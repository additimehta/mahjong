const Game = require('../game/Game');


const game = new Game();

game.setup();

console.log("Current player:", game.currentPlayer);

// East draws
game.drawTile();

console.log("East hand:", game.players[0].hand);

// East discards tile at index 3
game.discardTile(3);

console.log("East hand:", game.players[0].hand);
console.log("East discards:", game.players[0].discards);

// Move to South
game.nextPlayer();

console.log("Current player:", game.currentPlayer);

// South draws
game.drawTile();

console.log("South hand:", game.players[1].hand);

// South discards their first tile
game.discardTile(0);

console.log("South hand:", game.players[1].hand);
console.log("South discards:", game.players[1].discards);

// Move to West
game.nextPlayer();

console.log("Current player:", game.currentPlayer);