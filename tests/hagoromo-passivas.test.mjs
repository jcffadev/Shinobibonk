// 27/11/2026 — usuário: "Todos os itens tem que ter passivas" (ferramentas do Hagoromo). As 25 de atributo ganharam efeito
// próprio além do bônus (TOOL_PASSIVES em hagoromoTraining.ts), mais forte quanto maior a raridade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SAGE_TOOLS, TOOL_PASSIVES } from '../src/game/hagoromoTraining.ts';

const RANK = { Comum: 0, Incomum: 1, Raro: 2, 'Épico': 3, 'Lendário': 4 };

test('todas as 34 ferramentas têm efeito: 9 especiais e 25 com passiva própria', () => {
  const attribute = SAGE_TOOLS.filter(t => t.effect === 'passive');
  assert.equal(attribute.length, 25);
  for (const t of attribute) {
    assert.ok(t.passive, t.name + ' tem passiva');
    assert.ok(!/sem efeito especial/.test(t.detail), t.name + ': o card descreve a passiva');
    assert.equal(t.detail, TOOL_PASSIVES[t.id].detail);
    assert.ok(t.passive.every > 0 && t.passive.color, t.name);
    if (['pulse', 'volley', 'drain', 'eliteSmash'].includes(t.passive.kind)) assert.ok((t.passive.power ?? 0) > 0 || t.passive.status, t.name + ' faz algo');
    if (['heal', 'drain', 'critBurst', 'killDrop'].includes(t.passive.kind)) assert.ok(t.passive.share > 0, t.name + ' tem parcela');
  }
  assert.deepEqual(Object.keys(TOOL_PASSIVES).sort(), attribute.map(t => t.id).sort(), 'uma passiva por ferramenta de atributo');
  for (const t of SAGE_TOOLS.filter(t => t.effect !== 'passive')) assert.equal(t.passive, undefined, t.name + ' segue com o efeito especial');
});

test('passivas de dano crescem com a raridade (média do poder por segundo)', () => {
  const dps = r => { const list = SAGE_TOOLS.filter(t => t.rarity === r && t.passive && ['pulse', 'volley', 'drain'].includes(t.passive.kind));
    return list.reduce((s, t) => s + (t.passive.power ?? 0) * (t.passive.count ?? 1) / t.passive.every, 0) / Math.max(1, list.length); };
  const values = Object.keys(RANK).map(dps);
  for (let i = 1; i < values.length; i++) assert.ok(values[i] > values[i - 1], `raridade ${i} mais forte que a anterior (${values.map(v => v.toFixed(2)).join(' < ')})`);
});

test('a partida executa as passivas: tempo, abates, crítico, elites e bloqueio', () => {
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.ok(canvas.includes("for(const id of hagoromo.tools){const tool=TOOL_BY_ID[id],p=tool?.passive;if(!p||p.kind==='guard'||p.kind==='critBurst'||p.kind==='eliteSmash')continue;"), 'laço por tempo');
  assert.ok(canvas.includes("if(p.kind==='killDrop'){"), 'por abates');
  assert.ok(canvas.includes("if(p.kind==='critBurst'&&critical&&now-(passiveAt[id]??-1e9)>=p.every){"), 'no crítico');
  assert.ok(canvas.includes("if(p.kind==='eliteSmash'&&(enemy.elite||enemy.megaElite||enemy.guardian||enemy.bijuu)&&"), 'em elites e chefes');
  assert.ok(canvas.includes("if(p?.kind==='guard'&&now-(passiveAt[id]??-1e9)>=p.every){passiveAt[id]=now;invulnerability=.25;"), 'anula o golpe');
  assert.ok(canvas.includes("if(p.kind==='heal'){cappedHeal(stats.maxHp*(p.share??0));") && canvas.includes("if(p.kind==='drain'&&hits)cappedHeal("), 'cura respeita o teto');
  assert.ok(canvas.includes("if(p.status==='Empurrar'){if(immovableBoss(e))return;"), 'chefes não são empurrados');
});
