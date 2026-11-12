import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES,HERO_BY_ID,heroOrganizations,skillPool,sandSynergy,versionForEncounter,isProjectileUltimate } from '../src/game/heroes.ts';
import { calculateStats,rollCritical,difficultyAt,heroDamageScale,xpToLevelUp,effectiveLootLuck } from '../src/game/progression.ts';
import { megaEliteHp,rollMegaSchedule } from '../src/game/enemyTiers.ts';
import { guardianVitality,guardianDefense } from '../src/game/missions.ts';
import { ITEMS,rollItems,availableItems } from '../src/game/catalog.ts';
import { ASUMA_ATLAS,FORMS,formAt,portraitRegion } from '../src/game/evolution.ts';
import { actionArt, directionalArt } from '../src/game/directionalArt.ts';
import { choiceCount,choiceUses,purchase,refund,NEW_ADMIN } from '../src/game/preparation.ts';
// Versões separadas (06/11/2026): cada forma de evolution.ts é um personagem jogável próprio (24 famílias, 56 versões).
assert.equal(HEROES.length,56);
assert.equal(new Set(HEROES.map(h=>h.family)).size,24);
for(const id of ['chomei','gyuki']){
 const portrait=portraitRegion(id);
 assert.equal(portrait.path,`/assets/bijuu/${id}-v2.png`);
 assert.ok(fs.existsSync('public'+portrait.path));
}
const motionPairs = new Set();
let motionForms = 0;
const versionForms = new Set();
for (const hero of HEROES) {
  const id=hero.family, level=formAt(hero.id).level;
  assert.equal(level,hero.form,`${hero.id} fica na própria forma`);
  assert.equal(formAt(hero.id,99).level,level,`${hero.id} não evolui dentro da run`);
  assert.ok(FORMS[id]?FORMS[id].some(f=>f.level===level):level===1,`${hero.id}: forma ${level} existe em FORMS`);
  versionForms.add(id+':'+level);
  motionForms++;
  if (id==='asuma'||(id==='naruto'&&level===1)) {
    assert.ok(fs.existsSync('public'+(id==='asuma'?ASUMA_ATLAS:'/assets/naruto-academia-walk-v1.png')));
    continue;
  }
  const action=actionArt(id,level);
  if(action)assert.ok(fs.existsSync('public'+action.path),`folha de ação ausente: ${id} nível ${level}`);
  const sheet=directionalArt(id,level);
  assert.ok(sheet && fs.existsSync('public'+sheet.path),`folha ausente: ${id} nível ${level}`);
  const row = sheet.firstRow ?? 0;
  assert.ok(row>=0 && row%2===0 && row+1<sheet.rows,`dupla frente/costas inválida: ${id} nível ${level}`);
  const pair = `${sheet.path}:${row}`;
  assert.ok(!motionPairs.has(pair),`folha compartilhando quadros entre formas: ${pair}`);
  motionPairs.add(pair);
}
assert.equal(motionForms,56);assert.equal(versionForms.size,56,'uma versão por forma');
{// Todas as formas de FORMS viraram versão jogável.
 for(const [family,forms] of Object.entries(FORMS))for(const f of forms)assert.ok(versionForms.has(family+':'+f.level),'forma sem versão: '+family+' '+f.name);}
{// Fase da obra por versão: cada versão só tem técnicas da própria fase.
 const {HERO_BY_ID,PHASE_LEVELS,SHARED_TECHNIQUES}=await import('../src/game/heroes.ts');const lv=(id,name)=>HERO_BY_ID[id].techniques.find(t=>t.name===name)?.unlockLevel;const has=(id,name)=>HERO_BY_ID[id].techniques.some(t=>t.name===name);
 assert.deepEqual(HERO_BY_ID.naruto.techniques.map(t=>t.name),['Kage Bunshin','Shuriken','Kunai Tática','Rendan Uzumaki']);
 assert.ok(!has('naruto','Rasengan')&&!has('naruto','Modo Sábio')&&!skillPool('naruto').some(t=>t.name==='Modo Sábio'),'Naruto Academia sem Rasengan/Modo Sábio');
 assert.deepEqual(HERO_BY_ID['naruto-genin'].techniques.map(t=>[t.name,t.unlockLevel]),[['Kage Bunshin',1],['Invocação do Sapo',5],['Kunai Tática',8],['Rasengan',15]]);
 assert.ok(has('naruto-shippuden','Modo Sábio')&&has('naruto-shippuden','Rasenshuriken')&&has('naruto-kyuubi','Bijūdama'));
 const sapo=HERO_BY_ID['naruto-genin'].techniques[1];assert.equal(sapo.shape,'Área');assert.equal(sapo.element,'Neutro');assert.ok(SHARED_TECHNIQUES.has('Invocação do Sapo'));assert.ok(HERO_BY_ID.jiraiya.techniques.some(t=>t.name==='Invocação do Sapo'),'Sapo compartilhado com Jiraiya');
 assert.ok(!skillPool('naruto-genin').some(t=>t.element==='Água'),'Sapo Neutro não abre Água ao Naruto');
 for(const [id,levels] of Object.entries(PHASE_LEVELS))for(const name of Object.keys(levels))assert.ok(lv(id,name)!==undefined,'PHASE_LEVELS cita técnica fora do kit: '+id+' / '+name);
 for(const h of HEROES){assert.equal(h.techniques[0].unlockLevel,1,h.id+': técnica inicial no Nv. 1');for(let i=1;i<h.techniques.length;i++)assert.ok(h.techniques[i].unlockLevel>=h.techniques[i-1].unlockLevel,h.id+': kit em ordem cronológica');}
 assert.ok(!has('sasuke','Amaterasu')&&has('sasuke-shippuden','Amaterasu')&&!has('sakura','Impacto de Sakura')&&has('sakura-shippuden','Impacto de Sakura')&&!has('neji','Palma de Ar')&&has('neji-jonin','Palma de Ar')&&!has('shikamaru','Costura das Sombras')&&has('shikamaru-estrategista','Costura das Sombras'),'técnicas do Shippuden só nas versões Shippuden');
 assert.ok(lv('lee','Portões do Inferno')<15&&lv('sasuke','Chidori')<15,'técnicas da Parte I liberadas na fase genin');
 // Versões avançadas mais fortes que a anterior da família.
 const {familyVersions}=await import('../src/game/heroes.ts');
 for(const family of new Set(HEROES.map(h=>h.family))){const list=familyVersions(family);for(let i=1;i<list.length;i++){const a=calculateStats(list[i-1].id,1),b=calculateStats(list[i].id,1);assert.ok(b.maxHp>a.maxHp&&b.damage>a.damage,list[i].id+' mais forte que '+list[i-1].id);}}}
{// Cadeia de missões das versões: jogar com a anterior, dificuldade/abates crescentes, legado de saves pelo id base.
 const {UNLOCK_MISSIONS,missingRequirements}=await import('../src/game/unlockMissions.ts');const {HERO_BY_ID,familyVersions}=await import('../src/game/heroes.ts');const {STARTER_HEROES}=await import('../src/game/account.ts');
 const rank={Genin:1,Chunin:2,Jonin:3,Kage:4};
 for(const h of HEROES){if(h.family===h.id){assert.ok(STARTER_HEROES.includes(h.id)||UNLOCK_MISSIONS[h.id],h.id+' sem missão');continue;}
  const m=UNLOCK_MISSIONS[h.id];assert.ok(m,'versão sem missão: '+h.id);const list=familyVersions(h.family),prev=list[list.findIndex(x=>x.id===h.id)-1];
  assert.equal(m.playWith,prev.id,h.id+' exige jogar com '+prev.id);
  const pm=UNLOCK_MISSIONS[prev.id];if(pm){assert.ok(rank[m.difficulty]>=rank[pm.difficulty]&&m.kills>pm.kills&&m.minute>=pm.minute,h.id+' mais difícil que a missão de '+prev.id);}
  assert.ok(m.kills>=300,h.id+' pede abates de versão');}
 assert.deepEqual(missingRequirements('naruto-genin',new Set(),()=>false),['naruto']);
 assert.deepEqual(missingRequirements('naruto-genin',new Set()),[],'Naruto Academia é inicial');
 assert.deepEqual(missingRequirements('naruto-shippuden',new Set()),['naruto-genin'],'Shippuden exige liberar o Genin');
 for(const id of ['naruto','sasuke','sakura','asuma'])assert.equal(HERO_BY_ID[id].form,1,'id antigo = primeira versão (saves)');}
{// Regra do usuário: 1–2 técnicas únicas por versão; pool respeita elemento; únicas de outros só após selar.
 const {uniqueTechniques,allowedElements,techniquePool}=await import('../src/game/heroes.ts');
 for(const h of HEROES){const n=uniqueTechniques(h.id).length;assert.ok(n>=1&&n<=2,h.id+' tem '+n+' únicas');const allowed=allowedElements(h.id);for(const t of techniquePool(h.id))assert.ok(allowed.has(t.element),h.id+' não pode aprender '+t.name+' ('+t.element+')');}
 const owner=new Map();for(const h of HEROES)for(const t of uniqueTechniques(h.id)){assert.ok(!owner.has(t.name)||owner.get(t.name)===h.family,'única '+t.name+' em duas famílias');owner.set(t.name,h.family);}
 assert.ok(!skillPool('naruto',new Set(['naruto-shippuden'])).some(t=>t.name==='Rasenshuriken'),'versão não empresta técnica de outra versão da família');
 assert.ok(!skillPool('lee').some(t=>t.element!=='Neutro'),'Lee (sem natureza) só aprende Neutro');
 assert.ok(!skillPool('naruto').some(t=>t.name==='Raikiri'),'única do Kakashi bloqueada antes de selar');
 assert.ok(!skillPool('naruto',new Set(['kakashi'])).some(t=>t.name==='Raikiri'),'selar não ignora incompatibilidade elemental');
 assert.ok(skillPool('sasuke',new Set(['kakashi'])).some(t=>t.name==='Raikiri'),'única liberada após selar para shinobi compatível');
 assert.ok(!skillPool('gaara').some(t=>t.name==='Punho da Folha'),'Neutro compartilhado de outra vila não entra');
 assert.ok(!skillPool('gaara').some(t=>t.name==='Lâminas Cruzadas'),'sem selar a Temari, nada dela entra');assert.ok(skillPool('gaara',new Set(['kankuro'])).some(t=>t.name==='Kunai Tática'),'compartilhada da mesma vila com elemento compatível entra após selar');assert.ok(!skillPool('gaara',new Set(['temari'])).some(t=>t.name==='Lâminas Cruzadas'),'Gaara (base Areia) não aprende Vento');assert.ok(!skillPool('naruto').some(t=>t.name==='Katon: Fagulha'),'Naruto (base Vento) não aprende Katon');assert.ok(skillPool('naruto').every(t=>HEROES[0].techniques.some(k=>k.name===t.name)||t.unlockLevel<=4),'no começo: kit + básicas da Academia');assert.ok(skillPool('lee').some(t=>t.name==='Técnica de Substituição')&&!skillPool('lee').some(t=>t.name==='Katon: Fagulha'),'básicas respeitam a natureza');}
assert.equal(rollCritical(0,2.5,()=>0).tier,0);
assert.deepEqual(rollCritical(1,2.5,()=>.8),{tier:1,multiplier:2.5});
assert.deepEqual(rollCritical(1.5,2.5,()=>.49),{tier:2,multiplier:3});
assert.deepEqual(rollCritical(1.5,2.5,()=>.51),{tier:1,multiplier:2.5});
assert.deepEqual(rollCritical(2,2.5,()=>.999),{tier:2,multiplier:3});
let seed=8127;const rng=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
let mega=0;for(let i=0;i<100000;i++)mega+=Number(rollCritical(1.5,2.5,rng).tier===2);
assert.ok(mega>49000&&mega<51000);
let rare=0,highRare=0;for(let i=0;i<50000;i++){rare+=Number(['Raro','Épico','Lendário'].includes(rollItems(ITEMS,{},0,1,rng)[0].rarity));highRare+=Number(['Raro','Épico','Lendário'].includes(rollItems(ITEMS,{},200,1,rng)[0].rarity));}
assert.ok(rare<600,'Sorte 0: raro ou melhor abaixo de ~1,2%');assert.ok(highRare>rare*10,'Sorte 200 aumenta muito a raridade');
// Catálogo no formato da referência: ~90 itens, ids únicos, limites válidos, ícones do atlas 4×4 e itens pedidos (Genjutsu e Jutsu Sábio).
assert.ok(ITEMS.length>=80);assert.equal(new Set(ITEMS.map(i=>i.id)).size,ITEMS.length);assert.equal(new Set(ITEMS.map(i=>i.name)).size,ITEMS.length);
assert.ok(ITEMS.every(i=>i.max>=1&&i.sprite>=0&&i.sprite<16&&Object.keys(i.bonuses).length>0));
const m=ITEMS.find(i=>i.id==='luck');assert.equal(m.rarity,'Raro');assert.equal(m.max,10);
assert.equal(ITEMS.find(i=>i.id==='genjutsu-scroll').bonuses.genjutsu,.28);assert.equal(ITEMS.find(i=>i.id==='el-sage').bonuses.elSabio,.28);
const {itemAttribute}=await import('../src/game/combat.ts');
assert.equal(ITEMS.filter(i=>i.rarity==='Raro'&&itemAttribute(i)==='Chance crítica').length,1);
for(const id of ['damage','life','sandals','experience','coins','luck','pickup','bandana','critical','speed','clone','cooldown','tenten','recruit'])assert.ok(ITEMS.some(i=>i.id===id),'ícone da árvore sem item: '+id);
const n1=calculateStats('naruto',1),n2=calculateStats('naruto',2);
assert.ok(n2.damage/n1.damage>1.06&&n2.damage/n1.damage<1.08);assert.equal(n1.maxHp,85);
assert.equal(heroDamageScale(1),1);assert.ok(heroDamageScale(50)>11&&heroDamageScale(50)<12);
assert.ok(heroDamageScale(500)>7000&&heroDamageScale(1000)>90000);
assert.equal(xpToLevelUp(1),30);assert.ok(xpToLevelUp(1000)>xpToLevelUp(500));
const overtime=18*60,runSeconds=10*60+overtime;
const hpLate=guardianVitality(difficultyAt('Genin',runSeconds,1,overtime).hp,runSeconds,runSeconds,overtime,1);
// Rodada 47 — faixa atualizada: o usuário pediu early game +200% (hpBase 1,6→3,2 em ENEMY_SCALING; dano do herói ×0,55→×0,41).
// O HP tardio do guardião é proporcional a hpBase (1,17^min amplifica ~81× aos 28 min): 1,06e9 → ≈1,23e9. Se o usuário
// ajustar o scale da dificuldade, atualize esta faixa junto com ENEMY_SCALING (progression.ts) e a nota na docs/14.
assert.ok(hpLate>=1.1e9&&hpLate<1.35e9,`HP tardio do guardião: ${hpLate}`);
assert.ok(guardianDefense(runSeconds)>.85&&guardianDefense(runSeconds,true)>guardianDefense(runSeconds));
assert.ok(Math.abs(effectiveLootLuck(33,0)-6.6)<1e-9);assert.equal(effectiveLootLuck(33,150),33);
// Rodada 50 — base 9.500 ±5% por nascimento (rng fixo 0,5 = variação neutra = 9.500).
assert.equal(megaEliteHp(55,1,()=>.5),9500);assert.ok(megaEliteHp(595,1,()=>.5)>8e5);
for(const rng of [()=>0,()=>.5,()=>.99]){const schedule=rollMegaSchedule(rng);assert.ok(schedule.length>=4&&schedule.length<=6);assert.ok(schedule.every((t,i)=>t>0&&t<600&&(i===0||t>schedule[i-1])));}
assert.ok(calculateStats('pain',1).maxHp>n1.maxHp);assert.ok(calculateStats('naruto-genin',1).maxHp>calculateStats('naruto',1).maxHp*1.3,'versão seguinte herda o bônus de forma (+25% HP) e +12% de base');
const gaara=calculateStats('gaara',1),armored=calculateStats('gaara',1,{'Bandana Reforçada':1});
assert.equal(armored.armor,gaara.armor+6);assert.ok(Math.abs(armored.damage/gaara.damage-1.18/1.12)<1e-8);
const xp=calculateStats('naruto',1,{'Pergaminho de Estudo':1});assert.equal(xp.xpGain,1.25);assert.equal(xp.pickup,4.5);
const cursed=calculateStats('naruto',1,{'Selo Amaldiçoado':1});assert.equal(cursed.maxHp,Math.round(n1.maxHp*.9));assert.ok(Math.abs(cursed.damage/n1.damage-1.3)<1e-8);
const fury=calculateStats('hashirama',1,{'Fúria da Kyuubi':1});assert.ok(Math.abs(fury.regen/calculateStats('hashirama',1).regen-.75)<1e-8);
assert.equal(calculateStats('naruto',1,{'Pergaminho Genjutsu':1}).genjutsu,1.28);assert.equal(calculateStats('naruto',1,{'Fio de Aço Ninja':2}).extra.rootChance,.08);
assert.equal(formAt('naruto',49).name,'Academia');assert.equal(formAt('naruto-shippuden',1).name,'Shippuden');assert.equal(formAt('naruto-kyuubi',1).name,'Manto da Kyuubi');assert.equal(portraitRegion('naruto-kyuubi').index,24);assert.equal(portraitRegion('sasuke-rinnegan').path,'/assets/shinobi-evolutions-v2.png');
for(const h of HEROES){const r=portraitRegion(h.id);assert.ok(r.index>=0&&r.index<r.cols*r.rows,h.id+' retrato fora do atlas');assert.ok(fs.existsSync('public'+r.path));}
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
 assert.ok(activeSynergies('naruto',['itachi-akatsuki','pain']).some(s=>s.id==='org:akatsuki'));
 const uch=activeSynergies('naruto',['itachi','sasuke']);assert.deepEqual(uch.map(s=>s.id).sort(),['org:uchiha','vila:Vila da Folha'],'ajudante acumula vila + organização');
 const leaf=n=>activeSynergies('gaara',['naruto','sakura','kakashi','lee','tenten'].slice(0,n)).find(s=>s.id==='vila:Vila da Folha');
 assert.deepEqual(leaf(2).bonuses,{exp:.03,pickupFlat:.5});assert.deepEqual(leaf(3).bonuses,{projectiles:1,exp:.05,pickupFlat:2});
 assert.deepEqual(leaf(4).bonuses,{projectiles:1,projectileChance:.5,exp:.05,pickupFlat:2},'1,5 projétil = +1 e 50% de chance de +1');assert.deepEqual(leaf(5).bonuses,{projectiles:2,exp:.1,pickupFlat:3});
 assert.ok(activeSynergies('gaara',['iruka','sakura','lee']).some(s=>s.id==='vila:Vila da Folha'&&s.tier===3),'Iruka (NPC) conta para a Folha');
 assert.ok(activeSynergies('naruto',['naruto','sakura','kakashi','lee','tenten']).some(s=>s.id==='vila:Vila da Folha'&&s.tier===5),'Ajudante Naruto conta mesmo com Naruto jogável');
 assert.ok((synergyBonuses(activeSynergies('gaara',['naruto-genin','sasuke','sakura','kakashi'])).damage??0)>=.11,'Time 7 com 4 ajudantes escala');
 // Afinidade: Nv. 1..5, passiva 40%→100%; Iruka/omitido = máximo.
 assert.equal(affinityLevel(0),1);assert.equal(affinityLevel(maxAffinityPoints()),AFFINITY_RULES.max);assert.equal(affinityFactor(0),.4);assert.equal(affinityFactor(maxAffinityPoints()),1);
 assert.equal(HERO_BY_ID.orochimaru.village,'Vila da Folha');assert.equal(HERO_BY_ID['orochimaru-som'].village,'Vila do Som');
 assert.ok(!heroOrganizations('itachi').some(o=>o.id==='akatsuki'));assert.ok(heroOrganizations('itachi-akatsuki').some(o=>o.id==='akatsuki'));
 assert.ok(heroOrganizations('gaara-alianca').some(o=>o.id==='alianca'));assert.ok(!heroOrganizations('gaara').some(o=>o.id==='alianca'));
 assert.ok(allyBuffBonuses('sakura-shippuden').regen>0&&allyBuffBonuses('sakura-shippuden').pickupFlat>0);
 assert.ok(allyBuffBonuses('tsunade').regen>0&&allyBuffBonuses('tsunade').pickupFlat>0);
 assert.ok(allyBuffBonuses('itachi-akatsuki').genjutsu>0&&allyBuffBonuses('asuma').normal>0);
 for(const hero of HEROES)assert.ok(Object.keys(allyBuffBonuses(hero.id)).length>0,hero.id+' tem passiva de ajudante');
 assert.equal(versionForEncounter('gaara',1,'Genin'),'gaara');assert.equal(versionForEncounter('gaara',3,'Kage'),'gaara-alianca');
 assert.equal(allyBuffBonuses('naruto',1,0).damage,.048);assert.equal(allyBuffBonuses('naruto').damage,.12);assert.equal(allyBuffBonuses('naruto',1.4).damage,.168);
 assert.deepEqual(allyBuffBonuses('tenten',1,0),{normal:.032,projectileChance:.4},'Tenten Nv. 1: 40% de chance de +1 projétil');assert.deepEqual(allyBuffBonuses('tenten',1.4),{normal:.112,projectiles:1,projectileChance:.4});
 assert.equal(alliesBonuses(['iruka'],1,{iruka:maxAffinityPoints()}).exp,.25);assert.deepEqual(splitProjectiles({projectiles:2.25}),{projectiles:2,projectileChance:.25});
 assert.equal(calculateStats('naruto',1,{},{},0,{},{projectileChance:.5}).projectileChance,.5);}
{// Velocidade de projétil, setups (buff puro) e linha Senjutsu.
 const {setupNumbers,setupLines,hasSenjutsu,SENJUTSU,affectedTechniques,itemAttribute:attr}=await import('../src/game/combat.ts');const {HERO_BY_ID,ultimateBase}=await import('../src/game/heroes.ts');
 assert.equal(calculateStats('naruto',1).projectileSpeed,1);assert.ok(Math.abs(calculateStats('naruto',1,{'Lente do Atirador':2}).projectileSpeed-1.28)<1e-9);assert.equal(calculateStats('naruto',1,{'Seixo Polido do Rio':2}).bounce,2);
 assert.ok(Math.abs(calculateStats('naruto',1,{},{'Pílula do Arremesso':3}).projectileSpeed-1.3)<1e-9);
 const setups=HEROES.flatMap(h=>h.techniques.filter(t=>t.setup).map(t=>t.name)).sort();assert.deepEqual([...new Set(setups)],['Byakugou','Habanero Sangrento','Modo Sábio','Portões do Inferno']);
 const gates=HERO_BY_ID.lee.techniques.find(t=>t.setup);const g=setupNumbers(gates);assert.equal(g.cooldown,11);assert.equal(g.duration,6);assert.ok(Math.abs(g.uptime-6/11)<1e-9);assert.ok(setupLines(gates).includes('Ativo 55% do tempo'));assert.ok(setupLines(gates).includes('Acumulável: Não'));
 assert.ok(setupNumbers(gates,{damage:0,area:0,haste:.1,duration:.2}).uptime>g.uptime,'afixos de recarga/duração aumentam o tempo ativo');
 assert.equal(ultimateBase(HERO_BY_ID.naruto).name,'Rendan Uzumaki');assert.equal(ultimateBase(HERO_BY_ID['naruto-shippuden']).name,'Rasenshuriken');assert.ok(HEROES.every(h=>!ultimateBase(h).setup));
 assert.ok(HEROES.every(h=>!h.techniques[0].setup),'a técnica inicial sempre ataca');
 assert.equal(SENJUTSU.multiplier,1.5);const rasengan=HERO_BY_ID['naruto-genin'].techniques.find(t=>t.name==='Rasengan'),punch=HERO_BY_ID.hashirama.techniques[0];
 assert.equal(hasSenjutsu(rasengan,false),false);assert.equal(hasSenjutsu(rasengan,true),true);assert.equal(hasSenjutsu(punch,true),false,'Senjutsu é linha só de Ninjutsu');assert.equal(hasSenjutsu(HERO_BY_ID['hashirama-sabio'].techniques[3],false),true,'Ninjutsu de elemento Sábio já tem Senjutsu');
 const lens=ITEMS.find(i=>i.id==='sniper-lens'),pebble=ITEMS.find(i=>i.id==='river-pebble');assert.ok(lens&&pebble);assert.equal(attr(pebble),'Velocidade');
 assert.ok(!affectedTechniques(lens,HERO_BY_ID.lee.techniques).includes('Portões do Inferno'),'itens de ataque não afetam setups');assert.equal(affectedTechniques(lens,HERO_BY_ID.lee.techniques).length,3);}
{// Caça-Níquel da Tsunade (ex-"Roleta da Tsunade"): casas + 5 combos de 3 iguais, sorte com teto, custo crescente por giro/minuto/zona e buff por Ryu gasto.
 const R=await import('../src/game/roulette.ts');const sum=w=>Object.values(w).reduce((a,b)=>a+b,0);
 const w0=R.rouletteWeights(0,0),wLuck=R.rouletteWeights(200,0),wMax=R.rouletteWeights(100000,0),wCurse=R.rouletteWeights(200,R.roulettePressure(1.2,3,'Kage'));
 for(const w of [w0,wLuck,wMax,wCurse])assert.ok(Math.abs(sum(w)-1)<1e-9);
 assert.ok(R.goodChance(wLuck)>R.goodChance(w0),'sorte aumenta casas boas');assert.ok(wLuck.item>w0.item*2.5,'sorte favorece casas premium');
 assert.ok(R.badChance(wMax)>=R.ROULETTE_RULES.minBad-1e-9,'nunca 100% bom');assert.ok(R.goodChance(wMax)<.9);
 assert.ok(R.badChance(wCurse)>R.badChance(wLuck),'dificuldade/Maldição compensa a sorte');assert.ok(R.badChance(R.rouletteWeights(0,50))<=R.ROULETTE_RULES.maxBad+1e-9);
 const rr=R.seededRng(77);let bad=0;for(let i=0;i<40000;i++)bad+=Number(R.ROULETTE_BY_ID[R.rollRoulette(wMax,rr)].kind==='ruim');assert.ok(Math.abs(bad/40000-R.badChance(wMax))<.01,'amostragem bate com a chance exibida de casas ruins');
 assert.ok(Math.abs(R.goodChance(w0)-.3088)<.002,'rodada 37 (5 combos): Sorte 0 → ~30,9% de casas boas');
 for(const [id,kind] of [['tsunade','bom'],['jiraiya','bom'],['hiruzen','bom'],['hidan','ruim'],['kakuzu','bom']])assert.equal(R.ROULETTE_BY_ID[id].kind,kind,'combo de 3 iguais existe com a classe certa');
 assert.equal(R.slotKakuzuRyu(0,0),120,'3 Kakuzus: base 120 Ryu sem sorte/pressão');assert.equal(R.slotKakuzuRyu(100,0),240,'Sorte 100 dobra o tesouro');assert.equal(R.slotKakuzuRyu(100,1),480,'pressão do jogo multiplica o tesouro');
 {const wNoPill=R.rouletteWeights(0,0);assert.equal(wNoPill.pill,0);assert.ok(Math.abs(sum(wNoPill)-1)<1e-9);const r2=R.seededRng(5);for(let i=0;i<20000;i++)assert.notEqual(R.rollRoulette(wNoPill,r2),'pill','casa excluída nunca é sorteada');}
 // Economia expansiva (rodada 37): ×1,70 por giro, ×1,15 por minuto inteiro de run, +25% por zona acima da 1.
 assert.equal(R.rouletteCost(0,0),30);assert.equal(R.rouletteCost(4,0),251);assert.equal(R.rouletteCost(0,.24),23);assert.equal(R.rouletteCost(0,.9),18,'desconto limitado a 40%');
 assert.equal(R.rouletteCost(0,0,59),30,'inflação só por minuto inteiro');assert.equal(R.rouletteCost(0,0,600),121);assert.ok(R.rouletteCost(40,0,1800)>1e6,'fim de run: milhões');
 assert.equal(R.rouletteCost(0,0,0,2),38,'zona 2: custo +25%');assert.equal(R.rouletteCost(0,0,0,3),45,'zona 3: custo +50%');
 {const P=await import('../src/game/preparation.ts'),T=await import('../src/game/itemTrade.ts');
  assert.deepEqual([0,1,2,3].map(n=>P.weaponPrice(n)),[20,30,45,68]);assert.equal(P.weaponPrice(0,600),81);assert.ok(P.weaponPrice(25,1200)>2e6,'kunai no fim custa milhões');
  assert.equal(T.merchantPrice('Comum',0),45);assert.ok(T.merchantPrice('Comum',1,0,1)>T.merchantPrice('Comum',0));assert.equal(T.merchantPrice('Comum',2),82);assert.equal(T.merchantRerollPrice(0,0),20);assert.equal(T.merchantRerollPrice(2,0),45);assert.equal(T.merchantRerollPrice(0,.9),12);}
 assert.deepEqual(R.spendBonuses({},5000),{});assert.equal(R.spendBonuses({'Carteira Gama-chan':1},749).damage,.02);assert.equal(R.spendBonuses({'Carteira Gama-chan':1},99999).damage,.3);
 const wallet=calculateStats('naruto',1,{'Carteira Gama-chan':1},{},0,{},R.spendBonuses({'Carteira Gama-chan':1},500));assert.ok(Math.abs(wallet.damage/calculateStats('naruto',1).damage-1.02)<1e-9);assert.ok(Math.abs(wallet.moneyGain-1.12)<1e-9);}
assert.ok(!skillPool('gaara',new Set(['temari'])).some(t=>t.name==='Corte do Leque'),'única de Vento fora da base do Gaara');assert.ok(skillPool('gaara',new Set(['kankuro'])).some(t=>t.name==='Agulhas de Karasu'));assert.ok(!skillPool('gaara').some(t=>t.name==='Corte do Leque'));
assert.equal(choiceCount({}),3);assert.equal(choiceCount({'Quarta opção':1}),4);
assert.equal(choiceCount({},1000,()=>0),4);
assert.equal(choiceCount({'Quarta opção':1},1000,()=>0),4);
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
// Horda — Rodada 50: escada de vivos reduzida ~40% no início (capBase 36 · capLinear 52 · capQuad 3,8): 1 min = 91 (era 156),
// 8 min = 695 (era 1189), 10 min = 936 (era 1.600), teto 1600 aos ~15 min (era ~10 min). Spawn em lote crescente; FINAL SWARM ×3 imediato e crescendo.
{const d8=difficultyAt('Genin',480),d10=difficultyAt('Genin',600),sw=difficultyAt('Genin',600,1,1e-3),sw5=difficultyAt('Genin',900,1,300);
 assert.ok(d8.cap>=650&&d8.cap<750,'escada de vivos reduzida ~695 aos 8 min');assert.ok(d10.cap===936,'~936 aos 10 min');assert.equal(difficultyAt('Genin',900).cap,1600,'teto 1600 aos 15 min');assert.ok(d8.spawnPerSecond>40,'spawn em lote');
 assert.ok(Math.abs(sw.hp/d10.hp-3)<.01&&Math.abs(sw.damage/d10.damage-3)<.01,'FINAL SWARM triplica HP e dano');
 // Rodada 47 — era `>d10.armor*2,9`: com a curva de armadura dobrada (armorPerMinute 0,015→0,03, maxArmor 0,6→0,72),
 // o 10 min tem armadura 0,30 e o swarm fica no teto FINAL_SWARM.maxArmor (0,85) = ×2,83. A defesa do swarm segue bem
 // acima da base (teto de 85% de redução); a intenção (swarm >> base) mantém-se válida na nova proporção.
 assert.ok(sw.armor>d10.armor*2.5,'FINAL SWARM eleva a defesa (teto 0,85)');
 assert.ok(sw5.hp/difficultyAt('Genin',900).hp>3.9,'FINAL SWARM cresce com o tempo sobrevivido');assert.ok(d10.hp>15,'HP ×16 aos 10 min');}
// Sorte: raridade primeiro, depois o item; raridade vazia desce para a mais próxima abaixo (Sorte alta não cai em Comum à toa).
{const pool=[...ITEMS.filter(i=>i.rarity==='Comum'),...ITEMS.filter(i=>i.rarity==='Incomum').slice(0,3),...ITEMS.filter(i=>i.rarity==='Raro').slice(0,2)];let commons=0;const r3=rng;
 for(let i=0;i<5000;i++)commons+=Number(rollItems(pool,{},360,1,r3)[0].rarity==='Comum');assert.ok(commons/5000<.06,'Sorte 360 com poucos raros desbloqueados: Comum < 6%');
 const {rollGrowth,rollRarityTier}=await import('../src/game/combat.ts');let lc=0;for(let i=0;i<5000;i++)lc+=Number(rollRarityTier(360,r3)===0);assert.ok(lc/5000<.06&&lc>0,'Sorte 360: Comum raro mas nunca 0%');
 const g=rollGrowth(0,HEROES.find(h=>h.id==='naruto').techniques[0],()=>0);assert.ok(g.growth.damage>=.3,'técnica de ataque sempre ganha dano');
 const PL=await import('../src/game/pills.ts');const pills={'Pílula do Soldado':8};PL.grantPill(pills,'Pílula do Soldado');assert.equal(pills['Pílula do Soldado'],9,'cada escolha vale um nível');
 assert.match(PL.pillOfferText('Pílula do Soldado',8,0,'Lendário'),/\+20%.*Nv\. 8 → 9/);
 assert.deepEqual(PL.pillBonuses({'Pílula de Incenso':1}),{enemyCount:.10,threat:.05,gold:.12});
 assert.ok(calculateStats('naruto',1,{},{'Pílula do Pergaminho':1}).xpGain>calculateStats('naruto',1).xpGain);
 assert.ok(Math.abs(calculateStats('naruto',1,{},{'Pílula do Soldado':10}).physical-calculateStats('naruto',1).physical-1)<1e-9,'bônus recalculado só dos níveis');}
{// Ultimate por fase (06/11/2026): toda versão tem Ultimate própria desde o Nv. 1, baseada numa técnica de ataque do PRÓPRIO kit.
 const {HERO_BY_ID,ultimateBase,versionForEncounter,versionStep}=await import('../src/game/heroes.ts');
 for(const h of HEROES){assert.ok(h.ultimate,h.id+' sem Ultimate');const b=ultimateBase(h);assert.ok(h.techniques.includes(b)&&!b.setup,h.id+': Ultimate fora do kit da fase');}
 assert.equal(new Set(HEROES.map(h=>h.ultimate)).size>=50,true,'Ultimates próprias por versão');
 assert.equal(HERO_BY_ID.naruto.ultimate,'Jutsu Sexy');assert.equal(isProjectileUltimate('naruto'),false);assert.equal(isProjectileUltimate('naruto-genin'),true);assert.equal(HERO_BY_ID['naruto-shippuden'].ultimate,'Rasenshuriken Supremo');
 assert.equal(HERO_BY_ID.madara.ultimate,'Susanoo Perfeito','Meteorito (Tengai Shinsei) exige o Rinnegan');assert.equal(HERO_BY_ID['madara-rinnegan'].ultimate,'Tengai Shinsei');
 assert.notEqual(HERO_BY_ID['guy-setimo-portao'].ultimate,'Oito Portões','Oito Portões é fase posterior ao Sétimo Portão');
 // Ajudantes e Mega Elites como versões: Genin/zona 1 → inicial; Kage/zona 3 → mais avançada.
 assert.equal(versionForEncounter('naruto',1,'Genin'),'naruto');assert.equal(versionForEncounter('naruto',3,'Kage'),'naruto-kyuubi');
 assert.equal(versionForEncounter('sasuke',1,'Jonin'),'sasuke-shippuden');assert.equal(versionForEncounter('kakashi',3,'Chunin'),'kakashi-hokage');assert.equal(versionForEncounter('pain',3,'Kage'),'pain');
 for(const family of ['naruto','gaara','neji'])for(const d of ['Genin','Chunin','Jonin','Kage'])for(let z=1;z<3;z++)assert.ok(versionStep(versionForEncounter(family,z,d))<=versionStep(versionForEncounter(family,z+1,d)),'versão não regride com a zona');
 const {allyBuffBonuses,ALLY_BUFFS}=await import('../src/game/allies.ts');const {activeSynergies}=await import('../src/game/synergy.ts');
 assert.equal(allyBuffBonuses('naruto-shippuden').damage,.18,'buff da família ×1,5 no 2º passo');assert.equal(allyBuffBonuses('tenten-shippuden').projectiles,1);assert.ok(ALLY_BUFFS['gaara-alianca'].title.includes('Aliança'));
 for(const h of HEROES)assert.ok(ALLY_BUFFS[h.id],h.id+' sem buff de ajudante');
 assert.ok(sandSynergy(['gaara-kazekage','temari-shippuden','kankuro']),'Irmãos da Areia por família');
 const team=activeSynergies('naruto',['itachi-akatsuki','pain']);assert.ok(team.some(s=>s.id==='org:akatsuki'&&s.members.includes('itachi-akatsuki')),'organização por família com id real da versão');}
{// Rodada 41: marionetes — Kuri (companheira do Kankuro) + Kuroari (entidade da técnica 'Kuroari').
 const {NPC_ALLIES,NPC_NAMES}=await import('../src/game/npcs.ts');
 const pngSize=(p)=>{const b=fs.readFileSync('public'+p);return [b.readUInt32BE(16),b.readUInt32BE(20)];};
 assert.ok(NPC_ALLIES.kuri&&NPC_ALLIES.kuri.technique.name==='Agulhas de Kuri','Kuri registrada em NPC_ALLIES');
 assert.equal(NPC_NAMES.kuri,'Kuri','Kuri em NPC_NAMES');
 assert.deepEqual([...pngSize('/assets/shinobi-motion/kuri-1-walk-v1.png')],[1280,640],'kuri-1-walk 1280×640');
 assert.deepEqual([...pngSize('/assets/shinobi-motion/kuri-1-action-v3.png')],[1280,1280],'kuri-1-action 1280×1280');
 assert.deepEqual([...pngSize('/assets/shinobi-motion/kuroari-1-walk-v1.png')],[1280,640],'kuroari-1-walk 1280×640');
 assert.deepEqual([...pngSize('/assets/shinobi-motion/kuroari-1-action-v3.png')],[1280,1280],'kuroari-1-action 1280×1280');
 const kSheet=directionalArt('kuri',1);assert.ok(kSheet&&fs.existsSync('public'+kSheet.path),'folha de caminhada da Kuri registrada');
 const kAction=actionArt('kuri',1);assert.ok(kAction&&kAction.kind==='full'&&fs.existsSync('public'+kAction.path),'folha de ação da Kuri registrada');
 assert.deepEqual(portraitRegion('kuri'),{path:'/assets/shinobi-motion/kuri-1-walk-v1.png',cols:4,rows:2,index:0},'retrato da Kuri na célula (0,0)');
 assert.ok(!HEROES.some(h=>h.id==='kuri'||h.id==='kuroari'),'marionetes fora do roster jogável');
}
{// Rodada 43: sons reais de jutsu do usuário (Kage Bunshin — só Naruto · Ultimate do Pain — som de Shinra Tensei)
 // + pose/levitação da Ultimate do Pain no playerMotion.
 const sfxSrc=fs.readFileSync('src/audio/sfx.ts','utf8');
 assert.ok(sfxSrc.includes("t.name==='Kage Bunshin'&&f==='naruto'")&&sfxSrc.includes('/assets/audio/kage-bunshin.mp3'),'regra do som Kage Bunshin (só Naruto) presente no sfx');
 assert.ok(sfxSrc.includes("u&&f==='pain'&&t.name==='Chibaku Tensei'")&&sfxSrc.includes('/assets/audio/shinra-tensei.mp3'),'regra do som da Ultimate do Pain presente no sfx');
 assert.ok(sfxSrc.includes('activeJutsuClip'),'gate anti-spam do som real (som anterior precisa terminar) presente');
 for(const p of ['/assets/audio/kage-bunshin.mp3','/assets/audio/shinra-tensei.mp3']){
   const f='public'+p;assert.ok(fs.existsSync(f)&&fs.statSync(f).size>10000,p+' presente no projeto');
 }
 const pmSrc=fs.readFileSync('src/scene/playerMotion.ts','utf8');
 assert.ok(pmSrc.includes('painUltimate'),'pose/levitação da Ultimate do Pain presente no playerMotion');
 const gcSrc=fs.readFileSync('src/scene/GameCanvas.tsx','utf8');
 assert.ok(gcSrc.includes('playTechniqueSound(t,false,heroId)')&&gcSrc.includes('playTechniqueSound(t,true,heroId)'),'call sites passam o herói para o som de jutsu');
 const pain=HEROES.find(h=>h.id==='pain');
 assert.ok(pain&&pain.ultimate==='Chibaku Tensei'&&pain.techniques.some(t=>t.name==='Shinra Tensei'),'kit do Pain: Shinra Tensei + Ultimate Chibaku Tensei');
}
{ // Rodada 44: mouse calmo e simétrico (1:1, sem aceleração — rodada 29 mantida) + câmera mais deitada (piso 0.05 rad) + início 0.55 rad
  const gcSrc=fs.readFileSync('src/scene/GameCanvas.tsx','utf8');
  assert.ok(gcSrc.includes("yaw-=dx*.0025*settings.mouseSensitivity"),'taxa do yaw reduzida e simétrica (rodada 44)');
  assert.ok(gcSrc.includes("dy*.0025*settings.mouseSensitivity"),'taxa do pitch reduzida e simétrica (rodada 44)');
  assert.ok(gcSrc.includes("clamp(pitch+dy*.0025*settings.mouseSensitivity*(settings.invertY?-1:1),.05,1.48)"),'piso do pitch deitado para 0.05 rad (rodada 44)');
  assert.ok(gcSrc.includes('let yaw=Math.PI/4, pitch=.55'),'início da partida com câmera mais deitada (0.55 rad, rodada 44)');
  const stSrc=fs.readFileSync('src/ui/SettingsScreen.tsx','utf8');
  assert.ok(stSrc.includes('6/11'),'dica do multiplicador do ponteiro do Windows no slider de sensibilidade (rodada 44)');
}
const result={megaRate:mega/100000,rareRateZeroLuck:rare/50000,rareRateLuck200:highRare/50000,roster:HEROES.length,motionForms,techniques:new Set(HEROES.flatMap(h=>h.techniques.map(t=>t.name))).size,items:ITEMS.length};console.log(result);fs.writeFileSync('artifacts/rules-checks.json',JSON.stringify(result,null,2));


