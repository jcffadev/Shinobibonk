// 27/11/2026 — usuário: "Naruto academia a ultimate dele tem que ser o vários clones das sombras... a skill inicial tem que ser o
// jutsu sexy lembra?"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HERO_BY_ID, isProjectileUltimate, ultimateBase } from '../src/game/heroes.ts';

test('Naruto Academia: Jutsu Sexy inicial e ultimate Tajū Kage Bunshin (vários clones)', () => {
  const naruto = HERO_BY_ID.naruto;
  assert.equal(naruto.techniques[0].name, 'Jutsu Sexy', 'técnica inicial');
  assert.equal(naruto.techniques[0].shape, 'Área');
  assert.equal(naruto.ultimate, 'Tajū Kage Bunshin');
  assert.equal(ultimateBase(naruto).name, 'Kage Bunshin', 'a ultimate sai dos Clones das Sombras');
  assert.equal(isProjectileUltimate('naruto'), true, 'vários clones disparados');
  assert.deepEqual(naruto.techniques.map(t => t.name), ['Jutsu Sexy', 'Kage Bunshin', 'Shuriken', 'Kunai Tática']);
  assert.equal(naruto.techniques[0].status, 'Atordoar', 'atordoa (statusProfiles.ts)');
  // "Habilidade inicial do Naruto inicial do naruto academia precisa de buff": poder 1,9 e 60% de atordoar (simulate-early: deixa de
  // ser o único inicial que não mata o comum de um golpe no 1º minuto).
  assert.equal(naruto.techniques[0].statusChance, .6);
  assert.ok(naruto.techniques[0].power > naruto.techniques[1].power, 'mais forte que a Kage Bunshin');
});
