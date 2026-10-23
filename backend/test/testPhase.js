const assert = require("assert");
const Game = require("../game/Game");
const Tile = require("../game/Tile");

function testNormalTurnFlow(){
    const game = new Game();

    assert.strictEqual(game.phase, "setup");

    game.setup();
    assert.strictEqual(game.phase, "draw");
    assert.strictEqual(game.currentPlayer, 0);

    const startingHandSize = game.players[0].hand.length;

    game.drawTile();
    assert.strictEqual(game.phase, "discard");
    assert.strictEqual(game.players[0].hand.length, startingHandSize + 1);

    const handSizeAfterDraw = game.players[0].hand.length;
    game.drawTile();
    assert.strictEqual(
        game.players[0].hand.length,
        handSizeAfterDraw,
        "A player should not be able to draw twice"
    );

    // Guarantee a competing pon so this test exercises the response phase.
    const discard = game.players[0].hand[0];
    game.players[2].hand = [{...discard}, {...discard}];
    game.discardTile(0);
    assert.strictEqual(game.phase, "response");
    assert.strictEqual(game.players[0].discards.length, 1);
    assert.notStrictEqual(game.lastDiscard, null);

    const handSizeAfterDiscard = game.players[0].hand.length;
    game.discardTile(0);
    assert.strictEqual(
        game.players[0].hand.length,
        handSizeAfterDiscard,
        "A player should not be able to discard twice"
    );

    game.drawTile();
    assert.strictEqual(
        game.players[0].hand.length,
        handSizeAfterDiscard,
        "A player should not be able to draw during the response phase"
    );

    game.resolveResponses(game.responseWindow.id);
    assert.strictEqual(game.phase, "draw");
    assert.strictEqual(game.currentPlayer, 1);
    assert.strictEqual(game.lastDiscard, null);
}

function testPonFlow(){
    const game = new Game();
    game.setup();

    const discardedTile = new Tile("pin", 5);

    game.currentPlayer = 0;
    game.phase = "response";
    game.lastDiscard = discardedTile;
    game.players[0].discards.push(discardedTile);
    game.players[2].hand = [
        new Tile("pin", 5),
        new Tile("pin", 5),
        new Tile("man", 3)
    ];

    game.handleResponsePhase();
    game.pon(2);

    assert.strictEqual(game.phase, "discard");
    assert.strictEqual(game.currentPlayer, 2);
    assert.strictEqual(game.lastDiscard, null);
    assert.strictEqual(game.players[0].discards.length, 0);
    assert.strictEqual(game.players[2].melds.length, 1);
    assert.strictEqual(game.players[2].melds[0].tiles.length, 3);
}

function testChiFlow(){
    const game = new Game();
    game.setup();

    const discardedTile = new Tile("pin", 5);

    game.currentPlayer = 0;
    game.phase = "response";
    game.lastDiscard = discardedTile;
    game.players[0].discards.push(discardedTile);
    game.players[1].hand = [
        new Tile("pin", 3),
        new Tile("pin", 4),
        new Tile("man", 7)
    ];

    game.handleResponsePhase();
    game.chi(1);
    if(game.responseWindow) game.resolveResponses(game.responseWindow.id);

    assert.strictEqual(game.phase, "discard");
    assert.strictEqual(game.currentPlayer, 1);
    assert.strictEqual(game.lastDiscard, null);
    assert.strictEqual(game.players[0].discards.length, 0);
    assert.strictEqual(game.players[1].melds.length, 1);
    assert.strictEqual(game.players[1].melds[0].tiles.length, 3);
}

testNormalTurnFlow();
testPonFlow();
testChiFlow();

console.log("All phase flow tests passed.");
