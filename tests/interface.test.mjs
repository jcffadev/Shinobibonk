// Interface (Rodada 57 — pedido: "Aumentar um pouco as fontes, mas manter o hud organizado... tem algumas fontes muito
// pequenas"). Análise estática dos CSS do jogo: piso de tamanho e nenhuma caixa fixa menor que o texto (texto cortado).
// A aparência final na tela é PENDENTE DE VALIDAÇÃO E2E (navegador suspenso para o Claude Code).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const cssFiles = [];
(function walk(dir) { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith('.css')) cssFiles.push(p); } })(src);

/** Regras CSS simples: [seletor, corpo, arquivo]. */
function rules() {
  const list = [];
  for (const file of cssFiles) for (const chunk of fs.readFileSync(file, 'utf8').split('}')) {
    const [selector, body] = chunk.split('{');
    if (body) list.push({ selector: selector.trim().split('\n').pop(), body, file: path.relative(src, file) });
  }
  return list;
}
const sizeOf = body => {
  const m = body.match(/font-size:\s*([\d.]+)(px|rem)/) || body.match(/font:\s*\d{3}\s+([\d.]+)(px|rem)/);
  return m ? (m[2] === 'rem' ? +m[1] * 16 : +m[1]) : undefined;
};

test('os CSS do jogo foram encontrados', () => {
  assert.ok(cssFiles.length >= 15, `${cssFiles.length} arquivos CSS`);
});

test('nenhuma fonte abaixo de 10px (piso de legibilidade; antes havia 7px, 7,5px, 8px e 9px)', () => {
  const tiny = rules().filter(r => sizeOf(r.body) !== undefined && sizeOf(r.body) < 10).map(r => `${r.file} ${r.selector}: ${sizeOf(r.body)}px`);
  assert.deepEqual(tiny, []);
});

test('texto não fica cortado: entrelinha e altura fixas comportam a fonte', () => {
  const clipped = [];
  for (const r of rules()) {
    const size = sizeOf(r.body); if (size === undefined) continue;
    const lh = r.body.match(/line-height:\s*([\d.]+)px/), h = r.body.match(/(?:^|[;\s{])height:\s*([\d.]+)px/);
    if (lh && +lh[1] < size) clipped.push(`${r.file} ${r.selector}: fonte ${size}px > entrelinha ${lh[1]}px`);
    if (h && +h[1] < size * 1.15) clipped.push(`${r.file} ${r.selector}: fonte ${size}px em altura ${h[1]}px`);
  }
  assert.deepEqual(clipped, []);
});

test('botões do topo do hub têm fundo próprio (sem texto branco sobre fundo branco do navegador)', () => {
  for (const selector of ['.archive-button', '.account-button']) {
    const bodies = rules().filter(r => r.selector.includes(selector)).map(r => r.body);
    assert.ok(bodies.length, selector + ' tem regra CSS');
    assert.ok(bodies.some(body => /background\s*:/.test(body)), selector + ' sem background');
  }
});
