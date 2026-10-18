const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateYaku } = require('../game/HandEvaluator');
const tiles = (suit, values) => values.map(value => ({suit, value}));
const context = {seatWind: 'east', roundWind: 'east', winMethod: 'ron'};
const find = (hand, melds, ctx, name) => evaluateYaku(hand, melds, ctx).find(yaku => yaku.name === name);

test('yakuhai counts concealed and declared dragons and double winds, but not pairs', () => {
    const hand = [...tiles('man', [1,2,3]), ...tiles('wind', ['east','east','east']), ...tiles('dragon', ['white','white'])];
    const melds = [
        {type:'pon', open:true, tiles:tiles('dragon',['red','red','red'])},
        {type:'kan', open:false, tiles:tiles('dragon',['green','green','green','green'])}
    ];
    assert.deepEqual(find(hand, melds, context, 'yakuhai'), {name:'yakuhai',han:4});
    assert.equal(find(hand, melds, {...context, seatWind:'south',roundWind:'west'}, 'yakuhai').han, 2);
});

test('toitoi accepts open and closed kans but rejects sequences', () => {
    const hand = [...tiles('man',[2,2,2]), ...tiles('pin',[4,4,4]), ...tiles('bamboo',[6,6,6]), ...tiles('wind',['north','north'])];
    for(const open of [true,false]){
        const melds = [{type:'kan',open,tiles:tiles('man',[8,8,8,8])}];
        assert.equal(find(hand,melds,context,'toitoi').han,2);
        assert.equal(find([...tiles('man',[1,2,3]),...hand.slice(3)],melds,context,'toitoi'),undefined);
    }
});

test('chinitsu distinguishes closed/open and rejects honors and mixed suits', () => {
    const hand = tiles('pin',[1,2,3,4,5,6,7,8,9,5,5]);
    for(const open of [true,false]){
        const melds = [{type:'kan',open,tiles:tiles('pin',[2,2,2,2])}];
        assert.equal(find(hand,melds,context,'chinitsu').han,open ? 5 : 6);
        assert.equal(find(hand,[{type:'pon',open,tiles:tiles('dragon',['red','red','red'])}],context,'chinitsu'),undefined);
        assert.equal(find(hand,[{type:'pon',open,tiles:tiles('man',[2,2,2])}],context,'chinitsu'),undefined);
    }
});

const sequences = [...tiles('man',[1,2,3]),...tiles('pin',[4,5,6]),...tiles('bamboo',[7,8,9,2,3,4])];
test('pinfu checks both ends of two-sided waits and rejects edge, middle and pair waits', () => {
    const hand = [...sequences,...tiles('wind',['north','north'])];
    for(const winningTile of tiles('pin',[4,6]).concat(tiles('bamboo',[9,2,4]))){
        assert.equal(find(hand,[],{...context,winningTile},'pinfu').han,1);
    }
    for(const winningTile of [...tiles('man',[3]),...tiles('bamboo',[7,3]),...tiles('pin',[5]),...tiles('wind',['north'])]){
        assert.equal(find(hand,[],{...context,winningTile},'pinfu'),undefined);
    }
    assert.equal(find(hand,[],context,'pinfu'),undefined);
});

test('pinfu rejects value pairs and open sequences', () => {
    const ctx = {...context,winningTile:{suit:'pin',value:4}};
    for(const pair of [tiles('dragon',['red','red']),tiles('wind',['east','east'])]){
        assert.equal(find([...sequences,...pair],[],ctx,'pinfu'),undefined);
    }
    const hand = [...sequences,...tiles('wind',['north','north'])];
    assert.equal(find(hand.slice(3),[{type:'chi',open:true,tiles:hand.slice(0,3)}],ctx,'pinfu'),undefined);
});

test('ambiguous seven pairs and sequence arrangements do not combine incompatible yaku', () => {
    const hand = tiles('man',[2,2,3,3,4,4,5,5,6,6,7,7,8,8]);
    const before = JSON.stringify(hand);
    const result = evaluateYaku(hand,[],{...context,winningTile:{suit:'man',value:2}});
    assert.ok(result.some(yaku => yaku.name === 'chiitoitsu'));
    assert.ok(!result.some(yaku => yaku.name === 'pinfu'));
    assert.equal(JSON.stringify(hand),before);
});

test('incomplete hands have no yaku and kokushi excludes ordinary yaku', () => {
    assert.deepEqual(evaluateYaku(sequences,[],context),[]);
    const hand = [...tiles('man',[1,9]),...tiles('pin',[1,9]),...tiles('bamboo',[1,9]),
        ...tiles('wind',['east','south','west','north']),...tiles('dragon',['red','green','white','white'])];
    assert.deepEqual(evaluateYaku(hand,[],{...context,riichi:true,winMethod:'tsumo'}),[{name:'kokushiMusou',yakuman:1}]);
});

test('iipeikou awards one han for identical sequences and combines with pinfu and riichi', () => {
    const hand = [...tiles('man',[1,2,3,1,2,3]),...tiles('pin',[4,5,6]),
        ...tiles('bamboo',[7,8,9]),...tiles('wind',['north','north'])];
    const ctx = {...context,riichi:true,winningTile:{suit:'pin',value:4}};
    const before = JSON.stringify({hand,ctx});
    const result = evaluateYaku(hand,[],ctx);
    assert.deepEqual(result,[{name:'riichi',han:1},{name:'pinfu',han:1},{name:'iipeikou',han:1}]);
    assert.equal(JSON.stringify({hand,ctx}),before);
    assert.equal(find(hand.slice(9),[
        {type:'chi',open:true,tiles:hand.slice(0,3)},
        {type:'chi',open:true,tiles:hand.slice(3,6)},
        {type:'chi',open:true,tiles:hand.slice(6,9)}
    ],ctx,'iipeikou'),undefined);
});

test('iipeikou requires matching ranks and suits, and a closed hand including unrelated groups', () => {
    const duplicate = tiles('man',[1,2,3,1,2,3]);
    const tail = [...tiles('pin',[4,5,6]),...tiles('wind',['north','north'])];
    for(const open of [true,false]){
        const melds = [{type:'kan',open,tiles:tiles('bamboo',[8,8,8,8])}];
        assert.equal(find([...duplicate,...tail],melds,context,'iipeikou')?.han,open ? undefined : 1);
    }
    for(const other of [tiles('pin',[1,2,3]),tiles('man',[2,3,4])]){
        const hand = [...duplicate.slice(0,3),...other,...tail,...tiles('bamboo',[7,8,9])];
        assert.equal(find(hand,[],context,'iipeikou'),undefined);
    }
});

test('iipeikou counts triple identical sequences once and does not stack with seven pairs', () => {
    const triple = [...tiles('man',[1,1,1,2,2,2,3,3,3]),...tiles('pin',[4,5,6]),...tiles('wind',['north','north'])];
    assert.equal(find(triple,[],context,'iipeikou').han,1);
    const twoPairs = [...tiles('man',[1,1,2,2,3,3]),...tiles('pin',[4,4,5,5,6,6]),...tiles('wind',['north','north'])];
    const result = evaluateYaku(twoPairs,[],context);
    assert.ok(result.some(yaku => yaku.name === 'chiitoitsu'));
    assert.ok(!result.some(yaku => yaku.name === 'iipeikou'));
});
