import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GUIZOS, guizoPickupKind } from '../src/game/guizos.ts';
import { createDropModels } from '../src/scene/dropModels.ts';

test('seis guizos têm malha com volume, cor própria e sombra no chão',()=>{
  const models=createDropModels(new THREE.Scene(),1);
  const geometries=GUIZOS.map(({id})=>models.mesh(guizoPickupKind(id)).geometry);
  assert.equal(new Set(geometries).size,6);
  const tints=geometries.map(g=>Array.from(g.getAttribute('color').array.slice(0,3)).join(','));
  assert.equal(new Set(tints).size,6);
  for(const {boundingBox:{min,max}} of geometries){
    assert.ok(min.y>=0&&max.y>.65&&max.z-min.z>.3);
  }
  models.dispose();
  const canvas=fs.readFileSync('src/scene/GameCanvas.tsx','utf8');
  assert.match(canvas,/if\(guizo\)\{[\s\S]*?groundModels\.mesh\(guizoPickupKind\(guizo\)\);\s*const shadow=pickupShadows\.place/);
});

test('as pílulas têm silhuetas individuais e o mesmo preço em Ryu aparece nos dois comerciantes', () => {
  const root='public/assets/inventory',icons=fs.readdirSync(root).filter(name=>/^pill-.*-v4\.svg$/.test(name));
  assert.equal(icons.length,19);
  assert.equal(new Set(icons.map(icon=>fs.readFileSync(root+'/'+icon,'utf8'))).size,19);
  assert.match(fs.readFileSync('src/ui/ItemTradeDialog.tsx','utf8'),/<RyuCost value=\{card.price\} available=\{money\}/);
  assert.match(fs.readFileSync('src/ui/TsunadeRoulette.tsx','utf8'),/<RyuCost value=\{live.cost\} available=\{live.money\}/);
});
