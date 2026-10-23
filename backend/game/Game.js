const createTileSet = require("./Deck");
const shuffleTiles = require("./Shuffle");
const Player = require("./Player");

const RESPONSE_TIMEOUT_MS = 15000;
const CLAIM_PRIORITY = {chi: 1, pon: 2};

class Game {
    constructor() {
        this.players = [];
        this.wall = [];
        this.currentPlayer = 0;
        this.lastDiscard = null;
        this.lastDraw = null;
        this.roundWind = 'east';
        this.claims = [];
        this.eligibleClaims = [];

        // stores info about the current oppurunity to claim  a discaded tile 
        // should store an id, deadline, timer
        this.responseWindow = null;
        this.responseSequence = 0;
        // phase can be setup, draw, discard, response pon, chi, win ,

        this.phase = "setup";
        
    }

    setup(){

        if(this.phase != "setup"){
            return;
        }
        // create the wall
        this.wall = createTileSet();
        shuffleTiles(this.wall);

        // create players;
        for(let i = 0; i < 4; i++){
            const seatWind = ['east', 'south', 'west', 'north'][i];
            this.players.push(new Player(i, `Player ${i+1}`, seatWind));
            this.players[i].hand = this.wall.splice(0,13)
        }

        this.phase  = "draw";
        
    }


    drawTile(){
        if(this.phase != "draw"){
            return;
        }
        const player = this.players[this.currentPlayer];
        const tile = this.wall.pop();
        player.hand.push(tile);
        this.lastDraw = tile;
        this.phase = "discard";
    }

    discardTile(tileIndex){
        if(this.phase != "discard"){
            return;
        }
        const player = this.players[this.currentPlayer];
        if(!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= player.hand.length){
            return;
        }
        const tile = player.hand.splice(tileIndex, 1)[0];
        player.discards.push(tile);
        this.lastDiscard = tile;
        this.lastDraw = null;

        this.phase = "response";

        this.handleResponsePhase();
    }

    // Keep currentPlayer pointing at the discarder until the response is resolved.
    handleResponsePhase(){
        if(this.phase !== "response" || !this.lastDiscard || this.responseWindow){
            return;
        }
        this.claims = [];
        this.eligibleClaims = [];
        for(let i = 0; i < 4; i++){
            // Players cannot claim their own discard.
            if(i === this.currentPlayer){
                continue;
            }

            const player = this.players[i];

            if(player.canPon(this.lastDiscard)){
                this.eligibleClaims.push({playerIndex: i, action: 'pon'});
            }

            // Only the next seat can chi, even if others have matching tiles.
            const isNextPlayer = i === (this.currentPlayer + 1) % 4;
            if(isNextPlayer && player.canChi(this.lastDiscard)){
                this.eligibleClaims.push({playerIndex: i, action: 'chi'});
            }

            // Add ron once legal ron authorization (including furiten) exists.
        }
        if(this.eligibleClaims.length === 0){
            this.handleNoClaim();
            return;
        }
        const id = ++this.responseSequence;
        const deadline = Date.now() + RESPONSE_TIMEOUT_MS;
        const timer = setTimeout(() => this.resolveResponses(id), RESPONSE_TIMEOUT_MS);
        timer.unref?.();
        this.responseWindow = {id, deadline, timer};
    }

    submitClaim(playerIndex, action, windowId){
        const window = this.responseWindow;
        if(this.phase !== 'response' || !window || window.id !== windowId){
            return false;
        }
        if(Date.now() >= window.deadline){
            this.resolveResponses(window.id);
            return false;
        }

        const isEligible = this.eligibleClaims.some(entry =>
            entry.playerIndex === playerIndex && entry.action === action);
        if(!isEligible){
            return false;
        }

        const alreadyClaimed = this.claims.some(claim => claim.playerIndex === playerIndex);
        if(alreadyClaimed){
            return false;
        }

        this.claims.push({playerIndex, action});

        // right after submission check the best claim and see if there is any possible higher claim
        // this is in case of conccurent claims being pushed 
        const bestClaim = this.getBestClaim();
        if(!this.hasPossibleHigherClaim(bestClaim)){
            this.resolveResponses(window.id);
        }
        return true;
    }

    getBestClaim(){
        let bestClaim = null;
        for(const claim of this.claims){
            // Keeping the earlier claim on a tie preserves server receipt order.
            if(!bestClaim || CLAIM_PRIORITY[claim.action] > CLAIM_PRIORITY[bestClaim.action]){
                bestClaim = claim;
            }
        }
        return bestClaim;
    }

    hasPossibleHigherClaim(bestClaim){
        for(const eligible of this.eligibleClaims){
            const alreadyClaimed = this.claims.some(claim =>
                claim.playerIndex === eligible.playerIndex);
            if(alreadyClaimed){
                continue;
            }

            if(CLAIM_PRIORITY[eligible.action] > CLAIM_PRIORITY[bestClaim.action]){
                return true;
            }
        }
        return false;
    }

    resolveResponses(windowId){
        if(!this.responseWindow || this.responseWindow.id !== windowId){
            return;
        }

        const bestClaim = this.getBestClaim();
        this.clearResponseWindow();
        if(bestClaim){
            this.applyClaim(bestClaim.playerIndex, bestClaim.action);
        }else{
            this.handleNoClaim();
        }
    }

    clearResponseWindow(){
        if(this.responseWindow){
            clearTimeout(this.responseWindow.timer);
        }
        this.responseWindow = null;
        this.claims = [];
        this.eligibleClaims = [];
    }

    nextPlayer(){
        this.currentPlayer  = (this.currentPlayer + 1) % 4;
    }

    // Prepare evaluator input; this does not authorize a win or check yaku/furiten.
    // Ron adds the discard to a copy. Tsumo already has the drawn tile in hand.
    getWinEvaluationInput(playerIndex, winMethod){
        const player = this.players[playerIndex];
        if(!player){
            throw new Error('Unknown player');
        }
        const isRon = winMethod === 'ron';
        const isTsumo = winMethod === 'tsumo';
        if(!isRon && !isTsumo){
            throw new Error('Win method must be ron or tsumo');
        }
        if(isRon && (this.phase !== 'response' || playerIndex === this.currentPlayer || !this.lastDiscard)){
            throw new Error('Ron requires another player\'s discard during the response phase');
        }
        if(isTsumo && (this.phase !== 'discard' || playerIndex !== this.currentPlayer || !this.lastDraw)){
            throw new Error('Tsumo requires the current player\'s drawn tile');
        }
        return {
            hand: isRon ? [...player.hand, this.lastDiscard] : [...player.hand],
            melds: player.melds,
            context: {
                winningTile: isRon ? this.lastDiscard : this.lastDraw,
                winMethod,
                seatWind: player.seatWind,
                roundWind: this.roundWind,
                riichi: player.riichi
            }
        };
    }


    getPonPlayers(){
        const ponPlayers = [];
        for(let i = 0; i < 4; i++){
            if(i !== this.currentPlayer){
                const player = this.players[i];
                if(player.canPon(this.lastDiscard)){
                    ponPlayers.push(player);
                }
            }
        }
        return ponPlayers;
    }


    pon(playerIndex, windowId = this.responseWindow?.id){
        return this.submitClaim(playerIndex, 'pon', windowId);
    }

    chi(playerIndex, windowId = this.responseWindow?.id){
        return this.submitClaim(playerIndex, 'chi', windowId);
    }

    // Internal mutation step; API callers submit claims through submitClaim().
    applyClaim(playerIndex, action){
        const discardingPlayer = this.players[this.currentPlayer];
        const player = this.players[playerIndex];
        player[action](this.lastDiscard);
        discardingPlayer.discards.pop();
        this.lastDiscard = null;
        this.lastDraw = null;
        this.currentPlayer = playerIndex;
        this.phase = 'discard';
    }

    handleNoClaim(){
        if(this.phase != "response" || this.responseWindow){
            return;
        }

        this.lastDiscard = null;
        this.nextPlayer();
        this.phase = "draw"; 
    }




}

module.exports = Game;


