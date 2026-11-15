// Proporção ao começar a andar (Rodada 69 — pedido do usuário: "A cabeça dos personagens ao iniciar o movimento, estava
// ficando desproporcional ao personagem e a ele parado"). Lê os PNG reais no Node (sem navegador) e aplica a regra do
// controlador (headProportion de src/scene/playerMotion.ts) às 2.280 células de corrida das 114 versões.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodePng } from '../scripts/audit-walk-sheets.mjs';
import { load } from './helpers/load.mjs';

globalThis.document ??= { createElement: () => ({ getContext: () => null, width: 0, height: 0 }) };
const { headProportion } = await load('/src/scene/playerMotion.ts');
const { HEROES } = await load('/src/game/heroes.ts');
const { portraitRegion } = await load('/src/game/evolution.ts');
const { runningArt } = await load('/src/game/runningArt.ts');

/** Mesma medida do jogo: altura da silhueta e largura da cabeça (mediana das linhas do topo 28%), em fração da célula. */
function measure(img, x0, y0, w, h) {
  let top = h, bottom = -1; const widths = [];
  for (let y = 0; y < h; y++) {
    let left = -1, right = -1;
    for (let x = 0; x < w; x++) if (img.alpha(x0 + x, y0 + y) > 24) { if (left < 0) left = x; right = x; }
    widths.push(left < 0 ? 0 : right - left + 1);
    if (left >= 0) { if (y < top) top = y; bottom = y; }
  }
  if (bottom < 0) return null;
  const band = widths.slice(top, top + Math.max(2, Math.round((bottom - top + 1) * .28))).sort((a, b) => a - b);
  return { height: (bottom - top + 1) / h, head: band[band.length >> 1] / w };
}

let cache;
function runningCells() {
  if (cache) return cache;
  const images = new Map(), img = p => { if (!images.has(p)) images.set(p, decodePng('public' + p)); return images.get(p); };
  cache = [];
  for (const hero of HEROES) {
    const p = portraitRegion(hero.id), run = runningArt(hero.id);
    if (!run) continue;
    const pi = img(p.path), pw = Math.floor(pi.width / p.cols), ph = Math.floor(pi.height / p.rows);
    const idle = measure(pi, (p.index % p.cols) * pw, Math.floor(p.index / p.cols) * ph, pw, ph);
    const ri = img(run.path), rw = Math.floor(ri.width / 4), rh = Math.floor(ri.height / run.rows);
    for (let view = 0; view < 5; view++) for (let frame = 0; frame < 4; frame++) {
      const cell = measure(ri, frame * rw, (run.firstRow + view) * rh, rw, rh);
      if (idle && cell) cache.push({ id: hero.id, view, idle, cell });
    }
  }
  return cache;
}
const quantile = (values, q) => { const v = [...values].sort((a, b) => a - b); return v[Math.floor(q * (v.length - 1))]; };

test('regra: iguala a cabeça, com limites e piso do corpo', () => {
  assert.equal(headProportion(.8, .8, .4, .4), 1, 'mesma cabeça → mesmo tamanho');
  assert.ok(Math.abs(headProportion(.8, .7, .4, .5) - .8) < 1e-9, 'cabeça desenhada 25% maior → encolhe para 80%');
  assert.equal(headProportion(.8, .8, .4, .1), 1.35, 'nunca cresce mais de 35%');
  assert.ok(Math.abs(headProportion(.8, .4, .2, .8) - .7 * .8 / .4) < 1e-9, 'corpo nunca abaixo de 70% da altura parada');
  assert.equal(headProportion(.8, .8, 0, .4), 1, 'sem cabeça medida: regra antiga pela altura');
  assert.equal(headProportion(0, .8, .4, .4), 1, 'sem medida do repouso: não mexe');
});

test('as 114 versões têm células de corrida medidas', () => {
  const cells = runningCells();
  assert.ok(cells.length >= 2200, `${cells.length} células`);
  assert.ok(new Set(cells.map(c => c.id)).size >= 114);
});

test('correndo, a cabeça fica do mesmo tamanho que parado (mediana) e sem exageros (90% dos quadros até +25%)', () => {
  const ratios = runningCells().map(({ idle, cell }) => cell.head * headProportion(idle.height, cell.height, idle.head, cell.head) / idle.head);
  const median = quantile(ratios, .5), p90 = quantile(ratios, .9);
  assert.ok(Math.abs(median - 1) <= .03, `mediana ${median.toFixed(3)}`);
  assert.ok(p90 <= 1.25, `90% até ${p90.toFixed(3)}`);
});

test('a regra nova é melhor que a antiga (altura), que inchava a cabeça na corrida', () => {
  const cells = runningCells();
  const oldRule = ({ idle, cell }) => cell.head * Math.min(1.35, Math.max(.85, idle.height / cell.height)) / idle.head;
  const newRule = ({ idle, cell }) => cell.head * headProportion(idle.height, cell.height, idle.head, cell.head) / idle.head;
  const oldMedian = quantile(cells.map(oldRule), .5), newMedian = quantile(cells.map(newRule), .5);
  assert.ok(oldMedian > 1.1, `regra antiga: cabeça ${oldMedian.toFixed(2)}× (problema relatado)`);
  assert.ok(Math.abs(newMedian - 1) < Math.abs(oldMedian - 1) / 3, `regra nova: ${newMedian.toFixed(2)}×`);
});

test('o corpo não encolhe demais: nenhum quadro abaixo de 70% da altura parada', () => {
  const bodies = runningCells().map(({ idle, cell }) => cell.height * headProportion(idle.height, cell.height, idle.head, cell.head) / idle.height);
  assert.ok(Math.min(...bodies) >= .7 - 1e-9, `mínimo ${Math.min(...bodies).toFixed(3)}`);
});

test('o controlador usa a regra da cabeça (não a altura) ao trocar de folha', async () => {
  const fs = await import('node:fs');
  const motion = fs.readFileSync(new URL('../src/scene/playerMotion.ts', import.meta.url), 'utf8');
  assert.match(motion, /const propTarget = headProportion\(idleFrac, cellFrac, idleHead, cellHead\);/);
  assert.match(motion, /cellHead = headFracOf\(cellMap, cx, cy, cw, ch\)/, 'mede a cabeça da célula em uso');
  assert.match(motion, /idleHead=headFracOf\(idleMap,/, 'mede a cabeça do repouso');
});
