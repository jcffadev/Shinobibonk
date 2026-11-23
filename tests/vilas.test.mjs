import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { installCanvasStub,load } from './helpers/load.mjs';

installCanvasStub();
THREE.TextureLoader.prototype.load = function () { return new THREE.Texture(); };
const { VILLAGES, createVillageLayout, shuffledVillageSites, insideVillage, missionMapLayout, villageDeck, villageCanalX, villageSurface }=await load('/src/scene/villageLayout.ts');
const { createVillageGround, villageWater }=await load('/src/scene/villageTerrain.ts');
const { VILLAGE_LOTS }=await load('/src/scene/villageDistricts.ts');
const { createVillageScenery }=await load('/src/scene/villageScenery.ts');
const { createVillageTraversal, moveVillageActor }=await load('/src/scene/villageTraversal.ts');
const { createSolids, COLLISION_RULES }=await load('/src/scene/collision.ts');
const { foundationDistance }=await load('/src/scene/villageCollision.ts');
const { WATER, WATER_BODIES, createWater, waterSurfaceAt }=await load('/src/scene/water.ts');
const { MAP_BY_ID }=await load('/src/game/maps.ts');
const { WORLD_LIMIT }=await load('/src/game/worldScale.ts');
const sceneFixture=new Map();

function sceneFor(map,seed=0) {
  const key=map+':'+seed;
  const cached=sceneFixture.get(key);
  if(cached)return cached;
  const layout=createVillageLayout(map,seed),waters=villageWater(map),ground=createVillageGround(layout,waters);
  const solids=createSolids();
  const scene=new THREE.Scene();
  const scenery=createVillageScenery(scene,MAP_BY_ID[map],layout,ground,waters,solids,
    ()=>new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.Texture()})));
  const result={layout,waters,ground,solids,scenery,scene};
  sceneFixture.set(key,result);
  return result;
}

function explore(solids,from={x:0,z:0},extent={x:43,north:-73,south:9}) {
  const queue=[from],seen=new Set([`${from.x},${from.z}`]);
  for(let n=0;n<queue.length;n++) {
    const p=queue[n];
    for(const [dx,dz] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const x=p.x+dx,z=p.z+dz,key=`${x},${z}`;
      if(Math.abs(x)>extent.x||z<extent.north||z>extent.south||seen.has(key)||!solids.isFree(x,z,.2))continue;
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
  assert.match(canvas,/mapLayout,villageSeed,surfaceElevation:traversal.elevation/);
  assert.match(canvas,/resume.villageSeed\?\?0/);
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
  const available=layout.sites.filter(site=>solids.isFree(site.x,site.z,2.5,true)
    &&waterSurfaceAt(map,site.x,site.z,waters)===-Infinity
    &&seen.has(`${site.x},${site.z}`));
  assert.ok(available.length>=7,`pontos de evento livres: ${available.length}`);
  const shuffled=shuffledVillageSites(layout,4);
  const chosen=shuffled.find(site=>available.includes(site));
  assert.ok(chosen&&insideVillage(layout,chosen.x,chosen.z));
  const placements=[];
  for(let i=0;i<12;i++){
    const site=shuffled.find(p=>solids.isFree(p.x,p.z,2.5,true)
      &&waterSurfaceAt(map,p.x,p.z,waters)===-Infinity
      &&seen.has(`${p.x},${p.z}`)
      &&placements.every(previous=>Math.hypot(p.x-previous.x,p.z-previous.z)>6));
    if(site)placements.push(site);
  }
  assert.equal(placements.length,12,'NPCs e eventos cabem em rotas acessíveis dentro da vila');
  assert.equal(villageSurface(layout,layout.plaza.x,layout.plaza.z),'plaza');
  const buildings=scenery.root.children.filter(mesh=>mesh.name==='village-architecture');
  const vertices=buildings.reduce((sum,mesh)=>sum+mesh.geometry.attributes.position.count,0);
  assert.ok(layout.lots.length>=VILLAGE_LOTS[map].length);
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
  solids.addBox(9,8,1,.5,2.2);
  const enemy={x:7.8,z:7.9};
  assert.equal(solids.resolveBig(enemy),true);
  assert.ok(enemy.x<7.66,'casa na célula vizinha também resolve a colisão');
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


test('dash percorre os degraus sem atravessar as escadas de Konoha',()=>{
  const {solids,ground}=sceneFor('folha',3497);
  const direction={x:0,z:-1};
  for(const [x,z,treads] of [[0,-5,5],[7.85,-13,8]]){
    const point={x,z},traversal=createVillageTraversal(solids.all);
    const base=x===0?ground(0,-8):ground(x,-13.4);
    const tops=[];
    for(let i=0;i<treads;i++){
      tops.push(moveVillageActor(point,direction,.52,0,.045,traversal,solids,ground,76));
      const surface=solids.stairTop(point.x,point.z,tops.at(-1));
      assert.ok(tops.at(-1)+.0001>=surface,'o pé continua acima da face que atravessou');
    }
    assert.ok(Math.max(...tops)>base+.65,'a escada sobe no dash');
    assert.ok(point.z<z-1.9,'a escada permanece transitável');
  }
});

test('cidades sorteiam lotes, entrada e eventos por semente sem bloquear os bairros',()=>{
  for(const map of Object.keys(VILLAGES)){
    const seed=6308;
    const {layout,ground,waters,solids}=sceneFor(map,seed);
    const other=createVillageLayout(map,seed+1);
    assert.deepEqual(layout.lots,createVillageLayout(map,seed).lots);
    assert.notDeepEqual(layout.lots,other.lots);
    assert.deepEqual(shuffledVillageSites(layout,seed),shuffledVillageSites(layout,seed));
    assert.notDeepEqual(shuffledVillageSites(layout,seed),shuffledVillageSites(layout,seed+1));
    for(const lot of layout.lots){
      assert.ok(!solids.isFree(lot.x,lot.z,0));
      assert.ok(Number.isFinite(ground(lot.x,lot.z)));
    }
    const connected=explore(solids),chosen=[];
    const spots=shuffledVillageSites(layout,seed);
    for(let i=0;i<12;i++){
      const site=spots.find(p=>solids.isFree(p.x,p.z,2.5,true)&&waterSurfaceAt(map,p.x,p.z,waters)===-Infinity
        &&connected.has(p.x+','+p.z)&&chosen.every(o=>Math.hypot(o.x-p.x,o.z-p.z)>6));
      if(site)chosen.push(site);
    }
    assert.equal(chosen.length,12,map);
    if(map==='folha'){
      assert.ok(layout.lots.length>=60);
      assert.ok(connected.has('-39,-43')&&connected.has('39,-43'));
    }
  }
});


test('escadas de Konoha têm um piso por trecho, sem faces sobrepostas na mesma altura',()=>{
  const {scenery,solids}=sceneFor('folha',6308);
  const floors=[];
  for(const mesh of scenery.root.children.filter(child=>child.name==='village-stairs')){
    const pos=mesh.geometry.attributes.position;
    for(let i=0;i<pos.count;i+=6){
      const points=Array.from({length:6},(_,j)=>[pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j)]);
      const top=points[0][1];
      if(points.some(p=>Math.abs(p[1]-top)>.0001))continue;
      const x=points.map(p=>p[0]),z=points.map(p=>p[2]);
      floors.push({left:Math.min(...x),right:Math.max(...x),from:Math.min(...z),to:Math.max(...z),top});
    }
  }
  assert.equal(floors.length,solids.all.filter(solid=>solid.stair).length);
  for(const [i,floor] of floors.entries())for(const next of floors.slice(i+1)){
    const width=Math.min(floor.right,next.right)-Math.max(floor.left,next.left);
    const depth=Math.min(floor.to,next.to)-Math.max(floor.from,next.from);
    assert.ok(width<.0001||depth<.0001||Math.abs(floor.top-next.top)>.0001,'dois pisos disputando os mesmos pixels');
  }
});

test('o terraço lateral dá passagem entre duas ruas nos dois sentidos',()=>{
  const {solids,ground}=sceneFor('folha',6308);
  for(const [from,end,heading] of [[-12.9,-26.1,-1],[-26.1,-12.9,1]]){
    const traversal=createVillageTraversal(solids.all);
    const point={x:7.85,z:from};
    const levels=[];
    for(let i=0;i<54;i++){
      levels.push(moveVillageActor(point,{x:0,z:heading},.25,0,.05,traversal,solids,ground,WORLD_LIMIT));
    }
    assert.ok(Math.max(...levels)>1.0);
    assert.ok(Math.abs(point.z-end)<.55,'o outro lado da passagem está acessível');
    assert.ok(Math.abs(levels.at(-1)-ground(point.x,point.z))<.05);
  }
});

test('Konoha ocupa aproximadamente 80% da área jogável com bairros conectados',()=>{
  const {layout,ground,waters,solids}=sceneFor('folha',6308);
  let total=0,urban=0;
  for(let z=-WORLD_LIMIT;z<=WORLD_LIMIT;z++)for(let x=-WORLD_LIMIT;x<=WORLD_LIMIT;x++){
    total++;
    if(insideVillage(layout,x,z))urban++;
  }
  assert.ok(urban/total>=.78&&urban/total<=.85,'proporção do tecido urbano: '+urban/total);
  assert.ok(layout.lots.length>=150);
  const connected=explore(solids,{x:0,z:0},{x:WORLD_LIMIT,north:-WORLD_LIMIT,south:WORLD_LIMIT});
  for(const [x,z] of [[64,-26],[-64,-26],[2,62],[47,59],[-20,50],[1,-51]]){
    assert.ok(connected.has(x+','+z),'ligação com o bairro '+x+','+z);
  }
  assert.equal(layout.bridges.length,3);
  for(const bridge of layout.bridges){
    assert.equal(waterSurfaceAt('folha',bridge.x,bridge.z,waters),WATER.level);
    assert.ok(villageDeck(layout,ground,bridge.x,bridge.z)>WATER.level+.48);
  }
});


test('eventos e NPCs usam volume fixo e continuam clicáveis de perfis diferentes',async()=>{
  const {createFixedMissionNpc,createMissionStructures}=await load('/src/scene/missionStructures.ts');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(52,1,.1,40);
  const structures=createMissionStructures();
  const npc=createFixedMissionNpc(new THREE.SpriteMaterial({map:new THREE.Texture(),alphaTest:.1}));
  const actors=[npc,...['guardian','ramen','merchant','altar'].map(kind=>structures.make(kind,0x85caec).obj)];
  for(const [i,obj] of actors.entries()){
    obj.position.set(i*3,1,0);
    scene.add(obj);
  }
  scene.updateMatrixWorld(true);
  const poses=actors.map(obj=>obj.matrixWorld.clone());
  const ray=new THREE.Raycaster();
  for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    for(const [i,obj] of actors.entries()){
      camera.position.set(obj.position.x+Math.sin(angle)*6,1,Math.cos(angle)*6);
      camera.lookAt(obj.position);
      camera.updateMatrixWorld();
      scene.updateMatrixWorld(true);
      assert.ok(obj.matrixWorld.equals(poses[i]));
      obj.traverse(child=>assert.ok(!child.isSprite));
      if(obj===npc){
        ray.setFromCamera(new THREE.Vector2(),camera);
        assert.ok(ray.intersectObject(npc,false).length>0,'NPC tem uma face clicável de todos os lados');
      }
    }
  }
  structures.dispose();
});

test('monumentos têm relevo dentro da silhueta e é possível escalar até o mirante',async()=>{
  const {HOKAGE_MOUNTAIN_ROUTE}=await load('/src/scene/landmarkRelief.ts');
  const {layout,ground,waters,solids,scenery}=sceneFor('folha',6308);
  for(const name of ['monte-hokage','estatua-hashirama','estatua-madara']){
    const monument=scenery.root.getObjectByName(name);
    assert.ok(monument&&monument.children.length===2);
    const relief=monument.getObjectByName('landmark-rock-relief');
    relief.geometry.computeBoundingBox();
    assert.ok(relief.geometry.boundingBox.min.z<-.6);
    assert.ok(relief.geometry.boundingBox.max.z<.001,'apoio não atravessa a face de pedra');
  }
  for(const statue of layout.buildings.filter(landmark=>landmark.art==='leaf'&&landmark.index>0)){
    assert.equal(waterSurfaceAt('folha',statue.x,statue.z,waters),-Infinity);
  }
  const mountain=layout.buildings.find(landmark=>landmark.art==='leaf'&&landmark.index===0);
  const base=ground(mountain.x,mountain.z);
  let previous;
  for(const stage of HOKAGE_MOUNTAIN_ROUTE){
    const x=mountain.x+stage.dx,z=mountain.z+stage.dz;
    const left=x-stage.width/2;
    const approach={x:left-.16,z:previous?(z+previous.z)/2:z};
    const traversal=createVillageTraversal(solids.all);
    const terrain=ground(approach.x,approach.z);
    traversal.restore(approach,previous?.height,terrain);
    const direction={x:1,z:0};
    assert.ok(traversal.jump(approach,direction,terrain),'saliência tem acesso pela etapa anterior');
    for(let i=0;i<150&&traversal.climbing;i++)traversal.advance(approach,direction,terrain,.016);
    const height=base+mountain.height*stage.height;
    assert.ok(Math.abs(traversal.elevation-height)<.001,'saliência tem chão no topo');
    previous={height,z};
  }
  assert.ok(previous.height>16);
});

test('Konoha varia arquitetura e a água usa profundidade, luz e margem local',()=>{
  const layout=createVillageLayout('folha',6308),styles=new Set(layout.lots.map(lot=>lot.style));
  for(const style of ['academy','uzumaki','bathhouse','apartments'])assert.ok(styles.has(style),style);
  const {ground,waters}=sceneFor('folha',6308);
  const scene=new THREE.Scene(),water=createWater(scene,'folha',ground,waters);
  assert.equal(scene.children.length,waters.length);
  for(const mesh of scene.children){
    const depth=mesh.geometry.attributes.waterDepth.array;
    assert.ok(depth.some(value=>value>0)&&depth.some(value=>value<0));
  }
  const program=THREE.ShaderLib.standard;
  const shader={uniforms:{},vertexShader:program.vertexShader,fragmentShader:program.fragmentShader};
  scene.children[0].material.onBeforeCompile(shader);
  assert.match(shader.fragmentShader,/fresnel/);
  assert.match(shader.fragmentShader,/vWaterDepth\s*<=\s*0.0/);
  assert.match(shader.fragmentShader,/foam \+ rings/);
  assert.ok(shader.uniforms.waterRipples);
  water.dispose();
  assert.equal(scene.children.length,0);
});
