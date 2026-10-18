const test = require('node:test');
const assert = require('node:assert/strict');
const Game = require('../game/Game');
const Player = require('../game/Player');
const { isWinningHand, HalfFlush } = require('../game/HandEvaluator');
const tiles = (suit, values) => values.map(value => ({suit, value}));

test('meld metadata distinguishes open calls from concealed kans', () => {
    const player = new Player(0, 'East', 'east');
    assert.equal(player.riichi, false);
    assert.equal(player.isClosed(), true);
    player.melds.push({type: 'kan', tiles: tiles('man', [1,1,1,1]), open: false});
    assert.equal(player.isClosed(), true);
    player.hand = tiles('pin', [5,5,7]);
    player.pon({suit: 'pin', value: 5});
    assert.deepEqual(player.melds[1], {type: 'pon', tiles: tiles('pin', [5,5,5]), open: true});
    assert.deepEqual(player.hand, tiles('pin', [7]));
    assert.equal(player.isClosed(), false);
});

test('chi records metadata and consumes one of each required value', () => {
    const player = new Player(0, 'East');
    player.hand = tiles('pin', [3,3,4]);
    player.chi({suit: 'pin', value: 5});
    assert.deepEqual(player.melds[0], {type: 'chi', tiles: tiles('pin', [5,3,4]), open: true});
    assert.deepEqual(player.hand, tiles('pin', [3]));
});

test('ron input includes the winning discard once and carries player and round context', () => {
    const game = new Game();
    game.setup();
    assert.deepEqual(game.players.map(player => player.seatWind), ['east','south','west','north']);
    const player = game.players[1];
    player.hand = [...tiles('man', [1,2,3,4,5,6,7,8,9]), ...tiles('wind', ['east','east','east']),
        ...tiles('dragon', ['red'])];
    player.riichi = true;
    game.roundWind = 'south';
    game.phase = 'response';
    game.lastDiscard = {suit: 'dragon', value: 'red'};
    const input = game.getWinEvaluationInput(1, 'ron');
    assert.equal(player.hand.length, 13);
    assert.equal(input.hand.length, 14);
    assert.deepEqual(input.context, {winningTile: game.lastDiscard, winMethod: 'ron',
        seatWind: 'south', roundWind: 'south', riichi: true});
    assert.equal(isWinningHand(input.hand, input.melds), true);
    assert.equal(HalfFlush(input.hand, input.melds), true);
    assert.throws(() => game.getWinEvaluationInput(0, 'ron'));
});

test('tsumo uses the last draw without duplicating it and rejects stale context', () => {
    const game = new Game();
    game.setup();
    assert.throws(() => game.getWinEvaluationInput(0, 'tsumo'));
    game.drawTile();
    const input = game.getWinEvaluationInput(0, 'tsumo');
    assert.equal(input.hand.length, 14);
    assert.equal(input.context.winningTile, game.players[0].hand.at(-1));
    assert.equal(input.context.winMethod, 'tsumo');
    assert.throws(() => game.getWinEvaluationInput(1, 'tsumo'));
    assert.throws(() => game.getWinEvaluationInput(0, 'invalid'));
    game.discardTile(0);
    assert.throws(() => game.getWinEvaluationInput(0, 'tsumo'));
});
