const Game = require("../game/Game");
const Tile = require("../game/Tile");

// Test 1: The next player can Chi
const game = new Game();
game.setup();

game.players[1].hand = [
    new Tile("pin", 3),
    new Tile("pin", 4),
    new Tile("man", 7)
];

game.currentPlayer = 0;
const discardedTile = new Tile("pin", 5);
game.lastDiscard = discardedTile;
game.players[0].discards.push(discardedTile);

console.log("Valid Chi - Before:");
console.log("Player 1 discards:", game.players[0].discards);
console.log("Player 2 hand:", game.players[1].hand);
console.log("Player 2 melds:", game.players[1].melds);
console.log("Last discard:", game.lastDiscard);
console.log("Current player:", game.currentPlayer);

game.chi(1);

console.log("\nValid Chi - After:");
console.log("Player 1 discards:", game.players[0].discards);
console.log("Player 2 hand:", game.players[1].hand);
console.log("Player 2 melds:", game.players[1].melds);
console.log("Last discard:", game.lastDiscard);
console.log("Current player:", game.currentPlayer);

// Test 2: A player who is not next cannot Chi
const illegalGame = new Game();
illegalGame.setup();

illegalGame.players[2].hand = [
    new Tile("pin", 3),
    new Tile("pin", 4)
];

illegalGame.currentPlayer = 0;
const secondDiscardedTile = new Tile("pin", 5);
illegalGame.lastDiscard = secondDiscardedTile;
illegalGame.players[0].discards.push(secondDiscardedTile);

console.log("\nIllegal Chi - Before:");
console.log("Player 1 discards:", illegalGame.players[0].discards);
console.log("Player 3 hand:", illegalGame.players[2].hand);
console.log("Player 3 melds:", illegalGame.players[2].melds);
console.log("Last discard:", illegalGame.lastDiscard);
console.log("Current player:", illegalGame.currentPlayer);

illegalGame.chi(2);

console.log("\nIllegal Chi - After:");
console.log("Player 1 discards:", illegalGame.players[0].discards);
console.log("Player 3 hand:", illegalGame.players[2].hand);
console.log("Player 3 melds:", illegalGame.players[2].melds);
console.log("Last discard:", illegalGame.lastDiscard);
console.log("Current player:", illegalGame.currentPlayer);
