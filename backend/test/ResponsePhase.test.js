const test = require('node:test');
const assert = require('node:assert/strict');
const Game = require('../game/Game');
const Player = require('../game/Player');
const tile = value => ({suit: 'pin', value});
function gameWith(chi = false, pon = false){
    const game = new Game();
    game.players = Array.from({length: 4}, (_, i) => new Player(i, `P${i}`));
    game.players[0].hand = [tile(5)];
    if(chi) game.players[1].hand = [tile(3), tile(4)];
    if(pon) game.players[2].hand = [tile(5), tile(5)];
    game.phase = 'discard';
    game.discardTile(0);
    return game;
}
test('no eligible claims advances immediately and invalid discard leaves state intact', () => {
    const game = gameWith();
    assert.equal(game.phase, 'draw');
    assert.equal(game.currentPlayer, 1);
    game.phase = 'discard';
    game.discardTile(-1);
    assert.equal(game.phase, 'discard');
});
test('uncontested chi resolves immediately', () => {
    const game = gameWith(true);
    assert.equal(game.chi(1), true);
    assert.equal(game.phase, 'discard');
    assert.equal(game.currentPlayer, 1);
    assert.equal(game.players[1].melds.length, 1);
    assert.equal(game.responseWindow, null);
});
test('chi waits for possible pon and a later pon wins', () => {
    const game = gameWith(true, true);
    const id = game.responseWindow.id;
    assert.equal(game.currentPlayer, 0);
    assert.equal(game.responseWindow.deadline > Date.now(), true);
    assert.equal(game.submitClaim(1, 'chi', id), true);
    assert.equal(game.phase, 'response');
    assert.equal(game.submitClaim(1, 'chi', id), false);
    assert.equal(game.submitClaim(2, 'pon', id), true);
    assert.equal(game.currentPlayer, 2);
    assert.equal(game.players[1].melds.length, 0);
    assert.equal(game.players[2].melds.length, 1);
    assert.equal(game.submitClaim(1, 'chi', id), false);
    game.resolveResponses(id);
    assert.equal(game.currentPlayer, 2);
});
test('timeout awards waiting chi or advances when nobody claimed', () => {
    for(const claim of [true, false]){
        const game = gameWith(true, true);
        const id = game.responseWindow.id;
        if(claim) game.submitClaim(1, 'chi', id);
        game.resolveResponses(id);
        assert.equal(game.currentPlayer, 1);
        assert.equal(game.phase, claim ? 'discard' : 'draw');
    }
});
test('invalid, stale and late claims cannot change the result', () => {
    const game = gameWith(true, true);
    const id = game.responseWindow.id;
    assert.equal(game.submitClaim(0, 'pon', id), false);
    assert.equal(game.submitClaim(2, 'chi', id), false);
    assert.equal(game.submitClaim(1, 'chi', id + 1), false);
    game.responseWindow.deadline = Date.now() - 1;
    assert.equal(game.submitClaim(2, 'pon', id), false);
    assert.equal(game.phase, 'draw');
});
