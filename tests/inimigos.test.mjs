// Desenho dos inimigos em lote (src/scene/enemyRenderer.ts) — Rodada 62, bug da névoa do Zabuza: inimigos nascidos
// durante a névoa ficavam na cena como quadrados brancos (sprite sem textura fora do lote). Three.js no Node, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { load, installCanvasStub, memoryStorage } from './helpers/load.mjs';

installCanvasStub();
globalThis.localStorage ??= memoryStorage();
const E = await load('/src/scene/enemyRenderer.ts');

function rig() {
  const scene = new THREE.Scene(), renderer = E.createEnemyRenderer(scene);
  const spawn = (x = 0) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial()); renderer.adopt(sp, 0); sp.position.set(x, 1, 0); scene.add(sp); return { sprite: sp }; };
  return { scene, renderer, spawn };
}

test('inimigo em lote nunca é desenhado sozinho (sem quadrado branco), mesmo fora do sync', () => {
  const { renderer, spawn } = rig();
  const enemy = spawn();
  assert.equal(renderer.isBatched(enemy.sprite), true);
  assert.equal(enemy.sprite.material.visible, false, 'material próprio invisível: quem desenha é o lote');
});

test('névoa: sincronizar só o Mega Elite não desenha os comuns, e eles continuam invisíveis', () => {
  const { renderer, spawn, scene } = rig();
  const commons = [spawn(1), spawn(2), spawn(3)];
  renderer.sync([]);                                     // névoa: lote vazio (comuns escondidos)
  assert.equal(renderer.stats().bodies, 0);
  for (const c of commons) assert.ok(!c.sprite.parent || c.sprite.material.visible === false, 'nenhum sprite branco visível na cena');
  const late = spawn(4);                                 // nasce durante a névoa
  renderer.sync([]);
  assert.equal(late.sprite.material.visible, false);
  assert.ok(scene.children.every(o => !(o instanceof THREE.Sprite) || o.material.visible === false), 'nenhum sprite de inimigo visível fora do lote');
});

test('fora da névoa o lote desenha todos e tira os sprites da cena', () => {
  const { renderer, spawn } = rig();
  const enemies = [spawn(1), spawn(2)];
  renderer.sync(enemies);
  assert.equal(renderer.stats().bodies, 2);
  for (const e of enemies) assert.equal(e.sprite.parent, null);
});

test('GameCanvas: os inimigos comuns são criados pelo lote (makeSprite → adopt)', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.match(canvas, /const makeSprite=\(index:number,w=1\.8,h=2\.2\)=>\{const sp=new THREE\.Sprite\(new THREE\.SpriteMaterial\(\)\);enemyRenderer\.adopt\(sp,index\);/);
});
