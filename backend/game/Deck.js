const Tile = require('./Tile.js')

function createTileSet(){

    const tiles = []

    for(let copy = 1; copy <= 4; copy++){


        // pin (dots)
        for(let i = 1; i <= 9; i++){
            const tile = new Tile('pin', i)
            tiles.push(tile)
        }

        // bamboo
        for(let i = 1; i <= 9; i++){
            const tile = new Tile('bamboo', i) 
            tiles.push(tile)
        }

        // man (characters)
        for(let i = 1; i <= 9; i++){
            const tile = new Tile('man', i)
            tiles.push(tile)
        }

        // wind tiles
        const west = new Tile('wind', 'west')
        const east = new Tile('wind', 'east')
        const south = new Tile('wind', 'south')
        const north = new Tile('wind', 'north')

        tiles.push(west);
        tiles.push(east);
        tiles.push(south);
        tiles.push(north);

        // dragon tiles
        const red = new Tile('dragon', 'red')
        const green = new Tile('dragon', 'green')
        const white = new Tile('dragon', 'white')

        tiles.push(red);
        tiles.push(green);
        tiles.push(white);

    }
    
    return tiles
}

module.exports = createTileSet
