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
                    meld.push(this.hand.splice(i,1)[0]);
                    removedCount++;
                    i--;
                }
            }
            this.melds.push(meld);
        }
    }

    canChi(tile){
        // Chi can only happen if the player has 2 tile that can form a sequence with discareded tile
        const val = tile.value;


        if(this.hand.some(t=> t.suit == tile.suit && t.value == val - 2) &&
            this.hand.some(t=> t.suit == tile.suit && t.value == val - 1)){
                return true;
        }


        if(this.hand.some(t=> t.suit == tile.suit && t.value == val - 1) &&
            this.hand.some(t=> t.suit == tile.suit && t.value == val + 1)){
                return true;
        }   

        if(this.hand.some(t=> t.suit == tile.suit && t.value == val + 1) &&
            this.hand.some(t=> t.suit == tile.suit && t.value == val + 2)){
                return true;
        }   
        return false;
    }

    chi(tile) {

        if (this.canChi(tile)) {
    
            const v = tile.value;
            let values;
    
            if (
                this.hand.some(t => t.suit == tile.suit && t.value == v - 2) &&
                this.hand.some(t => t.suit == tile.suit && t.value == v - 1)
            ) {
                values = [v - 2, v - 1];
            }
    
            else if (
                this.hand.some(t => t.suit == tile.suit && t.value == v - 1) &&
                this.hand.some(t => t.suit == tile.suit && t.value == v + 1)
            ) {
                values = [v - 1, v + 1];
            }
    
            else {
                values = [v + 1, v + 2];
            }
    
            let meld = [tile];
    
            for (let i = 0; i < this.hand.length; i++) {
    
                if (
                    this.hand[i].suit == tile.suit &&
                    values.includes(this.hand[i].value)
                ) {
                    meld.push(this.hand.splice(i, 1)[0]);
                    i--;
    
                    if (meld.length == 3) {
                        break;
                    }
                }
            }
    
            this.melds.push(meld);
        }
    }

    


}


module.exports = Player;

