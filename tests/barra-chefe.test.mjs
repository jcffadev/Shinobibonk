// Barras de vida dos chefes e Mega Elites (26/11/2026 — "Ao nascer um elite a vida dele precisa ter a barrinha de hp aparecendo
// abaixo de onde mostra as informações do mapa centralizado um pouco mais acima do centro… hoje… está em números o hp").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('barra sem números, centralizada um pouco acima do meio, até 3 (chefes primeiro)', () => {
  const ui = fs.readFileSync('src/ui/BossBars.tsx', 'utf8'), css = fs.readFileSync('src/boss-bars.css', 'utf8');
  const main = fs.readFileSync('src/main.tsx', 'utf8'), src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  // Fração da barra limitada a 0–100%.
  const share = (hp, maxHp) => Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
  assert.match(ui, /export const bossBarShare = \(bar: Pick<BossBar, 'hp' \| 'maxHp'>\) => Math\.max\(0, Math\.min\(1, bar\.hp \/ Math\.max\(1, bar\.maxHp\)\)\);/);
  assert.equal(share(50, 100), .5); assert.equal(share(-5, 100), 0); assert.equal(share(500, 100), 1);
  assert.doesNotMatch(ui, /toLocaleString|compactNumber|hp\} ?\//, 'sem números de vida');
  assert.match(css, /\.boss-bars\{position:absolute;z-index:4;left:50%;top:30vh;transform:translateX\(-50%\)/);
  for (const size of css.match(/font-size:(\d+)px/g)) assert.ok(Number(size.match(/\d+/)[0]) >= 10, size);
  assert.match(main, /<BossBars bars=\{world\.bossBars\?\?\[\]\}\/>/);
  assert.doesNotMatch(main, /'Guardião'\} · \{world\.boss\}/);
  assert.match(src, /\.sort\(\(a,b\)=>Number\(!!b\.guardian\)-Number\(!!a\.guardian\)\|\|dist\(a\)-dist\(b\)\)\.slice\(0,3\)/);
  assert.match(src, /onSnapshotRef\.current\(\{killedBy,bossBars:bossBars\(\),/);
});
