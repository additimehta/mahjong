const createTileSet = require("./Deck");
const shuffleTiles = require("./Shuffle");
const Player = require("./Player");

class Game {
    constructor() {
        this.players = [];
        this.wall = [];
        this.currentPlayer = 0;
        this.lastDiscard = null;
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
            this.players.push(new Player(i, `Player ${i+1}`));
            this.players[i].hand = this.wall.splice(0,13)
        }

        this.phase  = "draw";
        
    }


    drawTile(){
        if(this.phase != "draw"){{
            return;
        }
        const player = this.players[this.currentPlayer];
        const tile = this.wall.pop();
        player.hand.push(tile);
        this.phase = "discard";
    }

    discardTile(tileIndex) {
        if(this.phase != "discard"){
            return;
        }
        const player = this.players[this.currentPlayer];
        const tile = player.hand.splice(tileIndex, 1)[0];
        player.discards.push(tile);
        this.lastDiscard = tile;

        this.phase = "response";

    }

    nextPlayer(){
        this.currentPlayer  = (this.currentPlayer + 1) % 4;
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


    pon(playerIndex){
        if(this.phase != "response"){ 
            return;
        }

        const discardingPlayer = this.players[this.currentPlayer];
        const player = this.players[playerIndex];


        if(!player.canPon(this.lastDiscard)){
            return;
        }

        player.pon(this.lastDiscard); // add the discarded tile to the player's melds
        discardingPlayer.discards.pop(); // remove the last discard from the discarding player's discards
        this.lastDiscard = null;
        this.currentPlayer = playerIndex;
        
        this.phase = "discard";

    }

    chi(playerIndex){
        if(this.phase != "response"){ 
            return;
        } 
        const nextPlayerIndex = (this.currentPlayer + 1) % 4;
        if(playerIndex !== nextPlayerIndex){
            return; // Only the next player can Chi
        }
        const discardingPlayer = this.players[this.currentPlayer];
        const player = this.players[playerIndex];

        if(!player.canChi(this.lastDiscard)){
            return;
        }

        player.chi(this.lastDiscard); // add the discarded tile to the player's melds
        discardingPlayer.discards.pop(); // remove the last discard from the discarding player's discards
        this.lastDiscard = null;
        this.currentPlayer = playerIndex;

        this.phase = "discard";
    }

    handleNoClaim(){
        if(this.phase != "response"){
            return;
        }

        this.lastDiscard = null;
        this.nextPlayer();
        this.phase = "draw"; 
    }
    



}

module.exports = Game;


