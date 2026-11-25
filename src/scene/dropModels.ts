import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { SCROLL_STYLES, scrollStyle, type ScrollStyle } from './dropSprites.ts';

export type MonsterDropKind = 'xp' | 'ryu' | 'chakra' | 'pill' | 'item' | 'onigiri';
const MONSTER_DROPS = ['xp', 'ryu', 'chakra', 'pill', 'item', 'onigiri'] as const;
export type ThrownWeapon = 'kunai' | 'shuriken' | 'fuma';
type BatchedModel = MonsterDropKind | ThrownWeapon;
type GroundModel = BatchedModel | 'scroll' | 'freeScroll' | 'riceMound' | 'cursed';
const BATCHED_MODELS = [...MONSTER_DROPS,'kunai','shuriken','fuma'] as const;

function modelParts() {
  const parts: THREE.BufferGeometry[] = [];
  function add(g: THREE.BufferGeometry, color: string, x: number, y: number, z: number) {
    const geometry = g.index ? g.toNonIndexed() : g;
    if (geometry !== g) g.dispose();
    geometry.translate(x,y,z);
    const paint = new THREE.Color(color);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i=0;i<colors.length;i+=3) paint.toArray(colors,i);
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    geometry.deleteAttribute('uv');
    parts.push(geometry);
  }
  return {
    add,
    box(w:number,h:number,d:number,color:string,x=0,y=0,z=0) { add(new THREE.BoxGeometry(w,h,d),color,x,y,z); },
    cylinder(radius:number,length:number,color:string,x=0,y=0,z=0,axis:'x'|'y'|'z'='y',segments=10) {
      const g=new THREE.CylinderGeometry(radius,radius,length,segments,1);
      if(axis==='x')g.rotateZ(Math.PI/2);
      if(axis==='z')g.rotateX(Math.PI/2);
      add(g,color,x,y,z);
    },
    finish() {
      const merged=mergeGeometries(parts)!;
      const geometry=mergeVertices(merged);
      merged.dispose();
      for (const part of parts) part.dispose();
      geometry.computeBoundingBox();
      geometry.translate(0,-geometry.boundingBox!.min.y,0);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      return geometry;
    },
  };
}

function scroll(parts:ReturnType<typeof modelParts>, style:ScrollStyle, free:boolean) {
  const { box, cylinder } = parts;
  const trim = free ? '#5ad69b' : style.rodEnd;
  if (style.open) {
    for (const x of [-.36,.36]) {
      cylinder(.116,.86,style.rod,x,.12,0,'z');
      for (const z of [-.415,.415]) {
        cylinder(.138,.084,trim,x,.139,z,'z');
        cylinder(.088,.092,'#bc914f',x,.139,z,'z');
      }
    }
    box(.73,.036,.68,style.border,0,.075);
    box(.64,.025,.59,style.paper,0,.101);
    for (const z of [-.25,.25]) box(.42,.006,.022,style.ink,0,.116,z);
    for (const [x,z,length] of [[-.19,-.12,.23],[.012,-.14,.11],[.012,.047,.19],[.18,-.11,.27]] as const) {
      box(.022,.007,length,style.ink,x,.117,z+length/2);
      box(.062,.007,.018,style.ink,x,.117,z+.065);
    }
    box(.12,.012,.10,free?'#35b778':'#ad2f37',.18,.122,.17);
  } else {
    cylinder(.15,.92,style.border,0,.15,0,'x');
    cylinder(.157,.79,style.paper,0,.159,0,'x');
    cylinder(.165,.22,free?'#388957':style.band??style.rod,0,.167,0,'x');
    for (const x of [-.465,.465]) {
      cylinder(.159,.075,trim,x,.159,0,'x');
      cylinder(.114,.087,style.rod,x,.159,0,'x');
      cylinder(.053,.095,'#503018',x,.159,0,'x');
    }
    box(.15,.046,.16,free?'#87eaa8':'#c34b3d',0,.322);
  }
}

function rice(parts:ReturnType<typeof modelParts>, x=0,y=0,z=0,size=1,yaw=0) {
  const grains = new THREE.CylinderGeometry(.18,.27,.16,3,1);
  grains.rotateX(-Math.PI/2).scale(size,size,size).rotateY(yaw);
  parts.add(grains,'#fff2c9',x,y+.26*size,z);
  const wrap = new THREE.BoxGeometry(.18*size,.19*size,.185*size).rotateY(yaw);
  parts.add(wrap,'#263a25',x,y+.12*size,z);
}

function shuriken(parts:ReturnType<typeof modelParts>, tint:string, ridge:string, large=false) {
  const blade = new THREE.Shape().moveTo(-.12,-.07).lineTo(-.06,.17).lineTo(.07,.51).lineTo(.15,.27).lineTo(.19,.08).lineTo(.13,-.07).closePath();
  for (let i=0;i<4;i++) {
    const yaw = i*Math.PI/2;
    const edge = new THREE.ExtrudeGeometry(blade,{depth:.028,bevelEnabled:true,bevelSegments:1,bevelThickness:.015,bevelSize:.019,steps:1});
    edge.rotateX(-Math.PI/2).rotateY(yaw);
    if(large)edge.scale(1.32,1,1.32);
    parts.add(edge,tint,0,.021,0);
    const stripe=new THREE.BoxGeometry(.023,.012,.20).translate(.047,.064,-.24).rotateY(yaw);
    parts.add(stripe,ridge,0,0,0);
  }
  parts.add(new THREE.TorusGeometry(.123,.037,4,10).rotateX(-Math.PI/2),ridge,0,.064,0);
}

function makeGeometry(kind:GroundModel,style:ScrollStyle) {
  const parts=modelParts();
  const { add, box, cylinder }=parts;
  switch(kind) {
    case 'scroll': case 'freeScroll': case 'item':
      scroll(parts,style,kind==='freeScroll');
      break;
    case 'riceMound':
      rice(parts,-.27,0,.12,1.1,-.3);
      rice(parts,.26,0,.13,1.1,.35);
      rice(parts,0,0,-.25,1.1);
      rice(parts,.01,.23,.015,1.03,.14);
      break;
    case 'onigiri':
      rice(parts,0,0,0,1.32);
      break;
    case 'cursed':
      shuriken(parts,'#6a438a','#e3a2ff');
      for (const [x,z] of [[-.24,-.25],[.26,.29]]) add(new THREE.OctahedronGeometry(.09,0),'#bc69fa',x,.045,z);
      break;
    case 'shuriken': case 'fuma':
      shuriken(parts,kind==='fuma'?'#a75a53':'#647083','#e6c5b8',kind==='fuma');
      break;
    case 'kunai': {
      const blade=new THREE.OctahedronGeometry(1,0).scale(.17,.053,.29);
      add(blade,'#aab6c4',0,.05,.12);
      box(.094,.074,.27,'#4a3942',0,.05,-.15);
      box(.26,.075,.07,'#635854',0,.05,-.04);
      add(new THREE.TorusGeometry(.064,.018,4,8).rotateX(-Math.PI/2),'#b09380',0,.05,-.325);
      break;
    }
    case 'ryu':
      cylinder(.33,.093,'#a66c19',0,.047,0,'y',10);
      cylinder(.295,.024,'#f2b844',0,.108,0,'y',10);
      add(new THREE.TorusGeometry(.243,.024,4,10).rotateX(-Math.PI/2),'#ffdc80',0,.125,0);
      box(.135,.012,.14,'#9c631d',0,.124);
      box(.069,.018,.073,'#eebb63',0,.13);
      break;
    case 'xp':
      add(new THREE.OctahedronGeometry(1,0).scale(.30,.48,.30),'#b96bf0',0,.48,0);
      add(new THREE.OctahedronGeometry(1,0).scale(.17,.31,.16),'#e9bcff',.097,.48,.099);
      break;
    case 'chakra':
      add(new THREE.IcosahedronGeometry(.39,0),'#54b9f3',0,.39,0);
      add(new THREE.TorusGeometry(.369,.026,4,10).rotateZ(.55),'#8cecf4',0,.39,0);
      break;
    case 'pill':
      cylinder(.16,.17,'#ef6989',0,.16,-.083,'z',8);
      cylinder(.16,.17,'#ffe9cd',0,.16,.084,'z',8);
      add(new THREE.SphereGeometry(.16,8,4,0,Math.PI*2,0,Math.PI/2).rotateX(-Math.PI/2),'#ef6989',0,.16,-.168);
      add(new THREE.SphereGeometry(.16,8,4,0,Math.PI*2,0,Math.PI/2).rotateX(Math.PI/2),'#ffe9cd',0,.16,.168);
      break;
  }
  return parts.finish();
}

export function createDropModels(scene:THREE.Scene, capacity:number) {
  const material = new THREE.MeshLambertMaterial({vertexColors:true,emissive:'#201d1d',emissiveIntensity:.21});
  const geometries=new Map<string,THREE.BufferGeometry>();
  function geometry(kind:GroundModel,variant=0) {
    const style=scrollStyle(variant);
    const key=kind==='scroll'||kind==='freeScroll'?kind+':'+style.name:kind;
    let value=geometries.get(key);
    if(!value){value=makeGeometry(kind,style);geometries.set(key,value);}
    return value;
  }
  const batches=new Map<BatchedModel,THREE.InstancedMesh>();
  function batch(kind:BatchedModel, size:number) {
    const old=batches.get(kind);
    if(old){
      old.removeFromParent();
      old.dispose();
    }
    const mesh = new THREE.InstancedMesh(geometry(kind),material,size);
    mesh.name='drops-'+kind;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count=0;
    mesh.frustumCulled=false;
    scene.add(mesh);
    batches.set(kind,mesh);
    return mesh;
  }
  const counts:Record<BatchedModel,number>={xp:0,ryu:0,chakra:0,pill:0,item:0,onigiri:0,kunai:0,shuriken:0,fuma:0};
  const bounds=new THREE.Sphere();
  return {
    mesh(kind:GroundModel,variant=0){
      const mesh=new THREE.Mesh(geometry(kind,variant),material);
      mesh.name='item-'+kind;
      mesh.userData.shared=true;
      mesh.userData.worldDropModel=true;
      return mesh;
    },
    update(drops:readonly {type:MonsterDropKind;mesh:THREE.Object3D}[],frustum:THREE.Frustum,
      weapons:readonly {type:ThrownWeapon;object:THREE.Object3D}[]=[]){
      for(const kind of BATCHED_MODELS)counts[kind]=0;
      for(const drop of drops)counts[drop.type]++;
      for(const weapon of weapons)counts[weapon.type]++;
      for(const kind of BATCHED_MODELS){
        const current=batches.get(kind);
        const allocated=current?.instanceMatrix.count??0;
        const initial=kind==='kunai'||kind==='shuriken'||kind==='fuma'?32:capacity;
        if(counts[kind]>allocated)batch(kind,Math.max(initial,allocated*2,counts[kind]));
      }
      for(const mesh of batches.values())mesh.count=0;
      function submit(type:BatchedModel,object:THREE.Object3D) {
        const instances=batches.get(type)!;
        object.updateMatrix();
        bounds.copy(instances.geometry.boundingSphere!).applyMatrix4(object.matrix);
        if(frustum.intersectsSphere(bounds))instances.setMatrixAt(instances.count++,object.matrix);
      }
      for(const drop of drops)submit(drop.type,drop.mesh);
      for(const weapon of weapons)submit(weapon.type,weapon.object);
      for(const mesh of batches.values()){
        mesh.visible=mesh.count>0;
        if(!mesh.count)continue;
        mesh.instanceMatrix.clearUpdateRanges();
        mesh.instanceMatrix.addUpdateRange(0,mesh.count*16);
        mesh.instanceMatrix.needsUpdate=true;
      }
    },
    dispose(){
      for(const mesh of batches.values()){mesh.removeFromParent();mesh.dispose();}
      for(const g of geometries.values())g.dispose();
      material.dispose();
    },
  };
}

const UP=new THREE.Vector3(0,1,0);
const normal=new THREE.Vector3();
export function restDrop(mesh:THREE.Object3D,x:number,z:number,surface:(x:number,z:number)=>number,yaw:number) {
  const step=.24;
  normal.set(surface(x-step,z)-surface(x+step,z),step*2,surface(x,z-step)-surface(x,z+step)).normalize();
  mesh.position.set(x,surface(x,z)+.012,z);
  mesh.quaternion.setFromUnitVectors(UP,normal);
  mesh.rotateY(yaw);
}

export function monsterDropScale(kind:MonsterDropKind,value:number,discreet:boolean) {
  const size=kind==='xp'?(value>=90?1.55:value>=20?1.15:.85):kind==='chakra'?.8:1.05;
  return size*(discreet?.385:.55);
}

export function pickupScrollVariant(kind:'kunai'|'shuriken'|'sealDrop',roll:number) {
  const variants=SCROLL_STYLES.map((style,i)=>({style,i})).filter(({style})=>style.open===(kind!=='shuriken'));
  return variants[Math.min(variants.length-1,Math.floor(Math.max(0,roll)*variants.length))].i;
}
