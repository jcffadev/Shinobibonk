// Orientação da caminhada (WASD × câmera): frente/costas e espelho com histerese, sem piscar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { decodePng, cellShape } from '../scripts/audit-walk-sheets.mjs';
import { load } from './helpers/load.mjs';

// O teste lê os PNGs direto do disco. O canvas de proporção do sprite é dispensável.
globalThis.document ??= { createElement: () => ({ getContext: () => null, width: 0, height: 0 }) };
const M = await load('/src/scene/playerMotion.ts');
const { HEROES, portraitRegion } = await load('/scripts/motion-review-entry.ts');

const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

// vertical > 0 = afastando da câmera (subindo na tela); horizontal < 0 = indo para a esquerda da tela.
const dirs = { W: [1, 0], S: [-1, 0], A: [0, -1], D: [0, 1], WD: [.707, .707], WA: [.707, -.707], SD: [-.707, .707], SA: [-.707, -.707] };

test('as 8 direções escolhem a fileira e o espelho certos', () => {
  const expected = { W: [true, false], S: [false, false], A: [false, true], D: [false, false], WD: [true, false], WA: [true, true], SD: [false, false], SA: [false, true] };
  for (const [name, [v, h]] of Object.entries(dirs)) {
    const memory = {};
    const f = M.stableFacing(memory, v, h);
    assert.deepEqual([f.back, f.left], expected[name], name);
  }
});

test('diagonais são marcadas como diagonal; retas não', () => {
  for (const [name, [v, h]] of Object.entries(dirs)) {
    const f = M.stableFacing({}, v, h);
    assert.equal(f.diagonal, name.length === 2, name);
  }
});

test('ruído perto da linha lateral não faz piscar frente/costas (histerese)', () => {
  const memory = {};
  M.stableFacing(memory, 1, 0); // andando para cima → costas
  for (const v of [.2, .15, .22, .12, .25]) assert.equal(M.stableFacing(memory, v, .98).back, true, `v=${v}`);
  assert.equal(M.stableFacing(memory, .05, .99).back, false, 'só troca abaixo de 0,1');
});

test('ruído lateral pequeno não espelha o sprite', () => {
  const memory = {};
  M.stableFacing(memory, 0, -1); // esquerda
  for (const h of [-.05, .05, .08, -.02]) assert.equal(M.stableFacing(memory, 1, h).left, true, `h=${h}`);
  assert.equal(M.stableFacing(memory, 0, .5).left, false);
});

test('ajudantes, clones, Kuri e monstros usam a orientação com histerese', () => {
  const uses = canvas.match(/stableFacing\(/g)?.length ?? 0;
  assert.ok(uses >= 4, `stableFacing usado ${uses} vezes no GameCanvas`);
  assert.ok(!/movementFacing\(dir\.dot\(v1\)/.test(canvas), 'não sobra orientação sem histerese');
});

test('WASD e o vetor do dash selecionam a mesma orientação nas oito direções', () => {
  for (const [keys, [vertical, horizontal]] of Object.entries(dirs)) {
    const length = Math.hypot(vertical, horizontal);
    const facing = M.movementFacing(vertical, horizontal);
    assert.deepEqual(facing, {
      back: keys.includes('W'),
      left: keys.includes('A'),
      diagonal: keys.length === 2,
    }, keys);
    assert.deepEqual(M.movementFacing(vertical / length, horizontal / length), facing, keys);
  }
  assert.deepEqual(M.movementFacing(0, -.00001), { back: false, left: false, diagonal: false });
  assert.match(canvas, /movementFacing\(facing\.dot\(v1\),facing\.dot\(v2\)\)/);
});

test('inimigos apontam no mesmo vetor usado para caminhar e dar dash', () => {
  assert.match(canvas, /stableFacing\(sprite\.userData,enemyTravel\.dot\(v1\),enemyTravel\.dot\(v2\)\)/);
  assert.match(canvas, /enemy\.sprite\.position\.addScaledVector\(enemyTravel,enemy\.speed/);
});

test('as 114 versões selecionam quadros não vazios para movimento e dash nas oito direções', (t) => {
  const images = new Map();
  const cells = new Map();
  const getImage = (path) => {
    if (!images.has(path)) images.set(path, decodePng('public' + path));
    return images.get(path);
  };
  t.mock.method(THREE.TextureLoader.prototype, 'load', (path) => {
    const { width, height } = getImage(path);
    return new THREE.Texture({ width, height, path });
  });
  const inspect = (map, label) => {
    const { path, width, height } = map.image;
    const left = Math.round((map.offset.x + Math.min(0, map.repeat.x)) * width);
    const top = Math.round((1 - map.offset.y - map.repeat.y) * height);
    const w = Math.round((map.offset.x + Math.max(0, map.repeat.x)) * width) - left;
    const h = Math.round((1 - map.offset.y) * height) - top;
    assert.ok(left >= 0 && top >= 0 && left + w <= width && top + h <= height, label);
    const cell = JSON.stringify([path, left, top, w, h]);
    if (!cells.has(cell)) cells.set(cell, !cellShape(getImage(path), left, top, w, h).empty);
    assert.ok(cells.get(cell), label);
    return { cell, row: map.offset.y };
  };
  assert.ok(HEROES.length >= 114);
  const scene = new THREE.Scene();
  const missingRearDash = [];
  const dashFrameCounts = {};
  const jumpFrameCounts = {};
  for (const hero of HEROES) {
    const portrait = portraitRegion(hero.id);
    const idle = new THREE.TextureLoader().load(portrait.path);
    idle.repeat.set(1 / portrait.cols, 1 / portrait.rows);
    idle.offset.set(portrait.index % portrait.cols / portrait.cols, 1 - (1 + Math.floor(portrait.index / portrait.cols)) / portrait.rows);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: idle }));
    const motion = M.createPlayerMotion(scene, sprite, hero.id, false);
    const walks = {}, dashes = {}, jumps = {};
    for (const [keys, [vertical, horizontal]] of Object.entries(dirs)) {
      const { back, left, diagonal } = M.movementFacing(vertical, horizontal);
      walks[keys] = [];
      const update = (dt, walking, jump, sliding, progress) => {
        motion.update(dt, 0, 1, 1, walking, back, left, 1, jump, sliding, diagonal, progress, progress);
      };
      for (let i = 0; i < 6; i++) {
        update(.08, true, 0, false, 0);
        const map = sprite.material.map;
        assert.equal(map.repeat.x < 0, left, hero.id + ' caminhada ' + keys);
        walks[keys].push(inspect(map, hero.id + ' caminhada ' + keys));
      }
      assert.equal(new Set(walks[keys].map((sample) => sample.cell)).size, 4, hero.id + ' ciclo ' + keys);
      dashes[keys] = [.1, .35, .6, .85].map((progress) => {
        update(.05, false, 0, true, progress);
        assert.equal(sprite.material.map.repeat.x < 0, left, hero.id + ' dash ' + keys);
        return inspect(sprite.material.map, hero.id + ' dash ' + keys);
      });
      jumps[keys] = [.1, .35, .6, .85].map((progress) => {
        update(.05, false, 1, false, progress);
        assert.equal(sprite.material.map.repeat.x < 0, left, hero.id + ' pulo ' + keys);
        return inspect(sprite.material.map, hero.id + ' pulo ' + keys);
      });
      motion.attack(false, left, true, hero.family === 'lee' ? 'kick' : undefined, false, back);
      update(.2, false, 0, false, 0);
      inspect(sprite.material.map, hero.id + ' ataque ' + keys);
      update(.6, false, 0, false, 0);
    }
    assert.notEqual(walks.W[0].row, walks.S[0].row, hero.id + ' frente e costas');
    for (const keys of ['WD', 'WA']) assert.equal(walks[keys][0].row, walks.W[0].row, hero.id + ' caminhada ' + keys);
    for (const keys of ['A', 'D', 'SD', 'SA']) assert.equal(walks[keys][0].row, walks.S[0].row, hero.id + ' caminhada ' + keys);
    for (const keys of ['WD', 'WA']) assert.equal(dashes[keys][0].row, dashes.W[0].row, hero.id + ' dash ' + keys);
    for (const keys of ['A', 'D', 'SD', 'SA']) assert.equal(dashes[keys][0].row, dashes.S[0].row, hero.id + ' dash ' + keys);
    const jumpFrames = new Set(jumps.S.map((sample) => sample.cell)).size;
    jumpFrameCounts[jumpFrames] = (jumpFrameCounts[jumpFrames] ?? 0) + 1;
    const dashFrames = new Set(dashes.S.map((sample) => sample.cell)).size;
    dashFrameCounts[dashFrames] = (dashFrameCounts[dashFrames] ?? 0) + 1;
    if (dashes.W.every((sample, i) => sample.cell === dashes.S[i].cell)) missingRearDash.push(hero.id);
    motion.dispose();
    idle.dispose();
    sprite.material.dispose();
  }
  t.diagnostic('Quadros distintos de pulo por quantidade de versões: ' + JSON.stringify(jumpFrameCounts));
  t.diagnostic('Quadros distintos de dash por quantidade de versões: ' + JSON.stringify(dashFrameCounts));
  t.diagnostic('Dash dianteiro e traseiro usam as mesmas células em ' + missingRearDash.length + ' versões.');
});
