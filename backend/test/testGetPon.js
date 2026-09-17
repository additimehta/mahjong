const Player = require("../game/Player");
const Tile = require("../game/Tile");  
const Game = require("../game/Game");

const game = new Game();

game.setup();

// Make Player 0 the current player
game.currentPlayer = 0;

// Give Player 1 two 5-pin tiles
game.players[1].hand = [
    new Tile("pin", 5),
    new Tile("pin", 5),
    new Tile("man", 3)
];

// Give Player 2 two 5-pin tiles
game.players[2].hand = [
    new Tile("pin", 5),
    new Tile("pin", 5),
    new Tile("bamboo", 7)
];

// Give Player 3 no 5-pin tiles
game.players[3].hand = [
    new Tile("man", 2),
    new Tile("man", 4),
    new Tile("bamboo", 9)
];

// Player 0 discards a 5-pin
game.lastDiscard = new Tile("pin", 5);

const ponPlayers = game.getPonPlayers();

console.log("Players who can Pon:");
console.log(ponPlayers);