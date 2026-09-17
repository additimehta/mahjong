const Player = require("../game/Player");
const Tile = require("../game/Tile");  
const Game = require("../game/Game");

const game = new Game();

game.setup();

// Player 0 is the one who discarded
game.currentPlayer = 0;

// Give Player 1 exactly two 5-pin tiles
game.players[1].hand = [
    new Tile("pin", 5),
    new Tile("pin", 5),
    new Tile("man", 3)
];

// The discarded tile
game.lastDiscard = new Tile("pin", 5);

console.log("Before Pon:");
console.log("Player 1 hand:", game.players[1].hand);
console.log("Player 1 melds:", game.players[1].melds);
console.log("Current player:", game.currentPlayer);

// Player 1 Pons
game.pon(1);

console.log("\nAfter Pon:");
console.log("Player 1 hand:", game.players[1].hand);
console.log("Player 1 melds:", game.players[1].melds);
console.log("Current player:", game.currentPlayer);
console.log("Last discard:", game.lastDiscard);
