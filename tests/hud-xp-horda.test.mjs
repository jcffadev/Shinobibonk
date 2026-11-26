// Nome inteiro no HUD, XP +10% a cada 100 níveis e menos monstros acumulando (26/11/2026). Sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { XP_CENTURY, xpCenturyScale, xpToLevelUp, HORDE_CAP_SCALE, difficultyAt, ENEMY_SCALING, MISSION_TIER } = await import('../src/game/progression.ts');

test('nome do personagem no HUD quebra em duas linhas em vez de ser cortado', () => {
  // "Os nomes dos personagens do lado superior esquerdo, não estão aparecendo as vezes, o HUD está minimizando o nome".
  const main = fs.readFileSync('src/main.tsx', 'utf8'), css = fs.readFileSync('src/ninja-theme.css', 'utf8');
  assert.match(main, /<b data-len=\{hero\.name\.length>18\?'long':undefined\}>🥷 \{hero\.name\}<\/b>/);
  assert.match(css, /\.game-shell \.game-level>b\{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere\}/);
  assert.match(css, /\.game-shell \.game-level>b\[data-len="long"\]\{font-size:12\.5px\}/);
});

test('XP pedido sobe 10% a cada 100 níveis, acumulando', () => {
  // "aumentar a tabela de XP a cada 100 levels para não estacar tanto exp assim, colocar cerca de 10% mais exp".
  assert.deepEqual(XP_CENTURY, { every: 100, growth: 1.1 });
  assert.equal(xpCenturyScale(99), 1); assert.equal(xpCenturyScale(100), 1.1);
  assert.ok(Math.abs(xpCenturyScale(250) - 1.21) < 1e-12);
  assert.equal(xpToLevelUp(1), 30);
  // Do Nv 99 para o 100 o salto inclui os +10%.
  assert.ok(xpToLevelUp(100) / xpToLevelUp(99) > 1.1);
});

test('20% menos monstros vivos fora do Final Swarm; teto do Final Swarm igual', () => {
  // "Diminuir um pouco o acumulo de monstros durante a partida esta nascendo monstros demais".
  assert.equal(HORDE_CAP_SCALE, .8);
  const S = ENEMY_SCALING, tier = MISSION_TIER.Genin;
  const raw = Math.floor((S.capBase + S.capLinear * 10 + S.capQuad * 100) * (.85 + tier * .15));
  assert.equal(difficultyAt('Genin', 600).cap, Math.floor(raw * .8));
  assert.equal(difficultyAt('Kage', 600 + 600, 1, 600).cap, 1600, 'Final Swarm continua chegando a 1.600');
});
