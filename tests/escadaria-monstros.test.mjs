// 27/11/2026 — usuário: "monstros ainda conseguindo passaar dentro dessa escadaria... não deve ser possivel eles entrarem dentro
// dela, só passar por cima ou do lado". Os degraus agora valem para os monstros: sobem um degrau por vez ou contornam.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';

const { COLLISION_RULES, createSolids } = await load('/src/scene/collision.ts');

/** Escada de 5 degraus de 0,2 m subindo para +z, 4 m de largura (x de −2 a 2), cada degrau com 1 m de fundo. */
function stairs() {
  const solids = createSolids();
  for (let i = 0; i < 5; i++) solids.addStair(0, i + .5, 2, .5, .2 * (i + 1));
  return solids;
}

test('monstro no chão não entra pela lateral da escada (degrau alto vira parede)', () => {
  const solids = stairs(), p = { x: 2 + COLLISION_RULES.enemyRadius - .1, z: 3.5 }; // encostando na lateral do 4º degrau (topo 0,8 m), pés no chão
  assert.equal(solids.resolveStairs(p, 0), true, 'empurrado para fora');
  assert.ok(p.x >= 2 + COLLISION_RULES.enemyRadius - 1e-6, 'fica do lado de fora da parede');
  const deep = { x: 0, z: 3.5 }; solids.resolveStairs(deep, 0);
  assert.equal(solids.resolveStairs(deep, 0), false, 'quem estava dentro sai para um degrau alcançável ou para fora');
});

test('monstro sobe pelos degraus, um de cada vez, e desce sem travar', () => {
  const solids = stairs();
  let foot = 0;
  for (let i = 0; i < 5; i++) {
    const p = { x: 0, z: i + .5 };
    assert.equal(solids.resolveStairs(p, foot), false, `degrau ${i + 1} não bloqueia quem vem do anterior`);
    foot = Math.max(foot, solids.enemyStairTop(p.x, p.z, foot));
    assert.ok(Math.abs(foot - .2 * (i + 1)) < 1e-9, `pés no degrau ${i + 1}`);
  }
  assert.equal(solids.resolveStairs({ x: 0, z: .5 }, 1), false, 'do alto, os degraus de baixo não bloqueiam');
  assert.equal(solids.enemyStairTop(0, 3.5, 0), -Infinity, 'do chão não pula para o 4º degrau');
  assert.ok(COLLISION_RULES.enemyStepUp >= .2 && COLLISION_RULES.enemyStepUp < .4, 'sobe um degrau de 0,2 m, não dois');
});

test('a partida aplica os degraus aos monstros', () => {
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.ok(canvas.includes('solids.resolveStairs(p,p.y-enemy.sprite.scale.y*.46);'), 'degrau alto bloqueia');
  assert.ok(canvas.includes('ep.y=Math.max(standHeight(ep.x,ep.z),activeInstance||arena?-Infinity:solids.enemyStairTop(ep.x,ep.z,foot))'), 'altura segue o degrau');
});
