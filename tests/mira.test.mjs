// Rodada 78 — técnicas miram o alvo: Órbita e corpo a corpo acertam no alvo, nunca no pé do jogador.
// Pedido do usuário: "Ataques ou devem ser meele, chegar perto para acertar, mas mirando os alvos ou arremessados/lançados,
// nunca usados no pé do jogador, igual o madara seis caminhos… Revise todas as habilidades que funcionam igual e altere."
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES, LAUNCHED_ORBITS } from '../src/game/heroes.ts';
import { aimedCenter } from '../src/game/combat.ts';

const src = file => fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('Área, Órbita e corpo a corpo acertam no alvo; cone, linha e puxão saem do shinobi', () => {
  for (const shape of ['Área', 'Órbita', 'Corpo a corpo']) assert.equal(aimedCenter({ shape }), 'target', shape);
  for (const shape of ['Cone', 'Linha']) assert.equal(aimedCenter({ shape }), 'origin', shape);
  assert.equal(aimedCenter({ shape: 'Onda', gravity: 'pull' }), 'origin', "Bansho Tenin puxa para o usuário");
  assert.equal(aimedCenter({ shape: 'Corpo a corpo' }, true), 'origin', 'Modo Sábio: taijutsu gira em volta do usuário');
});

test('toda Órbita do elenco mira o alvo: lançadas alcançam 4,5 m, as de contato pedem chegar perto (1,7)', () => {
  const orbits = new Map();
  for (const hero of HEROES) for (const t of hero.techniques) if (t.shape === 'Órbita') orbits.set(t.name, t);
  assert.ok(orbits.size >= 14, 'as técnicas em órbita continuam no elenco');
  for (const name of LAUNCHED_ORBITS) assert.ok(orbits.has(name), 'órbita lançada existe: ' + name);
  for (const [name, t] of orbits) assert.equal(t.range, LAUNCHED_ORBITS.has(name) ? 4.5 : 1.7, name);
  assert.ok(LAUNCHED_ORBITS.has('Limbo') && LAUNCHED_ORBITS.has('Esferas da Busca da Verdade'), 'as do Madara Seis Caminhos são lançadas');
});

test('acerto, área marcada e visual ficam no alvo (GameCanvas, partículas, Susanoo, prévia)', () => {
  assert.match(src('scene/GameCanvas.tsx'), /const center=aimedCenter\(t,sageArea\)==='target'\?target\.sprite\.position\.clone\(\):origin\.clone\(\)/);
  assert.match(src('scene/particleFx.ts'), /case 'Órbita': orbit\(t, p, center\.x, center\.y, center\.z, radius\)/);
  assert.match(src('scene/susanooFx.ts'), /ox = rig\.ultimate \? sx : rig\.target\.x, oz = rig\.ultimate \? sz : rig\.target\.z/);
  assert.doesNotMatch(src('ui/TechniquePreview.tsx'), /\['Órbita','Cone','Linha','Corpo a corpo'\]/, 'a prévia não prende a Órbita no shinobi');
});
