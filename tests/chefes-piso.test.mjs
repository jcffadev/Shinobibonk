import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOSS_POWER, bossPowerFloor, bossHpWithFloor, singleTargetDps, expectedHit } from '../src/game/bossScaling.ts';
import { calculateStats } from '../src/game/progression.ts';
import { HERO_BY_ID } from '../src/game/heroes.ts';
import { NO_GROWTH } from '../src/game/combat.ts';
import { BOSS_HP_LIMIT } from '../src/game/missions.ts';
import { missionProbe } from '../scripts/simulate-bosses.mjs';

const canvas = readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('piso dos chefes: 30 s de Guardião e 60 s de Bijū contra o dano atual, +33% por plano (25/11)', () => {
  assert.deepEqual(BOSS_POWER, { guardianSeconds: 30, bijuuSeconds: 60, perPlan: .33 });
  assert.equal(bossPowerFloor(1000, 30), 30000);
  assert.equal(bossPowerFloor(1000, 30, 3), Math.round(30000 * 1.99));
  assert.equal(bossHpWithFloor(5e6, 1000, 30), 5e6, 'a fórmula da zona vale quando é maior');
  assert.equal(bossHpWithFloor(10, 1000, 60), 60000, 'build forte → o piso manda');
  assert.equal(bossPowerFloor(Infinity, 60), BOSS_HP_LIMIT, 'sempre finito');
  assert.equal(bossPowerFloor(-5, 60), 0);
});

test('dano de alvo único cresce com o nível e cai com a defesa do chefe', () => {
  const hero = HERO_BY_ID.naruto, t = hero.techniques.find(x => !x.setup && x.power > 0);
  const at = level => singleTargetDps({ heroId: 'naruto', techniques: hero.techniques, skillLevels: { [t.name]: 1 }, growth: {}, stats: calculateStats('naruto', level), defense: .5 });
  assert.ok(at(100) > at(10) * 10, 'nível alto → piso bem maior');
  const s = calculateStats('naruto', 20), base = { heroId: 'naruto', techniques: hero.techniques, skillLevels: { [t.name]: 1 }, growth: {}, stats: s };
  assert.ok(Math.abs(singleTargetDps({ ...base, defense: .9 }) * 5 - singleTargetDps({ ...base, defense: .5 })) < 1e-6 * singleTargetDps({ ...base, defense: .5 }));
  assert.ok(expectedHit('naruto', t, NO_GROWTH, s, 1) > 0);
  assert.equal(singleTargetDps({ ...base, skillLevels: {}, defense: 0 }), 0, 'sem técnica aprendida, sem dano');
});

test('Guardião e Bijū usam o piso no jogo e no simulador', () => {
  assert.ok(canvas.includes('const guardianHpNow=(hp=bossThreatNow().hp)=>bossHpWithFloor(guardianVitality(hp,elapsed,zoneElapsed(),overtimeNow(),zone),playerBossDps('));
  assert.ok(canvas.includes('BOSS_POWER.bijuuSeconds,bijuuPlans(shikamaruPlans));'));
  const run = missionProbe({ heroId: 'sasuke', mission: 'Genin', plans: 0, seed: 17, summonAt: 540 });
  assert.ok(run.bosses.length >= 1);
  for (const b of run.bosses) assert.ok(b.ttk >= 20, 'Guardião não cai em poucos segundos: ' + b.ttk + ' s');
  if (run.bijuu) assert.ok(run.bijuu.ttk >= 59, 'Bijū dura ao menos ~1 min');
});
