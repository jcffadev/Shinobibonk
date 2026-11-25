import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { zoneThreat, zoneCurse, ZONE_DIFFICULTY } from '../src/game/progression.ts';
import { guardianVitality, guardianDefense, guardianArmor, finiteBossHp, BOSS_HP_LIMIT } from '../src/game/missions.ts';
import { BIJUU_RULES, bijuuVitality, bijuuDefense, bijuuPlans } from '../src/game/bijuu.ts';
import { guardianProbe, bijuuProbe } from '../scripts/simulate-bosses.mjs';

const canvas = readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('Bijū: vida e defesa vêm das funções compartilhadas com o simulador (calibração 25/11)', () => {
  assert.ok(canvas.includes('const maxHp=saved?.maxHp??bijuuVitality(threat.hp,elapsed,overtime);'));
  assert.ok(canvas.includes('defense:bijuuDefense(elapsed,overtime,bijuuPlans(shikamaruPlans)),'));
  assert.ok(canvas.includes("const curse=zoneCurse(zoneDifficulty,bijuuPlans(shikamaruPlans),ex('threat'));"), 'HP da Bijū usa só os planos da zona');
  // Decisão de 25/11: armadura 3× a do Guardião equivalente; HP × 2,4 (mínimo 4.600), como antes.
  assert.equal(bijuuPlans(9), 3); assert.equal(bijuuPlans(2), 2); assert.equal(bijuuPlans(-1), 0);
  for (const [t, ov, plans] of [[1800, 0, 0], [2400, 420, 3], [3000, 900, 3]]) {
    const a = guardianArmor(t, false, ov, 3, plans) * 3; assert.ok(Math.abs(bijuuDefense(t, ov, plans) - a / (100 + a)) < 1e-12);
    assert.ok(bijuuDefense(t, ov, plans) > guardianDefense(t, true, ov, 3, plans), 'mais dura que a regra antiga (1,35×)');
    const hp = zoneThreat('Kage', 600 + ov, zoneCurse(ZONE_DIFFICULTY[3], plans, 0), ov, 0).hp;
    assert.equal(bijuuVitality(hp, t, ov), Math.max(4600, Math.round(guardianVitality(hp, t, 600 + ov, ov, 3) * 2.4)));
  }
  assert.equal(BIJUU_RULES.armorMultiplier, 3);
  // Mais armadura bruta → mais defesa, sem chegar a 100%.
  assert.ok(bijuuDefense(3000, 900, 9, 20) > bijuuDefense(3000, 900, 9) && bijuuDefense(3000, 900, 9, 20) < 1);
  assert.ok(Math.abs(guardianDefense(1200, false, 60, 1, 2) - guardianArmor(1200, false, 60, 1, 2) / (100 + guardianArmor(1200, false, 60, 1, 2))) < 1e-12);
});

test('chefes sem teto de gameplay, mas sempre finitos e com dano que desconta vida', () => {
  // Trilhões e quadrilhões valem: o Guardião da zona 1 aos +50 min passa de 1 quatrilhão.
  const ov = 3000, th = zoneThreat('Kage', 600 + ov, zoneCurse(1, 3, 0), ov, 0);
  assert.ok(guardianVitality(th.hp, 600 + ov, 600 + ov, ov, 1) > 1e15);
  // ~25 h de Final Swarm: a conta bruta estoura, o limite numérico segura.
  const far = 1500 * 60, thFar = zoneThreat('Kage', 600 + far, zoneCurse(ZONE_DIFFICULTY[3], 9, 0), far, 0);
  assert.ok(Number.isFinite(bijuuVitality(thFar.hp, 600 + far, far)));
  assert.equal(finiteBossHp(Infinity), BOSS_HP_LIMIT); assert.equal(finiteBossHp(5), 5);
  // Defesa nunca zera o dano, nem com 20× a armadura e dia inteiro de Final Swarm.
  assert.ok(1 - bijuuDefense(90000, 86400, 9, 20) > 1e-6);
  // Precisão: com vida acima de 2^53, um golpe de 1 bilionésimo da vida ainda desconta.
  let hp = 1.6e18; const before = hp; hp -= hp * 1e-9; assert.ok(hp < before);
});

test('simulador de chefes mede Guardião nos marcos e Bijū com opções de armadura', () => {
  const g = guardianProbe({ heroId: 'naruto', mission: 'Genin', plans: 0, seed: 17 });
  assert.ok(g.normal && g.normal.hp > 0 && g.normal.ttk > 0 && Number.isFinite(g.normal.ttk));
  // Desde 25/11 (afixos de dano ½) o Naruto Academia não segura 3 planos desde o segundo 0 no simulador; 1 plano basta aqui.
  const more = guardianProbe({ heroId: 'naruto', mission: 'Genin', plans: 1, seed: 17 });
  assert.ok(more.normal.def > g.normal.def, 'planos do Shikamaru somam armadura');
  const b = bijuuProbe({ heroId: 'naruto', mission: 'Genin', plans: 0, seed: 17 });
  assert.ok(b && b['chegada'].hp >= 4600);
  assert.ok(b['chegada'].options[20] > b['chegada'].options[1.35] * 10, '20× de armadura alonga muito a luta');
  assert.ok(b['+15'].hp > b['chegada'].hp);
});

test('missão até a arena: 1 + planos pergaminhos por Guardião (4 com 3 planos) e Bijū medida na chegada', async () => {
  const { missionProbe, summarizeMission } = await import('../scripts/simulate-bosses.mjs');
  // Sasuke chega à arena no Genin com 3 planos desde o segundo 0 (o simulador aplica os planos do início da zona).
  const three = missionProbe({ heroId: 'sasuke', mission: 'Genin', plans: 3, seed: 17, summonAt: 160 });
  assert.ok(three.bosses.length >= 1);
  for (const b of three.bosses) { assert.equal(b.scrolls, 4, 'quatro pergaminhos grátis com três planos'); assert.ok(b.ttk >= 1 && b.hp > 0 && b.def > 0 && b.def < 1); }
  const none = missionProbe({ heroId: 'naruto', mission: 'Genin', plans: 0, seed: 17, summonAt: 160 });
  assert.ok(none.bosses.every(b => b.scrolls === 1));
  if (three.victory) assert.ok(three.bijuu && three.bijuu.hp >= 4600 && Number.isFinite(three.bijuu.ttk));
  const rows = summarizeMission([{ mission: 'Genin', plans: 3, policy: 'cedo', result: three }]);
  assert.equal(rows[0].zones.length, 3); assert.equal(rows[0].n, 1);
  const sim = (await import('node:fs')).readFileSync(new URL('../scripts/simulate-run.mjs', import.meta.url), 'utf8');
  assert.ok(sim.includes('const scrolls = 1 + Math.min(GUARDIAN_RULES.shikamaruMaxPlans, plans);'), 'simulador segue a recompensa do jogo');
});
