// Pílulas e Mercador (26/11/2026). Lógica pura, sem navegador.
// "Temos 6 espaços, eu quero 5 no jogo e no hud" · "No mercador, quando não selecionarmos nenhum item, só aumentar o valor de
// roletar não dos itens disponíveis pra escolha, a % de aumento do preço dos itens, só aumentam considerando quantos itens eu
// comprei por pool. Hoje eles estão aumentando roletando mesmo sem comprar nada."
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { PILL_SLOTS, PILL_NAMES, canGrantPill, grantPill } = await import('../src/game/pills.ts');
const { merchantPrice, merchantRerollPrice, PRICE_GROWTH } = await import('../src/game/itemTrade.ts');

test('cinco tipos de pílula por run: o sexto não entra, os cinco continuam subindo de nível', () => {
  assert.equal(PILL_SLOTS, 5);
  const pills = {};
  for (const name of PILL_NAMES.slice(0, 5)) assert.ok(grantPill(pills, name));
  assert.equal(canGrantPill(pills, PILL_NAMES[5]), false);
  assert.ok(canGrantPill(pills, PILL_NAMES[0]));
  // HUD (espaços vazios) e ficha usam o mesmo limite.
  const main = fs.readFileSync('src/main.tsx', 'utf8'), sheet = fs.readFileSync('src/ui/RunSheet.tsx', 'utf8');
  assert.match(main, /Array\.from\(\{length:Math\.max\(0,PILL_SLOTS-Object\.keys\(world\.pills\)\.length\)\}/);
  assert.match(sheet, /\{Object\.keys\(world\.pills\)\.length\}\/\{PILL_SLOTS\} tipos/);
});

test('Mercador: roletar sobe só o preço da roletada; o preço dos itens sobe só com as compras', () => {
  assert.equal(PRICE_GROWTH.merchantStockReroll, undefined);
  // Mesmo minuto: o preço do item não depende de quantas vezes o estoque foi roletado.
  assert.equal(merchantPrice('Raro', 0, 30), 95);
  assert.equal(merchantPrice('Raro', 0, 30, 9), 95);
  // Cada compra encarece os próximos itens em 35%.
  assert.equal(merchantPrice('Raro', 1, 30), Math.round(95 * 1.35));
  assert.equal(merchantPrice('Raro', 2, 30), Math.round(95 * 1.35 ** 2));
  // A roletada continua ficando mais cara a cada uso.
  assert.ok(merchantRerollPrice(3, 0) > merchantRerollPrice(2, 0));
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /merchantPrice\(ITEM_BY_NAME\[name\]\.rarity,merchant\.purchases,elapsed\)/);
});
