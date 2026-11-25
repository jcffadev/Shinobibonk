// Rodada 78 — técnicas miram o alvo: Órbita e corpo a corpo acertam no alvo, nunca no pé do jogador.
// Pedido do usuário: "Ataques ou devem ser meele, chegar perto para acertar, mas mirando os alvos ou arremessados/lançados,
// nunca usados no pé do jogador, igual o madara seis caminhos… Revise todas as habilidades que funcionam igual e altere."
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES, LAUNCHED_ORBITS } from '../src/game/heroes.ts';
import { aimedCenter } from '../src/game/combat.ts';
import { firstProjectileContact, projectileContact, projectileSpread, selectCombatTarget } from '../src/game/targetFocus.ts';

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

const start = { x: 0, z: 0 };
const east = { x: 1, z: 0 };
const foe = (x,z=0,hp=10)=>({hp,sprite:{position:{x,z}}});

test('o foco prevalece no alcance efetivo de cada técnica e o alvo próximo cobre os demais casos',()=>{
  const minion=foe(2),boss=foe(8),side=foe(0,3);
  const enemies=[boss,side,minion];
  assert.equal(selectCombatTarget(enemies,start,8,boss),boss);
  assert.equal(selectCombatTarget(enemies,start,7.99,boss),minion);
  assert.equal(selectCombatTarget([minion],start,10,boss),minion);
  assert.equal(selectCombatTarget(enemies,start,1,boss),undefined);
  assert.equal(selectCombatTarget(enemies,start,8,boss,new Set([boss,minion])),side);
  boss.hp=0;
  assert.equal(selectCombatTarget(enemies,start,8,boss),minion);
});

test('em V e com bônus de projéteis, o primeiro disparo mantém a mira exata enquanto houver foco',()=>{
  for(const fan of [false,true]){
    for(const count of [1,2,3,8,12]){
      assert.equal(projectileSpread(fan,0,count,true),0);
      assert.notEqual(projectileSpread(fan,1,count,true),0);
    }
  }
  assert.deepEqual([0,1].map(i=>projectileSpread(true,i,1,false)),[-.2,.2]);
  assert.deepEqual([0,1].map(i=>projectileSpread(false,i,2,false)),[-.05,.05]);
});

test('o projétil simples para no primeiro contato, mesmo se cruzar dois inimigos no mesmo quadro',()=>{
  const blocker=foe(2),boss=foe(5),offAxis=foe(1,.8),behind=foe(-1),enemies=[boss,offAxis,blocker,behind];
  const expected=selectCombatTarget(enemies,start,6,boss);
  assert.equal(expected,boss);
  assert.deepEqual(firstProjectileContact(enemies,start,east,7,.5,new Set()),{target:blocker,distance:1.5});
  assert.deepEqual(firstProjectileContact(enemies,start,east,7,.5,new Set([blocker])),{target:boss,distance:4.5});
  assert.equal(firstProjectileContact([boss],start,east,4,.5,new Set()),undefined);
  assert.equal(projectileContact(start,east,.4,.5,{x:.15,z:.2}),0);
  assert.equal(projectileContact(start,east,2,.5,{x:1,z:.6}),Infinity);
});

test('o combate usa o seletor também ao lançar o ataque com preparo, e mede a colisão no segmento real',()=>{
  const scene=src('scene/GameCanvas.tsx');
  assert.match(scene,/const target=selectCombatTarget\(enemyList,casterPosition,range,activeFocus\(\)\)/);
  assert.match(scene,/pendingHits\.push\(\{time:\.12,run:\(\)=>\{\s*const current=selectCombatTarget\(enemyList,casterPosition,range,activeFocus\(\)\)/);
  assert.match(scene,/projectileSpread\(fan,i,projectiles,focused\)/);
  assert.match(scene,/firstProjectileContact\(enemyList,position,shot.direction,travel,radius,shot.hit\)/);
});
