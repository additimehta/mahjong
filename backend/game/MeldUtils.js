
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

    return false;
}


// The supplied tile may be in the hand or be a discarded tile.
function sequenceStarts(tile){
    if(!['pin', 'bamboo', 'man'].includes(tile.suit) ||
       !Number.isInteger(tile.value) || tile.value < 1 || tile.value > 9){
        return [];
    }
    return [tile.value - 2, tile.value - 1, tile.value]
        .filter(start => start >= 1 && start <= 7);
}

function canMakeSequence(hand, tile){
    return sequenceStarts(tile).some(start =>
        [start, start + 1, start + 2]
            .filter(value => value !== tile.value)
            .every(value => hand.some(t => t.suit === tile.suit && t.value === value))
    );
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


// Remove one tile of each value, preserving the original hand.
// An explicit start lets the evaluator try the sequence beginning at its lowest tile.
function removeSequence(hand, tile, startValue){
    const starts = sequenceStarts(tile).filter(start =>
        startValue === undefined || start === startValue
    );
    for(const start of starts){
        const newHand = [...hand];
        let complete = true;
        for(const value of [start, start + 1, start + 2]){
            const index = newHand.findIndex(t => t.suit === tile.suit && t.value === value);
            if(index === -1){
                complete = false;
                break;
            }
            newHand.splice(index, 1);
        }
        if(complete){
            return newHand;
        }
    }
    return null;
}

module.exports  = {
    canMakeTriplets,
    canMakeSequence,
    removeTriplet,
    removeSequence
}
