// Rodada 76 — balanceamento por forma de técnica, abertura calma, curva de XP, Final Swarm por dificuldade e simulador de partidas.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compactNumber, damageLabel } from '../src/game/format.ts';
import { HEROES, SHAPE_COOLDOWN, SHAPE_POWER } from '../src/game/heroes.ts';
import { attackCooldown, techniqueCooldownScale } from '../src/game/combat.ts';
import { ENEMY_TIERS, commonEnemyProjectile, xpLoot, lootScale, megaEliteHp, capMegaEliteHp } from '../src/game/enemyTiers.ts';
import { MISSION_TIER, MISSION_HP, GENIN_PRESSURE, normalHpFactor, difficultyAt, AMBUSH_RULES, SPAWN_RING, finalSwarmFactor, xpToLevelUp, XP_RULES } from '../src/game/progression.ts';
import { simulateRun } from '../scripts/simulate-run.mjs';

const src = file => fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

test('números de dano curtos: 50, 1K, 123.1K, 1M, 1B, 1T, 1Q (pedido do usuário)', () => {
  const cases = [[50, '50'], [100, '100'], [999.4, '999'], [999.6, '1K'], [1000, '1K'], [1050, '1.1K'], [10000, '10K'], [123148, '123.1K'], [999950, '1M'], [1e6, '1M'], [1.25e7, '12.5M'], [1e9, '1B'], [1e12, '1T'], [1e15, '1Q'], [4.6e21, '4.6Sx'], [3e36, '3e36']];
  for (const [value, label] of cases) assert.equal(damageLabel(value), label, String(value));
  assert.equal(compactNumber(2.4e12), '2,4T');
  assert.equal(compactNumber(3.2e15), '3,2Q');
  assert.equal(compactNumber(1e18), '1,0e+18');
  assert.match(src('scene/damageNumbers.ts'), /const label = damageLabel\(amount\)/, 'os números flutuantes usam o formato curto');
});

test('recarga por forma no Nv. 1 (0,6 corpo a corpo … 2 área) e −35% no Nv. 9', () => {
  assert.deepEqual({ ...SHAPE_COOLDOWN }, { 'Corpo a corpo': .6, 'Projétil': .8, 'Órbita': 1, 'Cone': 1.2, 'Linha': 1.5, 'Onda': 1.5, 'Em V': 1.5, 'Área': 2, 'Buff': 1 });
  assert.equal(techniqueCooldownScale(1), 1, 'o Nv. 1 não é mais punido (antes ×1,55)');
  assert.ok(close(techniqueCooldownScale(9), .65) && close(techniqueCooldownScale(20), .65));
  for (const hero of HEROES) for (const t of hero.techniques) {
    if (t.setup) continue;
    const expected = t.name === 'Invocação do Sapo' ? 2.6 : SHAPE_COOLDOWN[t.shape];
    assert.ok(close(attackCooldown(t, 1), expected), `${hero.id} · ${t.name}`);
  }
});

test('poder por forma: 1 alvo recebe o maior reforço, área o menor; chefes descontam o fator', () => {
  assert.ok(SHAPE_POWER['Projétil'] > SHAPE_POWER['Linha'] && SHAPE_POWER['Linha'] > SHAPE_POWER['Área']);
  assert.ok(SHAPE_POWER['Corpo a corpo'] > SHAPE_POWER['Cone']);
  assert.match(src('scene/bossCombat.ts'), /power = technique\.power \/ \(SHAPE_POWER\[technique\.shape\] \?\? 1\)/, 'o golpe do chefe não fica mais forte');
});

test('vida do monstro comum 13 e por dificuldade 1/1,3/1,6/2 (elites e chefes iguais)', () => {
  assert.equal(ENEMY_TIERS.normal.hp, 13);
  assert.equal(ENEMY_TIERS.elite.hp, 95);
  assert.deepEqual({ ...MISSION_HP }, { Genin: 1, Chunin: 1.3, Jonin: 1.6, Kage: 2 });
  for (const rank of Object.keys(MISSION_TIER)) assert.ok(close(normalHpFactor(rank) * MISSION_TIER[rank], MISSION_HP[rank]));
  assert.match(src('scene/GameCanvas.tsx'), /hpBase\*threat\.hp\*\(tier==='normal'&&!challenge\?normalHpFactor\(mission\):1\)/);
});

test('Genin ganha pressão entre os minutos 1 e 5 sem acelerar o nascimento da horda', () => {
  const opening=difficultyAt('Genin',60), five=difficultyAt('Genin',300);
  const other=difficultyAt('Chunin',300);
  assert.equal(opening.armor,.03);
  assert.equal(five.armor,5*.03+GENIN_PRESSURE.armor);
  assert.equal(other.armor,5*.03);
  assert.ok(five.attackRate < other.attackRate && five.damage < other.damage);
  assert.ok(close(five.attackRate,1+5*.08+GENIN_PRESSURE.attackRate));
  assert.ok(close(five.damage,(1.45+5*.2)*1.06**5*(1+GENIN_PRESSURE.damage)));
  assert.equal(five.spawnPerSecond,32);
});

test('projéteis comuns viajam 15% mais devagar, com o mesmo alcance em metros', () => {
  for (const [fuma,previous] of [[false,12],[true,8]]) {
    const projectile=commonEnemyProjectile(fuma);
    assert.ok(close(projectile.speed,previous*.85));
    assert.ok(close(projectile.speed*projectile.life,previous*1.25));
  }
  assert.match(src('scene/GameCanvas.tsx'), /enemyShots\.push\(\{object,type,direction,\.\.\.commonEnemyProjectile\(fuma\)/);
  assert.doesNotMatch(src('scene/bossCombat.ts'), /commonEnemyProjectile/);
});

test('primeiro Mega Elite tem teto de 3.000 HP em toda dificuldade, e os seguintes escalam', () => {
  for (const tier of Object.values(MISSION_TIER)) {
    for (const seconds of [42, 55, 68, 600]) for (const roll of [0, .5, .999]) {
      assert.equal(megaEliteHp(seconds, tier, () => roll, true), 3000);
    }
  }
  assert.equal(megaEliteHp(55, .2, () => .5, true), 1900, 'é um teto, não um piso');
  assert.equal(capMegaEliteHp(3000 * 1.33, true), 3000);
  assert.equal(capMegaEliteHp(3000 * 1.33, false), 3990);
  assert.equal(megaEliteHp(55, 1, () => .5), 9500);
  assert.ok(megaEliteHp(200, MISSION_TIER.Kage, () => .5) > megaEliteHp(200, MISSION_TIER.Genin, () => .5));
  assert.ok(megaEliteHp(200, 1, () => .5) > megaEliteHp(55, 1, () => .5));
});

test('Mega Elite natural e de clima compartilham o primeiro encontro, inclusive ao retomar', () => {
  const canvas = src('scene/GameCanvas.tsx');
  assert.match(canvas, /accountSeal=false,openingMega=!openingMegaSpawned/);
  assert.match(canvas, /const isMegaEncounter=tier==='mega'&&!guardian&&!akatsuki;\s*if\(isMegaEncounter\)openingMegaSpawned=true/);
  assert.match(canvas, /megaEliteHp\([^\n]+,Math\.random,openingMega\)/);
  assert.match(canvas, /weatherEvent=\{id,until:[^\n]+openingMega:enemy\.openingMega/);
  assert.match(canvas, /campaign:\{openingMegaSpawned,/);
  assert.match(canvas, /openingMegaSpawned=camp\?\.openingMegaSpawned\?\?/);
  assert.match(canvas, /spawnEnemy\(false,true,false,event\.elite,false,event\.openingMega\)/);
  assert.match(canvas, /const maxHp = capMegaEliteHp\(enemy\.maxHp \* ratio, !!enemy\.openingMega\)/);
  // 25/11/2026: o plano do Shikamaru reescala só o Guardião da zona (antes, todos os inimigos).
  assert.match(canvas, /for\(const enemy of enemyList\)if\(enemy\.guardian&&!enemy\.bijuu&&enemy\.guardianZone===zone\)\{rescaleEnemyHp\(enemy,ratio\);/);
  assert.match(canvas, /for\(const e of enemyList\)rescaleEnemyHp\(e,ratio\)/);
  const simulator = fs.readFileSync(new URL('../scripts/simulate-run.mjs', import.meta.url), 'utf8');
  assert.match(simulator, /megaEliteHp\([^\n]+, rnd, openingMega\);\s+openingMega = false;/);
});

test('emboscada aos 2:30 e a cada 50–80 s; comuns nascem a 16–24 m nos 2 primeiros min', () => {
  assert.deepEqual({ ...AMBUSH_RULES }, { first: 150, min: 50, spread: 30 });
  assert.deepEqual([...SPAWN_RING.opening], [16, 24]);
  const canvas = src('scene/GameCanvas.tsx');
  assert.doesNotMatch(canvas, /ambushTimer=30\b|ambushTimer=18\+/);
  assert.match(canvas, /ambushTimer=AMBUSH_RULES\.min\+Math\.random\(\)\*AMBUSH_RULES\.spread/);
  assert.match(canvas, /zoneElapsed\(\)<SPAWN_RING\.openingSeconds\?SPAWN_RING\.opening\[0\]/);
});

test('XP: igual por dificuldade, ×5 entre o Nv. 10 e o 60; Final Swarm compõe mais rápido no Kage', () => {
  for (const rank of Object.keys(MISSION_TIER)) assert.ok(close(xpLoot(lootScale('normal', 0, 0, MISSION_TIER[rank]), MISSION_TIER[rank]), 1));
  assert.match(src('scene/GameCanvas.tsx'), /xpDropValue\(xpLoot\(loot,MISSION_TIER\[mission\]\)/);
  assert.equal(xpToLevelUp(1), 30);
  assert.ok(close(xpToLevelUp(XP_RULES.to) / xpToLevelUp(XP_RULES.from), (18 + 6 * 59 + .08 * 59 ** 2 / (1 + 59 / 250)) * XP_RULES.scale / (18 + 6 * 9 + .08 * 81 / (1 + 9 / 250)), 1e-6));
  assert.equal(finalSwarmFactor(0, 'Kage'), 1);
  assert.ok(finalSwarmFactor(600, 'Kage') > finalSwarmFactor(600, 'Genin') * 2, '10 min de Final Swarm pesam bem mais no Kage');
});

test('simulador: reproduzível pela semente e abertura do Genin calma (≤ 12 vivos no 1º minuto)', () => {
  const a = simulateRun({ heroId: 'naruto', mission: 'Genin', minutes: 3, seed: 7, record: 30 });
  const b = simulateRun({ heroId: 'naruto', mission: 'Genin', minutes: 3, seed: 7, record: 30 });
  assert.deepEqual(a.timeline, b.timeline);
  const minute = a.timeline.find(p => p.min >= 1);
  assert.ok(minute.alive <= 12, `vivos no 1º minuto: ${minute.alive}`);
  assert.ok(minute.kills > 10, `abates no 1º minuto: ${minute.kills}`);
  assert.ok(!a.dead, 'Naruto não morre no começo do Genin');
});

// Rodada 80 — decisão do usuário: "podem ser iguais nas suas proporções de dificuldade, como falei os erros do jogador vão
// decretar sua partida e o scale dos monstros tem que ser sentido de uma diferença para a outra". Mais monstros dando mais XP no
// Kage é intencional (risco e recompensa); o que se protege é cada degrau de dificuldade pesar e os degraus serem proporcionais.
test('cada dificuldade escala os monstros de forma sentida e na mesma proporção (Genin→Chunin→Jonin→Kage)', () => {
  const ranks = ['Genin', 'Chunin', 'Jonin', 'Kage'];
  for (const [minutes, overtime] of [[1, 0], [5, 0], [15, 0], [28, 0], [30, 180]]) {
    const t = ranks.map(r => difficultyAt(r, minutes * 60, 1, overtime));
    const hp = t.map((x, i) => x.hp * normalHpFactor(ranks[i]));
    const steps = values => values.slice(1).map((v, i) => v / values[i]);
    for (const [name, values, min] of [['vida do comum', hp, 1.2], ['dano', t.map(x => x.damage), 1.3]]) {
      const s = steps(values);
      for (const step of s) assert.ok(step >= min, `${name} sobe ao menos ${min}× por degrau (min ${minutes}, +${overtime}s): ${step.toFixed(2)}`);
      assert.ok(Math.max(...s) / Math.min(...s) <= 1.15, `degraus de ${name} proporcionais (min ${minutes}): ${s.map(x => x.toFixed(2))}`);
    }
    for (const key of ['cap', 'spawnPerSecond', 'attackRate', 'speed']) for (const step of steps(t.map(x => x[key]))) assert.ok(step >= 1, `${key} nunca cai ao subir a dificuldade`);
  }
});

test('simulador: geometria dos golpes igual à do jogo e bônus do preparo (25/11/2026)', async () => {
  const { targetsPerCast } = await import('../scripts/simulate-run.mjs');
  const { ATTACK_SCALE } = await import('../src/game/worldScale.ts');
  const { MELEE_IMPACT, CONE_COS, SHAPE_RADIUS } = await import('../src/game/combat.ts');
  assert.deepEqual(SHAPE_RADIUS, { area: 1.8, orbit: 1.7 }, 'raio da Área 1,8 desde 25/11');
  const stats = { area: 1, projectiles: 1, bounce: 0 }, many = 10000;
  const t = (shape, range) => ({ shape, range });
  const ratio = (a, b) => targetsPerCast(a, stats, many) / targetsPerCast(b, stats, many);
  const r = ATTACK_SCALE * 1.6, melee = Math.PI * Math.max(MELEE_IMPACT.min, r * MELEE_IMPACT.share) ** 2, area = Math.PI * (ATTACK_SCALE * SHAPE_RADIUS.area) ** 2;
  assert.ok(Math.abs(ratio(t('Corpo a corpo', 1.6), t('Área', 4.5)) - melee / area) < 1e-9, 'corpo a corpo usa o raio do impacto, não o alcance');
  const cone = Math.acos(CONE_COS) * (ATTACK_SCALE * 2.8) ** 2;
  assert.ok(Math.abs(ratio(t('Cone', 2.8), t('Área', 4.5)) - cone / area) < 1e-9, 'cone com o alcance em escala de ataque');
  const sim = fs.readFileSync(new URL('../scripts/simulate-run.mjs', import.meta.url), 'utf8');
  assert.ok(sim.includes('calculateStats(heroId, s.level, s.items, s.pills, 0, permanent, setupBuffs(), s.powerlevel)'), 'preparo entra pela fração ativa');
  assert.ok(sim.includes('const kit = process.env.SIM_KIT_ONLY ? hero.techniques : skillPool(heroId);'), 'pool da partida como no jogo (básicas incluídas)');
});

test('inimigo preso perto do jogador ataca de onde está (cerca, parede; 25/11/2026)', async () => {
  const { stuckReach, STUCK_REACH } = await import('../src/game/enemyTiers.ts');
  assert.deepEqual(STUCK_REACH, { range: 3, seconds: 1, progress: .15, slack: .2 });
  const track = {};
  assert.equal(stuckReach(track, 2, 1, 0), 1, 'acabou de chegar perto: alcance normal');
  assert.equal(stuckReach(track, 1.95, 1, .9), 1, 'ainda dentro do 1 s');
  assert.ok(Math.abs(stuckReach(track, 1.95, 1, 1.01) - 2.15) < 1e-9, 'parado 1 s a 1,95 m: ataca de onde está');
  const moving = {};
  stuckReach(moving, 2.5, 1, 0); stuckReach(moving, 2.2, 1, .6);
  assert.equal(stuckReach(moving, 2.0, 1, 1.3), 1, 'quem continua chegando perto não ganha alcance');
  assert.equal(stuckReach({}, 5, 1, 9), 1, 'longe: alcance normal');
  const canvas = src('scene/GameCanvas.tsx');
  assert.ok(canvas.includes('reach=ranged?8:stuckReach(enemy.stuck??={},distance,enemy.megaElite?1.6:1,elapsed);'));
});
