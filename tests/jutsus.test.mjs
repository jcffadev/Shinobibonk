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


test('jutsus revisados: técnicas sem efeito próprio ganham o efeito do atlas que combina com a obra (rodada 100)', async () => {
  const v = await import('../src/game/techniqueVisualProfiles.ts');
  const cell = name => v.battleEffectCell({ name, element: 'Neutro' });
  for (const [name, expected] of [
    ['Agulhas de Areia', 7], ['Garra de Areia', 7], ['Onda de Areia', 7],
    ['Esferas da Busca da Verdade', 16], ['Barreira Espaço-Tempo', 16],
    ['Yamata no Jutsu', 22], ['Serpentes Ocultas', 22],
    ['Possessão em Massa', 10], ['Agulhas da Sombra', 10],
    ['Punho Gentil', 12], ['Punhos dos Leões Gêmeos', 12], ['Chuva de Senbon', 18],
    ['Chute Ascendente', 9], ['Chute Giratório', 9], ['Combo do Leão', 9], ['Punho da Folha', 9],
  ]) { assert.equal(cell(name), expected, name); assert.ok(v.hasNamedBattleEffect(name), name + ' tem efeito próprio'); }
  assert.equal(cell('Muralha de Ouro'), 20, 'ouro do Rasa continua no pó de ouro');
  assert.equal(cell('Caixão de Areia'), 7);
});

test('equilíbrio dos status: só golpes de precisão ficam no crítico; gelo congela; Pain e Nagato usam magnetismo (rodada 102)', async () => {
  const { CRIT_ONLY } = await import('../src/game/statusProfiles.ts');
  const all = new Set(HEROES.map(h => h.id)), seen = new Map();
  for (const hero of HEROES) for (const t of skillPool(hero.id, all)) if (!seen.has(t.name)) seen.set(t.name, t);
  const has = t => (t.status && t.statusChance > 0) || (t.secondaryStatus && t.secondaryStatusChance) || t.burn || t.poison || t.gravity;
  const critOnly = [...seen.values()].filter(t => !t.setup && !has(t)).map(t => t.name).sort();
  assert.deepEqual(critOnly, [...CRIT_ONLY].sort(), 'só os golpes de precisão sem status');
  const tech = name => seen.get(name) ?? HEROES.flatMap(h => h.techniques).find(t => t.name === name);
  assert.equal(tech('Senbon de Gelo').status, 'Congelar'); assert.equal(tech('Espelhos Demoníacos de Gelo').status, 'Congelar');
  const pain = HERO_BY_ID.pain.techniques.filter(t => t.gravity).length;
  assert.ok(pain >= 3, 'Pain com magnetismo em 3 técnicas');
  assert.equal(tech('Receptores de Chakra').gravity, 'pull'); assert.equal(tech('Invocação dos Caminhos').gravity, 'push');
  assert.ok(tech('Bijūdama').burn && tech('Yamata no Jutsu').poison && tech('Impacto de Sakura').status === 'Atordoar');
});
