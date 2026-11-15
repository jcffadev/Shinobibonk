// Rodada 96: armadilha do ninja caído — +5% de inimigos na partida e 10 ninjas a 10 m em volta do jogador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FALLEN_TRAP, trapRing } from '../src/game/fallenTrap.ts';

test('10 ninjas num anel de 10 m em volta do jogador', () => {
  const ring = trapRing(5, -3);
  assert.equal(ring.length, 10);
  for (const p of ring) assert.ok(Math.abs(Math.hypot(p.x - 5, p.z + 3) - 10) < 1e-9, 'a 10 m');
  const angles = ring.map(p => Math.atan2(p.z + 3, p.x - 5)).sort((a, b) => a - b);
  for (let i = 1; i < angles.length; i++) assert.ok(Math.abs(angles[i] - angles[i - 1] - Math.PI / 5) < 1e-9, 'igualmente espaçados');
  assert.equal(trapRing(0, 0, 0).length, 0, 'sem vaga, ninguém');
});

test('a partida aplica a armadilha: +5% de inimigos e o anel', () => {
  assert.equal(FALLEN_TRAP.enemyCount, .05); assert.equal(FALLEN_TRAP.enemies, 10); assert.equal(FALLEN_TRAP.radius, 10);
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('runBuffs.enemyCount=(runBuffs.enemyCount??0)+FALLEN_TRAP.enemyCount;refreshStats();'), '+5% na partida toda');
  assert.ok(canvas.includes('const count=Math.min(body?FALLEN_TRAP.enemies:'), '10 ninjas');
  assert.ok(canvas.includes('const spot=ring[i]'), 'no anel em volta do jogador');
});
