// Rodada 96: armadilha do ninja caído — +5% de inimigos na partida e 10 ninjas a 10 m em volta do jogador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FALLEN_TRAP, trapRing } from '../src/game/fallenTrap.ts';

test('10 ninjas num anel de 10 m em volta do jogador', () => {
  const ring = trapRing(5, -3);
  assert.equal(ring.length, 10);
  for (const p of ring) assert.ok(Math.abs(Math.hypot(p.x - 5, p.z + 3) - 10) < 1e-9, 'a 10 m');
  const angles = ring.map(p => Math.atan2(p.z + 3, p.x - 5)).sort((a, b) => a - b);
  for (let i = 1; i < angles.length; i++) assert.ok(Math.abs(angles[i] - angles[i - 1] - Math.PI / 5) < 1e-9, 'igualmente espaçados');
  assert.equal(trapRing(0, 0, 0).length, 0, 'sem vaga, ninguém');
});

test('a partida aplica a armadilha: +5% de inimigos e o anel', () => {
  assert.equal(FALLEN_TRAP.enemyCount, .05); assert.equal(FALLEN_TRAP.enemies, 10); assert.equal(FALLEN_TRAP.radius, 10);
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('runBuffs.enemyCount=(runBuffs.enemyCount??0)+FALLEN_TRAP.enemyCount;refreshStats();'), '+5% na partida toda');
  assert.ok(canvas.includes('const count=body?FALLEN_TRAP.enemies:cursedAmbushCount(MISSION_TIER[mission],zone);'), '10 ninjas sempre, mesmo com a horda no teto (25/11; shuriken também desde 27/11)');
  assert.ok(canvas.includes('const spot=ring[i]'), 'no anel em volta do jogador');
});

test('armadilha do corpo: 10 ninjas sempre, 1 elite, e vencer dá 1 item (25/11)', async () => {
  const { trapIsElite } = await import('../src/game/fallenTrap.ts');
  assert.equal(FALLEN_TRAP.elites, 1);
  assert.deepEqual(Array.from({ length: FALLEN_TRAP.enemies }, (_, i) => trapIsElite(i)).filter(Boolean).length, 1, 'exatamente 1 elite');
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(!canvas.includes('const count=Math.min(body?FALLEN_TRAP.enemies:'), 'o teto de vivos não zera mais a armadilha');
  assert.ok(canvas.includes('const elite=body&&trapIsElite(i);forceElite=elite;const enemy=spawnEnemy(!elite);forceElite=false;'), 'elite forçado');
  assert.ok(canvas.includes("activeBody=undefined;spawnPickup('sealDrop',defeatedAt.x,defeatedAt.z);"), 'vencer solta o pergaminho de 1 item');
  assert.ok(!canvas.includes("eventToast='Emboscada concluída: +1 nível.'"));
});

test('Shuriken Amaldiçoada e corpo: os ninjas sempre surgem, fora das casas e do corte de 1.600 (27/11/2026)', async () => {
  // Usuário: "Shurikens de enboscadas e shinobi no chão / armadilhas ainda estão dando os buffs/recompensa sem aparecer os ninjas a mais".
  const { CURSED_AMBUSH, cursedAmbushCount } = await import('../src/game/fallenTrap.ts');
  assert.deepEqual({ ...CURSED_AMBUSH }, { base: 4, perZone: 2 });
  assert.equal(cursedAmbushCount(1, 1), 4); assert.equal(cursedAmbushCount(4, 1), 8); assert.equal(cursedAmbushCount(4, 3), 12);
  assert.ok(cursedAmbushCount(0, 1) >= 1, 'nunca zero');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const start = canvas.indexOf('function startFieldAmbush('), body = canvas.slice(start, canvas.indexOf('function scatterPickups(', start));
  assert.ok(!/cap-enemyList.length/.test(body), 'a vaga até o teto não limita nenhuma armadilha');
  assert.ok(body.includes('enemy.fieldAmbush=true;if(body)enemy.bodyAmbush=pickup;'), 'shuriken e corpo marcam os ninjas');
  assert.ok(body.includes('solids.safeSpot(cx,cz)'), 'anel fora de casas e escadarias');
  assert.ok(canvas.includes('e.boss||e.clone||e.fieldAmbush)continue;'), 'o corte do teto de 1.600 poupa os ninjas da armadilha');
  assert.ok(canvas.includes("if(room>0)eventToast='Emboscada! Ninjas cercando a área.';"), 'emboscada comum sem vaga não avisa');
});
