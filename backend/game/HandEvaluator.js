function isSevenPairs(hand, melds = []){
    if(hand.length !== 14 || melds.length !== 0){
        return false;
    }

    const counts = {};

    for(const tile of hand){
        const key = `${tile.suit}-${tile.value}`;

        // new tile found
        if(counts[key] === undefined){
            counts[key] = 1;
        }else{
            counts[key]++;
        }
    }

    for(let i = 0; i < Object.values(counts).length; i++){
        if(Object.values(counts)[i] > 2){
            return false;
        }
    }

    const tileCounts = Object.values(counts);

    if(tileCounts.length !== 7){
        return false;
    }

    return true;
}


// trying the hands and melds arrange into melds
function canFormMelds(hand, melds=[]){

    // base case
    if(hands.length === 0 && melds.length === 4){
        return true;
    }



    // TO DO: backtrack by removing those pairs


    // take first tile
    // can make a triplet?
    // yes -> remove hand and recurse on remainign 
    // if succeeds then return true
    // else put back the tile you were trying to make a triplet

    const tile = hand[0];
    let count = 0;
    for(const t of hand){
        if(t.suit === tile.suit && t.value === tile.value){
            count++;
        }

    } 
    
    if(count >= 3){

        const newHand = [...hand];
        let removed = 0;
        for(let i = newHand.length-1; i >=0 && removed < 3; i--){
            if(newHand[i].suit == tile.suit && newHand[i].value == tile.value){
                newHand.splice(i, 1);
                removed++;
            }
        }
    }


    // can I make a sequence?
    // yes -> remove tile, tile+1, tile+2 
    //      recurse on remaining
    // if succeeds then return true
    // else put back the tile you were trying to make a sequence







}








//detect that there exists 4 melds and a pair
function canFormStandardHand(hand, melds = []){
    const frequencyMap = new Map();
    for(const tile of hand){
        const key = '${tile.suit}-${tile.value}';
        if(frequencyMap.has(key)){
            frequencyMap.set(key, frequencyMap.get(key) + 1);
        }else
            frequencyMap.set(key, 1);
    }

    for(const [key, count] of frequencyMap.entries()){
        if(count >= 2){
            const remainingTiles = hand.filter(tile => '${tile.suit}-${tile.value}' !== key);
            if(canFormMelds(remainingTiles, melds)){
                return true;
            }
        }
    }





}
function isWinningHand(hand, melds = []){
    if(isSevenPairs(hand, melds)){
        return true;
    }


    // TO DO: Add the remaining winning hand combinations to check

    // Standard hand detection will be added next
    return false;
}

module.exports = {
    isWinningHand,
    isSevenPairs
};
