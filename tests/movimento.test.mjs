// Orientação da caminhada (WASD × câmera): frente/costas e espelho com histerese, sem piscar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';

// playerMotion.ts cria canvas só quando monta um personagem; para a função pura basta um document mínimo.
globalThis.document ??= { createElement: () => ({ getContext: () => null, width: 0, height: 0 }) };
const M = await load('/src/scene/playerMotion.ts');
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
