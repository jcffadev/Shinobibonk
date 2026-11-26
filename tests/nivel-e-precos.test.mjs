// Selo do nível no HUD e preços +20% por uso (26/11/2026). Lógica pura, sem navegador.
// "precisa na hud de level ficar o level certinho na bolinha vermelha" · "Vamos considerar 20% do valor de acréscimo na roleta da
// Tsunade e não colocar 15% por minuto, nem 25% por zona, sempre subirá 20%. O mesmo para kunais/pergaminhos".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { levelSealText } = await import('../src/game/format.ts');
const { rouletteCost, ROULETTE_RULES } = await import('../src/game/roulette.ts');
const { weaponPrice, WEAPON_PRICE } = await import('../src/game/preparation.ts');

test('selo do nível: número inteiro até 9.999, abreviado depois, e a fonte diminui com os dígitos', () => {
  assert.deepEqual(levelSealText(7), { text: '7', digits: 1 });
  assert.deepEqual(levelSealText(315), { text: '315', digits: 3 });
  assert.deepEqual(levelSealText(5897), { text: '5897', digits: 4 });
  assert.deepEqual(levelSealText(12345), { text: '12.3K', digits: 5 });
  assert.equal(levelSealText(0).text, '1');
  const main = fs.readFileSync('src/main.tsx', 'utf8'), css = fs.readFileSync('src/ninja-theme.css', 'utf8');
  assert.match(main, /className="level-seal" aria-hidden="true" data-digits=\{levelSealText\(world\.level\)\.digits\}>\{levelSealText\(world\.level\)\.text\}/);
  assert.match(css, /\.level-seal\[data-digits="3"\]\{font-size:13px\}/);
  assert.match(css, /\.level-seal\[data-digits="4"\],[^{]*\.level-seal\[data-digits="5"\]\{font-size:10px/);
});

test('roleta da Tsunade: sempre +20% por giro, sem inflação por minuto nem por zona', () => {
  assert.equal(ROULETTE_RULES.costGrowth, 1.2);
  assert.equal(ROULETTE_RULES.zoneCostWeight, undefined);
  assert.deepEqual([0, 1, 2, 3, 4].map(n => rouletteCost(n, 0)), [30, 36, 43, 52, 62]);
  assert.equal(rouletteCost(10, 0), Math.round(30 * 1.2 ** 10));
  assert.equal(rouletteCost(0, .9), 18, 'desconto continua limitado a 40%');
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /const slotPrice=\(\)=>rouletteCost\(rouletteSpins,ex\('slotDiscount'\)\);/);
});

test('kunai, shuriken e pergaminho pago: sempre +20% por abertura, sem inflação por minuto', () => {
  assert.equal(WEAPON_PRICE.growth, 1.2);
  assert.deepEqual([0, 1, 2, 3].map(n => weaponPrice(n)), [20, 24, 29, 35]);
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /const kunaiPrice=\(\)=>Math\.round\(weaponPrice\(paidWeapons\)\*/);
});
