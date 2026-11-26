// Teto da cura por roubo de vida e por abate (26/11/2026 — "Sim, aplicar teto"): até 10% da vida máxima por segundo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { HEAL_CAP, refillHealBudget, spendHeal } = await import('../src/game/healCap.ts');

test('reserva enche 10% da vida por segundo, guarda no máximo 1 s e limita a cura', () => {
  assert.equal(HEAL_CAP.perSecond, .1);
  let budget = 0; const maxHp = 500;
  for (let i = 0; i < 60; i++) budget = refillHealBudget(budget, maxHp, 1 / 60);
  assert.ok(Math.abs(budget - 50) < 1e-9);
  assert.equal(refillHealBudget(50, maxHp, 10), 50, 'não acumula mais que 1 s');
  // Roubo de vida de bilhões cura só o que cabe na reserva.
  const spent = spendHeal(50, 3e9);
  assert.equal(spent.heal, 50); assert.equal(spent.budget, 0);
  assert.deepEqual(spendHeal(50, 20), { heal: 20, budget: 30 });
  assert.deepEqual(spendHeal(10, -5), { heal: 0, budget: 10 });
  // Em 10 s, no máximo 100% da vida máxima volta por roubo de vida.
  let total = 0; budget = 0;
  for (let i = 0; i < 600; i++) { budget = refillHealBudget(budget, maxHp, 1 / 60); const s = spendHeal(budget, 1e9); budget = s.budget; total += s.heal; }
  assert.ok(Math.abs(total - 500) < 1);
});

test('o jogo e o simulador passam o roubo de vida e a cura por abate pela reserva', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8'), sim = fs.readFileSync('scripts/simulate-run.mjs', 'utf8');
  assert.match(src, /if\(ex\('lifesteal'\)>0&&!defeated\)cappedHeal\(dealt\*ex\('lifesteal'\)\)/);
  assert.match(src, /Math\.random\(\)<ex\('killHeal'\)\)cappedHeal\(stats\.maxHp\*\.02\)/);
  assert.match(src, /healBudget=refillHealBudget\(healBudget,stats\.maxHp,dt\);/);
  assert.match(sim, /Math\.min\(stats\.maxHp \* HEAL_CAP\.perSecond, dealt \* ex\('lifesteal'\)/);
});
