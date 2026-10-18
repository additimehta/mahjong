const test = require('node:test');
const assert = require('node:assert/strict');
const { HalfFlush, isWinningHand } = require('../game/HandEvaluator');
const tiles = (suit, values) => values.map(value => ({suit, value}));

test('half flush recognizes each numbered suit, open hands, and kans without mutation', () => {
    for(const suit of ['man', 'pin', 'bamboo']){
        const hand = [...tiles(suit, [1,2,3,4,5,6,7,8,9]),
            ...tiles('wind', ['east','east','east']), ...tiles(suit, [5,5])];
        const before = JSON.stringify(hand);
        assert.equal(HalfFlush(hand), true);
        assert.equal(HalfFlush(hand.slice(3), [{type: 'chi', tiles: hand.slice(0,3), open: true}]), true);
        assert.equal(HalfFlush(hand.slice(0,9).concat(hand.slice(12)),
            [{type: 'kan', tiles: tiles('wind', ['east','east','east','east']), open: false}]), true);
        assert.equal(JSON.stringify(hand), before);
    }
});

test('half flush recognizes seven pairs and honors supplied by a declared meld', () => {
    assert.equal(HalfFlush([...tiles('man', [1,1,2,2,3,3,4,4,5,5,6,6]),
        ...tiles('dragon', ['red','red'])]), true);
    assert.equal(HalfFlush(tiles('pin', [1,2,3,4,5,6,7,8,9,5,5]),
        [{type: 'pon', tiles: tiles('dragon', ['red','red','red']), open: true}]), true);
});

test('half flush rejects full flush, all honors, mixed suits, and incomplete hands', () => {
    assert.equal(HalfFlush(tiles('man', [1,2,3,4,5,6,7,8,9,5,5,5,6,6])), false);
    assert.equal(HalfFlush([...tiles('wind', ['east','east','east','south','south','south',
        'west','west','west','north','north','north']), ...tiles('dragon', ['red','red'])]), false);
    assert.equal(HalfFlush([...tiles('man', [1,2,3,4,5,6]), ...tiles('pin', [7,8,9]),
        ...tiles('wind', ['east','east','east']), ...tiles('dragon', ['red','red'])]), false);
    assert.equal(HalfFlush([...tiles('man', [1,2,3]), ...tiles('dragon', ['red','red'])]), false);
    assert.equal(HalfFlush([]), false);
});

test('an empty concealed hand cannot win, including with four declared melds', () => {
    const melds = [tiles('man', [1,2,3]), tiles('man', [4,5,6]),
        tiles('pin', [7,8,9]), tiles('wind', ['east','east','east'])].map(tiles => ({type: tiles[0].suit === 'wind' ? 'pon' : 'chi', tiles, open: true}));
    assert.equal(isWinningHand([]), false);
    assert.equal(isWinningHand([], melds), false);
    assert.equal(isWinningHand(tiles('dragon', ['red','red']), melds), true);
});
