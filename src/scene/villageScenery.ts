import * as THREE from 'three';
import type { GameMap } from '../game/maps';
import { MAP_SIZE } from '../game/worldScale';
import { COLLISION_RULES, type Solid } from './collision';
import { createMemorialSprite, MEMORIAL } from './memorialStone';
import { bridgeHeight, villageSurface, type VillageLayout } from './villageLayout';
import { waterDistance, type WaterBody } from './water';

type Solids = ReturnType<typeof import('./collision').createSolids>;
type Ground = (x:number,z:number)=>number;

function pixelTexture(path:string) {
  const map=new THREE.TextureLoader().load(path);
  map.colorSpace=THREE.SRGBColorSpace;
  map.magFilter=map.minFilter=THREE.NearestFilter;
  map.generateMipmaps=false;
  return map;
}

export function createVillageScenery(
  scene:THREE.Scene, map:GameMap, layout:VillageLayout, ground:Ground, waters:readonly WaterBody[], solids:Solids,
  environmentSprite:(index:number,width:number,height:number)=>THREE.Sprite,
) {
  const architecture=new THREE.Group();
  scene.add(architecture);
  const sprites:THREE.Sprite[]=[];
  const textures=new Map<string,THREE.Texture>();
  const animatedWater:THREE.Texture[]=[];
  const addSprite=(sprite:THREE.Sprite,x:number,z:number)=>{
    sprite.center.set(.5,.03);
    sprite.position.set(x,ground(x,z)-.06,z);
    architecture.add(sprite);
    sprites.push(sprite);
    return sprite;
  };
  const atlasRegion=(art:'regional'|'leaf',index:number)=>{
    const key=art+index;
    let texture=textures.get(key);
    if (!texture) {
      const rows=art==='leaf'?1:3;
      texture=pixelTexture(`/assets/${art==='leaf'?'leaf':'regional'}-landmarks-v1.png`);
      texture.repeat.set(1/3,1/rows);
      texture.offset.set((index%3)/3,(rows-1-Math.floor(index/3))/rows);
      textures.set(key,texture);
    }
    return texture;
  };

  for(const item of layout.buildings) {
    const {x,z,width,height,art,index}=item;
    const sprite=art==='environment'?environmentSprite(index,width,height):
      new THREE.Sprite(new THREE.SpriteMaterial({map:atlasRegion(art,index),alphaTest:.16}));
    sprite.scale.set(width,height,1);
    if (art==='environment'&&index===7&&x>0) sprite.material.color.set('#ffdd9f');
    addSprite(sprite,x,z);
    const y=ground(x,z);
    if(item.gate) {
      // Os dois pilares bloqueiam na base. O vão central permanece transitável.
      const side=width*(map.id==='folha'?.315:.34);
      const r=width*(map.id==='folha'?.073:.145);
      for(const sign of [-1,1]) solids.add(x+side*sign,z,r,true,y+height*.8);
    } else {
      const r=width*(art==='environment'?.28:art==='leaf'?.33:.30);
      solids.add(x,z,r,true,y+height*(art==='regional'?.70:.83));
    }
  }
  if(map.id==='folha') {
    const {x,z}=MEMORIAL;
    addSprite(createMemorialSprite(),x,z);
    solids.add(x,z,1.42,true,ground(x,z)+2.8);
  }

  // Lotes densos, com as ruas livres entre os bairros. Semente fixa para salvar e retomar no mesmo lugar.
  let seed=map.id.split('').reduce((sum,char)=>sum+char.charCodeAt(0),1729);
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/0x1_0000_0000;};
  const weights=map.scenery.weights,total=weights.reduce((sum,n)=>sum+n,0);
  const foliage=new Map<Solid,THREE.Sprite>();
  for(let i=0;i<Math.round(map.scenery.count*1.55);i++) {
    const x=(random()-.5)*(MAP_SIZE-8),z=(random()-.5)*(MAP_SIZE-8);
    if(Math.hypot(x,z)<6||villageSurface(layout,x,z)||waterDistance(map.id,x,z,waters).outside<1.5) continue;
    if (layout.sites.some(site=>Math.hypot(site.x-x,site.z-z)<2.7)) continue;
    let roll=random()*total,kind=0;
    while(kind<3&&roll>=weights[kind]) {roll-=weights[kind];kind++;}
    const scale=.8+random()*.36,w=(kind===3?2.4:3.2)*scale,h=(kind===3?1.8:4.2)*scale;
    const sprite=addSprite(environmentSprite(kind,w,h),x,z);
    sprite.material.color.set(map.scenery.tint);
    const solid=solids.add(x,z,COLLISION_RULES.scenery[kind]*scale,false,ground(x,z)+h*(kind===3?.65:.87));
    foliage.set(solid,sprite);
  }

  const materials = new Map<string,THREE.MeshStandardMaterial>();
  function surface(color:string,tile?:number) {
    const key=color+'/'+(tile??'');
    let result=materials.get(key);
    if (!result) {
      let texture:THREE.Texture|undefined;
      if(tile!==undefined) {
        const spritePath=map.id==='folha'?'/assets/ground-materials-v1.png':`/assets/ground-${map.id}-v2.png`;
        texture=pixelTexture(spritePath);
        texture.repeat.set(.488,.488);
        texture.offset.set(.006+(tile%2)*.5,.006+(1-Math.floor(tile/2))*.5);
        textures.set(key,texture);
      }
      result=new THREE.MeshStandardMaterial({color,map:texture??null,roughness:.9,flatShading:true});
      materials.set(key,result);
    }
    return result;
  }
  function box(x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);
    architecture.add(mesh);
    return mesh;
  }
  function round(x:number,y:number,z:number,radius:number,top:number,height:number,material:THREE.Material) {
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,radius,height,16),material);
    mesh.position.set(x,y,z);
    architecture.add(mesh);
    return mesh;
  }
  if(map.id==='folha') {
    const x=-1,z=-39,y=ground(x,z);
    round(x,y+.28,z,5.1,5.1,.56,surface('#dfcbb2',3));
    round(x,y+2,z,4.64,4.58,3.1,surface('#aa4028'));
    round(x,y+3.89,z,5.16,3.6,1.0,surface('#d9954a',1));
    round(x,y+5.27,z,3.64,3.64,1.77,surface('#963522'));
    round(x,y+6.6,z,4.12,2.11,1.14,surface('#b14d37',2));
    round(x,y+7.38,z,2.08,.14,.6,surface('#cf9751',1));
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      const ledge=box(x+4.61*Math.sin(a),y+2.35,z+4.61*Math.cos(a),.62,.92,.18,surface('#47382d'));
      ledge.rotation.y=a;
    }
    // Base e duas plataformas. A segunda pode ser escalada a partir do primeiro beiral.
    solids.add(x,z,5.1,true,y+3.38);
    solids.add(x,z,3.55,true,y+6.03,y+3.38);
    solids.add(x,z,2.04,true,y+7.66,y+6.03);
  }

  const wallBody=surface(map.id==='folha'?'#e7c291':'#d99e62',3);
  const wood=surface('#90603f'),roof=surface(map.id==='folha'?'#a94c32':'#aa774a',2);
  for(const wall of layout.walls) {
    const {from,to,z,height,width}=wall;
    const count=Math.ceil((to-from)/3.6),step=(to-from)/count;
    for(let i=0;i<count;i++) {
      const x=from+(i+.5)*step,y=ground(x,z);
      box(x,y+height*.5,z,step+.035,height,width,wallBody);
      box(x,y+height,z,step+.05,.21,width*1.22,roof);
      if(map.id==='folha')box(x-step*.47,y+height*.48,z,.13,height,width*1.03,wood);
      solids.addBox(x,z,step/2,width/2,y+height+.10);
    }
  }

  const stone=surface(map.id==='areia'?'#d09a61':'#a3a7a6',2);
  for(const bridge of layout.bridges) {
    const segments=20,w=bridge.halfSpan*2/segments;
    for(let i=0;i<segments;i++) {
      const x=bridge.x-bridge.halfSpan+(i+.5)*w;
      const y=bridgeHeight(bridge,x,ground);
      const slope=(bridgeHeight(bridge,x+w/2,ground)-bridgeHeight(bridge,x-w/2,ground))/w;
      const board=box(x,y-.10,bridge.z,w+.035,.20,bridge.width,bridge.wood?wood:stone);
      board.rotation.z=Math.atan(slope);
      for(const sign of [-1,1]) {
        const z=bridge.z+sign*(bridge.width/2-.10);
        const rail=box(x,y+.49,z,w+.10,.12,.14,bridge.wood?wood:stone);
        rail.rotation.z=Math.atan(slope);
        if(i%3===0)box(x,y+.23,z,.15,.53,.16,bridge.wood?wood:stone);
      }
    }
  }

  if(map.id==='areia') {
    for(const [x,z,rise] of [[-30,-52,6.4],[32,-55,7.3]]) {
      for(let i=0;i<13;i++) {
        const a=i*Math.PI/12;
        const mx=x+Math.cos(a)*6.7;
        const y=ground(mx,z)+Math.sin(a)*rise;
        const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),stone);
        rock.scale.set(1.55,1.33,2.34);
        rock.position.set(mx,y,z);
        rock.rotation.set(i*.2,0,a*.8);
        architecture.add(rock);
      }
      for(const sign of [-1,1]) {
        const edge=x+sign*6.6;
        solids.add(edge,z,1.18,true,ground(edge,z)+1.5);
      }
    }
  }

  if(map.id==='nevoa'||map.id==='pedra') {
    for(const [x,z] of map.id==='nevoa'?[[-15,-47],[27,-43]]:[[-19,-52],[25,-41]]) {
      const y=ground(x,z);
      box(x,y+1.10,z,4.75,2.20,3.48,stone);
      solids.addBox(x,z,2.375,1.74,y+2.2);
      const stream=pixelTexture('/assets/ground-nevoa-v2.png');
      stream.repeat.set(.13,.21);
      stream.wrapT=THREE.RepeatWrapping;
      textures.set(`waterfall-${x}`,stream);
      animatedWater.push(stream);
      const paint=new THREE.MeshBasicMaterial({color:'#8de2ed',map:stream,transparent:true,opacity:.85,side:THREE.DoubleSide});
      const falls=new THREE.Mesh(new THREE.PlaneGeometry(1.06,2.23),paint);
      falls.position.set(x+.42,y+1.12,z+1.75);
      architecture.add(falls);
    }
  }

  solids.prune(COLLISION_RULES.sceneryClearance,solid=>{
    const sprite=foliage.get(solid);
    if (!sprite) return;
    sprite.removeFromParent();
    sprite.material.dispose();
    sprites.splice(sprites.indexOf(sprite),1);
    foliage.delete(solid);
  });

  return {
    sprites, root:architecture,
    update(elapsed:number) { for (const stream of animatedWater) stream.offset.y=(elapsed*.36)%1; },
    dispose() {
      const seen=new Set<THREE.Material>();
      architecture.traverse(object=>{
        if (object instanceof THREE.Mesh) { object.geometry.dispose(); seen.add(object.material); }
        if (object instanceof THREE.Sprite) {seen.add(object.material); if(object.material.map) object.material.map.dispose();}
      });
      seen.forEach(material=>material.dispose());
      textures.forEach(texture=>texture.dispose());
      architecture.removeFromParent();
    },
  };
}
