import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroDamageScale, HERO_DAMAGE_CURVE, FINAL_SWARM } from '../src/game/progression.ts';
import { GROWTH_ROLLS } from '../src/game/combat.ts';
import { damageProbe, withCurve, CURVE_OPTIONS, summarizeDamage } from '../scripts/simulate-damage.mjs';

test('curva de dano por nível: parâmetros expostos sem mudar os valores (25/11)', () => {
  assert.deepEqual({ ...HERO_DAMAGE_CURVE }, { open: .74, openLevels: 14, perLevel: .04, cubicDivisor: 72, power: 3 });
  assert.equal(heroDamageScale(1), .74);
  for (const level of [2, 15, 50, 200, 1000]) {
    const l = level - 1, before = (.74 + .26 * Math.min(1, l / 14)) * (1 + l * .04) * (1 + l / 72) ** 3;
    assert.ok(Math.abs(heroDamageScale(level) - before) < 1e-9 * before, 'Nv. ' + level + ' igual à fórmula anterior');
  }
});

test('simulador de dano: partes do golpe multiplicam até o golpe inteiro e as opções não vazam para o jogo', () => {
  const marks = damageProbe({ heroId: 'naruto', mission: 'Genin', marks: [1, 5] });
  const at = marks[5]; assert.ok(at && at.full > 0 && at.normalHp > 0);
  const product = Object.values(at.parts).reduce((a, b) => a * b, 1);
  assert.ok(Math.abs(at.base * product - at.full) < 1e-6 * at.full, 'base × partes = golpe');
  assert.ok(at.parts.level > 1, 'o nível aumenta o golpe');
  const before = { curve: { ...HERO_DAMAGE_CURVE }, swarm: FINAL_SWARM.multiplier, affix: [...GROWTH_ROLLS.damage.base] };
  const inside = withCurve({ cubicDivisor: 150, affix: .5, swarm: 2 }, () => ({ div: HERO_DAMAGE_CURVE.cubicDivisor, swarm: FINAL_SWARM.multiplier, affix: GROWTH_ROLLS.damage.base[0] }));
  assert.deepEqual(inside, { div: 150, swarm: 2, affix: before.affix[0] * .5 });
  assert.deepEqual({ ...HERO_DAMAGE_CURVE }, before.curve); assert.equal(FINAL_SWARM.multiplier, before.swarm); assert.deepEqual(GROWTH_ROLLS.damage.base, before.affix);
  assert.ok(CURVE_OPTIONS.some(([name]) => name === 'afixos ½ + swarm ×2'));
  const low = withCurve({ cubicDivisor: 150 }, () => damageProbe({ heroId: 'naruto', mission: 'Genin', marks: [5] })[5]);
  assert.ok(low.full < at.full, 'curva mais lenta → golpe menor');
  assert.equal(summarizeDamage([{ marks }], [1, 5]).length, 2);
});

test('curva aplicada em 25/11: afixos de dano pela metade e Final Swarm entrando com ×2', () => {
  assert.deepEqual(GROWTH_ROLLS.damage, { base: [22.5, 40, 67.5, 112.5, 187.5], spread: [11, 15, 22.5, 35, 55] });
  assert.equal(FINAL_SWARM.multiplier, 2);
});
