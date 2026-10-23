const test = require('node:test');
const assert = require('node:assert/strict');
const {evaluateYaku} = require('../game/HandEvaluator');
const t = (suit, ...values) => values.map(value => ({suit, value}));
const pair = t('wind', 'north', 'north');
const ctx = {seatWind:'south', roundWind:'east', winMethod:'ron'};
const result = (hand, melds = [], context = ctx) => evaluateYaku(hand, melds, context);
const han = (entries, name) => entries.find(entry => entry.name === name)?.han;
const pon = (suit, value, open = true, type = 'pon') => ({type, open,
    tiles: t(suit, ...Array(type === 'kan' ? 4 : 3).fill(value))});

test('triple sequences, straight, and outside hands lose one han when open', () => {
    const cases = [
        ['sanshokuDoujun', [...t('man',2,3,4),...t('pin',2,3,4),...t('bamboo',2,3,4),...t('man',6,7,8),...pair],2],
        ['ittsu', [...t('man',1,2,3,4,5,6,7,8,9),...t('pin',3,4,5),...pair],2],
        ['chanta', [...t('man',1,2,3),...t('pin',7,8,9),...t('bamboo',1,1,1),...t('dragon','red','red','red'),...pair],2],
        ['junchan', [...t('man',1,2,3),...t('pin',7,8,9),...t('bamboo',1,1,1,9,9,9),...t('man',9,9)],3]
    ];
    for(const [name, hand, closed] of cases){
        assert.equal(han(result(hand),name),closed,name);
        assert.equal(han(result(hand.slice(3),[{type:'chi',open:true,tiles:hand.slice(0,3)}]),name),closed-1,name);
        assert.equal(han(result(hand),name === 'chanta' ? 'junchan' : 'chanta'),undefined);
    }
});

test('triplet patterns include kans, dragon pairs, and seven-pairs terminals/honors', () => {
    const hand = [...t('pin',4,5,6),...pair];
    assert.equal(han(result(hand,[pon('man',2),pon('pin',2),pon('bamboo',2)]),'sanshokuDoukou'),2);
    assert.equal(han(result(hand,[pon('man',2,true,'kan'),pon('pin',3,false,'kan'),pon('bamboo',4,true,'kan')]),'sankantsu'),2);
    const dragons = result([...t('man',1,2,3,4,5,6),...t('dragon','white','white')],
        [pon('dragon','red'),pon('dragon','green')]);
    assert.equal(han(dragons,'shousangen'),2);
    assert.equal(han(dragons,'yakuhai'),2);
    const pairs = [...t('man',1,1,9,9),...t('pin',1,1,9,9),...t('bamboo',1,1),...t('wind','east','east'),...t('dragon','red','red')];
    assert.equal(han(result(pairs),'honroutou'),2);
    assert.equal(han(result(pairs),'chiitoitsu'),2);
});

test('ron exposes only the winning triplet; tsumo and pair ron allow suuankou', () => {
    const hand = [...t('man',2,2,2),...t('pin',3,3,3),...t('bamboo',4,4,4),...t('wind','east','east','east'),...pair];
    const onTriplet = {...ctx,winningTile:hand[0]};
    assert.equal(han(result(hand,[],onTriplet),'sanankou'),2);
    assert.ok(!result(hand,[],onTriplet).some(y => y.name === 'suuankou'));
    for(const context of [{...onTriplet,winMethod:'tsumo'},{...ctx,winningTile:pair[0]}]){
        assert.deepEqual(result(hand,[],context),[{name:'suuankou',yakuman:1}]);
    }
    const mixed = [...hand.slice(0,9),...t('man',6,7,8),...pair];
    assert.equal(han(result(mixed,[],{...ctx,winningTile:mixed[0]}),'sanankou'),undefined);
    assert.equal(han(result(mixed,[],{...ctx,winningTile:mixed[9]}),'sanankou'),2);
    assert.equal(han(result(mixed),'sanankou'),undefined);
});

test('yakuman suppress ordinary yaku and stack distinct patterns', () => {
    const dragons = [pon('dragon','red'),pon('dragon','green'),pon('dragon','white')];
    assert.deepEqual(result([...t('man',1,2,3),...pair],dragons),[{name:'daisangen',yakuman:1}]);
    const winds = ['east','south','west','north'].map(wind => pon('wind',wind,true,'kan'));
    assert.deepEqual(new Set(result(t('dragon','red','red'),winds).map(y => y.name)),
        new Set(['tsuuiisou','daisuushii','suukantsu']));
    const little = result([...t('man',1,2,3),...pair],winds.slice(0,3));
    assert.deepEqual(little,[{name:'shousuushii',yakuman:1}]);
    const terminals = result(t('man',9,9),[pon('man',1),pon('pin',1),pon('pin',9),pon('bamboo',9)]);
    assert.deepEqual(terminals,[{name:'chinroutou',yakuman:1}]);
    assert.deepEqual(result(t('bamboo',8,8),[pon('bamboo',2),pon('bamboo',3),pon('bamboo',4),pon('dragon','green')]),
        [{name:'ryuuiisou',yakuman:1}]);
});

test('nine gates excludes open calls and concealed kans', () => {
    const hand = t('man',1,1,1,2,3,4,5,5,6,7,8,9,9,9);
    assert.deepEqual(result(hand),[{name:'chuurenPoutou',yakuman:1}]);
    assert.ok(!result(hand.slice(3),[pon('man',1)]).some(y => y.name === 'chuurenPoutou'));
    assert.ok(!result(hand.slice(3),[pon('man',1,false,'kan')]).some(y => y.name === 'chuurenPoutou'));
});

test('event yaku require explicit flags, closed riichi, and matching win methods', () => {
    const hand = [...t('man',1,2,3),...t('pin',4,5,6),...t('bamboo',6,7,8,2,3,4),...pair];
    const events = {...ctx,riichi:true,doubleRiichi:true,ippatsu:true,haitei:true,houtei:true,rinshanKaihou:true,chankan:true};
    const ron = result(hand,[],events);
    assert.equal(han(ron,'doubleRiichi'),2);
    assert.equal(han(ron,'riichi'),undefined);
    assert.equal(han(ron,'ippatsu'),1);
    assert.equal(han(ron,'chankan'),1);
    assert.equal(han(ron,'houtei'),undefined);
    assert.equal(han(ron,'rinshanKaihou'),undefined);
    const tsumo = result(hand,[],{...events,winMethod:'tsumo'});
    assert.equal(han(tsumo,'rinshanKaihou'),1);
    assert.equal(han(tsumo,'haitei'),undefined);
    assert.equal(han(result(hand,[],{...ctx,haitei:true,winMethod:'tsumo'}),'haitei'),1);
    assert.equal(han(result(hand,[],{...ctx,houtei:true}),'houtei'),1);
    assert.equal(han(result(hand,[],{...ctx,ippatsu:true}),'ippatsu'),undefined);
    const open = result(hand.slice(3),[{type:'chi',open:true,tiles:hand.slice(0,3)}],events);
    assert.equal(han(open,'doubleRiichi'),undefined);
    assert.equal(han(open,'ippatsu'),undefined);
    assert.deepEqual(result(hand,[],{...ctx,winMethod:'tsumo',chiihou:true}),[{name:'chiihou',yakuman:1}]);
    assert.deepEqual(result(hand,[],{...ctx,seatWind:'east',winMethod:'tsumo',tenhou:true}),[{name:'tenhou',yakuman:1}]);
    assert.ok(!result(hand,[],{...ctx,tenhou:true,chiihou:true}).some(y => y.yakuman));
});
