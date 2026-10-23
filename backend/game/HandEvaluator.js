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


const isHonor = tile => tile.suit === 'wind' || tile.suit === 'dragon';
const isTerminal = tile => ['man', 'pin', 'bamboo'].includes(tile.suit) &&
    (tile.value === 1 || tile.value === 9);
const sameTile = (a, b) => a && b && a.suit === b.suit && a.value === b.value;

// A winning tile can belong to multiple groups. Evaluate each placement separately:
// a ron-completed triplet is exposed for Sanankou/Suuankou, but the hand stays closed.
function winningPlacements(arrangement, melds, context){
    const placements = [];
    if(context.winningTile){
        if(sameTile(arrangement.pair, context.winningTile)) placements.push(-1);
        arrangement.groups.forEach((group, index) => {
            if(index >= melds.length && group.tiles.some(tile => sameTile(tile, context.winningTile))){
                placements.push(index);
            }
        });
    }
    return placements.length ? placements : [null];
}

function arrangementYaku(arrangement, melds, isClosed, context, placement){
    const ordinary = [];
    const yakuman = [];
    const add = (name, han) => ordinary.push({name, han});
    const limit = name => yakuman.push({name, yakuman: 1});
    const {groups, pair} = arrangement;
    const sequences = groups.filter(group => group.type === 'chi');
    const triplets = groups.filter(group => group.type === 'pon' || group.type === 'kan');
    const kans = triplets.filter(group => group.type === 'kan').length;
    const concealed = groups.filter((group, index) => {
        if(group.type === 'chi' || group.open) return false;
        if(index < melds.length || context.winMethod === 'tsumo') return true;
        return context.winMethod === 'ron' && placement !== null && placement !== index;
    }).length;
    const dragonGroups = triplets.filter(group => group.tiles[0].suit === 'dragon').length;
    const windGroups = triplets.filter(group => group.tiles[0].suit === 'wind').length;
    if(concealed === 4) limit('suuankou');
    if(dragonGroups === 3) limit('daisangen');
    if(windGroups === 3 && pair.suit === 'wind') limit('shousuushii');
    if(windGroups === 4) limit('daisuushii');
    if(kans === 4) limit('suukantsu');
    if(concealed >= 3) add('sanankou', 2);
    if(kans === 3) add('sankantsu', 2);
    if(dragonGroups === 2 && pair.suit === 'dragon') add('shousangen', 2);
    for(let value = 1; value <= 9; value++){
        if(['man', 'pin', 'bamboo'].every(suit => triplets.some(group =>
            group.tiles[0].suit === suit && group.tiles[0].value === value))){
            add('sanshokuDoukou', 2);
        }
    }
    for(let start = 1; start <= 7; start++){
        if(['man', 'pin', 'bamboo'].every(suit => sequences.some(group =>
            group.tiles[0].suit === suit && group.tiles[0].value === start))){
            add('sanshokuDoujun', isClosed ? 2 : 1);
        }
    }
    for(const suit of ['man', 'pin', 'bamboo']){
        if([1,4,7].every(start => sequences.some(group =>
            group.tiles[0].suit === suit && group.tiles[0].value === start))){
            add('ittsu', isClosed ? 2 : 1);
        }
    }
    const all = [pair, ...groups.flatMap(group => group.tiles)];
    if(sequences.length && (isHonor(pair) || isTerminal(pair)) && groups.every(group =>
        group.tiles.some(tile => isHonor(tile) || isTerminal(tile)))){
        const honors = all.some(isHonor);
        add(honors ? 'chanta' : 'junchan', honors ? (isClosed ? 2 : 1) : (isClosed ? 3 : 2));
    }
    return {ordinary, yakuman};
}

// Event flags are assertions supplied by game logic after validating the event.
// Optional boolean flags: doubleRiichi, ippatsu, haitei, houtei,
// rinshanKaihou, chankan, tenhou, chiihou. Missing flags award nothing.
// This evaluator does not infer declaration timing, interrupted turns, or kan events.
// Win authorization (including furiten), fu, dora, payments and final-point
// arrangement selection belong to the game/scoring layer.
function evaluateYaku(hand, melds = [], context = {}){
    const yaku = [];
    if(!isWinningHand(hand, melds)){
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

    const riichi = isClosed && (context.riichi === true || context.doubleRiichi === true);
    if(riichi){
        yaku.push({name: context.doubleRiichi ? 'doubleRiichi' : 'riichi', han: context.doubleRiichi ? 2 : 1});
        if(context.ippatsu === true) yaku.push({name: 'ippatsu', han: 1});
    }
    const tsumo = context.winMethod === 'tsumo';
    const ron = context.winMethod === 'ron';
    if(tsumo && context.rinshanKaihou === true) yaku.push({name: 'rinshanKaihou', han: 1});
    if(ron && context.chankan === true) yaku.push({name: 'chankan', han: 1});
    if(tsumo && context.haitei === true && !context.rinshanKaihou) yaku.push({name: 'haitei', han: 1});
    if(ron && context.houtei === true && !context.chankan) yaku.push({name: 'houtei', han: 1});

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

    const globalYakuman = [];
    const limit = name => globalYakuman.push({name, yakuman: 1});
    if(isThirteenOrphans(hand, melds)) limit('kokushiMusou');
    if(allTiles.every(isHonor)) limit('tsuuiisou');
    if(allTiles.every(isTerminal)) limit('chinroutou');
    if(allTiles.every(tile => (tile.suit === 'bamboo' && [2,3,4,6,8].includes(tile.value)) ||
        (tile.suit === 'dragon' && tile.value === 'green'))) limit('ryuuiisou');
    if(isClosed && melds.length === 0 && allTiles.every(tile => tile.suit === allTiles[0].suit &&
        ['man', 'pin', 'bamboo'].includes(tile.suit))){
        const counts = Array(10).fill(0);
        allTiles.forEach(tile => counts[tile.value]++);
        if([1,2,3,4,5,6,7,8,9].every(value => counts[value] >= (value === 1 || value === 9 ? 3 : 1))){
            limit('chuurenPoutou');
        }
    }
    if(tsumo && isClosed && melds.length === 0){
        if(context.tenhou === true && context.seatWind === 'east') limit('tenhou');
        if(context.chiihou === true && context.seatWind && context.seatWind !== 'east') limit('chiihou');
    }
    if(allTiles.every(tile => isTerminal(tile) || isHonor(tile))) yaku.push({name: 'honroutou', han: 2});
    const candidates = [];
    if(isSevenPairs(hand, melds)){
        candidates.push(globalYakuman.length ? [...globalYakuman] : [...yaku, {name: 'chiitoitsu', han: 2}]);
    }
    for(const arrangement of standardArrangements(hand, melds)){
        for(const placement of winningPlacements(arrangement, melds, context)){
            const extra = arrangementYaku(arrangement, melds, isClosed, context, placement);
            const result = [...yaku, ...extra.ordinary];
            const triplets = arrangement.groups.filter(group => group.type === 'pon' || group.type === 'kan');
            const yakuhaiHan = triplets.reduce((sum, group) => sum + valueHonorHan(group.tiles[0], context), 0);
            if(yakuhaiHan > 0) result.push({name: 'yakuhai', han: yakuhaiHan});
            if(triplets.length === 4) result.push({name: 'toitoi', han: 2});
            if(hasPinfu(arrangement, melds, isClosed, context)) result.push({name: 'pinfu', han: 1});
            // Iipeikou: 1 han, closed hand only, for two sequences with identical ranks
            // in the same suit (e.g. man 123 + man 123). An unrelated open call also
            // disqualifies it; a concealed kan keeps the hand closed.
            // Count within this arrangement so it never combines with Seven Pairs.
            if(isClosed){
                const sequenceCounts = new Map();
                for(const group of arrangement.groups){
                    if(group.type !== 'chi') continue;
                    const first = group.tiles[0];
                    const key = `${first.suit}-${first.value}`;
                    sequenceCounts.set(key, (sequenceCounts.get(key) || 0) + 1);
                }
                // Three copies of one sequence contain one pair, not two overlapping pairs.
                const identicalPairs = [...sequenceCounts.values()]
                    .reduce((sum, count) => sum + Math.floor(count / 2), 0);
                // Ryanpeikou replaces Iipeikou, and cannot combine with Seven Pairs.
                if(identicalPairs === 1) result.push({name: 'iipeikou', han: 1});
                if(identicalPairs === 2) result.push({name: 'ryanpeikou', han: 3});
            }
            const limits = [...globalYakuman, ...extra.yakuman];
            candidates.push(limits.length ? limits : result);
        }
    }
    // Stack distinct yakuman at one limit each; no optional double-yakuman variants.
    // Compare yakuman first, then han. Fu-based point selection is a scoring concern.
    if(globalYakuman.length) candidates.push(globalYakuman);
    const total = (result, key) => result.reduce((sum, entry) => sum + (entry[key] || 0), 0);
    return candidates.reduce((best, result) => {
        const difference = total(result, 'yakuman') - total(best, 'yakuman');
        return difference > 0 || (difference === 0 && total(result, 'han') > total(best, 'han')) ? result : best;
    }, []);
}

module.exports = {
    isWinningHand,
    isSevenPairs,
    isThirteenOrphans,
    isAllSimples,
    HalfFlush,
    evaluateYaku

};

