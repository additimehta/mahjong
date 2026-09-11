const createTileSet = require("./Deck");


function shuffleTiles(tiles){

    for(var i = tiles.length - 1; i > 0; i--){
        var j = Math.floor(Math.random() * (i + 1));
        var temp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = temp;
    }
}

module.exports = shuffleTiles
