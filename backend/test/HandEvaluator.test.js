const test = require('node:test');
const assert = require('node:assert/strict');
const { isWinningHand } = require('../game/HandEvaluator');
const { canMakeTriplets, canMakeSequence, removeTriplet, removeSequence } = require('../game/MeldUtils');
const tiles = (suit, values) => values.map(value => ({ suit, value }));

test('triplets remove exactly three without changing the hand', () => {
    const hand = tiles('pin', [1, 1, 1, 1]);
    assert.equal(canMakeTriplets(hand, hand[0]), true);
    assert.equal(canMakeTriplets(hand.slice(0, 2), hand[0]), false);
    assert.deepEqual(removeTriplet(hand, hand[0]), tiles('pin', [1]));
    assert.equal(hand.length, 4);
});

test('sequence removal handles every position and duplicates', () => {
    const hand = tiles('pin', [3, 3, 4, 5]);
    for(const value of [3, 4, 5]){
        assert.equal(canMakeSequence(hand, {suit: 'pin', value}), true);
        assert.deepEqual(removeSequence(hand, {suit: 'pin', value}), tiles('pin', [3]));
    }
    assert.equal(hand.length, 4);
    assert.equal(removeSequence(tiles('pin', [3, 3, 4]), hand[0]), null);
    assert.equal(canMakeSequence(tiles('wind', [1, 2, 3]), {suit: 'wind', value: 1}), false);
    assert.equal(removeSequence(tiles('pin', [8, 9, 10]), {suit: 'pin', value: 8}), null);
    assert.equal(canMakeSequence(tiles('pin', [4, 5]), {suit: 'pin', value: 3}), true);
});

test('standard hands recognize triplets, unsorted sequences and open melds', () => {
    assert.equal(isWinningHand(tiles('pin', [1,1,1,2,2,2,3,3,3,4,4,4,5,5])), true);
    const hand = [...tiles('man', [3,1,2,6,4,5]), ...tiles('pin', [9,7,8]),
        ...tiles('wind', ['east','east','east']), ...tiles('dragon', ['red','red'])];
    const original = JSON.stringify(hand);
    assert.equal(isWinningHand(hand), true);
    assert.equal(JSON.stringify(hand), original);
    assert.equal(isWinningHand(hand.slice(3), [{type: 'chi', tiles: hand.slice(0,3), open: true}]), true);
    assert.equal(isWinningHand(tiles('dragon', ['red','red']), Array(4).fill({type: 'chi', tiles: tiles('pin',[1,2,3]), open: true})), true);
    assert.equal(isWinningHand(hand.slice(1)), false);
});

test('pair removal retains other matching tiles and searches alternative pairs', () => {
    // Choosing 1 as the pair fails; choosing 9 succeeds. Four 1s split across a triplet and sequence.
    assert.equal(isWinningHand(tiles('man', [1,1,1,1,2,3,4,5,6,7,8,9,9,9])), true);
});

test('mixed melds succeed and incomplete arrangements fail', () => {
    const hand = [...tiles('man', [1,1,1,2,2,2,3,3,3,4,5,6]), ...tiles('dragon', ['red','red'])];
    assert.equal(isWinningHand(hand), true);
    assert.equal(isWinningHand([...tiles('man', [1,1,1,2,3,5,6,7,8,7,8,9]), ...tiles('dragon', ['red','red'])]), false);
});

test('declared kans count as one group regardless of openness without mutation', () => {
    const hand = [...tiles('man', [1,2,3,4,5,6]), ...tiles('dragon', ['red','red'])];
    for(const open of [false, true]){
        const melds = [
            {type: 'kan', tiles: tiles('pin', [2,2,2,2]), open},
            {type: 'pon', tiles: tiles('wind', ['east','east','east']), open: true}
        ];
        const before = JSON.stringify({hand, melds});
        assert.equal(isWinningHand(hand, melds), true);
        assert.equal(isWinningHand(hand.slice(1), melds), false);
        assert.equal(JSON.stringify({hand, melds}), before);
    }
});
