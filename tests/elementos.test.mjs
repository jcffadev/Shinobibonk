import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HERO_BY_ID, HEROES, heroAffinity } from '../src/game/heroes.ts';
import { ELEMENT_KEY, elementMultiplier, techniqueHitDamage, NO_GROWTH } from '../src/game/combat.ts';
import { ITEM_BY_NAME } from '../src/game/catalog.ts';
import { calculateStats } from '../src/game/progression.ts';
import { mergedTechnique } from '../src/game/techniqueMerge.ts';

const canvas = readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
const close = (a, b) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);
const buffs = (...names) => calculateStats('auditoria', 1, Object.fromEntries(names.map(n => [n, 1])));
const base = { ...HEROES[0].techniques[0], name: 'Teste', school: 'Ninjutsu', power: 1, secondaryElement: undefined };

test('Gelo (Hyōton) é elemento próprio: Haku, Pergaminho Hyoton e fusão Água + Vento (25/11)', () => {
  assert.equal(ELEMENT_KEY.Gelo, 'elGelo');
  const haku = HERO_BY_ID.haku;
  for (const name of ['Senbon de Gelo', 'Espelhos Demoníacos de Gelo']) {
    const t = haku.techniques.find(x => x.name === name);
    assert.equal(t.element, 'Gelo'); assert.equal(t.secondaryElement, undefined); assert.equal(t.status, 'Congelar');
  }
  assert.equal(heroAffinity('haku'), 'Gelo');
  assert.equal(ITEM_BY_NAME['Pergaminho Hyoton'].bonuses.elGelo, .28);
  const ice = { ...base, element: 'Gelo' };
  close(techniqueHitDamage(ice, NO_GROWTH, buffs('Pergaminho Hyoton')), techniqueHitDamage(ice, NO_GROWTH, buffs()) * 1.28);
  const pool = [{ ...base, name: 'A', element: 'Água' }, { ...base, name: 'B', element: 'Vento' }];
  const fused = mergedTechnique({ kind: 'fuse', names: ['A', 'B'] }, pool);
  assert.equal(fused.element, 'Gelo'); assert.equal(fused.secondaryElement, undefined);
});

test('queimadura, explosão da Katon, estilhaços e ajudantes usam o bônus do elemento (25/11)', () => {
  const fire = { ...base, element: 'Fogo' }, katon = buffs('Pergaminho Katon'), plain = buffs();
  close(techniqueHitDamage(fire, NO_GROWTH, katon, { ally: true }), techniqueHitDamage(fire, NO_GROWTH, plain, { ally: true }) * 1.28 * 1.03);
  close(elementMultiplier(katon.extra, 'Fogo'), 1.28); close(elementMultiplier({}, 'Gelo'), 1);
  assert.ok(canvas.includes("takeDamage(enemy,stats.damage*.15*dt*(1+ex('statusDamage'))*elementMultiplier(stats.extra,'Fogo'),"));
  assert.ok(canvas.includes("D.fireDamage*(1+ex('statusDamage'))*elementMultiplier(stats.extra,'Fogo'):D.iceDamage*elementMultiplier(stats.extra,'Gelo')"));
});
