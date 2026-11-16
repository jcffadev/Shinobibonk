import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as THREE from 'three';
import { installCanvasStub,load } from './helpers/load.mjs';

installCanvasStub();
// As malhas são construídas no Node sem decodificar os atlas e sem WebGL.
THREE.TextureLoader.prototype.load = function () { return new THREE.Texture(); };
const world=await load('/src/prototype/prototypeWorld.ts');
const benchmark=await load('/src/prototype/prototypeBenchmark.ts');
const art=await load('/src/prototype/prototypeArt.ts');
const crowd=await load('/src/prototype/prototypeCrowd.ts');

test('o portão liga a área externa à praça e a câmera mantém a diagonal normalizada',()=>{
  const direction=world.cameraInput(1,-1,Math.PI*.25);
  assert.ok(Math.abs(Math.hypot(direction.x,direction.z)-1)<1e-8);
  const player=world.createPrototypePlayer();
  for(let i=0;i<180;i++)player.update(1/60,{x:0,z:-1});
  assert.ok(world.inCity(player.position));
  assert.ok(player.position.z<-8);
  assert.ok(player.distance>20);
});

test('paredes bloqueiam ao tocar a base e o corpo continua andando',()=>{
  const body={x:0,z:5,width:4,depth:2,top:3};
  const player=world.createPrototypePlayer([body]);
  for(let i=0;i<100;i++)player.update(1/60,{x:0,z:-1});
  assert.ok(player.position.z>6.22&&player.position.z<6.40);
  assert.equal(player.walking,true);
  assert.equal(world.canWalk({x:2.6,z:5},0,[body]),true);
  assert.equal(world.canWalk({x:2,z:5},0,[body]),false);
});

test('escalada sobe ao topo, mantém apoio e cai ao sair, com salto para soltar',()=>{
  const body={x:0,z:8,width:4,depth:3,top:3};
  const player=world.createPrototypePlayer([body]);
  for(let i=0;i<42;i++)player.update(1/60,{x:0,z:-1});
  player.jump({x:0,z:-1});
  assert.ok(player.climbing);
  for(let i=0;i<20;i++)player.update(1/60,{x:0,z:-1});
  assert.ok(player.position.y>1.6);
  player.jump({x:0,z:-1});
  assert.equal(player.climbing,undefined);
  for(let i=0;i<120;i++)player.update(1/60,{x:0,z:0});
  assert.equal(player.position.y,0);
  player.jump({x:0,z:-1});
  for(let i=0;i<49;i++)player.update(1/60,{x:0,z:-1});
  assert.equal(player.position.y,3);
  assert.ok(world.overlaps(player.position,body));
  for(let i=0;i<80;i++)player.update(1/60,{x:0,z:-1});
  assert.equal(player.position.y,0);
});

test('obstáculo redondo tem cantos livres e o dash acelera sem atravessar um muro',()=>{
  const circle={x:0,z:4,width:4,depth:4,top:3,round:true};
  assert.equal(world.canWalk({x:1.95,z:5.95},0,[circle]),true);
  const wall={x:0,z:9,width:9,depth:1,top:2};
  const player=world.createPrototypePlayer([wall]);
  player.dash({x:0,z:-1});
  player.update(1/60,{x:0,z:0});
  assert.ok(player.distance>.24);
  for(let i=0;i<28;i++)player.update(1/60,{x:0,z:-1});
  assert.ok(player.position.z>9.72&&player.position.z<9.96);
});

test('matriz de desempenho cobre 24 combinações, com cauda de quadros lenta detectada',()=>{
  const { BENCHMARK_CASES,frameStats }=benchmark;
  assert.equal(BENCHMARK_CASES.length,24);
  assert.equal(new Set(BENCHMARK_CASES.map(JSON.stringify)).size,24);
  for(const avatar of ['sprite','low-poly'])for(const texture of [1024,4096])for(const effects of [true,false])
    assert.ok(BENCHMARK_CASES.some(config=>config.avatar===avatar&&config.texture===texture&&config.effects===effects&&config.enemies===1600));
  assert.deepEqual(frameStats([16,16,32,-1,NaN]),{frames:3,fps:46.9,p99Ms:32,low1:31.3});
});

test('cena gera malhas e agrupa a horda no limite, em ambas as artes',()=>{
  const scene=new THREE.Scene(),content=art.createPrototypeArt(new THREE.Texture());
  content.makeVillage(scene);
  const avatar=content.makeNaruto(scene);
  const meshCrowd=crowd.createCrowd(scene,avatar.actor,new THREE.Texture());
  meshCrowd.set('low-poly',2000,true);
  assert.ok(scene.children.filter(o=>o instanceof THREE.InstancedMesh&&o.count===1600&&o.visible).length>1);
  const fx=scene.children.find(o=>o instanceof THREE.Points);
  assert.equal(fx.geometry.drawRange.count,3200);
  meshCrowd.set('sprite',1600,false);
  assert.equal(scene.children.filter(o=>o instanceof THREE.InstancedMesh&&o.count===1600&&o.visible).length,1);
  assert.equal(fx.visible,false);
  assert.ok(scene.children.some(o=>o instanceof THREE.InstancedMesh&&o.castShadow&&o.count>3));
});

test('a tela inicial oferece o protótipo e a rota está isolada da missão',()=>{
  const main=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');
  const scene=readFileSync(new URL('../src/prototype/prototypeScene.ts',import.meta.url),'utf8');
  assert.match(main,/changePage\('prototype'\).*Mapa Protótipo/);
  assert.match(main,/if\(page==='prototype'\) return <React.Suspense/);
  assert.doesNotMatch(scene,/localStorage|SAVED_RUN_KEY|recordLocalRun|submitRankResult/);
});
