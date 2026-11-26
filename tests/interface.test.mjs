// Interface (Rodada 57 — pedido: "Aumentar um pouco as fontes, mas manter o hud organizado... tem algumas fontes muito
// pequenas"). Análise estática dos CSS do jogo: piso de tamanho e nenhuma caixa fixa menor que o texto (texto cortado).
// A aparência final na tela é PENDENTE DE VALIDAÇÃO E2E (navegador suspenso para o Claude Code).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from './helpers/load.mjs';
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


test('Chute Giratório renderiza o PNG dedicado no componente compartilhado', async () => {
  const { SkillIcon } = await load('/src/ui/SkillIcon.tsx');
  const markup = renderToStaticMarkup(createElement(SkillIcon, { heroId: 'naruto', name: 'Chute Giratório' }));
  assert.match(markup, /aria-label="Chute Giratório"/);
  assert.match(markup, /\/assets\/inventory\/skill-chute-giratorio-v1\.png/);
  assert.ok(fs.existsSync(new URL('../public/assets/inventory/skill-chute-giratorio-v1.png', import.meta.url)));
});


test('cartão de pílula e item: Nome, pool, Efeito, Descrição e Quantidade (rodada 101)', async () => {
  const { plannerCardInfo } = await import('../src/game/plannerCards.ts');
  const pill = plannerCardInfo('Pílula do Mercador');
  assert.ok(pill.effect.includes('Ryu') && pill.effect.endsWith('por nível'), pill.effect);
  assert.equal(pill.flavor, 'Faro para Ryu durante a missão.');
  assert.equal(pill.quantity, 'Até 9 níveis');
  const item = plannerCardInfo('Luneta Ninja');
  assert.ok(item.effect.includes('chance crítica') && item.quantity.startsWith('Comum · até '), item.quantity);
  assert.equal(plannerCardInfo('Rasengan'), undefined, 'técnica não usa este cartão');
  const src = (await import('node:fs')).readFileSync(new URL('../src/ui/BuildPlanner.tsx', import.meta.url), 'utf8');
  assert.ok(src.includes('<dt>Efeito</dt>') && src.includes('<dt>Descrição</dt>') && src.includes('<dt>Quantidade</dt>'));
});

test('catálogo de fusões: ícone enquadrado e descrição do que a fusão faz (rodada 101)', () => {
  const src = fs.readFileSync(new URL('../src/ui/BuildPlanner.tsx', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../src/mission-planner.css', import.meta.url), 'utf8');
  assert.ok(src.includes('<span className="fusion-catalog-icon"><SkillIcon') && src.includes('className="fusion-catalog-effect"'), 'ícone num quadro próprio e linha do efeito');
  assert.ok(!css.includes('.fusion-catalog-entry>span{'), 'a regra do texto não pega mais o ícone');
  assert.match(css, /.fusion-catalog-icon{flex:0 0 44px;width:44px;height:44px;[^}]*overflow:hidden/);
});

test('planejador: aba Pílulas sem o painel lateral, grade na largura toda (25/11)', () => {

  const planner = fs.readFileSync(new URL('../src/ui/BuildPlanner.tsx', import.meta.url), 'utf8');
  assert.ok(planner.includes("{tab!=='Pílulas'&&<aside className=\"build-detail\""), 'painel some só na aba Pílulas');
  assert.ok(planner.includes("build-workspace${tab==='Pílulas'?' no-detail':''}"));
  assert.match(fs.readFileSync(new URL('../src/mission-planner.css', import.meta.url), 'utf8'), /\.build-workspace\.no-detail[^{]*\{grid-template-columns:minmax\(0,1fr\)\}/);
});

test('Tab: mouse gira a câmera e o botão direito segurado mostra a kunai para marcar rota (25/11/2026)', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes("const overlayUi=()=>enabledRef.current&&((panelRef.current==='quickmap'&&quickCursor)||!cameraCanMove())"), 'kunai só com o direito segurado');
  assert.ok(canvas.includes("quickCursor=e.type==='mousedown';"));
  assert.ok(canvas.includes("if(next!=='quickmap'){quickMap.clear();quickCursor=false;}"), 'soltar o Tab some com a kunai');
  const map = fs.readFileSync(new URL('../src/ui/MapOverlay.tsx', import.meta.url), 'utf8');
  assert.ok(map.includes('Mouse gira a câmera · segure o botão direito para a kunai'));
});

test('ficha final mostra o golpe que derrubou o jogador e quem deu (25/11/2026)', async () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  for (const wired of ['if(hp<hpBefore)lastHit={by:label??attackerName(attacker),damage:hpBefore-hp,maxHp:stats.maxHp};', 'else{defeated=true;killedBy=lastHit;', 'onSnapshotRef.current({killedBy,',
    "damagePlayer(shot.damage,undefined,0,'horde',shot.type==='fuma'?'Fūma de monstro':'Kunai de monstro')", "attackerName(host as Enemy)+(technique?' · '+technique:'')"]) assert.ok(canvas.includes(wired), wired);
  assert.ok(fs.readFileSync(new URL('../src/scene/bossCombat.ts', import.meta.url), 'utf8').includes('t.gravity,c.center,host,t.name);'));
  const summary = fs.readFileSync(new URL('../src/ui/RunSummary.tsx', import.meta.url), 'utf8');
  assert.ok(summary.includes('Golpe final: <b>{world.killedBy.by}</b>'));
});
