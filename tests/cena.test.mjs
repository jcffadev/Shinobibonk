// Cena (Three.js sem renderizar): corpo caído do Mega Elite, áreas das técnicas e ímã de drops.
// Three.js roda no Node; só o canvas 2D das texturas é simulado (installCanvasStub). Nenhum navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { load, installCanvasStub, memoryStorage } from './helpers/load.mjs';
import { collectedXp, magnetSpeed, xpCollectedAtPortal, GLOBAL_PULL_SECONDS } from '../src/game/drops.ts';

import { COLLISION_RULES, createSolids } from '../src/scene/collision.ts';

installCanvasStub();
globalThis.localStorage ??= memoryStorage();
const F = await load('/src/scene/fallenShinobi.ts');
const A = await load('/src/scene/techniqueAreas.ts');
const B = await load('/src/scene/rewardBeacon.ts');

const flat = () => 0;
function body(extra = {}) {
  const scene = new THREE.Scene();
  const b = F.createFallenBody({ scene, map: new THREE.Texture(), width: 1.2, height: 1.8, x: 5, z: 0, ground: flat, color: '#ff4d6d', right: new THREE.Vector3(1, 0, 0), awayFrom: new THREE.Vector3(0, 0, 0), ...extra });
  return { scene, b };
}
function run(b, seconds, hidden = false, step = 1 / 60) { for (let t = 0; t < seconds; t += step) b.update(step, hidden); }

test('Mega Elite caído: cambaleia → cai → assenta → fica deitado, nos tempos de FALLEN_TIMING', () => {
  const { b } = body(), T = F.FALLEN_TIMING;
  assert.equal(b.debug().phase, 'stagger');
  run(b, (T.stagger + T.fall) / 2); assert.equal(b.debug().phase, 'fall');
  run(b, T.settle - (T.stagger + T.fall) / 2 - .05); assert.equal(b.debug().phase, 'settle');
  run(b, .2); assert.equal(b.debug().phase, 'down');
  assert.ok(Math.abs(b.debug().angle - Math.PI / 2) < 1e-3, `deitado a 90°: ${b.debug().angle}`);
  run(b, 30); assert.equal(b.debug().phase, 'down', 'continua deitado até ser capturado');
});

test('luz do corpo caído: aparece ao chegar ao chão, pulsa suave e nunca estoura', () => {
  const { b } = body();
  assert.equal(b.debug().halo, 0, 'sem luz enquanto está em pé');
  run(b, F.FALLEN_TIMING.settle + .1);
  let min = 1, max = 0;
  for (let i = 0; i < 400; i++) { b.update(1 / 60, false); const h = b.debug().halo; min = Math.min(min, h); max = Math.max(max, h); }
  assert.ok(min >= .45, `sempre visível (mín ${min})`);
  assert.ok(max <= .75, `nada muito brilhoso (máx ${max})`);
  assert.ok(max - min > .05, 'pulsa');
});

test('luz no modo H (efeitos reduzidos): continua visível, fixa e sem facho', () => {
  const { b } = body();
  run(b, F.FALLEN_TIMING.settle + 1, true);
  assert.ok(b.debug().halo >= .4, `halo mínimo com H: ${b.debug().halo}`);
  assert.equal(b.debug().beam, 0);
});

test('área de captura do corpo caído: raio do E (10 m), aparece no chão, pulsa e não estoura', () => {
  const { b } = body();
  assert.equal(b.debug().area, 0, 'sem área enquanto está em pé');
  assert.equal(b.debug().areaRadius, 10, 'mesmo raio do E');
  run(b, F.FALLEN_TIMING.settle + .1);
  let min = 1, max = 0, beam = 0;
  for (let i = 0; i < 400; i++) { b.update(1 / 60, false); const d = b.debug(); min = Math.min(min, d.area); max = Math.max(max, d.area); beam = Math.max(beam, d.beam); }
  assert.ok(min >= .45, `área sempre visível (mín ${min})`);
  assert.ok(max <= .7, `área sem estourar (máx ${max})`);
  assert.ok(beam >= .4 && beam <= .5, `facho de luz forte e sem estourar (${beam})`);
  assert.equal(body({ areaRadius: 6 }).b.debug().areaRadius, 6);
});

test('área de captura no modo H: fica visível e fixa', () => {
  const { b } = body();
  run(b, F.FALLEN_TIMING.settle + 1, true);
  const a = b.debug().area;
  b.update(.7, true);
  assert.ok(a >= .35, `área com H: ${a}`);
  assert.equal(b.debug().area, a, 'sem pulsação');
});

test('farol do pergaminho grátis (drop de boss / G): facho alto, visível desde que cai, pulsa e não estoura', () => {
  const scene = new THREE.Scene();
  const b = B.createRewardBeacon(scene, 4, 2, flat, .7);
  assert.ok(b.debug().height >= 25, `facho alto para ser visto no mapa todo: ${b.debug().height}`);
  assert.ok(b.debug().beam >= .4, 'aceso desde o primeiro quadro');
  let min = 1, max = 0;
  for (let i = 0; i < 300; i++) { b.update(1 / 60, false); const d = b.debug(); min = Math.min(min, d.beam); max = Math.max(max, d.beam); assert.ok(d.glow > 0 && d.glow <= .85); }
  assert.ok(max <= .6, `sem estourar (máx ${max})`);
  assert.ok(max - min > .05, 'pulsa');
  b.update(1 / 60, true);
  assert.ok(b.debug().beam >= .25, 'modo H mantém o facho');
  assert.equal(b.debug().glow, 0, 'modo H sem brilho extra');
  b.dispose();
  assert.equal(scene.children.length, 0, 'dispose limpa a cena');
});

test('pergaminho grátis: farol e marcação no minimapa, no Tab e no M sem precisar ser visto', async () => {
  const fs = await import('node:fs');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.match(canvas, /if\(kind==='sealDrop'\)\{const pickup=pickups\.at\(-1\)!;pickup\.discovered=true;beacons\.set\(pickup,createRewardBeacon\(/);
  assert.match(canvas, /discovered=p\.discovered\|\|p\.kind==='sealDrop'/, 'save restaurado mantém a marcação');
  const overlay = fs.readFileSync(new URL('../src/ui/MapOverlay.tsx', import.meta.url), 'utf8');
  assert.match(overlay, /pk\.kind === 'sealDrop' \|\| dist\(world, pk\.x, pk\.z\) < 30/, 'minimapa mostra o pergaminho a qualquer distância');
});

test('corpo cai para longe do jogador e fica dentro do alcance de captura (10 m)', () => {
  const { b } = body();
  assert.ok(b.position.x > 5, 'jogador à esquerda → cai para a direita');
  assert.ok(Math.hypot(b.position.x, b.position.z) <= 10, 'continua alcançável');
  const left = body({ x: -5, awayFrom: new THREE.Vector3(0, 0, 0) }).b;
  assert.ok(left.position.x < -5, 'jogador à direita → cai para a esquerda');
});

test('save restaurado (instant): já aparece deitado no ponto salvo', () => {
  const { b } = body({ instant: true, x: 3, z: 4 });
  run(b, F.FALLEN_TIMING.settle + .1);
  assert.equal(b.debug().phase, 'down');
  assert.deepEqual([b.position.x, b.position.z], [3, 4]);
});

test('dispose remove tudo da cena', () => {
  const { scene, b } = body();
  assert.ok(scene.children.length > 0);
  b.dispose();
  assert.equal(scene.children.length, 0);
});

test('áreas das técnicas: o cone desenhado usa o MESMO ângulo do acerto (CONE_COS)', async () => {
  const fs = await import('node:fs');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(/dot\(direction\)>CONE_COS/.test(canvas), 'acerto do Cone lê CONE_COS');
  assert.ok(!/dot\(direction\)>\.65/.test(canvas), 'sem número solto duplicado');
  assert.equal(A.CONE_COS, .65);
});

test('áreas das técnicas: marca, expira no tempo certo e reaproveita fatias (sem alocar)', () => {
  const scene = new THREE.Scene(), areas = A.createTechniqueAreas(scene, flat);
  const tech = s => ({ name: 'T', shape: s, element: 'Fogo', school: 'Ninjutsu', color: '#f00', power: 1, range: 4, cooldown: 1, statusChance: 0, unlockLevel: 1 });
  const v = (x, z) => new THREE.Vector3(x, 0, z);
  const geometry = scene.children[0]?.geometry, vertices = geometry?.attributes.position.count;
  for (const shape of ['Área', 'Cone', 'Linha', 'Órbita', 'Corpo a corpo']) areas.mark(tech(shape), v(0, 0), v(1, 0), v(2, 0), 2, 4, .6);
  assert.equal(areas.stats().active, 5);
  areas.update(.3); assert.equal(areas.stats().active, 5, 'ainda visíveis em 0,3 s');
  areas.update(.2); assert.equal(areas.stats().active, 0, 'somem depois de ~0,42 s');
  for (let i = 0; i < 500; i++) areas.mark(tech('Área'), v(0, 0), v(1, 0), v(0, 0), 1, 1, 0);
  assert.ok(areas.stats().active <= areas.stats().slots, `no máximo ${areas.stats().slots} ao mesmo tempo`);
  if (geometry) assert.equal(geometry.attributes.position.count, vertices, 'a geometria não cresce');
  areas.dispose();
  assert.equal(scene.children.length, 0);
});

test('ímã do morro: drop de qualquer distância chega em ≤ 1,2 s; ímã normal não é afetado', () => {
  assert.equal(GLOBAL_PULL_SECONDS, 1.2);
  for (const distance of [1, 10, 70, 160]) {
    // Simula o voo como o jogo faz: acelera e anda min(dist, speed·dt) por quadro.
    let d = distance, speed = 3.6, t = 0; const dt = 1 / 60;
    while (d > 0 && t < 5) { speed += 30 * dt; speed = magnetSpeed(speed, d, true); d -= Math.min(d, speed * dt); t += dt; }
    assert.ok(t <= GLOBAL_PULL_SECONDS + dt, `${distance} m em ${t.toFixed(2)} s`);
  }
  assert.equal(magnetSpeed(4, 100, false), 4, 'sem ímã global, a velocidade é a do ímã normal');
});

test('portal conserva só o XP em coleta ou perto, com os multiplicadores da coleta normal', () => {
  const drops = [
    {type:'xp', magnet:true, distance:12, value:11},
    {type:'xp', magnet:false, distance:2, value:8},
    {type:'xp', magnet:false, distance:4, value:15},
    {type:'ryu', magnet:true, distance:1, value:5},
  ];
  const atPortal = drops.filter(d => xpCollectedAtPortal(d.type, d.magnet, d.distance, 2.5));
  assert.equal(atPortal.reduce((xp,d) => xp + collectedXp(d.value, 1.25, 1.1), 0), 26);
  assert.equal(xpCollectedAtPortal('xp', false, 2.5, 2.5), false);
});

test('colisão de marco grande termina a 3 m e casa mantém a base sólida', () => {
  const solids = createSolids();
  solids.addBuilding(0, 0, 22);
  solids.addBuilding(15, 0, 5.5);
  solids.add(30, 0, COLLISION_RULES.scenery[0]);
  for (const x of [0,15]) {
    const far = {x, z:4};
    const near = {x, z:.5};
    assert.equal(solids.resolve(far), false);
    assert.equal(solids.resolve(near), true);
    assert.ok(near.z > 1);
  }
  assert.equal(solids.big[0].r, 3);
  assert.equal(solids.big[1].r, .99);
  assert.equal(solids.resolveBig({x:30,z:.2}), false);
  assert.equal(solids.resolve({x:30,z:.2}), true);
});

test('fade usa profundidade e sobreposição da câmera, sem atingir inimigos atrás ou ao lado', async () => {
  const {focusOpacity,setFocusView}=await import('../src/scene/playerFocus.ts');
  const view=new Float64Array(9),camera=new THREE.OrthographicCamera();
  camera.position.set(8,4,8);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  setFocusView(view,camera.matrixWorld.elements);
  const player=new THREE.Vector3(),size={x:1.5,y:2};
  const front=new THREE.Vector3(...view.slice(6)).multiplyScalar(2);
  const left=new THREE.Vector3(...view.slice(0,3)).multiplyScalar(3);
  assert.ok(Math.abs(focusOpacity(view,player,size,front,size)-.28)<.0001);
  assert.equal(focusOpacity(view,player,size,front.negate(),size),1);
  assert.equal(focusOpacity(view,player,size,left,size),1);
});

test('barra de HP pode aparecer sobre o chão e desaparecer quando uma encosta cobre o ator', async () => {
  const {terrainOccludesActor}=await load('/src/scene/terrainArt.ts');
  const hill=(x,z)=>z>=2&&z<=4?2:0;
  assert.equal(terrainOccludesActor(0,.45,0,0,.11,20,()=>0),false);
  assert.equal(terrainOccludesActor(0,.45,0,0,.11,20,hill),true);
  assert.equal(terrainOccludesActor(0,.45,0,Math.PI,.11,20,hill),false);
  assert.equal(terrainOccludesActor(0,.45,0,0,.90,20,hill),false);
});

test('terreno em terraços baixos, plano no centro, montanhas só no horizonte (rodada 85)', async () => {
  const { groundHeight, TERRAIN, terrace } = await load('/src/scene/terrainArt.ts');
  const { MAP_SIZE } = await load('/src/game/worldScale.ts');
  assert.equal(terrace(TERRAIN.step * 1.3), TERRAIN.step, 'meio do degrau é platô');
  assert.ok(terrace(TERRAIN.step * .99) > TERRAIN.step * .9, 'a encosta sobe até o próximo nível');
  const horizons = {};
  for (const map of ['folha', 'areia', 'pedra', 'nevoa']) {
    let max = 0, flat = 0, steep = 0, raised = 0, n = 0;
    const half = MAP_SIZE / 2 - 4;
    for (let x = -half; x <= half; x += 2) for (let z = -half; z <= half; z += 2) {
      const h = groundHeight(map, x, z), slope = Math.hypot(groundHeight(map, x + .5, z) - h, groundHeight(map, x, z + .5) - h) / .5;
      n++; max = Math.max(max, h); if (slope < .05) flat++; if (slope > .55) steep++; if (h > .5) raised++;
    }
    let horizon = 0;
    for (let a = 0; a < 6.28; a += .1) for (let r = 84; r < 140; r += 3) horizon = Math.max(horizon, groundHeight(map, Math.cos(a) * r, Math.sin(a) * r));
    assert.ok(max < 5, `${map}: sem montanha grande dentro do mapa (${max.toFixed(2)} m)`);
    assert.ok(flat / n > .6 && steep / n > .015, `${map}: platôs ${(flat / n * 100).toFixed(0)}% e encostas ${(steep / n * 100).toFixed(1)}%`);
    assert.ok(raised / n > .3, `${map}: terraços acima do chão em ${(raised / n * 100).toFixed(0)}%`);
    assert.ok(horizon > max && horizon < 8, `${map}: horizonte ${horizon.toFixed(1)} m`);
    horizons[map] = horizon;
    assert.ok(Math.abs(groundHeight(map, 0, 0)) < .05 && Math.abs(groundHeight(map, 6, 6) - groundHeight(map, 0, 0)) < .05, 'o ninja começa no plano');
  }
  // Rodada 87: cada vila com seu horizonte — Pedra mais alta e pontuda; Areia em paredão de topo reto.
  const { horizonProfile } = await load('/src/scene/terrainArt.ts');
  const ring = map => Array.from({ length: 360 }, (_, i) => horizonProfile(map, i * Math.PI / 180, 0));
  const spread = v => Math.max(...v) - Math.min(...v);
  assert.ok(horizons.pedra > horizons.areia && horizons.pedra > horizons.folha, 'Iwagakure tem os picos mais altos');
  assert.ok(spread(ring('areia')) < 4 && spread(ring('pedra')) > 15 && spread(ring('nevoa')) > 15, 'Suna: platô reto; Iwa e Kiri: picos');
  assert.ok(horizonProfile('areia', 0, 10) > horizonProfile('areia', 0, 0) * .99 && horizonProfile('areia', 0, 16) === 0, 'paredão de Suna com topo largo e borda íngreme');
});

test('chão plano sob as construções da Folha, mesmo com terraços (rodada 86)', async () => {
  const { groundHeight, LEAF_PLACES, LEAF_BUILDINGS } = await load('/src/scene/terrainArt.ts');
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  for (const [x, z] of LEAF_BUILDINGS) {
    assert.ok(canvas.includes(`${x},${z}`) || canvas.includes(`x:${x},z:${z}`), `${x},${z} é um ponto de construção do jogo`);
    const place = LEAF_PLACES.find(p => Math.abs(x - p.x) + 3 <= p.rx && Math.abs(z - p.z) + 3 <= p.rz);
    assert.ok(place, `${x},${z} dentro de uma área plana`);
    const center = groundHeight('folha', x, z);
    for (const [dx, dz] of [[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2]])
      assert.ok(Math.abs(groundHeight('folha', x + dx, z + dz) - center) < .02, `construção em ${x},${z} sem desnível`);
  }
});

test('mapas com o nome da obra e zonas dentro da vila (rodada 87)', async () => {
  const { MAP_BY_ID } = await load('/src/game/maps.ts');
  assert.equal(MAP_BY_ID.folha.name, 'Konohagakure · Vila Oculta da Folha');
  assert.equal(MAP_BY_ID.areia.name, 'Sunagakure · Vila Oculta da Areia');
  assert.equal(MAP_BY_ID.pedra.name, 'Iwagakure · Vila Oculta da Pedra');
  assert.equal(MAP_BY_ID.nevoa.name, 'Kirigakure · Vila Oculta da Névoa');
  const zones = Object.values(MAP_BY_ID).flatMap(m => m.zones.map(z => z.name));
  assert.ok(!zones.some(z => /Kannabi|Tazuna/.test(z)), 'Ponte Kannabi (País da Grama) e Ponte de Tazuna (País das Ondas) não ficam nas vilas');
});

test('pé do personagem nunca afunda no chão, em todos os mapas e personagens (rodada 88)', async () => {
  const { footHeight, FOOT_RADIUS } = await load('/src/scene/heightField.ts');
  const { groundHeight } = await load('/src/scene/terrainArt.ts');
  assert.equal(footHeight(() => 2, 3, 4), 2, 'no plano não muda nada');
  const step = (x) => (x > .2 ? 1.2 : 0);
  assert.equal(footHeight(step, 0, 0), 1.2, 'na beira do degrau fica no nível de cima');
  for (const map of ['folha', 'areia', 'pedra', 'nevoa']) {
    for (let x = -60; x <= 60; x += 3.7) for (let z = -60; z <= 60; z += 4.1) {
      const stand = footHeight((a, b) => groundHeight(map, a, b), x, z);
      for (const [dx, dz] of [[FOOT_RADIUS, 0], [-FOOT_RADIUS, 0], [0, FOOT_RADIUS], [0, -FOOT_RADIUS]])
        assert.ok(groundHeight(map, x + dx, z + dz) <= stand + 1e-9, `${map} ${x},${z}: chão acima do pé`);
    }
  }
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(!/terrainHeight\([^()]*\)\+\w+(?:\.\w+)*\.scale\.y\*/.test(canvas), 'todo personagem usa standHeight');
  assert.ok((canvas.match(/standHeight\(/g) ?? []).length >= 18);
  assert.ok(canvas.includes('groundLook.material.polygonOffset=true'), 'o chão recua na profundidade');
});

test('água: lagos e rios cavados em todos os mapas, longe do começo e das construções, e o ninja anda sobre ela (rodada 89)', async () => {
  const { WATER, WATER_BODIES, waterSurfaceAt, waterDistance } = await load('/src/scene/water.ts');
  const { groundHeight, LEAF_BUILDINGS, REGIONAL_PLACES } = await load('/src/scene/terrainArt.ts');
  const { MAP_SIZE } = await load('/src/game/worldScale.ts');
  for (const map of ['folha', 'areia', 'pedra', 'nevoa']) {
    assert.ok(WATER_BODIES[map].length >= 2, `${map}: tem água`);
    let under = 0;
    for (let x = -76; x <= 76; x += 1) for (let z = -76; z <= 76; z += 1) if (groundHeight(map, x, z) < WATER.level) {
      under++;
      assert.equal(waterSurfaceAt(map, x, z), WATER.level, `${map} ${x},${z}: chão abaixo da água tem superfície`);
    }
    assert.ok(under > 60, `${map}: ${under} m² de água`);
    assert.ok(waterDistance(map, 0, 0).outside > 15, `${map}: o começo fica longe da água`);
    const spots = map === 'folha' ? LEAF_BUILDINGS : REGIONAL_PLACES.map(p => [p.x, p.z]);
    for (const [x, z] of spots) assert.ok(waterDistance(map, x, z).outside > 8, `${map}: construção em ${x},${z} longe da água`);
    for (const body of WATER_BODIES[map]) if (body.kind === 'lake') assert.ok(Math.abs(body.x) + body.rx < MAP_SIZE / 2 - 4 && Math.abs(body.z) + body.rz < MAP_SIZE / 2 - 4, 'lago dentro do mapa');
  }
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('Math.max(footHeight(terrainHeight,x,z),waterSurfaceAt(MAP.id,x,z))'), 'de pé na superfície');
  assert.ok(canvas.includes('const water=createWater(scene,MAP.id,terrainHeight)'), 'malha da água na cena');
  assert.ok(canvas.includes('waterDistance(MAP.id,x,z).outside<1.5)continue;'), 'sem árvore dentro da água');
});

test('paisagem de fundo com a cara de cada vila e câmera que mostra o horizonte (rodada 89)', async () => {
  const { LANDSCAPE, LANDSCAPE_SHAPES } = await load('/src/scene/landscape.ts');
  const { CAMERA_VIEW } = await load('/src/game/settings.ts');
  const sample = f => Array.from({ length: 720 }, (_, i) => f(i / 720));
  const spread = v => Math.max(...v) - Math.min(...v);
  const distinct = v => new Set(v.map(x => x.toFixed(3))).size;
  assert.ok(distinct(sample(LANDSCAPE_SHAPES.areia.far)) <= 6, 'Suna: mesas de topo reto (poucos níveis)');
  assert.ok(spread(sample(LANDSCAPE_SHAPES.pedra.far)) > spread(sample(LANDSCAPE_SHAPES.folha.far)), 'Iwa mais pontuda que Konoha');
  const kiri = sample(LANDSCAPE_SHAPES.nevoa.far), base = Math.min(...kiri);
  assert.ok(kiri.filter(v => v > base + .3).length < kiri.length * .2, 'Kiri: agulhas finas');
  for (const map of Object.keys(LANDSCAPE_SHAPES)) for (const v of [...sample(LANDSCAPE_SHAPES[map].far), ...sample(LANDSCAPE_SHAPES[map].near)]) assert.ok(v >= 0 && v <= 1.2, map + ' dentro da faixa');
  assert.ok(Math.abs(LANDSCAPE_SHAPES.pedra.far(0) - LANDSCAPE_SHAPES.pedra.far(1)) < 1e-9, 'dá a volta sem emenda');
  assert.ok(LANDSCAPE.radius > 200 && LANDSCAPE.radius < 300, 'atrás do relevo da borda e dentro do far da câmera');
  assert.ok(CAMERA_VIEW.fov / 2 * Math.PI / 180 > CAMERA_VIEW.pitch, 'o topo da tela passa do horizonte');
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('const landscape=createLandscape(scene,MAP.id)'), 'paisagem na cena');
});

test('água mexe onde o ninja pisa e os pés brilham com chakra azul (rodada 91)', async () => {
  const { RIPPLES, rippleRadius } = await load('/src/scene/water.ts');
  assert.equal(rippleRadius(-1), 0); assert.equal(rippleRadius(RIPPLES.life + .01), 0, 'a onda some');
  assert.ok(rippleRadius(1) > rippleRadius(.2), 'a onda cresce');
  assert.ok(RIPPLES.step > .15 && RIPPLES.step < .6, 'uma onda por passo');
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('if(wasAirborne){water.ripple(player.position.x,player.position.z,1)'), 'pouso do pulo faz onda forte');
  assert.ok(canvas.includes('else if(moving&&rippleTimer<=0){water.ripple('), 'andar faz ondas');
  assert.ok(canvas.includes('chakraFeet.update(player.position.x,player.position.z,onWater&&!airborne'), 'brilho só com os pés na água');
  const water = (await import('node:fs')).readFileSync(new URL('../src/scene/water.ts', import.meta.url), 'utf8');
  assert.ok(water.includes("color: '#6fd8ff'") && water.includes('AdditiveBlending'), 'brilho azul de chakra');
  assert.ok(water.includes('PARA O CODEX APRIMORAR'), 'anotado o que falta');
});

test('pergaminhos no chão com vários desenhos da obra (rodada 92)', async () => {
  const D = await load('/src/scene/dropSprites.ts');
  assert.ok(D.SCROLL_STYLES.length >= 6, 'vários estilos');
  const names = new Set(D.SCROLL_STYLES.map(s => s.name)), kanji = new Set(D.SCROLL_STYLES.map(s => s.kanji));
  assert.equal(names.size, D.SCROLL_STYLES.length); assert.equal(kanji.size, D.SCROLL_STYLES.length, 'cada um com seu kanji');
  assert.ok(D.SCROLL_STYLES.some(s => !s.open) && D.SCROLL_STYLES.some(s => s.open), 'abertos e fechados');
  assert.ok(['天', '地'].every(k => kanji.has(k)), 'Céu e Terra do exame Chunin');
  assert.equal(D.scrollStyle(D.SCROLL_STYLES.length + 2), D.SCROLL_STYLES[2], 'índice dá a volta');
  const a = D.makeDropSprite('kunai', 1, 3), b = D.makeDropSprite('kunai', 1, 3), c = D.makeDropSprite('kunai', 1, 4);
  assert.equal(a.material, b.material, 'mesmo estilo compartilha material');
  assert.notEqual(a.material, c.material, 'estilos diferentes, desenhos diferentes');
  assert.equal(D.makeDropSprite('item', 5).material, D.makeDropSprite('item', 5).material, 'outros drops não mudam');
});

test('Pedra Memorial de Konoha numa clareira plana (rodada 92)', async () => {
  const { MEMORIAL } = await load('/src/scene/memorialStone.ts');
  const { groundHeight, LEAF_BUILDINGS } = await load('/src/scene/terrainArt.ts');
  const { waterDistance } = await load('/src/scene/water.ts');
  assert.ok(LEAF_BUILDINGS.some(([x, z]) => x === MEMORIAL.x && z === MEMORIAL.z), 'na lista de construções (chão plano)');
  const h = groundHeight('folha', MEMORIAL.x, MEMORIAL.z);
  for (const [dx, dz] of [[6, 0], [-6, 0], [0, 6], [0, -6]]) assert.ok(Math.abs(groundHeight('folha', MEMORIAL.x + dx, MEMORIAL.z + dz) - h) < .02, 'clareira plana');
  assert.ok(waterDistance('folha', MEMORIAL.x, MEMORIAL.z).outside > 10 && Math.hypot(MEMORIAL.x, MEMORIAL.z) > 20, 'longe da água e do começo');
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('memorial=createMemorialSprite()') && canvas.includes('[x,z]=[-38,-26]'), 'a pedra está na Folha');
});

test('carregamento: chão pintado pela grade de alturas fica igual à fórmula exata e bem mais rápido (rodada 95)', async () => {
  const { paintGround, groundHeight, RENDERED_GROUND_SIZE } = await load('/src/scene/terrainArt.ts');
  const { createHeightField } = await load('/src/scene/heightField.ts');
  const { MAP_BY_ID } = await load('/src/game/maps.ts');
  for (const id of ['folha', 'nevoa']) {
    const map = MAP_BY_ID[id], size = 256;
    const grid = createHeightField((x, z) => groundHeight(id, x, z), RENDERED_GROUND_SIZE / 2);
    let t = performance.now(); const exact = paintGround(map, undefined, size); const exactMs = performance.now() - t;
    t = performance.now(); const fast = paintGround(map, grid, size); const fastMs = performance.now() - t;
    let same = 0; for (let i = 0; i < exact.surfaces.length; i++) if (exact.surfaces[i] === fast.surfaces[i]) same++;
    let color = 0; for (let i = 0; i < exact.data.length; i++) color += Math.abs(exact.data[i] - fast.data[i]);
    assert.ok(same / exact.surfaces.length > .995, `${id}: superfícies iguais em ${(same / exact.surfaces.length * 100).toFixed(2)}%`);
    assert.ok(color / exact.data.length < 2, `${id}: cor média difere ${(color / exact.data.length).toFixed(2)}`);
    assert.ok(fastMs < exactMs, `${id}: grade ${fastMs.toFixed(0)} ms × exata ${exactMs.toFixed(0)} ms`);
  }
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('createGroundMaterial(MAP,terrainHeight)') && canvas.includes(',RENDERED_GROUND_SIZE/2);'), 'o jogo usa a grade');
});


test('Susanoo do Madara: quadros se fundem, sobe do chão, avança no golpe e dissolve subindo (rodada 99)', async () => {
  const { susanooPaintedLook, SUSANOO_FRAMES } = await load('/src/scene/susanooFx.ts');
  assert.deepEqual([...SUSANOO_FRAMES], [0, .09, .17, .22]);
  assert.equal(susanooPaintedLook(0, 1).frame, 0); assert.equal(susanooPaintedLook(.3, 1).frame, 3, 'golpe a partir de 0,22 s (acerto)');
  const before = susanooPaintedLook(.08, 1); assert.ok(before.frame === 0 && before.blend > .5 && before.blend < 1, 'fundindo no quadro seguinte');
  assert.equal(susanooPaintedLook(.5, 1).blend, 0, 'último quadro sem fusão');
  assert.ok(susanooPaintedLook(0, 1).rise < susanooPaintedLook(.2, 1).rise, 'sobe do chão');
  assert.ok(susanooPaintedLook(0, 1).size < susanooPaintedLook(.2, 1).size, 'cresce ao se formar');
  assert.ok(susanooPaintedLook(.32, 1).lunge > .3 && susanooPaintedLook(.05, 1).lunge === 0, 'avança no golpe');
  assert.ok(susanooPaintedLook(.98, 1).rise > susanooPaintedLook(.6, 1).rise, 'dissolve subindo');
});

test('água: respingos, ondas de inimigos e aliados e chakra no ritmo dos passos (rodada 99)', async () => {
  const { RIPPLES, SPLASH } = await load('/src/scene/water.ts');
  assert.equal(RIPPLES.max, 16); assert.ok(SPLASH.pool >= 120 && SPLASH.othersMax >= 4);
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('splashes.burst(player.position.x,footY,player.position.z,16,1.4)'), 'respingo forte no pouso');
  assert.ok(canvas.includes('else if(slideTime>0&&rippleTimer<=0){water.ripple('), 'dash na água');
  assert.ok(canvas.includes("water.ripple(a.position.x,a.position.z,.35);made++;"), 'outros atores fazem ondas');
  assert.ok(canvas.includes('chakraFeet.step();'), 'chakra pulsa no passo');
  assert.ok(canvas.includes('splashes.update(dt);'));
});
