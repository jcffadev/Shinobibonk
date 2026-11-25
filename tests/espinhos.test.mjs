import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { thornsDamage } from '../src/game/combat.ts';
import { ITEM_BY_NAME } from '../src/game/catalog.ts';
import { calculateStats } from '../src/game/progression.ts';

const canvas = readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('Espinhos = armadura × dano do personagem e crescem com a partida (25/11)', () => {
  assert.equal(ITEM_BY_NAME['Armadura de Espinhos'].bonuses.thorns, 1);
  assert.equal(ITEM_BY_NAME['Armadura Samurai'].bonuses.thorns, 1.5);
  assert.equal(thornsDamage(1, 10, 50), 500);
  assert.equal(thornsDamage(1.5, -3, 50), 0, 'armadura negativa não cura o inimigo');
  const at = level => { const s = calculateStats('naruto', level, { 'Armadura de Espinhos': 1 }); return thornsDamage(s.extra.thorns, s.armor, s.damage); };
  assert.ok(at(1) >= 15 && at(1) <= 40, 'nível 1 perto do valor fixo antigo (25): ' + at(1));
  assert.ok(at(100) > at(1) * 100, 'acompanha o nível');
  const withDamage = calculateStats('naruto', 30, { 'Armadura de Espinhos': 1, 'Selo Amaldiçoado': 1 }), plain = calculateStats('naruto', 30, { 'Armadura de Espinhos': 1 });
  assert.ok(thornsDamage(1, withDamage.armor, withDamage.damage) > thornsDamage(1, plain.armor, plain.damage), 'dano% aumenta os Espinhos');
  assert.ok(canvas.includes("takeDamage(attacker,thornsDamage(ex('thorns'),stats.armor,stats.damage)*damageMultiplier*tune().playerDamage,"));
});
