// Guizos (26/11/2026 — "faça dropar os guisos · faça um de cada cor para cada efeito · Esses efeitos duram sempre 60 segundos ·
// Eles dropam por rng, sem considerar a sorte… drop fixo por monstros" → "vamos manter os guisos de imã sempre").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { GUIZOS, GUIZO_BY_ID, GUIZO_RULES, rollGuizo, guizoFromKind, guizoPickupKind, guizoToast, guizoDuration, guizoStacks } = await import('../src/game/guizos.ts');
// mulberry32: o LCG simples tem viés em chances pequenas como 1/2000.
const seeded = (seed = 7) => () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

test('seis guizos, um de cada cor, efeitos de 60 s', () => {
  assert.deepEqual(GUIZOS.map(g => g.name), ['Guizo de Ímã', 'Guizo de Dificuldade', 'Guizo de Isca', 'Guizo da Nevasca', 'Guizo do Raio', 'Guizo da Força da Juventude']);
  assert.equal(new Set(GUIZOS.map(g => g.color)).size, 6);
  assert.equal(GUIZO_RULES.duration, 60);
  assert.equal(GUIZO_BY_ID.juventude.bonuses.move, .6);
  assert.ok(GUIZO_BY_ID.dificuldade.bonuses.threat > 0 && GUIZO_BY_ID.isca.bonuses.enemyCount > 0);
  assert.equal(guizoToast('ima'), 'Coletou Guizo de Ímã: puxa todos os itens do mapa por 60 s');
  for (const g of GUIZOS) assert.equal(guizoFromKind(guizoPickupKind(g.id)), g.id);
  assert.equal(guizoFromKind('sealDrop'), undefined);
  assert.equal(guizoFromKind('guizo-nada'), undefined);
});

test('drop fixo por abate (sem Sorte), um de cada no máximo, Ímã sempre no sorteio', () => {
  assert.equal(rollGuizo.length, 1, 'só recebe os tipos ocupados (e o rng): a Sorte não entra');
  const rng = seeded(3), n = 400000, counts = {};
  let drops = 0;
  for (let i = 0; i < n; i++) { const g = rollGuizo(new Set(), rng); if (g) { drops++; counts[g] = (counts[g] ?? 0) + 1; } }
  assert.ok(Math.abs(drops / n - GUIZO_RULES.chancePerKill) < GUIZO_RULES.chancePerKill * .2, String(drops / n));
  assert.ok(counts.ima > 0 && Object.keys(counts).length === 6);
  // Tipos ocupados (no chão ou ativos) não caem de novo.
  const busy = new Set(['ima', 'dificuldade', 'isca', 'nevasca', 'raio']);
  for (let i = 0; i < 50; i++) { const g = rollGuizo(busy, () => 0); assert.equal(g, 'juventude'); }
  assert.equal(rollGuizo(new Set(GUIZOS.map(g => g.id)), () => 0), undefined);
});

test('o jogo solta, coleta ao pisar e aplica os efeitos (chefes fora da Nevasca e do Raio)', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /\{const guizo=rollGuizo\(guizoBusy\(\)\);if\(guizo\)spawnPickup\(guizoPickupKind\(guizo\),defeatedAt\.x,defeatedAt\.z\);\}/);
  assert.match(src, /const guizo=guizoFromKind\(pickup\.kind\);if\(guizo\)\{pickup\.active=false;scene\.remove\(pickup\.mesh\);activateGuizo\(guizo\);return true;\}/);
  assert.match(src, /if\(id==='ima'\)globalMagnetUntil=pickupClock\+guizoDuration\(id\);/);
  assert.match(src, /for\(const enemy of enemyList\)\{if\(immovableBoss\(enemy\)\)continue;/);
  assert.match(src, /updateRikudo\(dt\);updateGuizos\(\);/);
});

test('Raio paralisa por 20 s e guizo igual ativo não acumula (26/11/2026)', () => {
  // "60s de parilisia é muito tempo, coloque 20s e não pode stackar se pegar vários guizos do mesmo".
  assert.equal(guizoDuration('raio'), 20);
  for (const id of ['ima', 'dificuldade', 'isca', 'nevasca', 'juventude']) assert.equal(guizoDuration(id), 60);
  assert.equal(guizoToast('raio'), 'Coletou Guizo do Raio: todos os inimigos paralisados por 20 s');
  assert.equal(guizoStacks(true), false); assert.equal(guizoStacks(false), true);
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /if\(!guizoStacks\(guizoActive\(id\)\)\)\{eventToast=guizo\.name\+' já está ativo: o tempo não acumula\.';snapshotTimer=0;return;\}/);
  assert.match(src, /applyTimedBuff\(guizo\.name,guizo\.bonuses,guizoDuration\(id\)\);/);
});
