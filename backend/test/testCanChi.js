const Player = require("../game/Player");
const Tile = require("../game/Tile");  
const Game = require("../game/Game");


const player = new Player(1, "Player 2");

player.hand = [
    new Tile("pin", 3),
    new Tile("pin", 4),
    new Tile("man", 7)
];

const discardedTile = new Tile("pin", 5);

console.log("Can Chi?", player.canChi(discardedTile));