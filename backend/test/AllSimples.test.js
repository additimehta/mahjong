const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllSimples } = require('../game/HandEvaluator');
const tiles = (suit, values) => values.map(value => ({suit, value}));
const standard = () => [
    ...tiles('man', [2,3,4,6,7,8]),
    ...tiles('pin', [3,4,5]),
    ...tiles('bamboo', [6,6,6,8,8])
];

test('All Simples recognizes closed and open completed hands without mutation', () => {
    const hand = standard();
    const before = JSON.stringify(hand);
    assert.equal(isAllSimples(hand), true);
    assert.equal(isAllSimples(hand.slice(3), [{type: 'chi', tiles: hand.slice(0,3), open: true}]), true);
    const quad = tiles('man', [2,2,2,2]);
    assert.equal(isAllSimples(hand.slice(3), [{type: 'kan', tiles: quad, open: false}]), true);
    assert.equal(JSON.stringify(hand), before);
});

test('All Simples also recognizes seven distinct simple pairs', () => {
    const hand = tiles('man', [2,2,3,3,4,4,5,5,6,6,7,7,8,8]);
    assert.equal(isAllSimples(hand), true);
});

test('All Simples rejects terminals and honors in the hand or declared melds', () => {
    for(const forbidden of [
        ...tiles('man', [1,9]),
        {suit:'wind',value:'east'}, {suit:'dragon',value:'red'}
    ]){
        const hand = standard();
        hand[0] = forbidden;
        assert.equal(isAllSimples(hand), false);
        const meld = [forbidden, {...forbidden}, {...forbidden}];
        assert.equal(isAllSimples(standard().slice(3), [{type: 'pon', tiles: meld, open: true}]), false);
    }
});

test('only simple tiles is insufficient without a completed hand', () => {
    assert.equal(isAllSimples([]), false);
    assert.equal(isAllSimples(standard().slice(1)), false);
    const invalid = standard();
    invalid[0] = {suit:'man',value:8};
    assert.equal(isAllSimples(invalid), false);
    for(const value of [0,10,2.5,'2']){
        const hand = standard();
        hand[0] = {suit:'man',value};
        assert.equal(isAllSimples(hand), false);
    }
});
