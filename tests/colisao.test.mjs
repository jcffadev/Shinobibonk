// Paredes invisíveis (Rodada 70 — pedidos do usuário: "Verifique ainda as paredes invisiveis e os blocks invisiveis no
// caminhar do personagem" e "Precisamos andar livre, o máximo que pode ter é travar ao esbarrar, mas ao dar dash
// conseguir passar"). Lógica pura de src/scene/collision.ts, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';

const { COLLISION_RULES, createSolids } = await load('/src/scene/collision.ts');
const { PLAYER_SIZE } = await load('/src/game/worldScale.ts');
const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('o corpo do jogador acompanha o tamanho desenhado (40%)', () => {
  assert.ok(COLLISION_RULES.playerRadius <= .42 * PLAYER_SIZE + .01, `raio ${COLLISION_RULES.playerRadius}`);
  assert.ok(COLLISION_RULES.playerRadius >= .12, 'ainda tem corpo');
});

test('raios do cenário não passam do desenho medido (tronco ~0,57 m, bambu ~1,2 m, rocha ~1,8 m)', () => {
  const [tree, pine, bamboo, rock] = COLLISION_RULES.scenery;
  assert.ok(tree <= .3 && pine <= .3, `árvore ${tree}, pinheiro ${pine}`);
  assert.ok(bamboo <= .6 && rock <= .9, `bambu ${bamboo}, rocha ${rock}`);
});

test('passa entre duas árvores com 1 m de vão visível', () => {
  const solids = createSolids(), r = COLLISION_RULES.scenery[0];
  solids.add(-(.5 + r), 0, r); solids.add(.5 + r, 0, r);
  const p = { x: 0, z: -2 };
  for (let i = 0; i < 40; i++) { p.z += .1; solids.resolve(p); }
  assert.ok(p.z > 1.9 && Math.abs(p.x) < 1e-9, `parou em ${p.x.toFixed(2)},${p.z.toFixed(2)}`);
});

test('ao esbarrar só trava (desliza pela borda), não é arremessado', () => {
  const solids = createSolids(); solids.add(0, 0, 1);
  const p = { x: .3, z: -1.5 };
  for (let i = 0; i < 60; i++) { p.z += .1; solids.resolve(p); }
  assert.ok(p.z > 1.4 && Math.abs(p.x) < 1.5, `contornou a rocha: ${p.x.toFixed(2)},${p.z.toFixed(2)}`);
});

test('árvore/rocha escondida dentro ou colada numa construção é removida, com o sprite', () => {
  const solids = createSolids(), removed = [];
  const hidden = solids.add(1, 0, .3), near = solids.add(3.9, 0, .3), far = solids.add(10, 0, .3);
  solids.addBuilding(0, 0, 22);
  assert.equal(solids.prune(COLLISION_RULES.sceneryClearance, s => removed.push(s)), 2);
  assert.deepEqual(removed.sort((a, b) => a.x - b.x), [hidden, near]);
  assert.ok(solids.all.includes(far) && solids.all.some(s => s.big), 'mantém o resto e a construção');
});

test('o dash atravessa e sai pela frente, nunca de volta', () => {
  const solids = createSolids(); solids.addBuilding(0, 0, 22);
  const p = { x: .5, z: -.4 };
  assert.ok(solids.exitAlong(p, { x: 0, z: 1 }));
  assert.ok(p.z > 0 && Math.hypot(p.x, p.z) >= 3 + COLLISION_RULES.playerRadius - 1e-6, `saiu em ${p.x},${p.z.toFixed(2)}`);
  const outside = { x: 9, z: 9 };
  assert.equal(solids.exitAlong(outside, { x: 1, z: 0 }), false);
  assert.equal(solids.exitAlong({ x: 0, z: 0 }, { x: 0, z: 0 }), false, 'sem direção não mexe');
});

test('o jogo liga as regras: poda o cenário e o dash não colide', () => {
  assert.match(canvas, /solids\.prune\(COLLISION_RULES\.sceneryClearance,/);
  assert.match(canvas, /if\(slideTime<=0\)\{if\(dashing\)solids\.exitAlong\(player\.position,heading\);else solids\.resolve\(player\.position\);\}/);
  assert.match(canvas, /sceneryBySolid\.set\(solids\.add\(/);
});
