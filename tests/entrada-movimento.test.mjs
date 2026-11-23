import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createMovementInput } from '../src/game/movementInput.ts';

test('movimento físico mantém diagonais, inversão por prioridade e remapeamento até soltar', () => {
  const input = createMovementInput();
  input.press('KeyW', 'w');
  input.press('KeyL', 'd');
  assert.deepEqual(input.axes(), { vertical: 1, horizontal: 1 });
  input.press('KeyS', 's');
  input.press('KeyW', 'w'); // auto-repeat do primeiro botão
  assert.deepEqual(input.axes(), { vertical: -1, horizontal: 1 });
  input.release('KeyS');
  input.press('ArrowUp', 'arrowup');
  input.release('KeyW');
  assert.deepEqual(input.axes(), { vertical: 1, horizontal: 1 });
  input.release('ArrowUp');
  assert.deepEqual(input.axes(), { vertical: 0, horizontal: 1 });
  input.clear();
  assert.deepEqual(input.axes(), { vertical: 0, horizontal: 0 });
});

test('progressão, escolhas e colisão conservam a entrada até keyup ou perda de foco', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.match(canvas, /movementInput\.press\(e\.code\|\|rawKey,key\);if\(document\.querySelector/);
  assert.match(canvas, /const onKeyUp=[^\n]+movementInput\.release\(e\.code\|\|raw\)/);
  assert.match(canvas, /const onBlur=\(\)=>\{keys\.clear\(\);movementInput\.clear\(\)/);
  assert.equal(canvas.match(/movementInput\.clear\(\)/g)?.length, 1);
  assert.match(canvas, /const \{vertical,horizontal\}=movementInput\.axes\(\)/);
  const movement=canvas.slice(canvas.indexOf('moving=dir.lengthSq()>0'),canvas.indexOf('// Rodada 93: Shinra Tensei — o Pain levita'));
  assert.match(movement, /if\(moving\)heading\.copy\(dir\)\.normalize\(\)/);
  assert.match(movement, /moveVillageActor\(player\.position,[^\n]+traversal,solids,standHeight,WORLD_LIMIT\)/);
  assert.match(movement, /else solids\.resolve\(player\.position\)/);
  assert.doesNotMatch(movement, /moving\s*=\s*false|movementInput\.clear/);
  assert.match(canvas, /const walking=moving&&!defeated/);
});

test('pool vazio treina uma vez e fecha a escolha também ao banir a última carta ou atualizar', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const handler = canvas.match(/function openLevelReward\(\)\{([\s\S]+?)\n    \}/)?.[1] ?? '';
  assert.match(handler, /choiceData=offers\.length\?offers:null/);
  assert.match(handler, /snapshotTimer=0/);
  assert.match(handler, /if\(choiceData\)\{keys\.clear\(\);return;\}[\s\S]+grantTraining\(\)/);
  assert.match(canvas, /choiceLevel=level;openLevelReward\(\)/);
  assert.equal(canvas.match(/else openLevelReward\(\)/g)?.length, 2, 'atualizar e banir usam o mesmo tratamento');
  assert.doesNotMatch(canvas, /choiceData=choiceLevel===0\?rollMegaLoot\(\):rollLevelOffers\(\)/);
});
