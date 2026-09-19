
// a meld is either a sequence or triplet or 4 of a kind
function isWinningHand(hand, melds = []){


    // 4 melds + 1 pair
    const meldsNeeded = 4 - melds.length;
    const expectedHandsize = meldsNeeded *3 + 2;


    if(hand.length !== expectedHandsize - 2){
        return false;
    }

    // 7 pairs - no melds
    const count = {};

    for(const tile of hand){
        const key = `${tile.suit}-${tile.value}`; 
        if(count[key]){
            count[key]++;
        }else{
            count[key] = 0;
        }
    }

    // convert to flat array 
    const tileCounts = Object.values(count);
    if(count.length != 7){
        return false;
    }
    return tileCounts.every(count => count === 2);

}

module.exports = isWinningHand;