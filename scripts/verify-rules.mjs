import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES,skillPool,sandSynergy } from '../src/game/heroes.ts';
import { calculateStats,rollCritical,difficultyAt } from '../src/game/progression.ts';
import { ITEMS,rollItems,availableItems } from '../src/game/catalog.ts';
import { formAt,portraitRegion } from '../src/game/evolution.ts';
import { choiceCount,choiceUses,purchase,refund,NEW_ADMIN } from '../src/game/preparation.ts';
assert.equal(HEROES.length,23);
assert.equal(new Set(HEROES.flatMap(h=>h.techniques.map(t=>t.name))).size,69);
{// Regra do usuário: 1–2 técnicas únicas por shinobi; pool respeita elemento; únicas de outros só após selar.
 const {uniqueTechniques,allowedElements,techniquePool}=await import('../src/game/heroes.ts');
 for(const h of HEROES){const n=uniqueTechniques(h.id).length;assert.ok(n>=1&&n<=2,h.id+' tem '+n+' únicas');const allowed=allowedElements(h.id);for(const t of techniquePool(h.id))assert.ok(allowed.has(t.element),h.id+' não pode aprender '+t.name+' ('+t.element+')');}
 const names=HEROES.flatMap(h=>uniqueTechniques(h.id).map(t=>t.name));assert.equal(new Set(names).size,names.length,'única pertence a um só shinobi');
 assert.ok(!skillPool('lee').some(t=>t.element!=='Neutro'),'Lee (sem natureza) só aprende Neutro');
 assert.ok(!skillPool('naruto').some(t=>t.name==='Raikiri'),'única do Kakashi bloqueada antes de selar');
 assert.ok(skillPool('naruto',new Set(['kakashi'])).some(t=>t.name==='Raikiri'),'única liberada depois de selar o Kakashi');
 assert.ok(!skillPool('gaara').some(t=>t.name==='Punho da Folha'),'Neutro compartilhado de outra vila não entra');
 assert.ok(!skillPool('gaara').some(t=>t.name==='Lâminas Cruzadas'),'sem selar a Temari, nada dela entra');assert.ok(skillPool('gaara',new Set(['temari'])).some(t=>t.name==='Lâminas Cruzadas'),'compartilhada da mesma vila com elemento compatível entra após selar');assert.equal(skillPool('naruto').length,4,'no começo o pool é só o kit');}
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
{// Combos por aldeia/organização: só AJUDANTES contam (herói fora); faixas 2/3/4/5; nenhum combo dá dano % + projétil.
 const {activeSynergies,synergyBonuses,synergyDefinitions,VILLAGE_COMBOS}=await import('../src/game/synergy.ts');
 const {allyBuffBonuses,alliesBonuses,affinityLevel,affinityFactor,maxAffinityPoints,AFFINITY_RULES,splitProjectiles}=await import('../src/game/allies.ts');
 for(const def of synergyDefinitions())for(const [tier,b] of Object.entries(def.tiers))assert.ok(!(b.damage&&(b.projectiles||b.projectileChance)),`combo ${def.id} faixa ${tier} mistura dano e projétil`);
 for(const v of ['Vila da Folha','Vila da Nuvem','Vila da Névoa','Vila da Pedra','Vila da Areia'])assert.deepEqual(Object.keys(VILLAGE_COMBOS[v].tiers).map(Number),[2,3,4,5],v+' sem faixas 2/3/4/5');
 const sand=activeSynergies('naruto',['gaara','temari','kankuro']);const brothers=sand.find(s=>s.id==='org:areia');assert.equal(brothers.bonuses.defense,12);assert.equal(brothers.bonuses.damage,.15);assert.equal(sand.find(s=>s.id==='vila:Vila da Areia').tier,3);
 assert.equal(activeSynergies('gaara',['temari','kankuro']).find(s=>s.id==='org:areia').tier,2,'herói (Gaara) fica fora da contagem');
 assert.equal(activeSynergies('naruto',[]).length,0,'sem ajudantes não há sinergia');
 assert.equal(activeSynergies('gaara',['naruto']).length,0,'1 ajudante não ativa');
 assert.equal(activeSynergies('naruto',['sakura']).length,0,'herói da Folha + 1 ajudante da Folha não ativa (herói não conta)');
 assert.ok(!activeSynergies('itachi',['pain']).length,'Itachi herói + Pain: 1 ajudante só');
 assert.ok(activeSynergies('naruto',['itachi','pain']).some(s=>s.id==='org:akatsuki'));
 const uch=activeSynergies('naruto',['itachi','sasuke']);assert.deepEqual(uch.map(s=>s.id).sort(),['org:uchiha','vila:Vila da Folha'],'ajudante acumula vila + organização');
 const leaf=n=>activeSynergies('gaara',['naruto','sakura','kakashi','lee','tenten'].slice(0,n)).find(s=>s.id==='vila:Vila da Folha');
 assert.deepEqual(leaf(2).bonuses,{exp:.03,pickupFlat:.5});assert.deepEqual(leaf(3).bonuses,{projectiles:1,exp:.05,pickupFlat:2});
 assert.deepEqual(leaf(4).bonuses,{projectiles:1,projectileChance:.5,exp:.05,pickupFlat:2},'1,5 projétil = +1 e 50% de chance de +1');assert.deepEqual(leaf(5).bonuses,{projectiles:2,exp:.1,pickupFlat:3});
 assert.ok(activeSynergies('gaara',['iruka','sakura','lee']).some(s=>s.id==='vila:Vila da Folha'&&s.tier===3),'Iruka (NPC) conta para a Folha');
 assert.ok((synergyBonuses(activeSynergies('gaara',['naruto','sasuke','sakura','kakashi'])).damage??0)>=.11,'Time 7 com 4 ajudantes escala');
 // Afinidade: Nv. 1..5, passiva 40%→100%; Iruka/omitido = máximo.
 assert.equal(affinityLevel(0),1);assert.equal(affinityLevel(maxAffinityPoints()),AFFINITY_RULES.max);assert.equal(affinityFactor(0),.4);assert.equal(affinityFactor(maxAffinityPoints()),1);
 assert.equal(allyBuffBonuses('naruto',1,0).damage,.048);assert.equal(allyBuffBonuses('naruto').damage,.12);assert.equal(allyBuffBonuses('naruto',1.4).damage,.168);
 assert.deepEqual(allyBuffBonuses('tenten',1,0),{projectileChance:.4},'Tenten Nv. 1: 40% de chance de +1 projétil');assert.deepEqual(allyBuffBonuses('tenten',1.4),{projectiles:1,projectileChance:.4});
 assert.equal(alliesBonuses(['iruka'],1,{iruka:maxAffinityPoints()}).exp,.25);assert.deepEqual(splitProjectiles({projectiles:2.25}),{projectiles:2,projectileChance:.25});
 assert.equal(calculateStats('naruto',1,{},{},0,{},{projectileChance:.5}).projectileChance,.5);}
{// Velocidade de projétil, setups (buff puro) e linha Senjutsu.
 const {setupNumbers,setupLines,hasSenjutsu,SENJUTSU,affectedTechniques,itemAttribute:attr}=await import('../src/game/combat.ts');const {HERO_BY_ID,ultimateBase}=await import('../src/game/heroes.ts');
 assert.equal(calculateStats('naruto',1).projectileSpeed,1);assert.ok(Math.abs(calculateStats('naruto',1,{'Lente do Atirador':2}).projectileSpeed-1.28)<1e-9);assert.equal(calculateStats('naruto',1,{'Seixo Polido do Rio':2}).bounce,2);
 assert.ok(Math.abs(calculateStats('naruto',1,{},{'Pílula do Arremesso':3}).projectileSpeed-1.3)<1e-9);
 const setups=HEROES.flatMap(h=>h.techniques.filter(t=>t.setup).map(t=>t.name)).sort();assert.deepEqual([...new Set(setups)],['Byakugou','Habanero Sangrento','Modo Sábio','Portões do Inferno']);
 const gates=HERO_BY_ID.lee.techniques.find(t=>t.setup);const g=setupNumbers(gates);assert.equal(g.cooldown,11);assert.equal(g.duration,6);assert.ok(Math.abs(g.uptime-6/11)<1e-9);assert.ok(setupLines(gates).includes('Ativo 55% do tempo'));assert.ok(setupLines(gates).includes('Acumulável: Não'));
 assert.ok(setupNumbers(gates,{damage:0,area:0,haste:.1,duration:.2}).uptime>g.uptime,'afixos de recarga/duração aumentam o tempo ativo');
 assert.equal(ultimateBase(HERO_BY_ID.naruto).name,'Kage Bunshin');assert.ok(HEROES.every(h=>!ultimateBase(h).setup));
 assert.ok(HEROES.every(h=>!h.techniques[0].setup),'a técnica inicial sempre ataca');
 assert.equal(SENJUTSU.multiplier,1.5);const rasengan=HERO_BY_ID.naruto.techniques.find(t=>t.name==='Rasengan'),punch=HERO_BY_ID.hashirama.techniques[0];
 assert.equal(hasSenjutsu(rasengan,false),false);assert.equal(hasSenjutsu(rasengan,true),true);assert.equal(hasSenjutsu(punch,true),false,'Senjutsu é linha só de Ninjutsu');assert.equal(hasSenjutsu(HERO_BY_ID.hashirama.techniques[3],false),true,'Ninjutsu de elemento Sábio já tem Senjutsu');
 const lens=ITEMS.find(i=>i.id==='sniper-lens'),pebble=ITEMS.find(i=>i.id==='river-pebble');assert.ok(lens&&pebble);assert.equal(attr(pebble),'Velocidade');
 assert.ok(!affectedTechniques(lens,HERO_BY_ID.lee.techniques).includes('Portões do Inferno'),'itens de ataque não afetam setups');assert.equal(affectedTechniques(lens,HERO_BY_ID.lee.techniques).length,3);}
{// Roleta da Tsunade: casas boas/ruins, sorte com teto, dificuldade compensando, custo crescente e buff por Ryu gasto.
 const R=await import('../src/game/roulette.ts');const sum=w=>Object.values(w).reduce((a,b)=>a+b,0);
 const w0=R.rouletteWeights(0,0),wLuck=R.rouletteWeights(200,0),wMax=R.rouletteWeights(100000,0),wCurse=R.rouletteWeights(200,R.roulettePressure(1.2,3,'Kage'));
 for(const w of [w0,wLuck,wMax,wCurse])assert.ok(Math.abs(sum(w)-1)<1e-9);
 assert.ok(R.goodChance(wLuck)>R.goodChance(w0),'sorte aumenta casas boas');assert.ok(wLuck.item>w0.item*2.5,'sorte favorece casas premium');
 assert.ok(R.badChance(wMax)>=R.ROULETTE_RULES.minBad-1e-9,'nunca 100% bom');assert.ok(R.goodChance(wMax)<.9);
 assert.ok(R.badChance(wCurse)>R.badChance(wLuck),'dificuldade/Maldição compensa a sorte');assert.ok(R.badChance(R.rouletteWeights(0,50))<=R.ROULETTE_RULES.maxBad+1e-9);
 const rr=R.seededRng(77);let bad=0;for(let i=0;i<40000;i++)bad+=Number(R.ROULETTE_BY_ID[R.rollRoulette(wMax,rr)].kind==='ruim');assert.ok(bad/40000>.13&&bad/40000<.17,'amostragem respeita o mínimo de casas ruins');
 assert.equal(R.rouletteCost(0,0),25);assert.equal(R.rouletteCost(4,0),45);assert.equal(R.rouletteCost(0,.24),19);assert.equal(R.rouletteCost(0,.9),15,'desconto limitado a 40%');
 assert.deepEqual(R.spendBonuses({},5000),{});assert.equal(R.spendBonuses({'Carteira Gama-chan':1},749).damage,.02);assert.equal(R.spendBonuses({'Carteira Gama-chan':1},99999).damage,.3);
 const wallet=calculateStats('naruto',1,{'Carteira Gama-chan':1},{},0,{},R.spendBonuses({'Carteira Gama-chan':1},500));assert.ok(Math.abs(wallet.damage/calculateStats('naruto',1).damage-1.02)<1e-9);assert.ok(Math.abs(wallet.moneyGain-1.12)<1e-9);}
assert.ok(skillPool('gaara',new Set(['temari'])).some(t=>t.name==='Corte do Leque'));assert.ok(skillPool('gaara',new Set(['kankuro'])).some(t=>t.name==='Agulhas de Karasu'));assert.ok(!skillPool('gaara').some(t=>t.name==='Corte do Leque'));
assert.equal(choiceCount({}),3);assert.equal(choiceCount({'Quarta opção':1}),4);
assert.deepEqual(choiceUses({'Atualizar':7,'Pular':7,'Banir':7}),{reroll:10,skip:10,ban:10});
assert.equal(refund(purchase(NEW_ADMIN,300)).balance,999999);
assert.ok(!availableItems(['critical'],['critical'],false).some(i=>i.id==='critical'));
// Passivas Shinobi: seções, nós novos com efeito real, Bolsa da Missão e Treinamento com Jiraiya.
{const P=await import('../src/game/preparation.ts');
 assert.equal(P.PASSIVES.length,25);assert.equal(new Set(P.PASSIVES.map(p=>p.name)).size,25);
 assert.ok(P.PASSIVES.every(p=>P.PASSIVE_SECTIONS.some(s=>s.id===p.section)));assert.ok(P.PASSIVES.every(p=>ITEMS.some(i=>i.id===p.icon)),'ícone de cada passiva existe no catálogo');
 for(const name of ['Chakra Curativo','Expansão','Farmacologia Ninja','Selo de Ressurreição','Baú do Clã','Meditação de Chakra','Bolsa Grande','Treinamento com Jiraiya'])assert.ok(P.PASSIVES.some(p=>p.name===name),name);
 const s0=calculateStats('naruto',1),s1=calculateStats('naruto',1,{},{},0,{'Chakra Curativo':5,'Expansão':5,'Meditação de Chakra':5,'Farmacologia Ninja':2,'Selo de Ressurreição':1});
 assert.ok(Math.abs(s1.regen-s0.regen-1)<1e-9);assert.ok(Math.abs(s1.area-s0.area-.15)<1e-9);assert.ok(Math.abs(s1.ultimateRate-s0.ultimateRate-.2)<1e-9);assert.equal(s1.extra.pillCap,2);assert.equal(s1.extra.revive35,1);
 assert.deepEqual(P.homeCapacity({},0),{total:5,fromChest:5,fromUnlocks:0});assert.equal(P.homeCapacity({'Baú do Clã':6},64).total,67);
 assert.equal(P.prioritySlots({}),2);assert.equal(P.prioritySlots({'Bolsa Grande':1}),3);
 assert.deepEqual(P.jiraiyaSlots({}),[]);assert.equal(P.jiraiyaSlots({'Treinamento com Jiraiya':4}).every(s=>s.rarity==='Raro'),true);
 assert.deepEqual(P.jiraiyaSlots({'Treinamento com Jiraiya':8}).map(s=>s.chance),[.15,.15,.15,.15]);
 let hits=0;for(let i=0;i<20000;i++)hits+=P.jiraiyaRolls({'Treinamento com Jiraiya':8});assert.ok(Math.abs(hits/20000-.6)<.03,'4 espaços lendários ≈ 0,6 técnica favorita por oferta');
 // Prioridade da Bolsa: peso ×3 aumenta a frequência sem tirar os outros itens do sorteio.
 const commons=ITEMS.filter(i=>i.rarity==='Comum').slice(0,5),fav=commons[0];let base=0,prio=0;
 for(let i=0;i<20000;i++){base+=Number(rollItems(commons,{},0,1)[0].id===fav.id);prio+=Number(rollItems(commons,{},0,1,Math.random,[fav.id],P.PRIORITY_WEIGHT)[0].id===fav.id);}
 assert.ok(prio/base>1.9&&prio/base<2.4,'prioridade ×3 de peso: 20% → 3/7 entre 5 itens da mesma raridade');}
assert.ok(difficultyAt('Kage',500,1.4).attackRate>difficultyAt('Genin',0).attackRate);
const result={megaRate:mega/100000,rareRateZeroLuck:rare/50000,rareRateLuck200:highRare/50000,roster:HEROES.length,techniques:new Set(HEROES.flatMap(h=>h.techniques.map(t=>t.name))).size,items:ITEMS.length};console.log(result);fs.writeFileSync('artifacts/rules-checks.json',JSON.stringify(result,null,2));


