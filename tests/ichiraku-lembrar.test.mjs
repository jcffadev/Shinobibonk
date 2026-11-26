// Ichiraku · "Tente lembrar o planejado" (26/11/2026 — "Sera uma escolha de 1 a 3 habilidades aleatórias, porém o peso para
// habilidades planejadas será 50% a mais. Uma vez por zona"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { ICHIRAKU_RECALL, recallCardCount, rollRecall, recallBlocked } = await import('../src/game/ichirakuRecall.ts');
const seeded = (seed = 7) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const techs = ['A', 'B', 'C', 'D', 'E'].map(name => ({ name }));

test('lembrança mostra de 1 a 3 técnicas, sem repetir e sem passar do que existe', () => {
  const rng = seeded(3), seen = new Set();
  for (let i = 0; i < 600; i++) { const n = recallCardCount(rng); assert.ok(n >= 1 && n <= 3); seen.add(n); }
  assert.deepEqual([...seen].sort(), [1, 2, 3]);
  const r2 = seeded(5);
  for (let i = 0; i < 300; i++) {
    const picks = rollRecall(techs, ['A'], r2);
    assert.ok(picks.length >= 1 && picks.length <= 3);
    assert.equal(new Set(picks.map(p => p.name)).size, picks.length);
  }
  assert.equal(rollRecall(techs.slice(0, 1), [], seeded(1)).length, 1);
  assert.equal(rollRecall([], [], seeded(1)).length, 0);
});

test('técnica planejada tem 50% a mais de peso no sorteio', () => {
  assert.equal(ICHIRAKU_RECALL.plannedWeight, 1.5);
  // Conta só a 1ª carta: chance da planejada = 1,5 / (1,5 + 4) e de cada outra = 1 / 5,5.
  const rng = seeded(17), hits = { A: 0, B: 0 }, n = 30000;
  for (let i = 0; i < n; i++) { const first = rollRecall(techs, ['A'], rng)[0].name; if (first in hits) hits[first]++; }
  const ratio = hits.A / hits.B;
  assert.ok(ratio > 1.35 && ratio < 1.65, String(ratio));
});

test('só abre com espaço de técnica livre, com técnica nova disponível e uma vez por zona', () => {
  const ok = { learned: 2, maxSkills: 3, usedZone: 0, zone: 1, candidates: 4 };
  assert.equal(recallBlocked(ok), undefined);
  assert.match(recallBlocked({ ...ok, usedZone: 1 }), /nesta zona/);
  assert.equal(recallBlocked({ ...ok, usedZone: 1, zone: 2 }), undefined);
  assert.match(recallBlocked({ ...ok, learned: 3 }), /primárias/);
  assert.equal(recallBlocked({ ...ok, learned: 3, maxSkills: 4 }), undefined);
  assert.match(recallBlocked({ ...ok, candidates: 0 }), /Nenhuma/);
});

test('Ichiraku mostra a opção, aprende pela mesma regra do level-up e guarda a zona no save', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8'), main = fs.readFileSync('src/main.tsx', 'utf8');
  assert.match(src, /id:'ichiraku-recall',kind:'stat',name:'Tente lembrar o planejado'/);
  assert.match(src, /if\(offer\.id==='ichiraku-recall'\)\{openRecall\(\);return;\}/);
  assert.match(src, /rollRecall\(recallCandidates\(\),config\.planned\?\?\[\]\)/);
  assert.match(src, /if\(offer\.kind==='skill'\)learnSkillOffer\(offer\);/);
  assert.match(src, /learnSkillOffer\(offer\);recallZone=zone;/);
  assert.match(src, /campaign:\{openingMegaSpawned,ichirakuRecall:recallZone,/);
  assert.match(src, /recallZone=camp\?\.ichirakuRecall\?\?0;/);
  assert.match(main, /'Tente lembrar o planejado'/);
});
