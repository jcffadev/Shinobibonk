// Cena (Three.js sem renderizar): corpo caído do Mega Elite, áreas das técnicas e ímã de drops.
// Three.js roda no Node; só o canvas 2D das texturas é simulado (installCanvasStub). Nenhum navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { load, installCanvasStub, memoryStorage } from './helpers/load.mjs';
import { magnetSpeed, GLOBAL_PULL_SECONDS } from '../src/game/drops.ts';

installCanvasStub();
globalThis.localStorage ??= memoryStorage();
const F = await load('/src/scene/fallenShinobi.ts');
const A = await load('/src/scene/techniqueAreas.ts');

const flat = () => 0;
function body(extra = {}) {
  const scene = new THREE.Scene();
  const b = F.createFallenBody({ scene, map: new THREE.Texture(), width: 1.2, height: 1.8, x: 5, z: 0, ground: flat, color: '#ff4d6d', right: new THREE.Vector3(1, 0, 0), awayFrom: new THREE.Vector3(0, 0, 0), ...extra });
  return { scene, b };
}
function run(b, seconds, hidden = false, step = 1 / 60) { for (let t = 0; t < seconds; t += step) b.update(step, hidden); }

test('Mega Elite caído: cambaleia → cai → assenta → fica deitado, nos tempos de FALLEN_TIMING', () => {
  const { b } = body(), T = F.FALLEN_TIMING;
  assert.equal(b.debug().phase, 'stagger');
  run(b, (T.stagger + T.fall) / 2); assert.equal(b.debug().phase, 'fall');
  run(b, T.settle - (T.stagger + T.fall) / 2 - .05); assert.equal(b.debug().phase, 'settle');
  run(b, .2); assert.equal(b.debug().phase, 'down');
  assert.ok(Math.abs(b.debug().angle - Math.PI / 2) < 1e-3, `deitado a 90°: ${b.debug().angle}`);
  run(b, 30); assert.equal(b.debug().phase, 'down', 'continua deitado até ser capturado');
});

test('luz do corpo caído: aparece ao chegar ao chão, pulsa suave e nunca estoura', () => {
  const { b } = body();
  assert.equal(b.debug().halo, 0, 'sem luz enquanto está em pé');
  run(b, F.FALLEN_TIMING.settle + .1);
  let min = 1, max = 0;
  for (let i = 0; i < 400; i++) { b.update(1 / 60, false); const h = b.debug().halo; min = Math.min(min, h); max = Math.max(max, h); }
  assert.ok(min >= .45, `sempre visível (mín ${min})`);
  assert.ok(max <= .75, `nada muito brilhoso (máx ${max})`);
  assert.ok(max - min > .05, 'pulsa');
});

test('luz no modo H (efeitos reduzidos): continua visível, fixa e sem facho', () => {
  const { b } = body();
  run(b, F.FALLEN_TIMING.settle + 1, true);
  assert.ok(b.debug().halo >= .4, `halo mínimo com H: ${b.debug().halo}`);
  assert.equal(b.debug().beam, 0);
});

test('corpo cai para longe do jogador e fica dentro do alcance de captura (10 m)', () => {
  const { b } = body();
  assert.ok(b.position.x > 5, 'jogador à esquerda → cai para a direita');
  assert.ok(Math.hypot(b.position.x, b.position.z) <= 10, 'continua alcançável');
  const left = body({ x: -5, awayFrom: new THREE.Vector3(0, 0, 0) }).b;
  assert.ok(left.position.x < -5, 'jogador à direita → cai para a esquerda');
});

test('save restaurado (instant): já aparece deitado no ponto salvo', () => {
  const { b } = body({ instant: true, x: 3, z: 4 });
  run(b, F.FALLEN_TIMING.settle + .1);
  assert.equal(b.debug().phase, 'down');
  assert.deepEqual([b.position.x, b.position.z], [3, 4]);
});

test('dispose remove tudo da cena', () => {
  const { scene, b } = body();
  assert.ok(scene.children.length > 0);
  b.dispose();
  assert.equal(scene.children.length, 0);
});

test('áreas das técnicas: o cone desenhado usa o MESMO ângulo do acerto (CONE_COS)', async () => {
  const fs = await import('node:fs');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(/dot\(direction\)>CONE_COS/.test(canvas), 'acerto do Cone lê CONE_COS');
  assert.ok(!/dot\(direction\)>\.65/.test(canvas), 'sem número solto duplicado');
  assert.equal(A.CONE_COS, .65);
});

test('áreas das técnicas: marca, expira no tempo certo e reaproveita fatias (sem alocar)', () => {
  const scene = new THREE.Scene(), areas = A.createTechniqueAreas(scene, flat);
  const tech = s => ({ name: 'T', shape: s, element: 'Fogo', school: 'Ninjutsu', color: '#f00', power: 1, range: 4, cooldown: 1, statusChance: 0, unlockLevel: 1 });
  const v = (x, z) => new THREE.Vector3(x, 0, z);
  const geometry = scene.children[0]?.geometry, vertices = geometry?.attributes.position.count;
  for (const shape of ['Área', 'Cone', 'Linha', 'Órbita', 'Corpo a corpo']) areas.mark(tech(shape), v(0, 0), v(1, 0), v(2, 0), 2, 4, .6);
  assert.equal(areas.stats().active, 5);
  areas.update(.3); assert.equal(areas.stats().active, 5, 'ainda visíveis em 0,3 s');
  areas.update(.2); assert.equal(areas.stats().active, 0, 'somem depois de ~0,42 s');
  for (let i = 0; i < 500; i++) areas.mark(tech('Área'), v(0, 0), v(1, 0), v(0, 0), 1, 1, 0);
  assert.ok(areas.stats().active <= areas.stats().slots, `no máximo ${areas.stats().slots} ao mesmo tempo`);
  if (geometry) assert.equal(geometry.attributes.position.count, vertices, 'a geometria não cresce');
  areas.dispose();
  assert.equal(scene.children.length, 0);
});

test('ímã do morro: drop de qualquer distância chega em ≤ 1,2 s; ímã normal não é afetado', () => {
  assert.equal(GLOBAL_PULL_SECONDS, 1.2);
  for (const distance of [1, 10, 70, 160]) {
    // Simula o voo como o jogo faz: acelera e anda min(dist, speed·dt) por quadro.
    let d = distance, speed = 3.6, t = 0; const dt = 1 / 60;
    while (d > 0 && t < 5) { speed += 30 * dt; speed = magnetSpeed(speed, d, true); d -= Math.min(d, speed * dt); t += dt; }
    assert.ok(t <= GLOBAL_PULL_SECONDS + dt, `${distance} m em ${t.toFixed(2)} s`);
  }
  assert.equal(magnetSpeed(4, 100, false), 4, 'sem ímã global, a velocidade é a do ímã normal');
});
