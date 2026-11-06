import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES,skillPool,sandSynergy } from '../src/game/heroes.ts';
import { calculateStats,rollCritical,difficultyAt } from '../src/game/progression.ts';
import { ITEMS,rollItems,availableItems } from '../src/game/catalog.ts';
import { formAt,portraitRegion } from '../src/game/evolution.ts';
import { choiceCount,choiceUses,purchase,refund,NEW_ADMIN } from '../src/game/preparation.ts';
assert.equal(HEROES.length,22);
assert.equal(new Set(HEROES.flatMap(h=>h.techniques.map(t=>t.name))).size,88);
assert.equal(rollCritical(0,2.5,()=>0).tier,0);
assert.deepEqual(rollCritical(1,2.5,()=>.8),{tier:1,multiplier:2.5});
assert.deepEqual(rollCritical(1.5,2.5,()=>.49),{tier:2,multiplier:3});
assert.deepEqual(rollCritical(1.5,2.5,()=>.51),{tier:1,multiplier:2.5});
assert.deepEqual(rollCritical(2,2.5,()=>.999),{tier:2,multiplier:3});
let seed=8127;const rng=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
let mega=0;for(let i=0;i<100000;i++)mega+=Number(rollCritical(1.5,2.5,rng).tier===2);
assert.ok(mega>49000&&mega<51000);
let rare=0,highRare=0;for(let i=0;i<50000;i++){rare+=Number(['Raro','Épico','Lendário'].includes(rollItems(ITEMS,{},0,1,rng)[0].rarity));highRare+=Number(['Raro','Épico','Lendário'].includes(rollItems(ITEMS,{},200,1,rng)[0].rarity));}
assert.ok(rare<150);assert.ok(highRare>rare*3);
// Catálogo no formato da referência: ~90 itens, ids únicos, limites válidos, ícones do atlas 4×4 e itens pedidos (Genjutsu e Jutsu Sábio).
assert.ok(ITEMS.length>=80);assert.equal(new Set(ITEMS.map(i=>i.id)).size,ITEMS.length);assert.equal(new Set(ITEMS.map(i=>i.name)).size,ITEMS.length);
assert.ok(ITEMS.every(i=>i.max>=1&&i.sprite>=0&&i.sprite<16&&Object.keys(i.bonuses).length>0));
const m=ITEMS.find(i=>i.id==='luck');assert.equal(m.rarity,'Raro');assert.equal(m.max,10);
assert.equal(ITEMS.find(i=>i.id==='genjutsu-scroll').bonuses.genjutsu,.28);assert.equal(ITEMS.find(i=>i.id==='el-sage').bonuses.elSabio,.28);
const {itemAttribute}=await import('../src/game/combat.ts');
assert.equal(ITEMS.filter(i=>i.rarity==='Raro'&&itemAttribute(i)==='Chance crítica').length,1);
for(const id of ['damage','life','sandals','experience','coins','luck','pickup','bandana','critical','speed','clone','cooldown','tenten','recruit'])assert.ok(ITEMS.some(i=>i.id===id),'ícone da árvore sem item: '+id);
const n1=calculateStats('naruto',1),n2=calculateStats('naruto',2);
assert.ok(Math.abs(n2.damage/n1.damage-1.01)<1e-8);assert.equal(n1.maxHp,85);
assert.ok(calculateStats('pain',1).maxHp>n1.maxHp);assert.ok(calculateStats('naruto',10).maxHp>calculateStats('naruto',9).maxHp+20);
const gaara=calculateStats('gaara',1),armored=calculateStats('gaara',1,{'Bandana Reforçada':1});
assert.equal(armored.armor,gaara.armor+6);assert.ok(Math.abs(armored.damage/gaara.damage-1.18/1.12)<1e-8);
const xp=calculateStats('naruto',1,{'Pergaminho de Estudo':1});assert.equal(xp.xpGain,1.25);assert.equal(xp.pickup,4.5);
const cursed=calculateStats('naruto',1,{'Selo Amaldiçoado':1});assert.equal(cursed.maxHp,Math.round(n1.maxHp*.9));assert.ok(Math.abs(cursed.damage/n1.damage-1.3)<1e-8);
const fury=calculateStats('hashirama',1,{'Fúria da Kyuubi':1});assert.ok(Math.abs(fury.regen/calculateStats('hashirama',1).regen-.75)<1e-8);
assert.equal(calculateStats('naruto',1,{'Pergaminho Genjutsu':1}).genjutsu,1.28);assert.equal(calculateStats('naruto',1,{'Fio de Aço Ninja':2}).extra.rootChance,.08);
assert.equal(formAt('naruto',49).name,'Shippuden');assert.equal(formAt('naruto',50).name,'Manto da Kyuubi');
for(const h of HEROES){const r=portraitRegion(h.id);assert.ok(r.index>=0&&r.index<25);assert.ok(fs.existsSync('public'+r.path));}
assert.equal(sandSynergy(['gaara','temari']),false);assert.equal(sandSynergy(['gaara','temari','kankuro']),true);
assert.ok(skillPool('gaara').some(t=>t.name==='Corte do Leque'));assert.ok(skillPool('gaara').some(t=>t.name==='Agulhas de Karasu'));
assert.equal(choiceCount({}),3);assert.equal(choiceCount({'Quarta opção':1}),4);
assert.deepEqual(choiceUses({'Atualizar':7,'Pular':7,'Banir':7}),{reroll:10,skip:10,ban:10});
assert.equal(refund(purchase(NEW_ADMIN,300)).balance,999999);
assert.ok(!availableItems(['critical'],['critical'],false).some(i=>i.id==='critical'));
assert.ok(difficultyAt('Kage',500,1.4).attackRate>difficultyAt('Genin',0).attackRate);
const result={megaRate:mega/100000,rareRateZeroLuck:rare/50000,rareRateLuck200:highRare/50000,roster:HEROES.length,techniques:HEROES.length*4,items:ITEMS.length};console.log(result);fs.writeFileSync('artifacts/rules-checks.json',JSON.stringify(result,null,2));


