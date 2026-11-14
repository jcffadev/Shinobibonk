// Eventos de clima (Rodada 63): Zabuza faz os selos à vista antes da Névoa Oculta — regras puras + ligação no jogo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { castProgress, blendFog, mistHides, isChanneling, CLEAR_FOG, CAST_DISTANCE } from '../src/game/weatherCast.ts';
import { WEATHER_EVENTS } from '../src/game/maps.ts';
import { handSealArt, EXTRA_SEAL_SHEETS } from '../src/game/directionalArt.ts';

const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
const mist = WEATHER_EVENTS.mist;

test('Névoa do Zabuza tem conjuração com fala e duração', () => {
  assert.deepEqual(mist.elites, ['zabuza']);
  assert.ok(mist.cast && mist.cast.seconds >= 1.5 && mist.cast.seconds <= 4, `duração ${mist.cast?.seconds}`);
  assert.match(mist.cast.line, /Kirigakure no Jutsu/);
});

test('progresso dos selos: 0 no início, 1 no fim, sempre subindo', () => {
  const s = mist.cast.seconds, end = 100;
  assert.ok(Math.abs(castProgress(end - s, end, s)) < 1e-12, "começa em 0");
  assert.equal(castProgress(end, end, s), 1);
  assert.equal(castProgress(end + 5, end, s), 1);
  assert.equal(castProgress(50, undefined, s), 1, 'sem conjuração = névoa cheia');
  let last = -1;
  for (let t = end - s; t <= end; t += .05) { const k = castProgress(t, end, s); assert.ok(k >= last - 1e-12 && k >= 0 && k <= 1); last = k; }
});

test('névoa engrossa aos poucos: começa aberta e termina na névoa do evento', () => {
  assert.deepEqual(blendFog(mist, 0), CLEAR_FOG);
  assert.deepEqual(blendFog(mist, 1), { near: mist.near, far: mist.far });
  const mid = blendFog(mist, .5);
  assert.ok(mid.far < CLEAR_FOG.far && mid.far > mist.far);
});

test('inimigos só somem na névoa depois dos selos', () => {
  const event = { id: 'mist', elite: 'zabuza', castEnd: 100 };
  assert.equal(mistHides(event, 99), false, 'durante os selos todo mundo continua visível');
  assert.equal(mistHides(event, 100), true);
  assert.equal(mistHides({ id: 'snow', elite: 'haku' }, 500), false, 'só a névoa esconde');
  assert.equal(mistHides(undefined, 10), false);
  assert.equal(mistHides({ id: 'mist', elite: 'zabuza' }, 0), true, 'save antigo sem conjuração: névoa direta');
});

test('Zabuza fica parado fazendo os selos (e só ele)', () => {
  const event = { id: 'mist', elite: 'zabuza', castEnd: 100 };
  assert.equal(isChanneling(event, 'zabuza', 99), true);
  assert.equal(isChanneling(event, 'zabuza', 100), false);
  assert.equal(isChanneling(event, 'haku', 99), false);
  assert.equal(isChanneling(undefined, 'zabuza', 0), false);
});

test('folha de selos do Zabuza: vazia até a arte existir; quando registrada, passa a ser usada', () => {
  assert.equal(handSealArt('zabuza', 1), undefined, 'sem arte: usa a pose de conjuração da folha de ação');
  assert.ok(handSealArt('naruto', 1), 'Naruto continua com a folha de selos');
  EXTRA_SEAL_SHEETS.zabuza = '/assets/shinobi-motion/zabuza-seal-v1.png';
  try { assert.deepEqual(handSealArt('zabuza', 1), { path: '/assets/shinobi-motion/zabuza-seal-v1.png', row: 0 }); }
  finally { delete EXTRA_SEAL_SHEETS.zabuza; }
});

test('GameCanvas: Zabuza surge à vista, faz selos, névoa engrossa e só depois esconde', () => {
  assert.ok(CAST_DISTANCE > 3 && CAST_DISTANCE < 12);
  assert.match(canvas, /if\(w\.cast\)\{const spot=solids\.freeSpot\(THREE\.MathUtils\.clamp\(player\.position\.x\+v1\.x\*CAST_DISTANCE/, 'aparece à frente do jogador, dentro da tela');
  assert.match(canvas, /castEnd:w\.cast\?elapsed\+w\.cast\.seconds:undefined/);
  assert.match(canvas, /eventToast=w\.cast\?w\.cast\.line:/, 'fala da técnica');
  assert.match(canvas, /const channeling=isChanneling\(weatherEvent,enemy\.heroId,elapsed\);const stunned=channeling\|\|/, 'parado durante os selos');
  assert.match(canvas, /if\(channeling&&motion\)\{[^}]*motion\.attack\(false,false,true,undefined,true\);/, 'repete os selos');
  assert.match(canvas, /blendFog\(active,castProgress\(elapsed,weatherEvent\?\.castEnd/, 'névoa engrossando');
  assert.ok(!/weatherEvent\?\.id==='mist'/.test(canvas), 'toda verificação de névoa passa por mistHides');
});
