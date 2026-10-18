const { canMakeTriplets, removeTriplet, removeSequence } = require('./MeldUtils.js');

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


// Honitsu: a completed hand with exactly one numbered suit and at least one honor.
function HalfFlush(hand, melds = []){
    if(!isWinningHand(hand, melds)){
        return false;
    }

    const allTiles = [...hand, ...melds.flatMap(meld => meld.tiles)];
    const suits = new Set();
    let hasHonor = false;
    for(const tile of allTiles){
        if(tile.suit === 'wind' || tile.suit === 'dragon'){
            hasHonor = true;
        }else{
            suits.add(tile.suit);
        }
    }
    return hasHonor && suits.size === 1;
}

// Kokushi musou: all thirteen terminal/honor types and one duplicate.
function isThirteenOrphans(hand, melds = []){
    if(hand.length !== 14 || melds.length !== 0){
        return false;
    }
    const required = new Set([
        'man-1', 'man-9', 'pin-1', 'pin-9', 'bamboo-1', 'bamboo-9',
        'wind-east', 'wind-south', 'wind-west', 'wind-north',
        'dragon-red', 'dragon-green', 'dragon-white'
    ]);
    const counts = new Map();
    for(const tile of hand){
        const key = `${tile.suit}-${tile.value}`;
        if(!required.has(key)){
            return false;
        }
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts.size === 13;
}

// The lowest tile can only start a sequence or belong to a triplet.
function canFormMelds(hand, melds = []){
    if(hand.length === 0){
        return melds.length === 4;
    }
    if(melds.length >= 4 || hand.length !== (4 - melds.length) * 3){
        return false;
    }

    const sortedHand = [...hand].sort((a, b) =>
        a.suit.localeCompare(b.suit) ||
        (typeof a.value === 'number' ? a.value - b.value : String(a.value).localeCompare(String(b.value)))
    );
    const tile = sortedHand[0];

    if(canMakeTriplets(sortedHand, tile)){
        const remaining = removeTriplet(sortedHand, tile);
        if(canFormMelds(remaining, [...melds, [tile, tile, tile]])){
            return true;
        }
    }

    const remaining = removeSequence(sortedHand, tile, tile.value);
    if(remaining !== null){
        const sequence = [tile, {suit: tile.suit, value: tile.value + 1}, {suit: tile.suit, value: tile.value + 2}];
        if(canFormMelds(remaining, [...melds, sequence])){
            return true;
        }
    }
    return false;
}


// a standard hand is 4 melds and a pair, with the melds being either triplets or sequences. 
// This function checks if the hand can be arranged into such a structure.
function canFormStandardHand(hand, melds = []){
    // Even with four declared melds, the concealed hand must contain a pair.
    if(hand.length === 0){
        return false;
    }
    // check if the lenght is fine
    if(melds.length > 4 || hand.length !== (4 - melds.length) * 3 + 2){
        return false;
    }
    // make a frequenyc map of the tiles in the hand to find pairs
    const frequencyMap = new Map();
    for(const tile of hand){
        const key = `${tile.suit}-${tile.value}`;
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    }

    for(const [key, count] of frequencyMap){
        if(count < 2){
            continue;
        }
        let removed = 0;
        const remainingTiles = hand.filter(tile => {
            if(`${tile.suit}-${tile.value}` === key && removed < 2){
                removed++;
                return false;
            }
            return true;
        });
        if(canFormMelds(remainingTiles, melds)){
            return true;
        }
    }
    return false;
}

// All Simples is a completed hand containing only suited tiles numbered 2–8. NO TERMINALs
// Declared melds are included; open All Simples is allowed.
function isAllSimples(hand, melds = []){
    const allTiles = [...hand, ...melds.flatMap(meld => meld.tiles)];
    if(!allTiles.every(tile =>
        ['man', 'pin', 'bamboo'].includes(tile.suit) &&
        Number.isInteger(tile.value) && tile.value >= 2 && tile.value <= 8
    )){
        return false;
    }
    return isWinningHand(hand, melds);
}

// Checks complete hand shapes; yaku and ron/tsumo eligibility are separate checks.
function isWinningHand(hand, melds = []){
    if(isSevenPairs(hand, melds) || isThirteenOrphans(hand, melds)){
        return true;
    }


    return canFormStandardHand(hand, melds);
}

module.exports = {
    isWinningHand,
    isSevenPairs,
    isThirteenOrphans,
    isAllSimples,
    HalfFlush
    

};

