function canMakeTriplets(hand, tile){
    let count = 0;
    for(const t of hand){
        if(t.suit === tile.suit && t.value === tile.value){
            count++;
        }
    }

    if(count >= 3){
        return true;
    }
}

function canMakeSequence(hand, tile){

    const val = tile.value;

    if(hand.some(t=> t.suit == tile.suit && t.value == val - 2) &&
        hand.some(t=> t.suit == tile.suit && t.value == val - 1)){
            return true;
    }

    if(hand.some(t=> t.suit == tile.suit && t.value == val - 1) &&
        hand.some(t=> t.suit == tile.suit && t.value == val + 1)){
            return true;
    }   

    if(hand.some(t=> t.suit == tile.suit && t.value == val + 1) &&
        hand.some(t=> t.suit == tile.suit && t.value == val + 2)){
            return true;
    }
}