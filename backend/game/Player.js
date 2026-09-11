const createTileSet = require("./Deck");

class Player {
    constructor(id, displayName) {
        this.id = id;
        this.displayName = displayName;
        this.hand = [];
        this.discards = [];
        this.melds = [];
    }


    // pon can only happen if the player has the exact
    //  2 same tile in their hand that matches the discarded tile

    canPon(tile){
        let count = 0;
        for(const handTile of this.hand){
            if(handTile.suit == tile.suit && handTile.value == tile.value){
                count++;
            }
        }

        if(count >= 2){
            return true;
        }else{
            return false;
        }
    }

    pon(tile){
        if(this.canPon(tile)){
            // remove 2 matching tiles from hand

            let meld = [tile];
            let removedCount = 0;
            for(let i = 0; i < this.hand.length && removedCount < 2; i++){
                if(this.hand[i].suit == tile.suit && this.hand[i].value == tile.value){
                    this.melds.push(this.hand.splice(i, 1)[0]);
                    removedCount++;
                    i--;
                }
            }
        }

        this.melds.push(meld);
    }


}


module.exports = Player;

