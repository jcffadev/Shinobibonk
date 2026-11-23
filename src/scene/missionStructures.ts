
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ARCHITECTURE_ATLAS, fitArchitectureTile, type ArchitectureSurface } from './villageArchitecture';

export type MissionStructure = 'guardian' | 'ramen' | 'merchant' | 'altar';

/** A small four-sided relief. All faces keep the same orientation in world space. */
export function createFixedMissionNpc(art:THREE.SpriteMaterial) {
  const faces:THREE.PlaneGeometry[]=[];
  const depth=.15;
  for(const side of [-1,1]){
    const front=new THREE.PlaneGeometry(1,1);
    front.rotateY(side===1?0:Math.PI);
    front.translate(0,0,side*depth/2);
    faces.push(front);
    const flank=new THREE.PlaneGeometry(depth,1);
    flank.rotateY(side*Math.PI/2);
    flank.translate(side*.5,0,0);
    faces.push(flank);
  }
  const geometry=mergeGeometries(faces)!;
  faces.forEach(face=>face.dispose());
  const material=new THREE.MeshBasicMaterial({
    map:art.map,color:art.color,opacity:art.opacity,transparent:art.transparent,
    alphaTest:art.alphaTest,depthWrite:true,
  });
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='mission-npc-fixed';
  return mesh;
}

export function createMissionStructures() {
  const atlas=new THREE.TextureLoader().load(ARCHITECTURE_ATLAS);
  atlas.colorSpace=THREE.SRGBColorSpace;
  atlas.magFilter=THREE.NearestFilter;
  atlas.minFilter=THREE.LinearMipmapLinearFilter;
  atlas.anisotropy=4;

  function make(kind:MissionStructure,color=0xffffff) {
    const root=new THREE.Group();
    root.name='mission-'+kind;
    const surfaces:THREE.BufferGeometry[]=[];
    const lights:THREE.BufferGeometry[]=[];
    function part(source:THREE.BufferGeometry,tile:ArchitectureSurface,x:number,y:number,z:number,
      width:number,height:number,depth:number,tint=0xffffff,angle=0,glow=false){
      const geometry=source.index?source.toNonIndexed():source;
      if(geometry!==source)source.dispose();
      geometry.clearGroups();
      geometry.scale(width,height,depth).rotateZ(angle).translate(x,y,z);
      fitArchitectureTile(geometry,tile);
      const rgb=new THREE.Color(tint),colors=new Float32Array(geometry.attributes.position.count*3);
      for(let i=0;i<colors.length;i+=3)colors.set([rgb.r,rgb.g,rgb.b],i);
      geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
      (glow?lights:surfaces).push(geometry);
    }
    const box=(tile:ArchitectureSurface,x:number,y:number,z:number,w:number,h:number,d:number,tint?:number,angle?:number,glow?:boolean)=>
      part(new THREE.BoxGeometry(1,1,1),tile,x,y,z,w,h,d,tint,angle,glow);
    const round=(tile:ArchitectureSurface,x:number,y:number,z:number,w:number,h:number,d:number,r=1,tint?:number)=>
      part(new THREE.CylinderGeometry(r/2,.5,1,16),tile,x,y,z,w,h,d,tint);
    if(kind==='guardian'){
      for(const side of [-1,1]){
        round('stone',side*.31,-.40,0,.21,.11,.24);
        round('vermillion',side*.31,-.015,0,.12,.74,.15,.95);
        box('dark',side*.31,.32,0,.21,.075,.25);
      }
      box('vermillion',0,.25,0,.86,.105,.18);
      box('red',0,.36,0,.97,.124,.31);
      box('slate',0,.432,0,1.02,.045,.35);
      box('wood',0,.13,0,.64,.055,.07);
      box('cloth',0,.143,.097,.19,.15,.021,0xf5d8a0);
    }else if(kind==='ramen'){
      box('stone',0,-.42,0,.81,.08,.50);
      box('wood',0,-.095,-.217,.76,.59,.065);
      for(const side of [-1,1]){
        box('wood',side*.35,-.104,.023,.065,.65,.41);
        box('dark',side*.32,-.10,.24,.05,.68,.06);
      }
      box('wood',0,-.232,.185,.72,.35,.11);
      box('bronze',0,-.044,.209,.78,.042,.185);
      round('dark',.185,.03,.145,.14,.09,.12,.85);
      for(const x of [-.23,0,.23]){
        round('wood',x,-.327,.350,.051,.23,.053);
        round('bronze',x,-.21,.350,.13,.046,.13);
        box('vermillion',x,.192,.272,.206,.125,.02,0xf4ab6b);
      }
      box('dark',0,.277,.005,.88,.055,.58);
      box('red',0,.34,-.10,.86,.09,.37);
      box('red',0,.29,.178,.87,.08,.28);
      box('red',0,.39,-.12,.80,.055,.15);
    }else if(kind==='merchant'){
      round('stone',0,-.405,0,.76,.09,.63);
      round('plaster',0,-.12,0,.73,.51,.60);
      round('dark',0,.12,0,.80,.075,.69);
      round('red',0,.22,0,.86,.17,.74,.64);
      round('plaster',0,.31,0,.54,.10,.45);
      round('red',0,.395,0,.66,.12,.56,.36);
      box('wood',0,-.20,.293,.18,.32,.042);
      for(const x of [-.215,.215]){
        box('wood',x,-.062,.244,.147,.15,.046);
        box('glass',x,-.05,.271,.106,.098,.012,0xb4d4de);
      }
      box('cloth',0,.04,.314,.26,.073,.012,0xeed6a9);
    }else{
      round('slate',0,-.393,0,.88,.114,.77);
      round('stone',0,-.286,0,.74,.12,.64);
      round('slate',0,-.203,0,.58,.064,.53);
      const circle=new THREE.RingGeometry(.203,.231,40);
      circle.rotateX(-Math.PI/2);
      part(circle,'cloth',0,-.168,0,1,1,1,color,0,true);
      box('slate',0,-.008,-.210,.49,.35,.102);
      box('cloth',0,.007,-.151,.133,.113,.010,color,0,true);
      for(const x of [-.275,.275]){
        box('stone',x,-.038,-.198,.095,.51,.12);
        box('cloth',x,.066,-.131,.048,.135,.031,color,0,true);
      }
      box('dark',0,.245,-.204,.67,.054,.29);
      box('slate',-.145,.304,-.204,.38,.074,.295,0xe0d3d3,.21);
      box('slate',.145,.304,-.204,.38,.074,.295,0xe0d3d3,-.21);
    }
    const material=new THREE.MeshStandardMaterial({map:atlas,vertexColors:true,roughness:.88,transparent:true});
    const fadeMaterials:THREE.Material[]=[material];
    for(const [parts,paint] of [
      [surfaces,material],
      [lights,lights.length?new THREE.MeshBasicMaterial({vertexColors:true,transparent:true}):null],
    ] as const){
      if(!paint||!parts.length)continue;
      root.add(new THREE.Mesh(mergeGeometries(parts)!,paint));
      for(const geometry of parts)geometry.dispose();
      if(paint!==material)fadeMaterials.push(paint);
    }
    return {obj:root,fadeMaterials};
  }

  return {make,dispose:()=>atlas.dispose()};
}
