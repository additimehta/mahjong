function isSevenPairs(hand, melds = []){
    if(hand.length !== 14 || melds.length !== 0){
        return false;
    }

    const counts = {};

    for(const tile of hand){
        const key = `${tile.suit}-${tile.value}`;

        if(counts[key] === undefined){
            counts[key] = 1;
        }else{
            counts[key]++;
        }
    }

    const tileCounts = Object.values(counts);

    if(tileCounts.length !== 7){
        return false;
    }

    return tileCounts.every(tileCount => tileCount === 2);
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
