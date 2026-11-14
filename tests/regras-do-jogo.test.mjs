// Regras gerais (elenco, catálogo, técnicas, sorteios) e trechos da rodada 55 conferidos no código-fonte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('verify-rules (elenco, catálogo, técnicas e sorteios) passa', () => {
  const run = spawnSync(process.execPath, ['scripts/verify-rules.mjs'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.equal(run.status, 0, (run.stderr || run.stdout).slice(-1500));
});

test('ameaça dos monstros usa o tempo DA ZONA (recomeça a cada zona)', () => {
  const threat = canvas.slice(canvas.indexOf('const threatNow='), canvas.indexOf('const threatNow=') + 400);
  assert.ok(threat.includes('zoneElapsed()'), 'threatNow usa zoneElapsed()');
  assert.ok(threat.includes("ex('enemyCount')"), '+% de inimigos continua aplicado por cima');
});

test('ímã do morro puxa o mapa inteiro em pouco tempo', () => {
  assert.ok(/userData\.globalPull/.test(canvas), 'drops do ímã global marcados');
  assert.ok(/dist\/1\.2/.test(canvas), 'velocidade mínima: qualquer distância em ~1,2 s');
});

test('câmera pode deitar mais que o piso antigo (0,05 rad)', () => {
  const m = canvas.match(/CAMERA_MIN_PITCH\s*=\s*([\d.]+)/);
  assert.ok(m && Number(m[1]) < .05, `piso atual ${m?.[1]}`);
});

test('Mega Elite caído fica deitado e capturável com E', () => {
  assert.ok(canvas.includes('createFallenBody'), 'usa o corpo caído');
  assert.ok(/sealRadius=10/.test(canvas), 'alcance de 10 m para o E');
  const fallen = fs.readFileSync(new URL('../src/scene/fallenShinobi.ts', import.meta.url), 'utf8');
  assert.ok(/halo/.test(fallen), 'tem halo de luz no chão');
});
