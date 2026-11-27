// Pain e Nagato com o mesmo kit do Rinnegan; ultimate do Nagato = Kuchiyose: Pein Rikudō (26/11/2026 — "pain e nagato devem
// compartilhar todas as mesmas habilidades de rinnegan, a diferença que nagato terá invocação: Seis Caminhos de Pain").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { HERO_BY_ID } = await import('../src/game/heroes.ts');
const { PEIN_RIKUDO, RIKUDO_PATHS, rikudoDue, rikudoTotalPower } = await import('../src/game/peinRikudo.ts');
const KIT = ['Kunai Tática', 'Chibaku Tensei', 'Bansho Tenin', 'Barras de Chakra'];

test('Pain e Nagato têm o mesmo kit do Rinnegan, nos mesmos níveis', () => {
  for (const id of ['pain', 'nagato']) {
    const hero = HERO_BY_ID[id];
    assert.deepEqual(hero.techniques.map(t => t.name), KIT, id);
    assert.deepEqual(hero.techniques.map(t => t.unlockLevel), [1, 5, 12, 20], id);
    assert.equal(hero.techniques[1].gravity, 'core');
    assert.equal(hero.techniques[2].gravity, 'pull');
  }
  assert.equal(HERO_BY_ID.pain.ultimate, 'Shinra Tensei');
  assert.equal(HERO_BY_ID.nagato.ultimate, PEIN_RIKUDO.name);
});

test('Pein Rikudō: os seis caminhos agem em 10 s, com dano espalhado e um pouco acima da ultimate comum', () => {
  assert.equal(Object.keys(RIKUDO_PATHS).length, 6);
  const acting = new Set(PEIN_RIKUDO.events.map(e => e.path));
  for (const path of ['deva', 'asura', 'human', 'animal', 'naraka']) assert.ok(acting.has(path), path);
  assert.ok(PEIN_RIKUDO.pretaRadius > 0 && PEIN_RIKUDO.pretaHeal > 0); // Preta age o tempo todo (absorção)
  for (const e of PEIN_RIKUDO.events) assert.ok(e.at >= 0 && e.at < PEIN_RIKUDO.duration);
  const start = rikudoDue(-1e-6, 0).map(e => e.path).sort();
  assert.deepEqual(start, ['deva', 'naraka']);
  assert.equal(rikudoDue(-1e-6, PEIN_RIKUDO.duration).length, PEIN_RIKUDO.events.length);
  // Quadros pequenos não pulam nem repetem ações.
  let t = -1e-6, count = 0; while (t < PEIN_RIKUDO.duration) { const next = t + 1 / 60; count += rikudoDue(t, next).length; t = next; }
  assert.equal(count, PEIN_RIKUDO.events.length);
  const total = rikudoTotalPower();
  assert.ok(total > 6 && total < 8, String(total));
  const single = PEIN_RIKUDO.events.filter(e => e.path === 'asura' || e.path === 'human').reduce((s, e) => s + (e.power ?? 0), 0);
  assert.ok(single / total > .4 && single / total < .6);
});

test('o jogo chama os Seis Caminhos na ultimate do Nagato e não reinicia com eles em campo', () => {
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /if\(hero\.ultimate===PEIN_RIKUDO\.name\)\{rikudo=\{t:-1e-6\};updateRikudo\(0\);/);
  assert.match(src, /function castUltimate\(\)\{if\(chakra<100\|\|defeated\|\|pausedRef\.current\|\|choiceData\|\|sealing\|\|roulette\|\|rikudo\)return;/);
  assert.match(src, /hp=Math\.min\(stats\.maxHp,hp\+dt\*stats\.regen\);\r?\n\s*updateRikudo\(dt\);/);
});
