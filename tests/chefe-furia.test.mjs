// Chefes inabaláveis e em fúria (26/11/2026 — "Os bosses não podem ser empurrados e entram em rage ao perder 30% do HP").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { BOSS_RAGE, bossRageDue, rageDefense, immovableBoss } = await import('../src/game/bossRage.ts');

test('fúria ao perder 30% da vida, uma vez só, com +25% de dano e mais armadura', () => {
  assert.equal(BOSS_RAGE.hpShare, .7);
  assert.equal(bossRageDue(71, 100), false);
  assert.equal(bossRageDue(70, 100), true);
  assert.equal(bossRageDue(40, 100), true);
  assert.equal(bossRageDue(40, 100, true), false);
  assert.equal(bossRageDue(0, 100), false);
  assert.equal(BOSS_RAGE.damage, .25);
  // Defesa 60% → 72%: fecha 30% do dano que ainda passava.
  assert.ok(Math.abs(rageDefense(.6) - .72) < 1e-9);
  assert.ok(rageDefense(.9) < 1);
});

test('Guardião, Bijū e Totem não são empurrados nem puxados; a horda continua sendo', () => {
  assert.equal(immovableBoss({ guardian: true }), true);
  assert.equal(immovableBoss({ bijuu: true, guardian: true }), true);
  assert.equal(immovableBoss({ totem: true }), true);
  assert.equal(immovableBoss({}), false);
  assert.equal(immovableBoss({ megaElite: true }), false);
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /if\(t\.gravity&&!immovableBoss\(enemy\)\)\{/);
  assert.match(src, /if\(status==='Empurrar'\)\{if\(!immovableBoss\(enemy\)\)\{/);
  assert.match(src, /t\.secondaryStatus==='Empurrar'&&!immovableBoss\(enemy\)/);
  assert.match(src, /else\{if\(enemy\.bijuu\)checkBijuuPhase\(enemy\);else if\(enemy\.guardian\)checkBossRage\(enemy\)/);
  assert.doesNotMatch(src, /guardian\?\.4:1/);
});
