const Game = require("../game/Game");
const Tile = require("../game/Tile");

const game = new Game();

// Create 4 players
game.setup();

// Make Player 2 able to Chi a 5 pin
game.players[1].hand = [
    new Tile("pin", 3),
    new Tile("pin", 4),
    new Tile("man", 7)
];

// Pretend Player 1 discarded a 5 pin
game.currentPlayer = 0;
const discardedTile = new Tile("pin", 5);
game.lastDiscard = discardedTile;
game.players[0].discards.push(discardedTile);

console.log("Before Chi:");
console.log("Player 1 discards:", game.players[0].discards);
console.log("Player 2 hand:", game.players[1].hand);
console.log("Player 2 melds:", game.players[1].melds);
console.log("Last discard:", game.lastDiscard);
console.log("Current player:", game.currentPlayer);

// Player 2 calls Chi
game.chi(1);

console.log("\nAfter Chi:");
console.log("Player 1 discards:", game.players[0].discards);
console.log("Player 2 hand:", game.players[1].hand);
console.log("Player 2 melds:", game.players[1].melds);
console.log("Last discard:", game.lastDiscard);
console.log("Current player:", game.currentPlayer);
