const assert = require("assert");
const Tile = require("../game/Tile");
const {
    isWinningHand,
    isSevenPairs
} = require("../game/HandEvaluator");

function tile(suit, value){
    return new Tile(suit, value);
}

function createValidSevenPairsHand(){
    return [
        tile("man", 1), tile("man", 1),
        tile("man", 3), tile("man", 3),
        tile("pin", 5), tile("pin", 5),
        tile("pin", 7), tile("pin", 7),
        tile("bamboo", 2), tile("bamboo", 2),
        tile("wind", "east"), tile("wind", "east"),
        tile("dragon", "red"), tile("dragon", "red")
    ];
}

function testValidSevenPairs(){
    const hand = createValidSevenPairsHand();

    assert.strictEqual(
        isSevenPairs(hand),
        true,
        "Seven different pairs should be valid"
    );
}

function testWrongHandSize(){
    const hand = createValidSevenPairsHand();
    hand.pop();

    assert.strictEqual(
        isSevenPairs(hand),
        false,
        "A seven-pairs hand must contain exactly 14 tiles"
    );
}

function testOpenHand(){
    const hand = createValidSevenPairsHand();
    const melds = [[
        tile("pin", 1),
        tile("pin", 2),
        tile("pin", 3)
    ]];

    assert.strictEqual(
        isSevenPairs(hand, melds),
        false,
        "Seven pairs must be a closed hand"
    );
}

function testFourIdenticalTiles(){
    const hand = [
        tile("man", 1), tile("man", 1),
        tile("man", 1), tile("man", 1),
        tile("man", 3), tile("man", 3),
        tile("pin", 5), tile("pin", 5),
        tile("pin", 7), tile("pin", 7),
        tile("bamboo", 2), tile("bamboo", 2),
        tile("wind", "east"), tile("wind", "east")
    ];

    assert.strictEqual(
        isSevenPairs(hand),
        false,
        "Four identical tiles cannot count as two separate pairs"
    );
}

function testUnevenTileCounts(){
    const hand = [
        tile("man", 1), tile("man", 1), tile("man", 1),
        tile("man", 3),
        tile("pin", 5), tile("pin", 5),
        tile("pin", 7), tile("pin", 7),
        tile("bamboo", 2), tile("bamboo", 2),
        tile("wind", "east"), tile("wind", "east"),
        tile("dragon", "red"), tile("dragon", "red")
    ];

    assert.strictEqual(
        isSevenPairs(hand),
        false,
        "Every tile type must occur exactly twice"
    );
}

function testWinningHandWrapper(){
    const hand = createValidSevenPairsHand();

    assert.strictEqual(
        isWinningHand(hand),
        true,
        "isWinningHand should recognize seven pairs"
    );
}

testValidSevenPairs();
testWrongHandSize();
testOpenHand();
testFourIdenticalTiles();
testUnevenTileCounts();
testWinningHandWrapper();

console.log("All seven-pairs tests passed.");
