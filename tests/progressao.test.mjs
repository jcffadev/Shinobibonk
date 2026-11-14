// Progressão do jogador e dos monstros: curva de HP (Rodada 55), escala de dano e ameaça por tempo da zona.
// Importa os módulos direto (TypeScript nativo do Node), sem Vite nem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroHpScale, HP_GROWTH, calculateStats, difficultyAt, zoneThreat, zoneCurse, ZONE_DIFFICULTY, ENEMY_SCALING, FINAL_SWARM, MISSION_TIER } from '../src/game/progression.ts';
import { HEROES } from '../src/game/heroes.ts';
import { close } from './helpers/load.mjs';

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
