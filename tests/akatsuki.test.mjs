import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { AKATSUKI_AMBUSH, AKATSUKI_MEMBERS, akatsukiAmbushHp, zetsuEmergence } from '../src/game/akatsukiAmbush.ts';
import { difficultyAt } from '../src/game/progression.ts';
import { trapRing } from '../src/game/fallenTrap.ts';

test('a emboscada usa todas as versões Akatsuki do elenco e escala pela ameaça da zona', () => {
  const expected = ['deidara','hidan','itachi-akatsuki','juzo','kakuzu','kisame','konan','nagato','orochimaru-akatsuki','pain','sasori','tobi-akatsuki','zetsu'];
  assert.deepEqual([...AKATSUKI_MEMBERS].sort(), expected);
  const genin = difficultyAt('Genin', 90, 1, 0);
  const kage = difficultyAt('Kage', 90, 1, 0);
  const swarm = difficultyAt('Kage', 780, 1.38, 180);
  assert.ok(akatsukiAmbushHp(genin.hp) < akatsukiAmbushHp(kage.hp));
  assert.ok(akatsukiAmbushHp(kage.hp) < akatsukiAmbushHp(swarm.hp));
});

test('Zetsu sobe gradualmente; os três pergaminhos ficam separados', () => {
  assert.equal(zetsuEmergence(0), 0);
  assert.equal(zetsuEmergence(AKATSUKI_AMBUSH.riseTime / 2), .5);
  assert.equal(zetsuEmergence(100), 1);
  assert.equal(AKATSUKI_AMBUSH.rewards, 3);
  const positions = trapRing(0, 0, AKATSUKI_AMBUSH.rewards, 2.8);
  assert.equal(new Set(positions.map(p => JSON.stringify(p))).size, 3);
  assert.ok(positions.every(p => Math.abs(Math.hypot(p.x,p.z) - 2.8) < 1e-9));
});

test('Zetsu inicia por clique ou E, e a última baixa solta os pergaminhos sem selamento', () => {
  const src = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.match(src, /npcRay\.intersectObject\(zetsuEvent\.obj,true\)\.length&&startAkatsukiAmbush\(\)/);
  assert.match(src, /if\(event===zetsuEvent\)\{startAkatsukiAmbush\(\);return;\}/);
  assert.match(src, /const hp=akatsukiAmbushHp\(threatNow\(\)\.hp\)/);
  assert.match(src, /if\(akatsukiEnemies\.delete\(enemy\)\)\{[\s\S]*?trapRing\(x,z,AKATSUKI_AMBUSH\.rewards,2\.8\)[\s\S]*?spawnPickup\('sealDrop'/);
  assert.match(src, /akatsukiAmbush:akatsukiEnemies\.size/);
  assert.match(src, /for\(const member of camp\.akatsukiAmbush\)/);
  assert.ok(fs.existsSync(new URL('../public/assets/icons/akatsuki-cloud.svg', import.meta.url)));
});

test('Zetsu visto de perto entra no mapa M/Tab, em qualquer ponto do mapa (25/11/2026)', async () => {
  const { zetsuSeen, AKATSUKI_AMBUSH } = await import('../src/game/akatsukiAmbush.ts');
  const r = AKATSUKI_AMBUSH.reveal;
  assert.equal(zetsuSeen(-14, 9 + r - .1, -14, 9), true, 'a menos de 7 m do Zetsu');
  assert.equal(zetsuSeen(-14, 0, -14, 30), false, 'longe dele, mesmo na linha z = 0');
  assert.equal(zetsuSeen(40, 52, 42, 50), true, 'longe do centro do mapa também conta');
  const src = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(src.includes('if(zetsuSeen(player.position.x,player.position.z,x,z))zetsuEvent.discovered=true;'));
  const map = (await import('node:fs')).readFileSync(new URL('../src/ui/MapOverlay.tsx', import.meta.url), 'utf8');
  assert.ok(map.includes("challenge: { glyph: 'akatsuki-cloud', tone: 'akatsuki' }"), 'ícone da Akatsuki no mapa');
});
