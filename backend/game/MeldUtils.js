
// checks whether a tile can be used to make a triplet with the hand
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


// checks whether a tile can be used to make a sequence with the hand
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

// this function finds a triplet in the hand and removes it from the hand
function removeTriplet(hand, tile){
    const newHand = [...hand];
    let removed = 0;
    for(let i = newHand.length-1; i >=0 && removed < 3; i--){
        if(newHand[i].suit == tile.suit && newHand[i].value == tile.value){
            newHand.splice(i, 1);
            removed++;
        }
    }

    if(removed < 3){
        return null;
    }

    return newHand;
}


// removes a sequence from the hand given a tile that is part of the sequence
function removeSequence(hand, tile){
    const neededValues = [
        
    ]

    let removed = 0;
    for(let i = newHand.length - 1; i>=0 && removed < 3; i--){
        if(newHand[i].suit == tile.suit && (newHand[i].value == tile.value || newHand[i].value == tile.value - 1 || newHand[i].value == tile.value - 2)){
            newHand.splice(i, 1);
            removed++;
        }
    }
}
