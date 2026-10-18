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
function canFormMelds(hand, meldCount = 0){
    if(hand.length === 0){
        return meldCount === 4;
    }
    if(meldCount >= 4 || hand.length !== (4 - meldCount) * 3){
        return false;
    }

    const sortedHand = [...hand].sort((a, b) =>
        a.suit.localeCompare(b.suit) ||
        (typeof a.value === 'number' ? a.value - b.value : String(a.value).localeCompare(String(b.value)))
    );
    const tile = sortedHand[0];

    if(canMakeTriplets(sortedHand, tile)){
        const remaining = removeTriplet(sortedHand, tile);
        if(canFormMelds(remaining, meldCount + 1)){
            return true;
        }
    }

    const remaining = removeSequence(sortedHand, tile, tile.value);
    if(remaining !== null){
        if(canFormMelds(remaining, meldCount + 1)){
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
    // Each declared chi, pon, or kan occupies one group, regardless of openness.
    if(melds.length > 4 || hand.length !== (4 - melds.length) * 3 + 2){
        return false;
    }
    // Count concealed tiles to find candidate pairs.
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
        if(canFormMelds(remainingTiles, melds.length)){
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

// Keep each possible arrangement so incompatible interpretations never share yaku.
function standardArrangements(hand, melds){
    if(melds.length > 4 || hand.length !== (4 - melds.length) * 3 + 2){
        return [];
    }
    const same = (a, b) => a.suit === b.suit && a.value === b.value;
    const results = [];
    function search(remaining, groups, pair){
        if(remaining.length === 0){
            if(groups.length + melds.length === 4){
                results.push({pair, groups: [...melds, ...groups]});
            }
            return;
        }
        const sorted = [...remaining].sort((a, b) =>
            a.suit.localeCompare(b.suit) || String(a.value).localeCompare(String(b.value)));
        const tile = sorted[0];
        if(canMakeTriplets(sorted, tile)){
            search(removeTriplet(sorted, tile), [...groups,
                {type: 'pon', tiles: [tile, tile, tile], open: false}], pair);
        }
        const rest = removeSequence(sorted, tile, tile.value);
        if(rest !== null){
            search(rest, [...groups, {type: 'chi', open: false, tiles:
                [0,1,2].map(offset => ({suit: tile.suit, value: tile.value + offset}))}], pair);
        }
    }
    const tried = new Set();
    for(const tile of hand){
        const key = `${tile.suit}-${tile.value}`;
        if(tried.has(key)) continue;
        tried.add(key);
        if(hand.filter(t => same(t, tile)).length < 2) continue;
        let removed = 0;
        const rest = hand.filter(t => !(same(t, tile) && removed++ < 2));
        search(rest, [], tile);
    }
    return results;
}

function valueHonorHan(tile, context){
    if(tile.suit === 'dragon') return 1;
    if(tile.suit !== 'wind') return 0;
    return Number(tile.value === context.seatWind) + Number(tile.value === context.roundWind);
}

function hasPinfu(arrangement, melds, isClosed, context){
    // Missing wind/winning-tile context cannot establish a valueless pair and wait.
    if(!isClosed || melds.length !== 0 || !context.winningTile ||
       !context.seatWind || !context.roundWind ||
       valueHonorHan(arrangement.pair, context) > 0 ||
       !arrangement.groups.every(group => group.type === 'chi')){
        return false;
    }
    const winning = context.winningTile;
    return arrangement.groups.some(group => {
        const first = group.tiles[0];
        if(first.suit !== winning.suit) return false;
        // 89 waiting for 7 and 12 waiting for 3 are edge waits.
        return (winning.value === first.value && first.value < 7) ||
            (winning.value === first.value + 2 && first.value > 1);
    });
}

function evaluateYaku(hand, melds = [], context = {}){
    const yaku = [];
    if(!isWinningHand(hand, melds)){
        return yaku;
    }
    if(isThirteenOrphans(hand, melds)){
        yaku.push({ name: 'kokushiMusou', yakuman: 1 });
        return yaku;
    }

    let isClosed = true;

    for(const meld of melds){
        if(meld.open){
            isClosed = false;
            break;
        }
    }

    if(isClosed && context.winMethod === 'tsumo'){
        yaku.push({name: 'menzenTsumo', han: 1});
    }

    if(isClosed && context.riichi){
        yaku.push({name: 'riichi', han: 1 });
    }

    if(isAllSimples(hand, melds)){
        yaku.push({name:'tanyao', han: 1});
    }

    if(HalfFlush(hand, melds)){
        yaku.push({ name: 'honitsu', han: isClosed ? 3 : 2 });
    }

    const allTiles = [...hand, ...melds.flatMap(meld => meld.tiles)];
    if(allTiles.every(tile => ['man', 'pin', 'bamboo'].includes(tile.suit)) &&
       new Set(allTiles.map(tile => tile.suit)).size === 1){
        yaku.push({name: 'chinitsu', han: isClosed ? 6 : 5});
    }

    const candidates = [];
    if(isSevenPairs(hand, melds)){
        candidates.push([...yaku, {name: 'chiitoitsu', han: 2}]);
    }
    for(const arrangement of standardArrangements(hand, melds)){
        const result = [...yaku];
        const triplets = arrangement.groups.filter(group => group.type === 'pon' || group.type === 'kan');
        const yakuhaiHan = triplets.reduce((sum, group) => sum + valueHonorHan(group.tiles[0], context), 0);
        if(yakuhaiHan > 0) result.push({name: 'yakuhai', han: yakuhaiHan});
        if(triplets.length === 4) result.push({name: 'toitoi', han: 2});
        if(hasPinfu(arrangement, melds, isClosed, context)) result.push({name: 'pinfu', han: 1});
        candidates.push(result);
    }
    // Select the highest han interpretation among the currently supported yaku.
    // Final point optimization will also need fu when scoring is implemented.
    const totalHan = result => result.reduce((sum, entry) => sum + entry.han, 0);
    return candidates.reduce((best, result) => totalHan(result) > totalHan(best) ? result : best, yaku);
}

module.exports = {
    isWinningHand,
    isSevenPairs,
    isThirteenOrphans,
    isAllSimples,
    HalfFlush,
    evaluateYaku

};

