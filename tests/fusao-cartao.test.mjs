// Cartão novo de fusão e ficha ao passar o mouse (25/11/2026 — docs/10, itens 4 e 5; pedido "Sim, fazer o cartão").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fusionParts, fusionUpgrades, fusionSheet, lastingEffects } from '../src/game/fusionCard.ts';
import { FUSION_RECIPES, mergedTechnique } from '../src/game/techniqueMerge.ts';

const tech = (extra = {}) => ({ name: 'T', school: 'Ninjutsu', element: 'Fogo', shape: 'Área', color: '#fff', power: 2, range: 4, cooldown: 1.5, statusChance: 0, unlockLevel: 1, ...extra });

test('como funciona: o golpe pela forma e uma parte por efeito', () => {
  assert.deepEqual(fusionParts(tech()).map(p => p.kind), ['Explosão no alvo']);
  const full = tech({ shape: 'Onda', status: 'Paralisar', statusChance: .4, secondaryStatus: 'Lentidão', secondaryStatusChance: .2, burn: true, poison: true, gravity: 'pull' });
  assert.deepEqual(fusionParts(full).map(p => p.kind), ['Onda de choque', 'Controle', 'Efeito secundário', 'Queimadura', 'Dano contínuo', 'Gravidade']);
  assert.deepEqual(lastingEffects(full), ['Paralisar', 'Lentidão', 'Queimadura', 'Dano contínuo']);
  assert.equal(fusionParts(tech({ status: 'Lentidão', statusChance: .3 }))[1].kind, 'Lentidão');
});

test('melhorias: projéteis e ricochete só ajudam disparos; duração só com efeito', () => {
  const shot = fusionUpgrades(tech({ shape: 'Projétil', burn: true }));
  assert.equal(shot.helps.find(u => u.stat === 'Projéteis').effect, '+1 disparo por ponto.');
  assert.ok(shot.helps.some(u => u.stat === 'Ricochete'));
  assert.ok(shot.helps.some(u => u.stat === 'Duração' && /queimadura/.test(u.effect)));
  const area = fusionUpgrades(tech());
  assert.match(area.helps.find(u => u.stat === 'Projéteis').effect, /golpe extra/);
  assert.match(area.helps.find(u => u.stat === 'Área').effect, /raio do círculo/);
  assert.ok(area.noHelp.some(t => t.startsWith('Ricochete')) && area.noHelp.some(t => t.startsWith('Duração')));
});

test('ficha: tipo, dano base, recarga, status e níveis de cada receita', () => {
  for (const r of FUSION_RECIPES) {
    const a = tech({ name: 'A' }), b = tech({ name: 'B' });
    const t = { ...a, name: 'Fusão · ' + r.name, shape: r.shape, status: r.status, statusChance: r.statusChance, burn: r.burn, poison: r.poison };
    const sheet = fusionSheet(t, ['A', 'B']);
    assert.notEqual(sheet.label, 'Combinação', r.name);
    assert.equal(sheet.base, Math.round(t.power * 1.2 * 100) + '% do dano do personagem por acerto');
    assert.equal(sheet.cap, 'Nv. 1 ao Nv. 7');
    assert.ok(fusionParts(t).length >= 1 && fusionUpgrades(t).helps.length >= 3);
  }
  const water = tech({ name: 'W1', element: 'Água' }), water2 = tech({ name: 'W2', element: 'Água' });
  const fused = mergedTechnique({ kind: 'fuse', names: ['W1', 'W2'] }, [water, water2]);
  assert.equal(fusionSheet(fused, ['W1', 'W2']).label, 'Fusão de natureza');
  assert.match(fusionSheet(fused, ['W1', 'W2']).status, /^Lentidão /);
});

test('planejador usa o cartão novo, a lista no mesmo estilo e a ficha no mouse', () => {
  const planner = fs.readFileSync(new URL('../src/ui/BuildPlanner.tsx', import.meta.url), 'utf8');
  for (const wired of ['<h4>Como funciona</h4>', '<h4>Quais melhorias afetam</h4>', 'Não ajuda: {upgrades.noHelp.join', '<dt>Dano final</dt>',
    "onMouseEnter={event=>showTip(f.name,event.currentTarget,f.pair)}", "showTip(name,event.currentTarget,category==='Fusões'?fusionPlan[index]:undefined)",
    '<small className="fusion-kind">{FUSION_KIND_LABEL[f.kind]}</small>']) assert.ok(planner.includes(wired), wired);
});
