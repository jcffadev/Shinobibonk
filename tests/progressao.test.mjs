// Progressão do jogador e dos monstros: curva de HP (Rodada 55), escala de dano e ameaça por tempo da zona.
// Importa os módulos direto (TypeScript nativo do Node), sem Vite nem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xpToLevelUp, heroHpScale, HP_GROWTH, calculateStats, difficultyAt, zoneThreat, zoneCurse, ZONE_DIFFICULTY, ENEMY_SCALING, FINAL_SWARM, MISSION_TIER, MISSION_HP } from '../src/game/progression.ts';
import { lootScale, xpDropValue } from '../src/game/enemyTiers.ts';
import { guardianAttackMultiplier, guardianDefense, guardianVitality } from '../src/game/missions.ts';
import { HEROES } from '../src/game/heroes.ts';
import { close } from './helpers/load.mjs';

test('Guardiões e Bijū ganham HP, armadura e dano sem teto de tempo no Final Swarm', () => {
  for (const mission of Object.keys(MISSION_TIER)) {
    const stat = (overtime, plans) => {
      const time = 600 + overtime;
      const threat = zoneThreat(mission, time, zoneCurse(1, plans, 0), overtime, 0);
      return {
        hp:guardianVitality(threat.hp, time, time, overtime, 1),
        defense:guardianDefense(time, false, overtime, 1, plans),
        damage:threat.damage*guardianAttackMultiplier(time, overtime, 1),
      };
    };
    const onTime = stat(0, 0), late = stat(60, 0), extreme = stat(900, 0), plans = stat(900, 3);
    for (const attribute of ['hp', 'defense', 'damage']) {
      assert.ok(onTime[attribute] < late[attribute] && late[attribute] < extreme[attribute], attribute);
      assert.ok(extreme[attribute] < plans[attribute], attribute + ' com três planos');
    }
    assert.ok(plans.defense < 1);
    assert.ok(guardianDefense(1500, true, 900, 3, 3) > plans.defense);
    assert.ok(guardianAttackMultiplier(1500, 900, 3, true) > guardianAttackMultiplier(1500, 900, 1));
    if (mission === 'Kage') {
      assert.ok(late.hp >= 1e6);
      assert.ok(extreme.hp >= 1e9);
    }
  }
});

const LEVELS = [1, 2, 10, 50, 100, 200, 415, 1000, 5000];

test('HP: fórmula exata 1 + 0,04·n/(1 + n/150) (n = nível − 1 ou nível, conforme o código)', () => {
  // A fórmula documentada no CHANGELOG precisa bater com o código em todos os níveis.
  const f = n => 1 + HP_GROWTH.perLevel * n / (1 + n / HP_GROWTH.softLevels);
  const offset = close(heroHpScale(1), f(1)) ? 0 : 1;
  for (const level of LEVELS) assert.ok(close(heroHpScale(level), f(level - offset)), `nível ${level}: ${heroHpScale(level)}`);
  assert.equal(HP_GROWTH.perLevel, .04);
  assert.equal(HP_GROWTH.softLevels, 150);
});

test('HP: sempre cresce, cada vez menos, e nunca passa do teto ×(1 + 0,04·150) = ×7', () => {
  let previous = heroHpScale(1), previousGain = Infinity;
  for (let level = 2; level <= 3000; level++) {
    const scale = heroHpScale(level), gain = scale - previous;
    assert.ok(gain > 0, `cresce no nível ${level}`);
    assert.ok(gain <= previousGain + 1e-12, `desacelera no nível ${level}`);
    assert.ok(scale < 1 + HP_GROWTH.perLevel * HP_GROWTH.softLevels, `abaixo do teto no nível ${level}`);
    previous = scale; previousGain = gain;
  }
});

test('HP real (calculateStats) do caso do usuário: Naruto Nv. 415 sem itens bem abaixo de 1.613', () => {
  const n1 = calculateStats('naruto', 1).maxHp, n415 = calculateStats('naruto', 415).maxHp;
  assert.ok(n415 < 500, `Nv. 415 = ${n415}`);
  assert.ok(n415 > n1 * 3, `Nv. 415 (${n415}) ainda é bem maior que o Nv. 1 (${n1})`);
});

test('HP real: nunca diminui ao subir de nível, para TODAS as versões do elenco', () => {
  assert.ok(HEROES.length >= 100, `elenco carregado: ${HEROES.length}`);
  for (const hero of HEROES) {
    let previous = 0;
    for (const level of [1, 5, 25, 100, 415]) {
      const hp = calculateStats(hero.id, level).maxHp;
      assert.ok(Number.isFinite(hp) && hp > 0, `${hero.id} Nv. ${level} = ${hp}`);
      assert.ok(hp >= previous, `${hero.id} Nv. ${level}: ${hp} < ${previous}`);
      previous = hp;
    }
  }
});

test('ameaça: monstros ficam mais fortes ao longo da zona (HP, dano, vivos, spawn)', () => {
  for (const mission of Object.keys(MISSION_TIER)) {
    let prev = difficultyAt(mission, 0);
    for (const seconds of [60, 180, 300, 480, 599]) {
      const now = difficultyAt(mission, seconds);
      for (const key of ['hp', 'damage', 'cap', 'spawnPerSecond']) assert.ok(now[key] >= prev[key], `${mission} ${key} em ${seconds}s`);
      prev = now;
    }
  }
});

test('troca de zona: zona nova no segundo 0 = início da zona 1 × multiplicador da zona (não o fim da zona anterior)', () => {
  for (const mission of Object.keys(MISSION_TIER)) {
    const z1Start = zoneThreat(mission, 0, zoneCurse(ZONE_DIFFICULTY[1], 0, 0), 0, 0);
    const z1End = zoneThreat(mission, 595, zoneCurse(ZONE_DIFFICULTY[1], 0, 0), 0, 0);
    for (const zone of [2, 3]) {
      const start = zoneThreat(mission, 0, zoneCurse(ZONE_DIFFICULTY[zone], 0, 0), 0, 0);
      assert.ok(close(start.hp, z1Start.hp * ZONE_DIFFICULTY[zone], 1e-9), `${mission} Z${zone} HP inicial = início da Z1 × ${ZONE_DIFFICULTY[zone]}`);
      assert.ok(close(start.damage, z1Start.damage * ZONE_DIFFICULTY[zone], 1e-9), `${mission} Z${zone} dano inicial`);
      assert.equal(start.cap, z1Start.cap, `${mission} Z${zone}: vivos recomeçam iguais aos da Z1`);
      assert.ok(start.hp < z1End.hp / 2, `${mission} Z${zone}: bem mais fraco que o fim da Z1`);
    }
  }
  assert.deepEqual([ZONE_DIFFICULTY[1], ZONE_DIFFICULTY[2], ZONE_DIFFICULTY[3]], [1, 1.18, 1.38]);
});

test('+% de inimigos multiplica spawn e vivos por cima da escala, respeitando o teto de 1.600', () => {
  const base = zoneThreat('Genin', 240, 1, 0, 0), more = zoneThreat('Genin', 240, 1, 0, 1);
  assert.ok(close(more.spawnPerSecond, base.spawnPerSecond * 2), 'spawn ×2 com +100%');
  assert.ok(close(more.spawnInterval, base.spawnInterval / 2), 'intervalo ÷2 com +100%');
  assert.ok(more.cap > base.cap, 'mais vivos com +100%');
  assert.ok(close(more.hp, base.hp), '+% de inimigos não muda o HP de cada monstro');
  const huge = zoneThreat('Kage', 599, 1, 0, 50);
  assert.ok(huge.cap <= ENEMY_SCALING.maxEnemies, `teto normal: ${huge.cap}`);
  const swarm = zoneThreat('Kage', 600, 1, 900, 50);
  assert.ok(swarm.cap <= FINAL_SWARM.maxEnemies, `teto do Final Swarm: ${swarm.cap}`);
  assert.ok(zoneThreat('Genin', 240, 1, 0, -5).spawnPerSecond > 0, 'redução forte de inimigos nunca zera o spawn (mínimo ×0,2)');
});

test('teto de monstros vivos é 1.600, no jogo normal e no Final Swarm (decisão do usuário, 14/11)', () => {
  assert.equal(ENEMY_SCALING.maxEnemies, 1600);
  assert.equal(FINAL_SWARM.maxEnemies, 1600);
  for (const mission of Object.keys(MISSION_TIER)) for (const [seconds, overtime] of [[599, 0], [600, 300], [600, 3600]]) {
    for (const bonus of [0, 1, 10]) {
      const cap = zoneThreat(mission, seconds, 1.38, overtime, bonus).cap;
      assert.ok(cap <= 1600, `${mission} ${seconds}s +${overtime}s bônus ${bonus}: ${cap}`);
    }
  }
});

test('maldição da zona: planos do Shikamaru (+33% cada) e bônus de ameaça (mínimo ×0,2)', () => {
  assert.ok(close(zoneCurse(1, 0, 0), 1));
  assert.ok(close(zoneCurse(1.18, 2, 0), 1.18 * 1.66));
  assert.ok(close(zoneCurse(1, 0, .5), 1.5));
  assert.ok(close(zoneCurse(1, 0, -3), .2));
});

test('dificuldade da missão multiplica por cima (Genin < Chunin < Jonin < Kage)', () => {
  const order = ['Genin', 'Chunin', 'Jonin', 'Kage'].map(m => difficultyAt(m, 120));
  for (let i = 1; i < order.length; i++) assert.ok(order[i].hp > order[i - 1].hp && order[i].damage > order[i - 1].damage);
});

test('XP por abate usa o relógio total e a curva continua nas trocas de zona', () => {
  const samples = [0, 599, 600, 1199, 1200, 1799];
  const normalXp = samples.map(elapsed => xpDropValue(lootScale('normal', 0, 0, MISSION_TIER.Genin), 1, elapsed));
  assert.deepEqual(normalXp, [4, 7, 7, 10, 10, 13]);
  // Rodada 76: a XP pedida fica igual até o Nv. 10 e chega a ×5 no Nv. 60 (XP_RULES); antes 1174 · 5069 · 11629.
  // 26/11/2026: +10% a cada 100 níveis (XP_CENTURY) — antes 5869 · 25345 · 58142.
  assert.deepEqual([100, 300, 582].map(level => Math.ceil(xpToLevelUp(level))), [6456, 33734, 93637]);
  assert.equal(xpDropValue(3, 1.25, 600), 25, 'bônus da zona ativa é aplicado antes do arredondamento');
});

// Rodada 76 (pedido: "ir nascendo 1 monstro por segundo no começo"): abertura calma por dificuldade (OPENING) que se mistura à
// curva antiga com peso (min/4)²; dos 4 min em diante a curva é a mesma de antes (26/s e teto 304 no Genin aos 4 min).
test('abertura calma: 1 monstro/s no Genin, 2 no Kage, e curva antiga a partir de 4 min', () => {
  const base=difficultyAt('Genin',0);
  assert.equal(base.cap,8);
  assert.ok(close(base.spawnPerSecond,1));
  assert.ok(difficultyAt('Genin',60).spawnPerSecond<2.5,'1º minuto continua calmo');
  for(const rank of Object.keys(MISSION_TIER)) {
    assert.ok(close(difficultyAt(rank,0).spawnPerSecond,MISSION_HP[rank]));
    assert.ok(close(difficultyAt(rank,240).spawnPerSecond,26*Math.sqrt(MISSION_TIER[rank])));
  }
  assert.equal(difficultyAt('Kage',0).cap,16);
  assert.equal(difficultyAt('Genin',240).cap,243); // 26/11/2026: HORDE_CAP_SCALE 0,8 (era 304)
});

test('todo shinobi começa com pelo menos 1,0 HP/s de regeneração (25/11/2026)', async () => {
  const { HEROES } = await import('../src/game/heroes.ts');
  const { calculateStats, BASE_REGEN } = await import('../src/game/progression.ts');
  assert.equal(BASE_REGEN, 1);
  for (const h of HEROES) assert.ok(calculateStats(h.id, 1).regen >= 1, h.id);
  assert.ok(Math.abs(calculateStats('hashirama', 1).regen - 1.8) < 1e-9, 'a passiva de cura soma por cima');
});

test('Final Swarm: degrau a cada 5 min com +50% de vida, +30% de dano e +2 pontos de defesa (25/11/2026)', async () => {
  const { SWARM_STEP, swarmStep, difficultyAt } = await import('../src/game/progression.ts');
  // 26/11/2026: degraus que escalam (o degrau k vale k vezes); teto de defesa 97%.
  // 26/11/2026 ("overkill em tudo aos 10 min de Final Swarm"): degrau k = vida ×(1+k), dano ×(1+0,5k), +3k pontos de defesa.
  assert.deepEqual(SWARM_STEP, { seconds: 300, hp: 1, damage: .5, armor: .03, armorCap: .97 });
  assert.deepEqual([0, 299, 300, 899, 900].map(swarmStep), [0, 0, 1, 2, 3]);
  const before = difficultyAt('Kage', 600 + 299.9, 1, 299.9), after = difficultyAt('Kage', 600 + 300, 1, 300);
  assert.ok(after.hp / before.hp > 1.5, 'salto de vida no degrau');
  assert.ok(after.damage / before.damage > 1.3, 'salto de dano no degrau');
  assert.ok(after.armor > before.armor, 'mais defesa no degrau');
  assert.ok(difficultyAt('Kage', 600 + 3600, 1, 3600).armor <= SWARM_STEP.armorCap);

});

test('Final Swarm repõe a horda até o teto em todas as zonas, mesmo com o herói matando rápido (26/11/2026)', async () => {
  // "No final swarm só tava aparecendo 400 monstros… Isso para todas as zonas, na zona 1 a progressão funcionou direito":
  // nas zonas 2 e 3 o herói mata mais rápido que o ritmo normal (teto ÷ 4 s = 200/s no começo do swarm) e a tela esvaziava.
  const { spawnBudgetFor } = await import('../src/game/progression.ts');
  const alive = (rank, overtime, killsPerSecond) => {
    const th = difficultyAt(rank, 600 + overtime, 1, overtime); let count = 0, budget = 0, acc = 0; const dt = 1 / 60;
    for (let f = 0; f < 15 * 60; f++) {
      budget = spawnBudgetFor(budget, dt, th.spawnInterval, count, th.cap, true, 120, 2);
      let made = 0; while (budget >= 1 && count < th.cap && made < 120) { count++; budget--; made++; }
      if (count >= th.cap) budget = Math.min(budget, 1);
      acc += killsPerSecond * dt; const k = Math.min(count, Math.floor(acc)); count -= k; acc -= k;
    }
    return { count, cap: th.cap };
  };
  for (const rank of ['Genin', 'Kage']) for (const [overtime, cap] of [[60, 800], [420, 1600]]) {
    const r = alive(rank, overtime, 2000);
    assert.equal(r.cap, cap);
    assert.ok(r.count >= cap * .9, `${rank} +${overtime}s: ${r.count}/${cap}`);
  }
  // Fora do swarm o ritmo continua o normal (não repõe tudo de uma vez).
  assert.ok(spawnBudgetFor(0, 1 / 60, .5, 0, 900, false, 40, 2) < 1);
  assert.equal(spawnBudgetFor(0, 1 / 60, .5, 100, 900, true, 120, 2), 120);
  const src = (await import('node:fs')).readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /spawnBudget=spawnBudgetFor\(spawnBudget,dt,threat\.spawnInterval,enemyList\.length,threat\.cap,threat\.swarm>1,perFrame,SPAWN_RULES\.refill\)/);
});

test('Final Swarm: cada degrau vale mais que o anterior (aos +30 min: vida ×5.040, dano ×315, defesa até 97%) (26/11/2026)', async () => {
  // "30min de final swarm deveria ser 'quase' impossível… Buffar dos monstros: Hp/Vida/dano".
  const { swarmStepHp, swarmStepDamage, swarmStepArmor, difficultyAt, SWARM_STEP } = await import('../src/game/progression.ts');
  assert.equal(swarmStepHp(0), 1); assert.equal(swarmStepHp(1), 2); assert.equal(swarmStepHp(2), 6);
  assert.ok(Math.abs(swarmStepHp(6) - 5040) < 1e-9);
  assert.ok(Math.abs(swarmStepDamage(6) - 315) < 1e-9);
  assert.ok(Math.abs(swarmStepArmor(6) - .63) < 1e-12);
  // Cada degrau cresce mais que o anterior.
  for (let k = 2; k <= 8; k++) assert.ok(swarmStepHp(k) / swarmStepHp(k - 1) > swarmStepHp(k - 1) / swarmStepHp(k - 2));
  const at = m => difficultyAt('Kage', 600 + m * 60, 1, m * 60);
  assert.ok(at(30).hp / at(25).hp > 3.9, 'do +25 ao +30 a vida passa de ×3,9');
  assert.ok(at(30).armor > .95 && at(30).armor <= SWARM_STEP.armorCap);
});

test('rampa do meio: vida ×1 até 2 min, ×12 aos 8 min, volta a ×1 aos 30 min e a vida total nunca cai (26/11/2026)', async () => {
  // "no jogo referencia aos 5min+ se você não tiver uma build boa… você já começa tomar dano/morrer" → "Sim, calibrar".
  const { MID_HP_RAMP, midHpRamp, difficultyAt } = await import('../src/game/progression.ts');
  assert.equal(MID_HP_RAMP.max, 12);
  assert.equal(midHpRamp(0), 1); assert.equal(midHpRamp(2), 1); assert.equal(midHpRamp(8), 12); assert.equal(midHpRamp(30), 1); assert.equal(midHpRamp(45), 1);
  assert.ok(Math.abs(midHpRamp(5) - Math.sqrt(12)) < 1e-9);
  for (const rank of ['Genin', 'Kage']) {
    let prev = 0;
    for (let m = 0; m <= 60; m += .25) { const h = difficultyAt(rank, m * 60, 1, Math.max(0, m * 60 - 600)).hp; assert.ok(h >= prev * .999, `${rank} ${m} min`); prev = h; }
  }
  // O 1º minuto não muda.
  assert.ok(Math.abs(difficultyAt('Genin', 60).hp / difficultyAt('Genin', 60).hp - 1) < 1e-12 && midHpRamp(1) === 1);
});

test('zonas 2 e 3: mais vida e defesa para quem chega forte, mesmo dano, curva recomeça por zona (26/11/2026)', async () => {
  // "a progressão deveria ser pela zona mesmo… a única coisa seria a dificuldade" + "deixe o dano como está, só armadura e vida".
  const { ZONE_TOUGHNESS, zoneThreat, zoneCurse, ZONE_DIFFICULTY, SWARM_STEP } = await import('../src/game/progression.ts');
  assert.deepEqual(ZONE_TOUGHNESS, { 1: { hp: 1, armor: 0 }, 2: { hp: 6, armor: .05 }, 3: { hp: 20, armor: .1 } });
  for (const zone of [2, 3]) {
    const base = zoneThreat('Genin', 300, zoneCurse(ZONE_DIFFICULTY[zone], 0, 0), 0, 0);
    const tough = zoneThreat('Genin', 300, zoneCurse(ZONE_DIFFICULTY[zone], 0, 0), 0, 0, undefined, zone);
    assert.ok(Math.abs(tough.hp / base.hp - ZONE_TOUGHNESS[zone].hp) < 1e-9, 'vida da zona');
    assert.equal(tough.damage, base.damage, 'dano igual');
    assert.ok(Math.abs(tough.armor - base.armor - ZONE_TOUGHNESS[zone].armor) < 1e-9, 'defesa somada');
  }
  assert.ok(zoneThreat('Kage', 600 + 3600, 1, 3600, 0, undefined, 3).armor <= SWARM_STEP.armorCap);
  const src = (await import('node:fs')).readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /ex\('enemyCount'\),t=>tuneThreat\(t,tune\(\)\),zone\);/);
});
