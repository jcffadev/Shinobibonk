// Selos de mão (pedido de 15/11; plano em docs/01; 25/11/2026 sem arte nova: pose que já existe + texto flutuante).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HAND_SEALS, CROSS_SEAL, SEAL_RULES, sealSequence, sealDue, sealLabel } from '../src/game/handSeals.ts';
import { HEROES } from '../src/game/heroes.ts';

const names = t => sealSequence(t).map(s => s.name);
const nin = name => ({ name, school: 'Ninjutsu' });

test('os 12 selos com o kanji do animal', () => {
  assert.equal(Object.keys(HAND_SEALS).length, 12);
  assert.equal(new Set(Object.values(HAND_SEALS).map(s => s.kanji)).size, 12);
  assert.equal(sealLabel(HAND_SEALS.tigre), '寅 Tigre');
});

test('sequências da obra, selo em cruz do Kage Bunshin e Taijutsu sem selo', () => {
  assert.deepEqual(names(nin('Katon: Grande Bola de Fogo')), ['Serpente', 'Carneiro', 'Macaco', 'Javali', 'Cavalo', 'Tigre']);
  assert.deepEqual(names(nin('Fênix de Fogo')), ['Rato', 'Tigre', 'Cachorro', 'Boi', 'Coelho', 'Tigre']);
  assert.deepEqual(names(nin('Chidori')), ['Boi', 'Coelho', 'Macaco']);
  assert.deepEqual(names(nin('Invocação do Sapo')), ['Javali', 'Cachorro', 'Pássaro', 'Macaco', 'Carneiro']);
  assert.deepEqual(names(nin('Parede de Terra')), ['Tigre', 'Coelho', 'Javali', 'Cachorro']);
  assert.deepEqual(sealSequence({ name: 'Kage Bunshin', school: 'Taijutsu' }), [CROSS_SEAL]);
  assert.deepEqual(sealSequence({ name: 'Shuriken', school: 'Taijutsu' }), []);
  assert.ok(sealSequence({ name: 'Rasengan Gigante', school: 'Taijutsu', ultimate: true }).length >= 2, 'Ultimate sempre tem selo');
});

test('as outras técnicas sorteiam 2 a 4 selos, sempre os mesmos', () => {
  for (const h of HEROES) for (const t of h.techniques) {
    if (t.school === 'Taijutsu') continue;
    const a = sealSequence(t), b = sealSequence(t);
    assert.deepEqual(a, b, t.name);
    assert.ok(a.length >= 1 && a.length <= 6, t.name);
  }
  const random = sealSequence(nin('Técnica qualquer'));
  assert.ok(random.length >= SEAL_RULES.minRandom && random.length <= SEAL_RULES.maxRandom);
});

test('no máximo a cada 2,5 s por personagem; Ultimate sempre; ligado no lançamento', () => {
  assert.equal(SEAL_RULES.interval, 2.5);
  assert.equal(sealDue(10, undefined), true);
  assert.equal(sealDue(11, 10), false);
  assert.equal(sealDue(12.5, 10), true);
  assert.equal(sealDue(10.1, 10, true), true);
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('if(!t.ultimate)showHandSeals(t,casterPosition,casterId);'));
  assert.ok(canvas.includes('playTechniqueSound(t,true,heroId);showHandSeals(t,player.position,heroId);'));
  assert.ok(canvas.includes('if(hiddenEffects||!sealDue(elapsed,lastSeal.get(casterId),t.ultimate))return;'));
});
