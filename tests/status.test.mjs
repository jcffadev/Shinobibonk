import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STATUS_RULES, addChill, chillSlow, controlResist, damageStatusCount, freezeTarget, isFrozen, tickStatus, statusDamageMultiplier, addPoisonStack, poisonMultiplier, reactionsFor, deathBurstKind } from '../src/game/statusRules.ts';
import { ITEMS } from '../src/game/catalog.ts';

const canvas = readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('o Selo dos Cinco Elementos conta lentidão apenas uma vez',()=>{
  assert.equal(damageStatusCount({control:'Lentidão',controlTime:1,slow:1}),1);
  assert.equal(damageStatusCount({control:'Paralisar',controlTime:1,slow:1,burn:2,poison:{}}),4);
  assert.equal(damageStatusCount({control:'Lentidão',controlTime:1,slow:0}),1);
});

test('Resfriado: −12% por acúmulo, 2 acúmulos congelam por 1,5 s e somem sem frio novo (rodada 103; 2 desde 25/11)', () => {
  const e = {};
  assert.equal(addChill(e, 1), false); assert.equal(e.chill, 1); assert.equal(chillSlow(e), 1 - .12);
  assert.equal(STATUS_RULES.chill.stacksToFreeze, 2);
  assert.equal(addChill(e, 1), true, 'segundo acúmulo congela');
  assert.ok(isFrozen(e)); assert.equal(e.controlTime, STATUS_RULES.freeze.seconds); assert.equal(e.chill, 0);
  const f = {}; addChill(f, 1); tickStatus(f, 3.01); assert.equal(f.chill, 0, 'Resfriado some após 3 s');
  assert.equal(STATUS_RULES.chill.techniqueStacks, 2, 'técnica de gelo dá 2 acúmulos');
});

test('molhado + gelo congela na hora; Raio eletrocuta molhado; Vento espalha queimadura (rodada 103)', () => {
  const wet = { wet: 3 };
  assert.equal(addChill(wet, 1), true); assert.ok(isFrozen(wet)); assert.equal(wet.wet, 0);
  assert.deepEqual(reactionsFor({}, ['Água']), ['wet']);
  assert.deepEqual(reactionsFor({ wet: 2 }, ['Raio']), ['electro']);
  assert.deepEqual(reactionsFor({}, ['Raio']), []);
  assert.deepEqual(reactionsFor({ burn: 1 }, ['Vento']), ['scorch']);
  assert.deepEqual(reactionsFor({ burn: 0 }, ['Vento']), []);
  assert.equal(STATUS_RULES.electro.targets, 3);
  assert.ok(canvas.includes("statusReactions(enemy,t,damage,frozenBefore&&!ally);"), 'reações ligadas no golpe');
});

test('resistência a controle, congelado +25%, golpe que acorda +60% e Quebra-Gelo (rodada 103)', () => {
  assert.equal(controlResist({}), 1); assert.equal(controlResist({ megaElite: true }), .6);
  assert.equal(controlResist({ guardian: true }), .6); assert.equal(controlResist({ bijuu: true }), .75);
  const boss = { megaElite: true }; freezeTarget(boss); assert.ok(Math.abs(boss.controlTime - .9) < 1e-9, 'mega congela menos');
  assert.equal(statusDamageMultiplier({ control: 'Congelar', controlTime: 1 }), 1.25);
  assert.equal(statusDamageMultiplier({ control: 'Congelar', controlTime: 1 }, .5), 1.75, 'Quebra-Gelo');
  assert.equal(statusDamageMultiplier({ control: 'Dormir', controlTime: 1 }), 1.6);
  assert.equal(statusDamageMultiplier({ control: 'Congelar', controlTime: 0 }), 1);
  const breaker = ITEMS.find(i => i.id === 'ice-breaker');
  assert.ok(breaker && breaker.name === 'Quebra-Gelo' && breaker.bonuses.shatter === .5);
  assert.ok(canvas.includes("bonus*=statusDamageMultiplier(enemy,ex('shatter'));"));
  assert.ok(canvas.includes("enemy.controlTime=duration*(status==='Lentidão'?1:controlResist(enemy));"));
});

test('veneno acumula até 8 (+15% por acúmulo) e itens explodem na morte (rodada 103)', () => {
  const e = {}; for (let i = 0; i < 12; i++) addPoisonStack(e);
  assert.equal(e.poisonStacks, 8);
  assert.equal(poisonMultiplier(1), 1); assert.ok(Math.abs(poisonMultiplier(8) - 2.05) < 1e-9); assert.ok(Math.abs(poisonMultiplier(20) - 2.05) < 1e-9);
  assert.ok(canvas.includes('enemy.poison.dps*duration*poisonMultiplier(enemy.poisonStacks)'));
  assert.equal(deathBurstKind({ burn: 1 }, 1, 0, .1), 'fire'); assert.equal(deathBurstKind({ burn: 1 }, 1, 0, .9), undefined);
  assert.equal(deathBurstKind({ burn: 1 }, 0, 0, .1), undefined);
  assert.equal(deathBurstKind({ control: 'Congelar', controlTime: 1 }, 0, 1, .9), 'ice');
  const byId = id => ITEMS.find(i => i.id === id);
  assert.equal(byId('katon-orb').bonuses.fireBurst, 1); assert.equal(byId('haku-mirror').bonuses.iceBurst, 1);
  assert.ok(canvas.includes('queueDeathBurst(enemy);const defeatedAt'));
  assert.ok(canvas.includes("if(Math.random()<ex('chillChance'))chillEnemy(enemy,1);"), 'Hyoton dá acúmulos');
});

test('proposta aplicada (25/11): Katon sem cadeia e chances de item ×2', () => {
  assert.equal(deathBurstKind({ burn: 1, burstBurn: true }, 1, 0, .1), undefined, 'queimadura da explosão não explode de novo');
  assert.equal(deathBurstKind({ burn: 1, burstBurn: false }, 1, 0, .1), 'fire');
  assert.ok(canvas.includes('if(fire){if(!((e.burn??0)>0))e.burstBurn=true;'), 'explosão marca a queimadura nova');
  assert.ok(canvas.includes("if(Math.random()<ex('burnChance')){enemy.burn=2*stats.duration;enemy.burstBurn=false;}"), 'queimadura de item volta a explodir');
  assert.ok(canvas.includes('enemy.burn=Math.max(enemy.burn??0,2*stats.duration*(1+g.duration));enemy.burstBurn=false;'), 'queimadura de técnica volta a explodir');
  const b = id => ITEMS.find(i => i.id === id).bonuses;
  assert.equal(b('wire').rootChance, .08); assert.equal(b('sleep-incense').sleepChance, .05);
  assert.equal(b('hyoton').chillChance, .12); assert.equal(b('poison').poisonChance, .12);
});
