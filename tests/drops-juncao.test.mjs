// Junção de drops no chão (26/11/2026 — "quando matamos muitos monstros e não coletamos, dropa muito o fps e quando pegamos de
// uma vez ele chega a travar o jogo"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { createGroundDropIndex, DROP_MERGE, DROP_CELL_SIZE } = await import('../src/game/drops.ts');
const seeded = (seed = 7) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

/** Mesmo caminho do addDrop do jogo: com a célula cheia daquele tipo, soma no drop que já está lá. */
function drop(index, x, z, type, value) {
  if (DROP_MERGE.kinds.has(type)) {
    const into = index.mergeTarget(x, z, d => d.type === type, DROP_MERGE.perCell);
    if (into) { into.value += value; return; }
  }
  index.add({ x, y: 0, z, type, value });
}

test('mergeTarget só junta quando a célula já tem o limite daquele tipo', () => {
  const index = createGroundDropIndex(d => d);
  assert.equal(index.mergeTarget(1, 1, () => true, 2), undefined); // célula vazia
  index.add({ x: 1, y: 0, z: 1, type: 'xp', value: 1 });
  assert.equal(index.mergeTarget(1, 1, d => d.type === 'xp', 2), undefined); // ainda cabe
  const second = { x: 2, y: 0, z: 2, type: 'xp', value: 1 };
  index.add(second);
  assert.equal(index.mergeTarget(3, 3, d => d.type === 'xp', 2), second);
  assert.equal(index.mergeTarget(3, 3, d => d.type === 'ryu', 2), undefined); // outro tipo não conta
  assert.equal(index.mergeTarget(1 + DROP_CELL_SIZE, 1, d => d.type === 'xp', 2), undefined); // outra célula
});

test('60 mil abates sem coletar: o chão fica com centenas de drops e nenhum valor se perde', () => {
  assert.equal(DROP_MERGE.perCell, 6);
  const index = createGroundDropIndex(d => d), rng = seeded(41);
  let xp = 0, ryu = 0, chakra = 0, raw = 0;
  for (let i = 0; i < 60000; i++) {
    const a = rng() * Math.PI * 2, r = rng() * 20, x = Math.cos(a) * r, z = Math.sin(a) * r;
    drop(index, x, z, 'xp', 3); xp += 3;
    for (let k = 0; k < 2; k++) { drop(index, x, z, 'ryu', 2); ryu += 2; }
    drop(index, x, z, 'chakra', 1); chakra += 1;
    drop(index, x, z, 'onigiri', 1); raw++;
  }
  const all = [...index.all()], sum = type => all.filter(d => d.type === type).reduce((s, d) => s + d.value, 0);
  assert.equal(sum('xp'), xp); assert.equal(sum('ryu'), ryu); assert.equal(sum('chakra'), chakra);
  const cells = [...index.cells()].length;
  const merged = all.filter(d => d.type !== 'onigiri').length;
  assert.ok(merged <= cells * 3 * DROP_MERGE.perCell, `${merged} drops em ${cells} células`);
  assert.ok(merged < 1500, String(merged)); // eram 240 mil sem a junção
  assert.equal(all.filter(d => d.type === 'onigiri').length, raw); // bolinho de cura não junta
});

test('o jogo junta XP, Ryu e chakra no addDrop', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /if\(DROP_MERGE\.kinds\.has\(type\)\)\{const into=drops\.mergeTarget\(x,z,d=>d\.type===type,DROP_MERGE\.perCell\);if\(into\)\{into\.value\+=value;/);
});

test('orbe de XP parado há mais de 10 s some; Ryu, chakra e o que o ímã puxou ficam (26/11/2026)', async () => {
  // "passar uns 20s sem pegar o item de EXP vamos fazer sumir do mapa os itens".
  const { DROP_EXPIRY, dropExpired } = await import('../src/game/drops.ts');
  assert.equal(DROP_EXPIRY.xpSeconds, 10); // 26/11/2026: "coloque 10s" (eram 20)
  assert.equal(dropExpired('xp', 9.9), false); assert.equal(dropExpired('xp', 10.1), true);
  assert.equal(dropExpired('ryu', 999), false); assert.equal(dropExpired('chakra', 999), false);
  const index = createGroundDropIndex(d => d), grounded = { x: 1, y: 0, z: 1, type: 'xp' }, pulled = { x: 2, y: 0, z: 2, type: 'xp' };
  index.add(grounded); index.add(pulled); index.startPull(pulled);
  assert.equal(index.removeGrounded(grounded), true);
  assert.equal(index.removeGrounded(pulled), false, 'o que o ímã já puxou não some');
  assert.deepEqual([...index.all()], [pulled]);
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /for\(const drop of drops\.ground\(\)\)if\(dropExpired\(drop\.type,pickupClock-drop\.born\)\)old\.push\(drop\);for\(const drop of old\)drops\.removeGrounded\(drop\);/);
  assert.match(src, /if\(into\)\{into\.value\+=value;into\.born=pickupClock;/);
});
