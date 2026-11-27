// Paredes invisíveis (Rodada 70 — pedidos do usuário: "Verifique ainda as paredes invisiveis e os blocks invisiveis no
// caminhar do personagem" e "Precisamos andar livre, o máximo que pode ter é travar ao esbarrar, mas ao dar dash
// conseguir passar"). Lógica pura de src/scene/collision.ts, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';

const { COLLISION_RULES, createSolids } = await load('/src/scene/collision.ts');
const { PLAYER_SIZE } = await load('/src/game/worldScale.ts');
const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');

test('jogador do tamanho do monstro comum (rodada 77: "aumente os ninja para ficar do tamanho dos monstros")', async () => {
  const { MONSTER_VISIBLE_HEIGHT } = await load('/src/game/worldScale.ts');
  const motion = fs.readFileSync(new URL('../src/scene/playerMotion.ts', import.meta.url), 'utf8');
  const adult = Number(/export const ADULT_HEIGHT = ([\d.]+)/.exec(motion)[1]);
  assert.ok(Math.abs(adult * PLAYER_SIZE - MONSTER_VISIBLE_HEIGHT) < .03, `ninja ${(adult * PLAYER_SIZE).toFixed(2)} × monstro ${MONSTER_VISIBLE_HEIGHT}`);
  assert.ok(PLAYER_SIZE > .6, 'não volta a ficar minúsculo');
  assert.match(canvas, /makeHero\(heroId,1,PLAYER_SIZE\)/);
  assert.match(canvas, /createPlayerMotion\(scene,player,heroId,true,PLAYER_SIZE\)/);
});

test('o corpo do jogador cabe no tamanho desenhado', () => {
  assert.ok(COLLISION_RULES.playerRadius <= .42 * PLAYER_SIZE + .01, `raio ${COLLISION_RULES.playerRadius}`);
  assert.ok(COLLISION_RULES.playerRadius >= .12, 'ainda tem corpo');
});

test('raios do cenário não passam do desenho medido (tronco ~0,57 m, bambu ~1,2 m, rocha ~1,8 m)', () => {
  const [tree, pine, bamboo, rock] = COLLISION_RULES.scenery;
  assert.ok(tree <= .3 && pine <= .3, `árvore ${tree}, pinheiro ${pine}`);
  assert.ok(bamboo <= .6 && rock <= .9, `bambu ${bamboo}, rocha ${rock}`);
});

test('passa entre duas árvores com 1 m de vão visível', () => {
  const solids = createSolids(), r = COLLISION_RULES.scenery[0];
  solids.add(-(.5 + r), 0, r); solids.add(.5 + r, 0, r);
  const p = { x: 0, z: -2 };
  for (let i = 0; i < 40; i++) { p.z += .1; solids.resolve(p); }
  assert.ok(p.z > 1.9 && Math.abs(p.x) < 1e-9, `parou em ${p.x.toFixed(2)},${p.z.toFixed(2)}`);
});

test('ao esbarrar só trava (desliza pela borda), não é arremessado', () => {
  const solids = createSolids(); solids.add(0, 0, 1);
  const p = { x: .3, z: -1.5 };
  for (let i = 0; i < 60; i++) { p.z += .1; solids.resolve(p); }
  assert.ok(p.z > 1.4 && Math.abs(p.x) < 1.5, `contornou a rocha: ${p.x.toFixed(2)},${p.z.toFixed(2)}`);
});

test('árvore/rocha escondida dentro ou colada numa construção é removida, com o sprite', () => {
  const solids = createSolids(), removed = [];
  const hidden = solids.add(1, 0, .3), near = solids.add(3.9, 0, .3), far = solids.add(10, 0, .3);
  solids.addBuilding(0, 0, 22);
  assert.equal(solids.prune(COLLISION_RULES.sceneryClearance, s => removed.push(s)), 2);
  assert.deepEqual(removed.sort((a, b) => a.x - b.x), [hidden, near]);
  assert.ok(solids.all.includes(far) && solids.all.some(s => s.big), 'mantém o resto e a construção');
});

test('o dash atravessa e sai pela frente, nunca de volta', () => {
  const solids = createSolids(); solids.addBuilding(0, 0, 22);
  const p = { x: .5, z: -.4 };
  assert.ok(solids.exitAlong(p, { x: 0, z: 1 }));
  assert.ok(p.z > 0 && Math.hypot(p.x, p.z) >= 3 + COLLISION_RULES.playerRadius - 1e-6, `saiu em ${p.x},${p.z.toFixed(2)}`);
  const outside = { x: 9, z: 9 };
  assert.equal(solids.exitAlong(outside, { x: 1, z: 0 }), false);
  assert.equal(solids.exitAlong({ x: 0, z: 0 }, { x: 0, z: 0 }), false, 'sem direção não mexe');
});

test('o jogo liga as regras: poda o cenário e o dash não colide', () => {
  assert.match(canvas, /solids\.prune\(COLLISION_RULES\.sceneryClearance,/);
  assert.match(canvas, /if\(slideTime<=0\)\{if\(dashing\)solids\.exitAlong\(player\.position,heading\);else solids\.resolve\(player\.position\);\}/);
  assert.match(canvas, /sceneryBySolid\.set\(solids\.add\(/);
});

test('todos os adultos do mesmo tamanho; Genin/Academia um pouco menores (rodada 96)', async () => {
  const { actorVisibleHeight, ADULT_HEIGHT, CHILD_HEIGHT } = await load('/src/scene/playerMotion.ts');
  for (const family of ['zabuza', 'kisame', 'gaara', 'naruto', 'pain', 'madara']) assert.equal(actorVisibleHeight(family, 50), ADULT_HEIGHT, family + ' adulto');
  assert.equal(actorVisibleHeight('zabuza', 1), ADULT_HEIGHT, 'Zabuza não é maior');
  assert.equal(actorVisibleHeight('naruto', 1), CHILD_HEIGHT, 'Naruto Academia');
  assert.equal(actorVisibleHeight('naruto', 10), CHILD_HEIGHT, 'Naruto Genin');
  assert.equal(actorVisibleHeight('gaara', 1), CHILD_HEIGHT, 'Gaara Genin');
  const ratio = CHILD_HEIGHT / ADULT_HEIGHT;
  assert.ok(ratio >= .85 && ratio < .95, `ligeiramente menores (${ratio.toFixed(2)})`);
  assert.ok(!canvas.includes("familyOf(id)==='gaara'?1.1"), 'sem aumento extra do Gaara');
});

test('inimigo encostado numa construção desliza ao longo dela e não nasce dentro (25/11/2026)', async () => {
  const { createSolids, slideAlong } = await import('../src/scene/collision.ts');
  const solids = createSolids();
  solids.addBuilding(0, 0, 10); // raio 1,8
  // Jogador do outro lado da construção: o inimigo empurrado para fora desliza e, em alguns passos, contorna.
  const enemy = { x: -2.2, z: .05 }, player = { x: 4, z: 0 };
  let around = false;
  for (let i = 0; i < 60; i++) {
    const dx = player.x - enemy.x, dz = player.z - enemy.z, d = Math.hypot(dx, dz);
    enemy.x += dx / d * .1; enemy.z += dz / d * .1;
    const bx = enemy.x, bz = enemy.z;
    if (solids.resolveBig(enemy) && slideAlong({ x: bx, z: bz }, enemy, player, .1)) solids.resolveBig(enemy);
    if (enemy.x > 0) { around = true; break; }
  }
  assert.ok(around, 'contornou a construção em vez de travar na parede');
  const spot = solids.freeSpot(0, .2, .6);
  assert.ok(Math.hypot(spot.x, spot.z) >= 1.8 + .6 - 1e-6, 'nascimento sai de dentro da construção');
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('if(solids.resolveBig(p)&&slideAlong({x:bx,z:bz},p,player.position,enemy.speed*threat.speed*dt))solids.resolveBig(p);'));
  // 27/11/2026: chefes e Mega Elites usam o safeSpot (fora das casas); os comuns seguem no freeSpot.
  assert.ok(canvas.includes(':arena||activeInstance?{x,z}:/* 27/11: chefes fora das casas */megaElite?solids.safeSpot(x,z):solids.freeSpot(x,z,.6);keepInInstance(spot);e.position.set(spot.x,'));
});

test('coletáveis nunca nascem dentro de casas nem de escadarias, mesmo no meio de casas vizinhas (26/11/2026)', async () => {
  // "As vezes está nascendo pergaminhos dentro das casas, isso não pode ser possível".
  const { createSolids, COLLISION_RULES } = await import('../src/scene/collision.ts');
  const { foundationDistance } = await import('../src/scene/villageCollision.ts');
  const solids = createSolids();
  // Fileira de casas coladas e uma escadaria: o empurrão simples jogava o ponto de uma casa para dentro da vizinha.
  for (let i = -3; i <= 3; i++) solids.addBox(i * 5, 0, 2.4, 3, 4);
  solids.addStair(0, 6, 2, 1.5, 1.2);
  const margin = COLLISION_RULES.placementMargin;
  const outside = p => solids.big.every(s => foundationDistance(p.x, p.z, s) > margin) && solids.all.filter(s => s.stair).every(s => foundationDistance(p.x, p.z, s) > margin);
  for (const [x, z] of [[0, 0], [2.5, 0], [-7.4, 1], [0, 6], [12, -2.9], [0.1, 3.2]]) {
    const old = solids.freeSpot(x, z), p = solids.safeSpot(x, z);
    assert.ok(outside(p), `(${x}, ${z}) → (${p.x.toFixed(2)}, ${p.z.toFixed(2)}) ainda dentro`);
    if (x === 0 && z === 6) assert.ok(!outside(old), 'o freeSpot antigo deixava o ponto na escadaria');
  }
  const src = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(src, /function spawnPickup\(kind:MapPickup\['kind'\],x:number,z:number\)\{[\s\S]*?else \(\{x,z\}=solids\.safeSpot\(x,z\)\);/);
});
