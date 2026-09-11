const createTileSet = require("./Deck");
const shuffleTiles = require("./Shuffle");
const Player = require("./Player");

class Game {
    constructor() {
        this.players = [];
        this.wall = [];
        this.currentPlayer = 0;
        this.lastDiscard = null;
    }

    setup(){
        // create the wall
        this.wall = createTileSet();
        shuffleTiles(this.wall);

        // create players;
        for(let i = 0; i < 4; i++){
            this.players.push(new Player(i, `Player ${i+1}`));
            this.players[i].hand = this.wall.splice(0,13)
        }
    
        
    }


    drawTile(){
        const player = this.players[this.currentPlayer];
        const tile = this.wall.pop();
        player.hand.push(tile);
    }

    discardTile(tileIndex) {
        const player = this.players[this.currentPlayer];
        const tile = player.hand.splice(tileIndex, 1)[0];
        player.discards.push(tile);
        this.lastDiscard = tile;

    }

    nextPlayer(){
        this.currentPlayer  = (this.currentPlayer + 1) % 4;
    }


}

module.exports = Game;


