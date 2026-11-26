// Sorte na qualidade dos buffs de evento (26/11/2026 — "A qualidade dos buffs dos altares/npcs/hagoromo também são
// influenciados pela sorte. Não sei se hoje isso esta sendo considerado"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { luckQuality, skewedRoll } = await import('../src/game/luckQuality.ts');
const { rollHagoromoRarity, rollToolOffers, SAGE_TOOLS } = await import('../src/game/hagoromoTraining.ts');
const { rollEbisuDeals, rollIrukaLesson, NPC_RULES } = await import('../src/game/npcs.ts');
const { altarLuckMultiplier } = await import('../src/game/altarRewards.ts');

const seeded = (seed = 7) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const mean = (n, f) => { let s = 0; for (let i = 0; i < n; i++) s += f(); return s / n; };

test('régua da Sorte: 0 até Sorte 10, 1 em Sorte 70 (mesma faixa do altar)', () => {
  assert.equal(luckQuality(0), 0);
  assert.equal(luckQuality(10), 0);
  assert.equal(luckQuality(40), .5);
  assert.equal(luckQuality(70), 1);
  assert.equal(luckQuality(500), 1);
  assert.equal(altarLuckMultiplier(70), 2.2);
  const rng = seeded();
  for (let i = 0; i < 200; i++) { const v = skewedRoll(rng, 1); assert.ok(v >= 0 && v <= 1); }
  const r0 = seeded(3), r1 = seeded(3);
  assert.ok(Math.abs(mean(8000, () => skewedRoll(r0, 0)) - .5) < .02);
  assert.ok(Math.abs(mean(8000, () => skewedRoll(r1, 1)) - .75) < .02);
});

test('Hagoromo: mais Sorte, mais treinos e ferramentas de raridade alta', () => {
  const tier = r => ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'].indexOf(r);
  let a = seeded(11), b = seeded(11);
  const low = mean(5000, () => tier(rollHagoromoRarity(a, 0))), high = mean(5000, () => tier(rollHagoromoRarity(b, luckQuality(70))));
  assert.ok(high > low + .4, `${low} → ${high}`);
  a = seeded(5); b = seeded(5);
  const toolTier = (rng, q) => mean(1, () => rollToolOffers([], 'Raro', rng, 3, q).reduce((s, t) => s + tier(t.rarity), 0) / 3);
  assert.ok(mean(2000, () => toolTier(b, 1)) > mean(2000, () => toolTier(a, 0)));
  assert.ok(SAGE_TOOLS.length >= 3);
});

test('Ebisu e lição do Iruka: o ganho tende ao máximo com Sorte, sempre dentro da faixa', () => {
  const canLose = () => true;
  let a = seeded(21), b = seeded(21);
  const ebisu = (rng, q) => rollEbisuDeals(canLose, rng, q)[0].value;
  const e0 = mean(3000, () => ebisu(a, 0)), e1 = mean(3000, () => ebisu(b, 1));
  assert.ok(e1 > e0 + .02, `${e0} → ${e1}`);
  for (const d of rollEbisuDeals(canLose, seeded(2), 1)) {
    assert.ok(d.value >= NPC_RULES.ebisu.min && d.value <= NPC_RULES.ebisu.max);
    assert.equal(d.cost, Math.round(d.value * NPC_RULES.ebisu.costFactor * 1000) / 1000);
  }
  a = seeded(9); b = seeded(9);
  assert.ok(mean(3000, () => rollIrukaLesson(b, 1).value) > mean(3000, () => rollIrukaLesson(a, 0).value));
});

test('o jogo passa a Sorte do personagem para Hagoromo, Ebisu e Iruka', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /rollHagoromoRarity\(Math\.random,luckQuality\(stats\.luck\)\)/);
  assert.match(src, /rollToolOffers\(hagoromo\.tools,rarity,Math\.random,HAGOROMO\.offers,luckQuality\(stats\.luck\)\)/);
  assert.match(src, /rollEbisuDeals\(canLose,Math\.random,luckQuality\(stats\.luck\)\)/);
  assert.match(src, /rollIrukaLesson\(Math\.random,luckQuality\(stats\.luck\)\)/);
  assert.match(src, /buildAltarOffers\(tier,stats\.luck\)/);
});
