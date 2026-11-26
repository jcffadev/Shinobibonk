// Ninja de capuz roxo (linha 0 do atlas da horda) é sempre atirador; as outras artes nunca atiram (26/11/2026 — "Esse
// personagem será ranged apenas"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { HORDE_ROWS, RANGED_ROW, rangedChance, hordeLook } = await import('../src/game/hordeRoles.ts');
const seeded = (seed = 7) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

test('atirador usa sempre a arte do capuz roxo, e essa arte só aparece em atirador', () => {
  const rng = seeded(13);
  const rows = new Set();
  for (let i = 0; i < 5000; i++) {
    const look = hordeLook(true, 300 * (i % 3), rng);
    assert.ok(look.row >= 0 && look.row < HORDE_ROWS);
    assert.equal(look.row === RANGED_ROW, look.ranged);
    rows.add(look.row);
  }
  assert.deepEqual([...rows].sort(), [0, 1, 2, 3]);
  // Elite, desafio e Mega Elite (canShoot = false): nunca atiram nem usam a arte do atirador.
  for (let i = 0; i < 2000; i++) { const look = hordeLook(false, 300, rng); assert.equal(look.ranged, false); assert.notEqual(look.row, RANGED_ROW); }
});

test('proporção de atiradores igual à de antes: 7% no início da zona e 20% a partir de 5 min', () => {
  assert.ok(Math.abs(rangedChance(0) - .07) < 1e-12);
  assert.ok(Math.abs(rangedChance(150) - .135) < 1e-12);
  assert.ok(Math.abs(rangedChance(600) - .2) < 1e-12);
  const rng = seeded(29); let ranged = 0; const n = 20000;
  for (let i = 0; i < n; i++) if (hordeLook(true, 600, rng).ranged) ranged++;
  assert.ok(Math.abs(ranged / n - .2) < .015, String(ranged / n));
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /const look=hordeLook\(tier==='normal'&&!challenge,zoneElapsed\(\)\);const e=megaElite\?makeHero\(id,Math\.max\(1,level\)\):makeSprite\(look\.row,/);
  assert.match(src, /if\(look\.ranged\)enemy\.ranged=/);
});
