import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as THREE from 'three';
import { HERO_BY_ID } from '../src/game/heroes.ts';
import { EXAM_ENTRANCE, EXAM_SPAWN, INSTANCE_FLOOR, constrainArena } from '../src/game/missionArenas.ts';
import { load,installCanvasStub } from './helpers/load.mjs';

installCanvasStub();
const {createInstanceArenas}=await load('/src/scene/missionArenas.ts');
const {DEFEAT_SHEETS,defeatFrame,FALLEN_TIMING,createFallenBody}=await load('/src/scene/fallenShinobi.ts');

test('arena do Exame tem entrada alcançável e limites próprios e Hagoromo fica no círculo',()=>{
  const point={x:EXAM_ENTRANCE.x,z:EXAM_ENTRANCE.z};
  const sage={x:-56,z:56};
  constrainArena('exam-forest',point,sage,13);
  assert.deepEqual(point,{x:EXAM_ENTRANCE.x,z:EXAM_ENTRANCE.z});
  constrainArena('exam-hall',point,sage,13);
  assert.equal(point.z,-15);
  assert.ok(EXAM_SPAWN.z>0&&EXAM_ENTRANCE.z<0);
  constrainArena('hagoromo',point,sage,13);
  assert.ok(Math.abs(Math.hypot(point.x-sage.x,point.z-sage.z)-13)<1e-6);
});

test('instâncias montam cenários separados e restauram o clima da missão ao sair',()=>{
  const scene=new THREE.Scene(),background=new THREE.Color('#123321'),fog=new THREE.Fog('#112233',3,4);
  scene.background=background;
  scene.fog=fog;
  const sage={x:-56,z:56},arenas=createInstanceArenas(scene,sage);
  const previous=THREE.TextureLoader.prototype.load;
  THREE.TextureLoader.prototype.load=()=>new THREE.Texture();
  try{
    arenas.set('exam-forest');
    const forest=scene.getObjectByName('exam-forest');
    assert.equal(forest.position.y,INSTANCE_FLOOR);
    assert.equal(forest.visible,true);
    arenas.set('exam-hall');
    assert.equal(forest.visible,false);
    assert.equal(scene.getObjectByName('exam-hall').visible,true);
    arenas.set('hagoromo');
    const training=scene.getObjectByName('hagoromo');
    assert.deepEqual(training.position.toArray(),[sage.x,INSTANCE_FLOOR,sage.z]);
    arenas.update(2,'wave',.15,false);
    assert.ok(training.children.some(child=>child instanceof THREE.Group&&child.children.some(o=>o instanceof THREE.Sprite)));
    arenas.set(undefined);
    assert.equal(training.visible,false);
    assert.equal(scene.background,background);
    assert.equal(scene.fog,fog);
  }finally{
    THREE.TextureLoader.prototype.load=previous;
    arenas.dispose();
  }
  assert.equal(scene.children.length,0);
});

test('duelo começa pela porta com objetivos cumpridos e Hagoromo usa a origem da missão',()=>{
  const canvas=readFileSync('src/scene/GameCanvas.tsx','utf8');
  assert.match(canvas,/if\(!duelReady\(duel,elapsed,kills\)\)[\s\S]+?setInstance\('exam-hall'\);/);
  assert.match(canvas,/activeInstance==='exam-hall'&&!duelWon[^\n]*spawnEnemy\(false,false,false,duelFoe,true\)/);
  assert.match(canvas,/if\(!arena&&!hagoromoEvent&&activeInstance!=='exam-hall'&&spawnTimer<=0\)/);
  assert.match(canvas,/function finishHagoromo\(\)\{[\s\S]*?setInstance\(undefined\);[\s\S]+?player\.position\.set\(origin\.x,/);
  assert.match(canvas,/player:\{x:hagoromoEvent\?\.origin\.x\?\?player\.position\.x/);
});

test('folhas de derrota têm oito quadros e a última pose só entra ao liberar E',()=>{
  const entries=Object.entries(DEFEAT_SHEETS);
  assert.deepEqual(entries.map(([,file])=>file.split('/').at(-1)).sort(),
    readdirSync('public/assets/shinobi-defeat').filter(file=>file.endsWith('.png')).sort());
  for(const [id,file] of entries){
    assert.ok(HERO_BY_ID[id], 'a folha corresponde a uma versão do elenco');
    assert.equal(file, '/assets/shinobi-defeat/'+id+'-derrota-v1.png');
    const png=readFileSync('public'+file);
    assert.equal(png.readUInt32BE(16),464);
    assert.equal(png.readUInt32BE(20),232);
  }
  const scene=new THREE.Scene(),sheet=new THREE.Texture({width:464,height:232});
  sheet.repeat.set(.25,.5);
  const body=createFallenBody({scene,map:new THREE.Texture(),defeatSheet:sheet,width:1,height:2,x:0,z:0,ground:()=>0,color:'#f00',right:new THREE.Vector3(1,0,0)});
  assert.equal(defeatFrame(0),0);
  assert.equal(defeatFrame(FALLEN_TIMING.settle-.01),6);
  assert.equal(body.ready,false);
  body.update(FALLEN_TIMING.settle,false);
  assert.equal(defeatFrame(FALLEN_TIMING.settle),7);
  assert.deepEqual(sheet.offset.toArray(),[.75,0]);
  assert.equal(body.ready,true);
  const vertices=scene.getObjectByName('shinobi-em-queda').geometry.attributes.position;
  const offset=new THREE.Vector3();
  const projectionWidth=(right)=>{
    let min=Infinity,max=-Infinity;
    for(let i=0;i<vertices.count;i++){
      const value=offset.fromBufferAttribute(vertices,i).dot(right);
      min=Math.min(min,value);max=Math.max(max,value);
    }
    return max-min;
  };
  for(let step=0;step<16;step++){
    const angle=step*Math.PI/8;
    const right=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle));
    body.update(0,false,right);
    assert.ok(Math.abs(projectionWidth(right)-2)<1e-6,'a largura legível permanece o tamanho do desenho');
    assert.deepEqual(body.position.toArray(),[0,0,0]);
    assert.deepEqual(sheet.offset.toArray(),[.75,0],'girar não reinicia o ciclo nem muda a pose');
  }
  body.dispose();
});
