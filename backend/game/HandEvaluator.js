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


function canFormMelds(hand, melds=[]){
    // backtrack by removing those pairs
}
function canFormMeld(hand, melds = []){
    //detect that there exists 4 melds and a pair
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

    // Standard hand detection will be added next
    return false;
}

module.exports = {
    isWinningHand,
    isSevenPairs
};
