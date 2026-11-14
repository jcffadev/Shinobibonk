// Recompensas de altar (rodada 55): projétil/golpe inteiro por raridade, sem "chance de projétil".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';

const A = await load('/src/game/altarRewards.ts');
const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('Comum e Incomum não dão projétil; Raro +1, Épico +2, Lendário +3', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(A.altarProjectiles), [0, 0, 1, 2, 3]);
  assert.equal(A.altarProjectiles(-1), 0);
  assert.equal(A.altarProjectiles(99), 3);
});

test('texto do cartão de projétil', () => {
  assert.equal(A.projectileLabel(1), '+1 projétil/golpe extra');
  assert.equal(A.projectileLabel(3), '+3 projéteis/golpes extras');
});

test('altar não sorteia mais "chance de projétil extra"', () => {
  const pool = canvas.slice(canvas.indexOf('ALTAR_BUFF_POOL'), canvas.indexOf('ALTAR_BUFF_POOL') + 2500);
  assert.ok(!/\['projectileChance'/.test(pool), 'projectileChance saiu do pool do altar');
  assert.ok(/\['projectiles',1/.test(pool), 'projectiles inteiro entrou no pool');
});
