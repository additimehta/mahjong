const { canMakeSequence } = require("./MeldUtils");

class Player {
    constructor(id, displayName, seatWind = null) {
        this.id = id;
        this.displayName = displayName;
        this.hand = [];
        this.discards = [];
        // Declared melds hold metadata: { type: 'chi' | 'pon' | 'kan', tiles: Tile[], open: boolean }.
        // open is true for calls using another player's discard (including an upgraded pon),
        // and false for a concealed kan. Any open meld makes the whole hand open.
        this.melds = [];
        this.seatWind = seatWind;
        this.riichi = false;
    }

    isClosed(){
        return !this.melds.some(meld => meld.open);
    }


    // pon can only happen if the player has the exact
    //  2 same tile in their hand that matches the discarded tile

    canPon(tile){
        return this.hand.filter(t => t.suit === tile.suit && t.value === tile.value).length >= 2;
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
            this.melds.push({type: 'pon', tiles: meld, open: true});
        }
    }

    canChi(tile){
        // Chi can only happen if the player has 2 tile that can form a sequence with discareded tile
       return canMakeSequence(this.hand, tile);
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
                    values.splice(values.indexOf(meld[meld.length - 1].value), 1);
                    i--;
    
                    if (meld.length == 3) {
                        break;
                    }
                }
            }
    
            this.melds.push({type: 'chi', tiles: meld, open: true});
        }
    }

    


}


module.exports = Player;

