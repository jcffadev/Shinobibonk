// Lamens do fim da run (26/11/2026 — run de 76 min no Kage deu 56.031 Lamens; usuário: "no máximo uma RUN bem sucedida nesse
// porte deveria dar em torno de 2.9k lamens a 3.1k e uns quebradinhos"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { runLamens, LAMEN_RULES } = await import('../src/game/rewards.ts');
const { bijuuLamens, BIJUU_LAMENS } = await import('../src/game/bijuu.ts');
const { MISSION_TIER } = await import('../src/game/progression.ts');
const { damageLabel } = await import('../src/game/format.ts');

const bigRun = (mission, plans, extra = {}) => runLamens({ elapsed: 4608, kills: 5771351, level: 5897, zone: 3, victory: true,
  bijuuReward: bijuuLamens(MISSION_TIER[mission], plans), allies: ['a', 'b', 'c', 'd'], ...extra }, mission);

test('vitória completa no Kage rende entre 2,8 mil e 3,1 mil Lamens, com ou sem planos do Shikamaru', () => {
  assert.equal(bigRun('Kage', 9).total, 3038);
  assert.equal(bigRun('Kage', 0).total, 2884);
  for (const plans of [0, 3, 9]) { const t = bigRun('Kage', plans).total; assert.ok(t >= 2800 && t <= 3100, String(t)); }
});

test('toda parcela tem teto: nível (100), selados (4), tempo (30 min), abates (200) e zonas (+60)', () => {
  const r = bigRun('Kage', 0, { allies: Array(9).fill('x') });
  const by = Object.fromEntries(r.sources.map(s => [s.id, s.value]));
  assert.equal(by.level, LAMEN_RULES.levelCap * LAMEN_RULES.perLevel);
  assert.equal(by.level, 200);
  assert.equal(by.sealed, 80);
  assert.equal(by.time, 600);
  assert.equal(by.kills, 200);
  assert.equal(by.zone, 60);
  assert.equal(r.subtotal, 1240);
  // Abaixo do teto, cada nível ainda conta.
  const low = runLamens({ elapsed: 600, kills: 0, level: 41, zone: 1, victory: false, allies: [] }, 'Genin');
  assert.equal(low.sources.find(s => s.id === 'level').value, 80);
});

test('Bijū: 60 por dificuldade e no máximo 3 planos contados', () => {
  assert.equal(BIJUU_LAMENS.base, 60);
  assert.equal(bijuuLamens(MISSION_TIER.Kage, 0), 156);
  assert.equal(bijuuLamens(MISSION_TIER.Kage, 3), 310);
  assert.equal(bijuuLamens(MISSION_TIER.Kage, 9), bijuuLamens(MISSION_TIER.Kage, 3));
});

test('ficha final abrevia números grandes em K, M, B, T, Q (e mantém os Lamens exatos)', () => {
  assert.equal(damageLabel(299992695280712), '300T');
  assert.equal(damageLabel(5771351), '5.8M');
  const src = fs.readFileSync('src/ui/RunSummary.tsx', 'utf8');
  for (const field of ['world.totalDamage', 'world.kills', 'world.runMoney', 'world.allyDamage']) assert.match(src, new RegExp(`big\\(${field.replace('.', '\\.')}`));
  assert.match(src, /\+\{fmt\(reward\.total,0\)\} Lamens/);
});
