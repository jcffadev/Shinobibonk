// Rodada 93: Shinra Tensei do Pain — levitação e ondas de repulsão com atordoamento (lógica pura, sem navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SHINRA, advanceShinra, shinraDone, shinraLift, startShinra } from '../src/game/shinraTensei.ts';

test('o Pain levita durante a Ultimate e volta ao chão', () => {
  assert.equal(shinraLift(-.1), 0); assert.equal(shinraLift(SHINRA.seconds), 0);
  assert.ok(shinraLift(1) > SHINRA.lift * .9, 'no ar no meio da Ultimate');
  assert.ok(shinraLift(.1) < shinraLift(.5), 'sobe suave');
  assert.ok(shinraLift(SHINRA.seconds - .05) < shinraLift(SHINRA.seconds - .6), 'desce suave');
});

test('ondas repetidas: todas disparam, uma a cada intervalo, e terminam', () => {
  const s = startShinra(); let total = 0, frames = 0;
  while (!shinraDone(s) && frames < 1000) { total += advanceShinra(s, 1 / 60); frames++; }
  assert.equal(total, SHINRA.pulses);
  const slow = startShinra();
  assert.equal(advanceShinra(slow, 10), SHINRA.pulses, 'quadro longo não perde ondas');
  assert.ok(SHINRA.pulses >= 3 && SHINRA.stunSeconds >= 1 && SHINRA.pulsePower > 0, 'várias ondas que atordoam e ferem');
});

test('a partida liga a Ultimate do Pain: levita, ondas ferem, empurram e atordoam', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes("if(repulsion){shinra=startShinra();"), 'toda Ultimate do Pain inicia');
  assert.ok(canvas.includes('+jumpHeight+shinraHeight;'), 'levita');
  assert.ok(canvas.includes("enemy.control='Atordoar';enemy.controlTime=Math.max(enemy.controlTime||0,SHINRA.stunSeconds);"), 'atordoa');
  assert.ok(canvas.includes("repulsion=hero.ultimate==='Shinra Tensei'") && canvas.includes("gravity:'push' as const"), 'empurra (repulsão)');
});
