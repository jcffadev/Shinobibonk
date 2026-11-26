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


test('Susanoo usa a versão do conjurador em todo o elenco, inclusive nas ultimates', async () => {
  const { KAKASHI_DMS, KAMUI_SHURIKEN, susanooStyleFor } = await import('../src/game/susanoo.ts');
  const everyoneSealed = new Set(HEROES.map(hero => hero.id));
  const expected = {
    madara: 'madara', 'madara-rinnegan': 'madara', 'madara-seis-caminhos': 'madara',
    itachi: 'itachi', 'itachi-akatsuki': 'itachi', 'sasuke-shippuden': 'sasuke',
    'sasuke-rinnegan': 'sasuke', shisui: 'shisui', [KAKASHI_DMS]: 'kakashi',
  };
  for (const hero of HEROES) {
    const fromPool = skillPool(hero.id, everyoneSealed).some(t => t.name === 'Susanoo');
    const style = Object.hasOwn(expected, hero.id) ? expected[hero.id] : undefined;
    assert.equal(fromPool, Boolean(style), hero.id);
    assert.equal(susanooStyleFor(hero.id, 'Susanoo'), style, hero.id);
  }
  assert.equal(susanooStyleFor('madara', HERO_BY_ID.madara.ultimate), 'madara');
  assert.equal(susanooStyleFor('itachi-akatsuki', HERO_BY_ID['itachi-akatsuki'].ultimate), 'itachi');
  assert.equal(HERO_BY_ID[KAKASHI_DMS].ultimate,KAMUI_SHURIKEN);
  assert.equal(susanooStyleFor(KAKASHI_DMS,KAMUI_SHURIKEN),'kakashi');
  assert.equal(susanooStyleFor('kakashi',KAMUI_SHURIKEN),undefined);
  assert.equal(susanooStyleFor('kakashi-hokage',KAMUI_SHURIKEN),undefined);
});


test('Kakashi dos Dois Mangekyō tem seu kit e a missão dependente do Sexto Hokage', async () => {
  const { versionForEncounter, ultimateBase } = await import('../src/game/heroes.ts');
  const { UNLOCK_MISSIONS, missingRequirements } = await import('../src/game/unlockMissions.ts');
  const id = 'kakashi-dms', kakashi = HERO_BY_ID[id];
  const mission = UNLOCK_MISSIONS[id];
  assert.deepEqual([mission.playWith, mission.map, mission.difficulty, mission.minute, mission.kills], ['kakashi-hokage','pedra','Kage',7,950]);
  assert.deepEqual(missingRequirements(id,new Set(),()=>false), ['kakashi-hokage']);
  assert.deepEqual(missingRequirements(id,new Set(),version=>version==='kakashi-hokage'), []);
  assert.deepEqual(kakashi.techniques.map(skill=>skill.name), ['Raikiri do Kamui','Shuriken','Susanoo','Kamui']);
  assert.equal(ultimateBase(kakashi).name, 'Susanoo');
  assert.equal(techniqueEye(kakashi.ultimate,id), 'obito');
  assert.equal(versionForEncounter('kakashi',3,'Kage'),id);
  assert.equal(versionForEncounter('kakashi',3,'Chunin'),'kakashi-hokage');
});

test('Nagato, dono do Rinnegan, usa Bansho Tenin e Chibaku Tensei como o Pain (25/11/2026)', async () => {
  const { HERO_BY_ID } = await import('../src/game/heroes.ts');
  const kit = id => HERO_BY_ID[id].techniques.map(t => t.name);
  assert.deepEqual(kit('nagato'), ['Receptores de Chakra', 'Bansho Tenin', 'Chibaku Tensei', 'Invocação dos Caminhos']);
  assert.deepEqual(kit('pain'), ['Kunai Tática', 'Chibaku Tensei', 'Bansho Tenin', 'Barras de Chakra'], 'o Pain não muda');
  const by = (id, name) => HERO_BY_ID[id].techniques.find(t => t.name === name);
  assert.equal(by('nagato', 'Bansho Tenin').gravity, 'pull'); assert.equal(by('nagato', 'Chibaku Tensei').gravity, 'core');
  assert.equal(by('nagato', 'Chibaku Tensei').power, by('pain', 'Chibaku Tensei').power);
});

test("quem usa o Susano'o na obra já o tem no próprio pool, sem selar ninguém (26/11/2026)", async () => {
  const { HEROES, skillPool } = await import('../src/game/heroes.ts');
  const owners = HEROES.filter(h => skillPool(h.id, new Set()).some(t => t.name === 'Susanoo')).map(h => h.id).sort();
  assert.deepEqual(owners, ['itachi', 'itachi-akatsuki', 'kakashi-dms', 'madara', 'madara-rinnegan', 'madara-seis-caminhos', 'sasuke-rinnegan', 'sasuke-shippuden', 'shisui']);
  const shisui = skillPool('shisui', new Set()).find(t => t.name === 'Susanoo');
  assert.equal(shisui.source, 'kit'); assert.equal(shisui.unlockLevel, 12);
  assert.ok(!skillPool('sasuke', new Set()).some(t => t.name === 'Susanoo'), 'Sasuke Genin ainda não');
});
