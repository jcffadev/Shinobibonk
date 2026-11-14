// Bênção do altar (Rodada 51/55) e golpes extras: sorteios reais com semente fixa, milhares de vezes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAltarOffers, altarProjectiles, projectileLabel, extraStrikes, altarLuckMultiplier, ALTAR_BUFF_BASE, ALTAR_BUFF_POOL, ALTAR_OFFENSE, ALTAR_RARITIES } from '../src/game/altarRewards.ts';
import { seeded, close } from './helpers/load.mjs';

const RUNS = 4000;

test('tabela de projéteis: Comum 0 · Incomum 0 · Raro +1 · Épico +2 · Lendário +3 (e limites)', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(altarProjectiles), [0, 0, 1, 2, 3]);
  assert.equal(altarProjectiles(-1), 0);
  assert.equal(altarProjectiles(2.9), 1, 'tier fracionário arredonda para baixo');
  assert.equal(altarProjectiles(99), 3);
  assert.equal(projectileLabel(1), '+1 projétil/golpe extra');
  assert.equal(projectileLabel(2), '+2 projéteis/golpes extras');
  assert.equal(projectileLabel(3), '+3 projéteis/golpes extras');
});

test('nenhuma bênção oferece "chance de projétil" (projectileChance)', () => {
  assert.ok(!ALTAR_BUFF_POOL.some(([key]) => key === 'projectileChance'));
  for (let tier = 0; tier <= 4; tier++) {
    const rng = seeded(100 + tier);
    for (let i = 0; i < RUNS; i++) for (const offer of buildAltarOffers(tier, 10, rng)) assert.ok(!('projectileChance' in offer.bonus));
  }
});

test(`sorteio (${RUNS}× por raridade): projétil só de Raro em diante, sempre com o valor exato da raridade`, () => {
  for (let tier = 0; tier <= 4; tier++) {
    const rng = seeded(7 + tier);
    let projectileOffers = 0;
    for (let i = 0; i < RUNS; i++) {
      for (const offer of buildAltarOffers(tier, 200, rng)) {
        if ('projectiles' in offer.bonus) {
          projectileOffers++;
          assert.equal(offer.bonus.projectiles, altarProjectiles(tier), `tier ${tier}`);
          assert.ok(Number.isInteger(offer.bonus.projectiles), 'projétil é inteiro (Sorte não altera)');
          assert.equal(offer.name, projectileLabel(altarProjectiles(tier)));
        }
      }
    }
    if (tier < 2) assert.equal(projectileOffers, 0, `${ALTAR_RARITIES[tier]} nunca sorteia projétil`);
    else assert.ok(projectileOffers > RUNS * .05, `${ALTAR_RARITIES[tier]} sorteia projétil às vezes (${projectileOffers}/${RUNS})`);
  }
});

test('cada bênção: 3 ofertas distintas, ≥1 ofensiva e ≥1 de utilidade/defesa, raridade e valores coerentes', () => {
  const rng = seeded(42);
  for (let i = 0; i < RUNS; i++) {
    const tier = i % 5, luck = (i * 37) % 300;
    const offers = buildAltarOffers(tier, luck, rng);
    assert.equal(offers.length, 3);
    const keys = offers.map(o => Object.keys(o.bonus)[0]);
    assert.equal(new Set(keys).size, 3, `sem repetição: ${keys}`);
    assert.ok(keys.some(k => ALTAR_OFFENSE.has(k)), 'tem ofensiva');
    assert.ok(keys.some(k => !ALTAR_OFFENSE.has(k)), 'tem utilidade/defesa');
    for (const offer of offers) {
      const [key, value] = Object.entries(offer.bonus)[0];
      assert.equal(offer.rarity, ALTAR_RARITIES[tier]);
      assert.equal(offer.id, 'altar-' + key);
      assert.ok(Number.isFinite(value) && value > 0, `${key}=${value}`);
      if (key !== 'projectiles') {
        const scale = ALTAR_BUFF_POOL.find(([k]) => k === key)[1];
        assert.ok(close(value, Math.round(ALTAR_BUFF_BASE[tier] * scale * altarLuckMultiplier(luck) * 100) / 100), `${key} no tier ${tier}`);
      }
    }
  }
});

test('Sorte: +2% por ponto acima de 10, teto +120%', () => {
  assert.equal(altarLuckMultiplier(0), 1);
  assert.equal(altarLuckMultiplier(10), 1);
  assert.ok(close(altarLuckMultiplier(35), 1.5));
  assert.ok(close(altarLuckMultiplier(70), 2.2));
  assert.ok(close(altarLuckMultiplier(9999), 2.2));
});

test('mesma semente → mesmas ofertas (sorteio reproduzível)', () => {
  const a = buildAltarOffers(4, 50, seeded(9)), b = buildAltarOffers(4, 50, seeded(9));
  assert.deepEqual(a, b);
});

test('golpes extras: projéteis−1, parte fracionária vira chance, Ultimate não repete, teto 11', () => {
  const never = () => .99, always = () => 0;
  assert.equal(extraStrikes(1, 0, false, never), 0, '1 projétil = sem golpe extra');
  assert.equal(extraStrikes(4, 0, false, never), 3, 'Lendário (+3) = 3 golpes extras');
  assert.equal(extraStrikes(4, 0, true, always), 0, 'Ultimate não repete');
  assert.equal(extraStrikes(2, .5, false, always), 2, 'chance fracionária que acerta');
  assert.equal(extraStrikes(2, .5, false, never), 1, 'chance fracionária que erra');
  assert.equal(extraStrikes(50, 0, false, never), 11, 'teto');
  assert.equal(extraStrikes(0, 0, false, never), 0, 'nunca negativo');
  const rng = seeded(3); let hits = 0;
  for (let i = 0; i < RUNS; i++) hits += extraStrikes(1, .25, false, rng);
  assert.ok(Math.abs(hits / RUNS - .25) < .03, `chance de 25% observada: ${(hits / RUNS).toFixed(3)}`);
});
