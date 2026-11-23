import * as THREE from 'three';
import type { GameMap } from '../game/maps';
import { MAP_SIZE } from '../game/worldScale';
import { COLLISION_RULES, type Solid } from './collision';
import { createMemorialSprite, MEMORIAL } from './memorialStone';
import { HAGOROMO_ARENA } from './terrainArt';
import { KONOHA_SQUARES, villageRandom } from './villageDistricts';
import { HOKAGE_MOUNTAIN_ROUTE, makeLandmarkRelief } from './landmarkRelief';
import { createVillageArchitecture } from './villageArchitecture';
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
  const built=createVillageArchitecture(architecture,layout,ground,solids);
  built.textures.forEach((texture,index)=>textures.set('architecture-'+index,texture));
  function landmarkFace(map:THREE.Texture,x:number,y:number,z:number,width:number,height:number) {
    const material=new THREE.MeshBasicMaterial({map,alphaTest:.18});
    const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
    face.position.set(x,y+height/2,z);
    architecture.add(face);
  }

  // Lotes densos, com as ruas livres entre os bairros. Semente fixa para salvar e retomar no mesmo lugar.
  const terrainSeed=map.id.split('').reduce((sum,char)=>sum+char.charCodeAt(0),1729);
  const random=villageRandom(terrainSeed^(layout.seed??0));
  const weights=map.scenery.weights,total=weights.reduce((sum,n)=>sum+n,0);
  const foliage=new Map<Solid,THREE.Sprite>();
  function plant(kind:number,x:number,z:number,scale:number) {
    const w=(kind===3?2.4:3.2)*scale,h=(kind===3?1.8:4.2)*scale;
    const sprite=addSprite(environmentSprite(kind,w,h),x,z);
    sprite.material.color.set(map.scenery.tint);
    const solid=solids.add(x,z,COLLISION_RULES.scenery[kind]*scale,false,ground(x,z)+h*(kind===3?.65:.87));
    foliage.set(solid,sprite);
  }
  if(map.id==='folha') {
    const gardens=[[-9,10,1.27],[9,12,1.28],[-4.37,-3,1.34],[4.35,-3,1.18],
      [-8.8,-24,1.08],[9.9,-29,1.12],[-10,-44,1.04],[7.2,-45,1.08]];
    gardens.forEach(([x,z,scale],i)=>plant(i%3===1?1:0,x,z,scale));
    for(const square of KONOHA_SQUARES){
      for(const side of [-1,1]){
        plant(0,square.x+side*(square.rx-.9),square.z+square.rz-.8,1.13);
        plant(1,square.x+side*(square.rx-.9),square.z-square.rz+.8,.94);
      }
    }
    for(let i=0;i<28;i++){
      const x=-39+i*2.9+(random()-.5)*1.1,z=-61.5-(i%3)*1.4;
      plant(i%4===0?0:1,x,z,1.14+random()*.52);
    }
    for(const side of [-1,1])for(let i=0;i<12;i++){
      const x=side*(26.1+i%2*.6),z=-13-i*4.12;
      if(layout.crossings.some(crossing=>Math.abs(crossing-z)<2))continue;
      plant(i%3===1?1:0,x,z,.88+random()*.28);
    }
  }
  for(let i=0;i<22;i++){
    const angle=i*Math.PI*2/22,r=HAGOROMO_ARENA.r+2.4+(i%3)*.9;
    plant(i%4===0?1:0,HAGOROMO_ARENA.x+Math.cos(angle)*r,HAGOROMO_ARENA.z+Math.sin(angle)*r,.98);
  }

  for(let i=0;i<Math.round(map.scenery.count*(map.id==='folha'?1.79:1.55));i++) {
    const x=(random()-.5)*(MAP_SIZE-8),z=(random()-.5)*(MAP_SIZE-8);
    if(Math.hypot(x,z)<6||villageSurface(layout,x,z)||waterDistance(map.id,x,z,waters).outside<1.5) continue;
    if(Math.hypot(x-HAGOROMO_ARENA.x,z-HAGOROMO_ARENA.z)<HAGOROMO_ARENA.r+1.5)continue;
    if (layout.sites.some(site=>Math.hypot(site.x-x,site.z-z)<2.7)) continue;
    let roll=random()*total,kind=0;
    while(kind<3&&roll>=weights[kind]) {roll-=weights[kind];kind++;}
    plant(kind,x,z,.8+random()*.36);
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
  const rockFace=surface('#8c7c65',2);
  for(const item of layout.buildings) {
    if(item.art!=='leaf')continue;
    const {x,z,width,height,index}=item;
    const y=ground(x,z);
    const texture=pixelTexture('/assets/leaf-landmarks-v1.png');
    texture.repeat.x=1/3;
    texture.offset.x=index/3;
    textures.set('leaf-'+index,texture);
    const stone=surface('#a69a87',2);
    stone.side=THREE.DoubleSide;
    const depth=index===0?12:1.5;
    const base=y-(index===0?.55:.035);
    const footing=index===0?(dx:number,dz:number)=>ground(x+dx,z+dz)-base:undefined;
    const monument=makeLandmarkRelief(index,width,height,depth,texture,stone,footing);
    monument.name=index===0?'monte-hokage':index===1?'estatua-hashirama':'estatua-madara';
    monument.position.set(x,base,z);
    architecture.add(monument);
    if(index===0){
      solids.addBox(x,z-3.5,width*.43,3.49,y+height*.22);
      // Saliências conectam a trilha do lado oeste ao mirante atrás dos rostos.
      for(const shelf of HOKAGE_MOUNTAIN_ROUTE){
        const cx=x+shelf.dx,cz=z+shelf.dz,top=y+height*shelf.height;
        const footing=ground(cx,cz)-.35;
        const geometry=new THREE.BoxGeometry(shelf.width,top-footing,shelf.depth,5,4,3);
        const points=geometry.attributes.position,span=top-footing;
        for(let i=0;i<points.count;i++){
          const x=points.getX(i),y=points.getY(i),z=points.getZ(i),t=y/span+.5;
          const weathering=(1-t)*(.075+.07*Math.sin(x*2.4+z*1.7+y*1.5));
          points.setXYZ(i,x*(1-weathering),y+.13*(1-t)*Math.sin(x*2.5+z*1.75),z*(1-weathering));
        }
        geometry.computeVertexNormals();
        const rock=new THREE.Mesh(geometry,stone);
        rock.name='monte-hokage-trilha';
        rock.position.set(cx,(top+footing)*.5,cz);
        rock.castShadow=true;rock.receiveShadow=true;
        architecture.add(rock);
        solids.addBox(cx,cz,shelf.width/2,shelf.depth/2,top);
      }
    }else {
      solids.addBox(x,z-depth*.45,width*.31,depth*.48,y+height*.22);
    }
  }
  if(map.id==='folha') {
    const {x,z,width,height}=MEMORIAL;
    const memorial=createMemorialSprite();
    const texture=memorial.material.map!;
    textures.set('memorial',texture);
    memorial.material.dispose();
    const y=ground(x,z);
    box(x,y+height*.28,z-.38,width*.58,height*.56,.76,rockFace);
    landmarkFace(texture,x,y-.04,z+.025,width,height);
    solids.addBox(x,z-.38,width*.29,.38,y+height*.56);
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
  const bridgeRail=map.id==='folha'?surface('#a44b3b'):wood;
  for(const bridge of layout.bridges) {
    const segments=20,w=bridge.halfSpan*2/segments;
    for(let i=0;i<segments;i++) {
      const x=bridge.x-bridge.halfSpan+(i+.5)*w;
      const y=bridgeHeight(bridge,x,ground);
      const slope=(bridgeHeight(bridge,x+w/2,ground)-bridgeHeight(bridge,x-w/2,ground))/w;
      const board=box(x,y-.10,bridge.z,w,.20,bridge.width,bridge.wood?wood:stone);
      board.rotation.z=Math.atan(slope);
      for(const sign of [-1,1]) {
        const z=bridge.z+sign*(bridge.width/2-.10);
        const rail=box(x,y+.49,z,w+.10,.12,.14,bridge.wood?bridgeRail:stone);
        rail.rotation.z=Math.atan(slope);
        if(i%3===0)box(x,y+.23,z,.15,.53,.16,bridge.wood?bridgeRail:stone);
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

  const skyline=surface(map.id==='areia'?'#d99755':map.id==='pedra'?'#888993':'#607b70',2);
  if(map.id!=='folha')for(let i=0;i<14;i++){
    const x=-61+i*9.3,z=-100-(i%4)*7,base=ground(x,z);
    const peak=map.id==='pedra'?12+(i*11%15):map.id==='areia'?11+(i*7%11):9+(i*7%13);
    const foot=map.id==='areia'?8.3:map.id==='pedra'?6.4:3.0;
    const top=map.id==='areia'?foot*.78:map.id==='pedra'?.60:.28;
    const crag=new THREE.Mesh(new THREE.CylinderGeometry(top,foot,peak,5,1),skyline);
    crag.rotation.y=i*.72;
    crag.position.set(x,base+peak*.47,z);
    architecture.add(crag);
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
