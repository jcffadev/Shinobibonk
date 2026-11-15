import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEROES, HERO_BY_ID, skillPool } from '../src/game/heroes.ts';
import { KEKKEI_RECIPES, kekkeiRecipe, mergedTechnique, techniqueLevelCap } from '../src/game/techniqueMerge.ts';
import { techniqueEye } from '../src/game/dojutsu.ts';
import { techniqueProc, techniqueStatusText, BURN_CHANCE, techniqueCritical, techniqueSchool } from '../src/game/combat.ts';

test('status isolado começa abaixo de 10%, cresce com técnica e buffs e respeita o teto', () => {
  for(const hero of HEROES)for(const t of skillPool(hero.id)){
    for(const chance of [t.statusChance,t.secondaryStatusChance??0,t.burn?BURN_CHANCE:0]){
      assert.ok(techniqueProc(chance,1)<=.1,t.name);
      assert.ok(techniqueProc(chance,5)>=techniqueProc(chance),t.name);
    }
  }
  const mei=HERO_BY_ID.mei.techniques[0];
  assert.match(techniqueStatusText(mei),/Queimadura · 10%/);
  assert.match(techniqueStatusText(mei,9,.12),/Queimadura · 72%/);
  assert.equal(techniqueProc(.88,9,.5),.95);
  const kunai=HERO_BY_ID.sasuke.techniques[0];
  assert.deepEqual(techniqueCritical(kunai,1),{chance:.02,damage:.05});
  assert.deepEqual(techniqueCritical(kunai,9),{chance:.08,damage:.25});
  assert.equal(techniqueSchool(HERO_BY_ID['kabuto-sabio'].techniques[0]),'Senjutsu');
});

test('Bansho é onda gravitacional, Chibaku puxa para o núcleo e nenhum deles herda crítico próprio',()=>{
  const [_,chibaku,bansho]=HERO_BY_ID.pain.techniques;
  assert.equal(bansho.shape,'Onda');assert.equal(bansho.gravity,'pull');
  assert.equal(chibaku.shape,'Área');assert.equal(chibaku.gravity,'core');
  assert.deepEqual(techniqueCritical(bansho),{chance:0,damage:0});
});

test('receitas elementais preservam natures, formato e limite do Nv. 7 sem alterar combinações',()=>{
  const seed=HERO_BY_ID.naruto.techniques[0];
  for(const recipe of KEKKEI_RECIPES){
    const [a,b]=recipe.natures.map((element,index)=>({...seed,name:'T'+index,element,school:'Ninjutsu',power:2+index}));
    assert.equal(kekkeiRecipe(b,a),recipe);
    assert.equal(kekkeiRecipe({...a,school:'Taijutsu'},b),undefined);
    const result=mergedTechnique({kind:'fuse',names:[b.name,a.name]},[a,b]);
    assert.equal(result.name,'Fusão · '+recipe.name);assert.equal(result.shape,recipe.shape);
    assert.equal(result.power,5);assert.equal(result.unlockLevel,1);assert.equal(techniqueLevelCap(result,4),7);
    const combination=mergedTechnique({kind:'combine',names:[a.name,b.name]},[a,b]);
    assert.equal(combination.name,'T0 + T1');assert.equal(techniqueLevelCap(combination,4),13);
  }
});

test('o mesmo jutsu usa o dōjutsu correto para fase e shinobi',()=>{
  assert.equal(techniqueEye('Amaterasu','sasuke-rinnegan'),'sasuke-eternal');
  assert.equal(techniqueEye('Amaterasu','itachi-akatsuki'),'itachi');
  assert.equal(techniqueEye('Kamui','kakashi'),'obito');
  assert.equal(techniqueEye('Kotoamatsukami','shisui'),'shisui');
  assert.equal(techniqueEye('Flecha de Indra','sasuke-rinnegan'),'rinnegan-sasuke');
  assert.equal(techniqueEye('Byakugan: Campo Sensorial','ao'),'byakugan');
});
