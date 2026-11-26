// Memória sem crescer com os abates (26/11/2026 — "Da forma que estava derrubou o navegador falando que faltou memória...
// isso não pode acontecer nunca"). Lógica pura e leitura do código, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { STATUS_RULES, enqueueDeathBurst } = await import('../src/game/statusRules.ts');

test('fila de explosões na morte nunca passa do teto, mesmo com milhões de abates', () => {
  const D = STATUS_RULES.deathBurst, queue = [];
  assert.equal(D.maxQueued, 120);
  let accepted = 0;
  for (let i = 0; i < 1_000_000; i++) {
    if (enqueueDeathBurst(queue, { x: i, z: 0, kind: 'fire' })) accepted++;
    if (i % 100 === 0) queue.splice(0, D.perFrame); // o jogo esvazia perFrame por quadro
  }
  assert.ok(queue.length <= D.maxQueued, String(queue.length));
  assert.ok(accepted > 100000, 'continua aceitando explosões quando há espaço');
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /if\(kind\)enqueueDeathBurst\(deathBursts,\{x:enemy\.sprite\.position\.x,z:enemy\.sprite\.position\.z,kind\}\);/);
  assert.doesNotMatch(src, /deathBursts\.push\(/);
});

test('guizo usa modelo compartilhado e sai da lista de pickups ao ser pego', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /const bell=new THREE\.Mesh\(guizoGeometry\.bell,material\);/);
  assert.match(src, /const loop=new THREE\.Mesh\(guizoGeometry\.loop,material\);/);
  assert.doesNotMatch(src, /new THREE\.SphereGeometry\(\.26,14,10\),material/);
  assert.match(src, /if\(guizo\)\{pickup\.active=false;scene\.remove\(pickup\.mesh\);const at=pickups\.indexOf\(pickup\);if\(at>=0\)pickups\.splice\(at,1\);/);
  assert.match(src, /id:'pickup-'\+\(pickupSerial\+\+\)/);
});
