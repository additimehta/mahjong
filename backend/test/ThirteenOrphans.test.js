const test = require('node:test');
const assert = require('node:assert/strict');
const { isThirteenOrphans, isWinningHand } = require('../game/HandEvaluator');
const orphans = () => [
    ...['man', 'pin', 'bamboo'].flatMap(suit => [1,9].map(value => ({suit,value}))),
    ...['east','south','west','north'].map(value => ({suit:'wind',value})),
    ...['red','green','white'].map(value => ({suit:'dragon',value}))
];

test('every orphan type can supply the pair without mutating the hand', () => {
    for(const duplicate of orphans()){
        const hand = [...orphans(), {...duplicate}].reverse();
        const before = JSON.stringify(hand);
        assert.equal(isThirteenOrphans(hand), true);
        assert.equal(isWinningHand(hand), true);
        assert.equal(JSON.stringify(hand), before);
    }
});

test('orphans reject wrong sizes, declared melds, missing types and invalid tiles', () => {
    const hand = [...orphans(), {suit:'man',value:1}];
    assert.equal(isThirteenOrphans(hand.slice(1)), false);
    assert.equal(isThirteenOrphans([...hand, hand[0]]), false);
    assert.equal(isThirteenOrphans(hand, [{type: 'pon', tiles: [hand[0],hand[0],hand[0]], open: true}]), false);
    const missing = [...hand];
    missing[1] = {...hand[0]};
    assert.equal(isThirteenOrphans(missing), false);
    assert.equal(isWinningHand(missing), false);
    for(const invalid of [{suit:'man',value:2}, {suit:'wind',value:'invalid'}, {suit:'dragon',value:'blue'}]){
        assert.equal(isThirteenOrphans([...orphans(), invalid]), false);
    }
});
