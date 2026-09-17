const Player = require("../game/Player");
const Tile = require("../game/Tile");  
const Game = require("../game/Game");
const player = new Player(1, "South");

// Give South two 5-pin tiles
player.hand = [
    new Tile("pin", 5),
    new Tile("man", 3),
    new Tile("pin", 5),
    new Tile("bamboo", 7)
];

const discardedTile = new Tile("pin", 5);

console.log("Before Pon:");
console.log("Hand:", player.hand);
console.log("Melds:", player.melds);

// Check if player can Pon
console.log("Can Pon?", player.canPon(discardedTile));

// Perform Pon
player.pon(discardedTile);

console.log("\nAfter Pon:");
console.log("Hand:", player.hand);
console.log("Melds:", player.melds);