import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { installCanvasStub,load } from './helpers/load.mjs';

installCanvasStub();
THREE.TextureLoader.prototype.load = function () { return new THREE.Texture(); };
const { VILLAGES, insideVillage, missionMapLayout, villageDeck, villageEventSite, villageCanalX, villageSurface }=await load('/src/scene/villageLayout.ts');
const { createVillageGround, villageWater }=await load('/src/scene/villageTerrain.ts');
const { VILLAGE_LOTS }=await load('/src/scene/villageDistricts.ts');
const { createVillageScenery }=await load('/src/scene/villageScenery.ts');
const { createVillageTraversal }=await load('/src/scene/villageTraversal.ts');
const { createSolids, COLLISION_RULES }=await load('/src/scene/collision.ts');
const { foundationDistance }=await load('/src/scene/villageCollision.ts');
const { WATER, WATER_BODIES, waterSurfaceAt }=await load('/src/scene/water.ts');
const { MAP_BY_ID }=await load('/src/game/maps.ts');
const sceneFixture=new Map();

function sceneFor(map) {
  const cached=sceneFixture.get(map);
  if(cached)return cached;
  const layout=VILLAGES[map],waters=villageWater(map),ground=createVillageGround(layout,waters);
  const solids=createSolids();
  const scene=new THREE.Scene();
  const scenery=createVillageScenery(scene,MAP_BY_ID[map],layout,ground,waters,solids,
    ()=>new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.Texture()})));
  const result={layout,waters,ground,solids,scenery,scene};
  sceneFixture.set(map,result);
  return result;
}

function explore(solids,from= {x:0,z:0}) {
  const queue=[from],seen=new Set([`${from.x},${from.z}`]);
  for(let n=0;n<queue.length;n++) {
    const p=queue[n];
    for(const [dx,dz] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const x=p.x+dx,z=p.z+dz,key=`${x},${z}`;
      if(x< -43||x>43||z< -73||z>9||seen.has(key)||!solids.isFree(x,z,.2))continue;
      seen.add(key);queue.push({x,z});
    }
  }
  return seen;
}

test('novas partidas usam as vilas e uma partida antiga retoma em mapas_basicos',()=>{
  assert.equal(missionMapLayout(null),'vilas');
  assert.equal(missionMapLayout({}),'mapas_basicos');
  assert.equal(missionMapLayout({mapLayout:'mapas_basicos'}),'mapas_basicos');
  assert.equal(missionMapLayout({mapLayout:'vilas'}),'vilas');
  const canvas=readFileSync(new URL('../src/scene/GameCanvas.tsx',import.meta.url),'utf8');
  assert.match(canvas,/mapLayout:MapLayout=enabledRef.current\?missionMapLayout\(resume\):'mapas_basicos'/);
  assert.match(canvas,/surfaceElevation:traversal.elevation/);
  assert.match(canvas,/villageActive=false;traversal.reset\(\)/);
});

for(const map of Object.keys(VILLAGES))test(`${map} permite atravessar entrada e ir às praças e aos eventos`,()=>{
  const {layout,ground,waters,solids,scenery}=sceneFor(map);
  assert.ok(Math.abs(ground(0,0))<.5);
  for(let z=2;z>=layout.entry.z-1;z--)assert.ok(solids.isFree(layout.entry.x,z,.27),`entrada em z=${z}`);
  const seen=explore(solids);
  assert.ok(seen.has(`${layout.plaza.x},${layout.plaza.z}`));
  const connected=[...seen].filter(key=>{
    const [x,z]=key.split(',').map(Number);
    return insideVillage(layout,x,z);
  });
  assert.ok(connected.length>900,`piso conectado: ${connected.length} m² amostrados`);
  const available=layout.sites.filter(site=>solids.isFree(site.x,site.z,2.5)
    &&waterSurfaceAt(map,site.x,site.z,waters)===-Infinity
    &&seen.has(`${site.x},${site.z}`));
  assert.ok(available.length>=7,`pontos de evento livres: ${available.length}`);
  const chosen=villageEventSite(layout,4,site=>available.includes(site));
  assert.ok(chosen&&insideVillage(layout,chosen.x,chosen.z));
  const placements=[];
  for(let i=0;i<12;i++){
    const site=villageEventSite(layout,i,p=>solids.isFree(p.x,p.z,2.5)
      &&waterSurfaceAt(map,p.x,p.z,waters)===-Infinity
      &&seen.has(`${p.x},${p.z}`)
      &&placements.every(previous=>Math.hypot(p.x-previous.x,p.z-previous.z)>6));
    if(site)placements.push(site);
  }
  assert.equal(placements.length,12,'NPCs e eventos cabem em rotas acessíveis dentro da vila');
  assert.equal(villageSurface(layout,layout.plaza.x,layout.plaza.z),'plaza');
  const buildings=scenery.root.children.filter(mesh=>mesh.name==='village-architecture');
  const vertices=buildings.reduce((sum,mesh)=>sum+mesh.geometry.attributes.position.count,0);
  assert.ok(VILLAGE_LOTS[map].length>=35);
  assert.ok(vertices>10000&&buildings.every(mesh=>mesh.isMesh&&mesh.material.map));
  for(const lot of VILLAGE_LOTS[map]){
    assert.equal(solids.isFree(lot.x,lot.z,0),false,'o corpo visível da casa tem colisão');
  }
  sceneFor(map).scene.updateMatrixWorld(true);
  const poses=buildings.map(mesh=>mesh.matrixWorld.clone());
  const camera=new THREE.PerspectiveCamera();
  camera.position.set(15,8,-22);camera.lookAt(0,0,-28);
  sceneFor(map).scene.updateMatrixWorld(true);
  assert.ok(buildings.every((mesh,i)=>mesh.matrixWorld.equals(poses[i])),'câmera não gira fachadas');
});

test('colisão atual usa o limite do muro e o contato redondo do tronco',()=>{
  const solids=createSolids();
  solids.addBox(0,0,2,.5,2.4);
  solids.add(9,0,.33,false,3.8);
  const side={x:2.11,z:.69};
  assert.equal(solids.resolve(side),false,'canto fora do círculo do pé');
  const touched={x:1,z:.57};
  assert.equal(solids.resolve(touched),true);
  assert.ok(Math.abs(touched.z-(.5+COLLISION_RULES.playerRadius))<.005);
  assert.equal(solids.resolve({x:1,z:.49},COLLISION_RULES.playerRadius,2.4),false,'já está acima');
  const trunk={x:9.37,z:0};
  assert.equal(solids.resolve(trunk),true);
  assert.ok(Math.abs(trunk.x-9.5)<.005);
});

test('segurar a direção sobe paredes retas e troncos; soltar a parede e retomar no telhado respeita o apoio',()=>{
  const solids=createSolids();
  const wall=solids.addBox(0,0,2,.5,3.6);
  solids.add(7,0,.43,false,2.9);
  const traversal=createVillageTraversal(solids.all);
  const player={x:0,z:.68},forward={x:0,z:-1};
  assert.equal(traversal.jump(player,{x:0,z:1},0),false);
  assert.equal(traversal.jump(player,forward,0),true);
  traversal.advance(player,{x:0,z:0},0,.1);
  assert.equal(traversal.elevation,0);
  for(let i=0;i<42;i++)traversal.advance(player,forward,0,1/60);
  assert.equal(traversal.elevation,3.6);
  assert.ok(foundationDistance(player.x,player.z,wall)<0);
  assert.equal(traversal.climbing,false);
  traversal.restore(player,3.6,0);
  assert.equal(traversal.elevation,3.6);
  player.z=3;
  for(let i=0;i<80;i++)traversal.advance(player,{x:0,z:1},0,1/60);
  assert.equal(traversal.elevation,0);
  Object.assign(player,{x:7,z:.6});
  assert.equal(traversal.jump(player,forward,0),true);
  traversal.advance(player,forward,0,.1);
  assert.ok(traversal.elevation>0);
  assert.equal(traversal.jump(player,forward,0),false);
  assert.equal(traversal.climbing,false);
});

test('Kiri cava um canal próprio: a ponte se apoia nas duas margens e passa acima da água',()=>{
  const village=sceneFor('nevoa');
  assert.equal(village.waters.length,WATER_BODIES.nevoa.length+1);
  for(const bridge of village.layout.bridges) {
    const x=villageCanalX(bridge.z),z=bridge.z;
    assert.ok(village.ground(x,z)<WATER.level);
    assert.equal(waterSurfaceAt('nevoa',x,z,village.waters),WATER.level);
    assert.ok(villageDeck(village.layout,village.ground,x,z)>WATER.level+.35);
    for(const side of [-1,1]){
      const end=x+bridge.halfSpan*side*.999999;
      assert.ok(Math.abs(villageDeck(village.layout,village.ground,end,z)-village.ground(end,z))<.13);
    }
  }
});

test('mapas novos mantêm o relevo interno baixo e horizonte proporcionado',()=>{
  for(const map of Object.keys(VILLAGES)) {
    const {ground}=sceneFor(map);
    let highest=0,ledge=0;
    for(let x=-74;x<=74;x+=2)for(let z=-74;z<=74;z+=2){
      const h=ground(x,z);
      highest=Math.max(highest,h);
      if(h>.8)ledge++;
    }
    assert.ok(highest<5,`${map}: ${highest}`);
    assert.ok(ledge>180,`${map}: ${ledge} amostras acima de .8 m`);
  }
});


test('escada de Konoha aceita o avanço a pé degrau por degrau e perde o apoio fora da escada',()=>{
  const {solids,ground}=sceneFor('folha');
  const x=7.85,z=-15.4;
  const start=ground(x,z+2);
  let feet=start;
  for(let i=0;i<8;i++){
    const p={x,z:z+1.89-i*.54};
    feet=solids.stairTop(p.x,p.z,feet);
    assert.ok(Math.abs(feet-start-(i+1)*.15)<.0001);
    assert.equal(solids.resolve(p,COLLISION_RULES.playerRadius,feet),false);
  }
  assert.equal(solids.stairTop(x+2,z,feet),-Infinity);
});
