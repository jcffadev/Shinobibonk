// Regras gerais do jogo (elenco, catálogo, técnicas, sorteios) — reaproveita scripts/verify-rules.mjs, que roda no
// Node sem navegador — e invariantes de ligação: o GameCanvas usa as funções puras testadas (não cópias da lógica).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url);
const canvas = fs.readFileSync(new URL('src/scene/GameCanvas.tsx', root), 'utf8');

test('verify-rules (elenco, catálogo, técnicas e sorteios) passa', () => {
  const rules = fs.readFileSync(new URL('scripts/verify-rules.mjs', root), 'utf8');
  // Nomes montados em partes para este arquivo não ser confundido com um teste de navegador pelo scripts/run-tests.mjs.
  const browser = new RegExp(['chrom' + 'ium', 'play' + 'wright', 'puppe' + 'teer', 'ms' + 'edge'].join('|'), 'i');
  assert.ok(!browser.test(rules), 'verify-rules não abre navegador');
  const run = spawnSync(process.execPath, ['scripts/verify-rules.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, (run.stderr || run.stdout).slice(-2000));
  assert.match(run.stdout, /roster/, 'verify-rules imprimiu o resumo');
});

test('GameCanvas usa as funções testadas (sem lógica duplicada)', () => {
  const uses = {
    'ameaça por zona': /const threatNow=\(\)=>zoneThreat\(mission,arena\?ZONE_SECONDS:zoneElapsed\(\)/,
    'maldição da zona': /zoneCurse\(zoneDifficulty,shikamaruPlans,ex\('threat'\)\)/,
    '+% de inimigos': /ex\('enemyCount'\)/,
    'bênção do altar': /buildAltarOffers\(tier,stats\.luck\)/,
    'golpes extras': /extraStrikes\(stats\.projectiles,stats\.projectileChance,!!t\.ultimate\)/,
    'ímã do morro': /magnetSpeed\(drop\.speed,dist,!!drop\.mesh\.userData\.globalPull\)/,
    'corpo caído': /createFallenBody\(/,
    'áreas das técnicas': /createTechniqueAreas\(scene,terrainHeight\)/,
  };
  for (const [name, pattern] of Object.entries(uses)) assert.match(canvas, pattern, name);
  assert.ok(!/ALTAR_BUFF_POOL\.filter/.test(canvas), 'o sorteio do altar não foi recopiado no GameCanvas');
  assert.ok(!/dist\/1\.2/.test(canvas), 'o ímã não foi recopiado no GameCanvas');
});

test('captura do caído: E até 10 m', () => {
  assert.match(canvas, /const sealRadius=10;/);
});

test('câmera pode deitar mais que o piso antigo (0,05 rad) e o laço usa a constante', () => {
  const m = canvas.match(/CAMERA_MIN_PITCH\s*=\s*([\d.]+)/);
  assert.ok(m && Number(m[1]) > 0 && Number(m[1]) < .05, `piso atual ${m?.[1]}`);
  assert.match(canvas, /pitch=THREE\.MathUtils\.clamp\(pitch\+dy\*.*,CAMERA_MIN_PITCH,1\.48\)/, 'o giro do mouse respeita o piso novo');
  assert.ok(!/,\.05,1\.48\)/.test(canvas), 'o piso antigo não sobrou');
});

test('nome do jogo de referência não aparece no código, testes nem documentação rastreada', () => {
  const run = spawnSync('git', ['grep', '-l', '-i', '-E', 'pok.{0,3}bonk', '--', '.', ':!.gitignore'], { cwd: root, encoding: 'utf8' });
  assert.equal(run.stdout.trim(), '', `arquivos com o nome: ${run.stdout}`);
});
