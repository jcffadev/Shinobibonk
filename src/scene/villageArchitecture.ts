import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { MapId } from '../game/maps';
import type { createSolids } from './collision';
import { VILLAGE_LOTS, type UrbanLot } from './villageDistricts';
import type { VillageLayout } from './villageLayout';

type Ground = (x:number,z:number)=>number;
type Solids = ReturnType<typeof createSolids>;
export const ARCHITECTURE_ATLAS = '/assets/vilas-arquitetura-v1.png';
const tile = {
  plaster:0,stone:1,red:2,gold:3,blue:4,wood:5,clay:6,sand:7,
  glass:8,vermillion:9,moss:10,cloth:11,bronze:12,slate:13,dark:14,paving:15,
} as const;
type Surface=keyof typeof tile;

const palettes:Record<MapId,{wall:Surface[];roof:Surface[];base:Surface;trim:Surface}> = {
  folha:{wall:['plaster','plaster','sand'],roof:['red','gold','red'],base:'stone',trim:'wood'},
  areia:{wall:['sand','clay','plaster'],roof:['clay','sand','bronze'],base:'paving',trim:'bronze'},
  pedra:{wall:['stone','stone','plaster'],roof:['slate','dark','blue'],base:'stone',trim:'dark'},
  nevoa:{wall:['plaster','stone','plaster'],roof:['blue','slate','blue'],base:'stone',trim:'dark'},
};

export function createVillageArchitecture(root:THREE.Group,layout:VillageLayout,ground:Ground,solids:Solids) {
  const atlas=new THREE.TextureLoader().load(ARCHITECTURE_ATLAS);
  atlas.colorSpace=THREE.SRGBColorSpace;
  atlas.magFilter=THREE.NearestFilter;
  atlas.minFilter=THREE.LinearMipmapLinearFilter;
  atlas.anisotropy=2;
  const material=new THREE.MeshStandardMaterial({map:atlas,vertexColors:true,roughness:.84,flatShading:true});
  const lanternMaterial=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true});
  const batches=new Map<string,{items:THREE.BufferGeometry[];lit:boolean}>();
  const boxIndexed=new THREE.BoxGeometry(1,1,1);
  const boxSource=boxIndexed.toNonIndexed();boxIndexed.dispose();
  const cylinders=new Map<number,THREE.BufferGeometry>();
  const roofs=new Map<number,THREE.BufferGeometry>();
  const sphereIndexed=new THREE.SphereGeometry(.5,12,6);
  const sphere=sphereIndexed.toNonIndexed();sphereIndexed.dispose();
  const state=new THREE.Object3D();

  function add(geo:THREE.BufferGeometry,key:Surface,x:number,y:number,z:number,w:number,h:number,d:number,
    tint=0xffffff,axis=0,lit=false) {
    const g=geo.clone();
    state.position.set(x,y,z);
    state.rotation.set(0,axis,0);
    state.scale.set(w,h,d);
    state.updateMatrix();
    g.applyMatrix4(state.matrix);
    const cell=tile[key],u=(cell%4)/4,v=(3-Math.floor(cell/4))/4;
    const uv=g.attributes.uv;
    const color=new THREE.Color(tint);
    const vertices=new Float32Array(uv.count*3);
    for(let i=0;i<uv.count;i++){
      uv.setXY(i,u+.002+uv.getX(i)*.246,v+.002+uv.getY(i)*.246);
      vertices.set([color.r,color.g,color.b],i*3);
    }
    g.setAttribute('color',new THREE.BufferAttribute(vertices,3));
    const id=`${Math.floor(x/24)},${Math.floor(z/24)},${Number(lit)}`;
    let batch=batches.get(id);
    if(!batch){batch={items:[],lit};batches.set(id,batch);}
    batch.items.push(g);
  }
  function box(key:Surface,x:number,y:number,z:number,w:number,h:number,d:number,tint?:number,axis?:number,lit?:boolean) {
    add(boxSource,key,x,y,z,w,h,d,tint,axis,lit);
  }
  function cylinder(key:Surface,x:number,y:number,z:number,w:number,h:number,d:number,top=1,tint?:number) {
    let geo=cylinders.get(top);
    if(!geo){
      const original=new THREE.CylinderGeometry(top*.5,.5,1,16);
      geo=original.toNonIndexed();original.dispose();cylinders.set(top,geo);
    }
    add(geo,key,x,y,z,w,h,d,tint);
  }
  const circular=(key:Surface,x:number,y:number,z:number,w:number,h:number,d:number,tint?:number) =>
    add(sphere,key,x,y,z,w,h,d,tint);

  function slabRoof(key:Surface,x:number,z:number,y:number,w:number,d:number,rise:number,tint=0xffffff) {
    const width=w+.66,depth=d+.60;
    box('dark',x,y,z,width+.10,.15,depth+.08);
    const ratio=Math.max(.23,Math.min(.72,Math.round((w-d*.46)/width*20)/20));
    let roof=roofs.get(ratio);
    if(!roof){
      const a=[-.5,0,-.5],b=[.5,0,-.5],c=[.5,0,.5],e=[-.5,0,.5];
      const p=[-ratio/2,1,0],q=[ratio/2,1,0];
      roof=new THREE.BufferGeometry();
      roof.setAttribute('position',new THREE.Float32BufferAttribute([e,c,q,e,q,p,b,a,p,b,p,q,a,e,p,c,b,q].flat(),3));
      roof.setAttribute('uv',new THREE.Float32BufferAttribute([
        0,0,1,0,(1+ratio)/2,1, 0,0,(1+ratio)/2,1,(1-ratio)/2,1,
        0,0,1,0,(1+ratio)/2,1, 0,0,(1+ratio)/2,1,(1-ratio)/2,1,
        0,0,1,0,.5,1, 0,0,1,0,.5,1,
      ],2));
      roof.computeVertexNormals();
      roofs.set(ratio,roof);
    }
    add(roof,key,x,y+.07,z,width,rise,depth,tint);
    box(key,x,y+rise+.09,z,width*ratio+.14,.14,.18,tint);
  }

  function sash(x:number,y:number,z:number,width:number,height:number,front:number,covered:boolean,wall:Surface) {
    box(wall,x,y,z,width+.20,height+.20,.10);
    box('dark',x,y,z+front*.05,width,height,.12);
    box(covered?'gold':'glass',x,y,z+front*.12,width*.73,height*.75,.026,covered?0xeac98e:0xaed2d9,0,covered);
    box('wood',x,y,z+front*.147,width*.75,.055,.035);
    box('wood',x,y,z+front*.148,.048,height*.75,.034);
    box('stone',x,y-height*.52,z+front*.14,width+.18,.09,.33);
  }

  function lantern(x:number,y:number,z:number,style:Surface) {
    box('dark',x,y+.18,z,.27,.07,.24);
    box(style,x,y,z,.21,.29,.19,0xffd494,0,true);
    box('dark',x,y-.17,z,.25,.054,.22);
  }
  function awning(x:number,y:number,z:number,width:number,front:number,paint:Surface) {
    box(paint,x,y,z+front*.36,width,.15,.95);
    box(paint,x,y-.14,z+front*.81,width,.26,.09,0xd8c8a8);
    for(const s of [-1,1])box('wood',x+s*(width*.46),y-.80,z+front*.72,.08,1.39,.10);
  }

  const placards:THREE.Texture[]=[];
  function plaque(text:string,ink:string,back:string,x:number,y:number,z:number,w:number,h:number) {
    const canvas=document.createElement('canvas');
    canvas.width=128;canvas.height=64;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle=ink;ctx.fillRect(0,0,128,64);
    ctx.fillStyle=back;ctx.fillRect(4,4,120,56);
    ctx.fillStyle=ink;ctx.font='bold 42px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,64,34,114);
    const map=new THREE.CanvasTexture(canvas);
    map.colorSpace=THREE.SRGBColorSpace;
    const label=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map}));
    label.position.set(x,y,z);
    root.add(label);placards.push(map);
  }

  const colors=palettes[layout.map];
  function building(lot:UrbanLot) {
    const {x,z,width:w,depth:d,body,shape,front,use,palette}=lot;
    const round=shape==='round';
    const pier=layout.map==='nevoa'&&x>18?.46:.18;
    const y=ground(x,z);
    const wall=colors.wall[palette],roof=colors.roof[palette],trim=colors.trim;
    const rise=layout.map==='areia'?.75:use==='terrace'?1.07:.78;
    const sideZ=z+front*(d*.5);
    if(layout.map==='nevoa') {
      for(const sign of [-1,1])for(const side of [-1,1])
        box('dark',x+sign*w*.39,y+.16,z+side*d*.41,.26,pier+.42,.25);
    }
    box(colors.base,x,y+pier*.30,z,w*.98,pier*.63,d*.98);
    if(round) {
      cylinder(wall,x,y+pier+body*.5,z,w,body,d);
      cylinder(trim,x,y+pier+body-.09,z,w+.28,.18,d+.28);
      if(layout.map==='areia') {
        cylinder(roof,x,y+pier+body+.18,z,w+.30,.40,d+.30,.85);
        circular(roof,x,y+pier+body+.24,z,w*.86,rise*1.48,d*.83);
        box(roof,x,y+pier+body+rise+.12,z,w*.38,.13,d*.36);
      } else {
        cylinder(roof,x,y+pier+body+rise*.56,z,w+.55,rise,d+.58,.56);
        cylinder(roof,x,y+pier+body+rise+.09,z,w*.57,.14,d*.56);
      }
    } else {
      box(wall,x,y+pier+body/2,z,w,body,d);
      box(trim,x,y+pier+body-.10,z,w+.05,.20,d+.09);
      slabRoof(roof,x,z,y+pier+body,w,d,rise);
      for(const s of [-1,1])for(const a of [-1,1])
        box(trim,x+s*(w/2-.055),y+pier+body/2,z+a*(d/2-.058),.14,body,.14);
    }
    const top=y+pier+body+rise+.17;
    if(round) {
      // A forma circular da fundação segue o corpo e exclui o vão dos beirais.
      solids.add(x,z,Math.min(w,d)*.49,true,top);
    } else solids.addBox(x,z,w*.5,d*.5,top);
    box(trim,x,y+pier+.82,sideZ,1.08,1.67,.13);
    box('dark',x,y+pier+.80,sideZ+front*.075,.79,1.51,.13);
    box('bronze',x+.24,y+pier+.84,sideZ+front*.15,.075,.09,.07);
    box(colors.base,x,y+.096,sideZ+front*.23,1.56,.18,.52);
    for(const side of [-1,1]) {
      sash(x+side*w*.27,y+pier+body*.67,z+front*d*(round?.425:.5),.69,.69,front,layout.map==='nevoa',trim);
      if(body>=3.55)sash(x+side*w*.31,y+pier+1.25,z+front*d*(round?.40:.5),.53,.52,front,false,trim);
      sash(x+side*w*.23,y+pier+body*.62,z-front*d*(round?.45:.5),.61,.63,-front,false,trim);
    }
    if(use==='shop'){
      awning(x,y+pier+1.97,sideZ,w*.66,front,layout.map==='nevoa'?'blue':layout.map==='areia'?'cloth':'vermillion');
      lantern(x+w*.36,y+pier+1.78,sideZ+front*.21,'gold');
      for(const s of [-1,1])box('wood',x+s*w*.42,y+.27,sideZ+front*.32,.49,.53,.51);
    } else if (use==='terrace') {
      box(colors.base,x,y+pier+1.93,sideZ+front*.30,w*.71,.18,.72);
      box(trim,x,y+pier+2.30,sideZ+front*.61,w*.70,.10,.10);
      for(let i=-2;i<=2;i++)box(trim,x+i*w*.156,y+pier+2.10,sideZ+front*.61,.078,.37,.10);
      if(layout.map==='folha')cylinder('slate',x+w*.19,top+.39,z-.29,.91,.80,.86);
    }
    if(layout.map==='nevoa') {
      lantern(x-w*.32,y+pier+1.65,sideZ+front*.31,'gold');
      box('wood',x,y+.12,sideZ+front*.55,w,.23,1.10);
    }
    // As fachadas laterais continuam legíveis quando o jogador orbita a câmera.
    for(const side of [-1,1]) {
      box(trim,x+side*(w*.50),y+pier+body*.61,z,.14,.82,.92);
      box('dark',x+side*(w*.515),y+pier+body*.61,z,.11,.63,.68);
      box('glass',x+side*(w*.535),y+pier+body*.61,z,.06,.45,.50);
      box(trim,x+side*(w*.55),y+pier+body*.61,z,.047,.49,.05);
    }
  }
  for(const lot of VILLAGE_LOTS[layout.map])building(lot);

  const gate=layout.buildings.find(item=>item.gate);
  if(gate) {
    const {x,z,width:w,height:h}=gate;
    const y=ground(x,z),sand=layout.map==='areia',rock=layout.map==='pedra',leaf=layout.map==='folha';
    const side=w*(layout.map==='folha'?.315:.34), pier=sand?2.50:rock?2.30:1.15;
    const base=sand?'sand':rock?'stone':'vermillion';
    for(const s of [-1,1]) {
      const cx=x+s*side;
      const level=ground(cx,z);
      box(colors.base,cx,level+.30,z,pier+.24,.6,pier+.41);
      box(base,cx,level+h*.39,z,pier,h*.78,pier+.26);
      box(rock?'stone':'dark',cx,level+h*.77,z,pier+.24,.34,pier+.60);
      if(sand)cylinder('paving',cx,level+h*.86,z,pier+1.23,1.1,pier+.94,.78);
      lantern(cx,level+2.5,z+pier*.68,sand?'gold':'red');
      if(leaf) {
        // Folhas abertas do portão, alinhadas à passagem e apoiadas nos batentes.
        box('moss',cx,level+1.72,z-1.12,.16,3.08,1.67,0xb2ccae);
        for(let i=0;i<3;i++)box('dark',cx,level+.47+i*1.23,z-1.12,.19,.072,1.71);
        solids.addBox(cx,z-1.12,.08,.835,level+3.26);
      }
      solids.addBox(cx,z,pier*.5,(pier+.26)*.5,level+h*.80);
    }
    box(sand?'paving':rock?'slate':'dark',x,y+h*.75,z,w,.43,1.48);
    if(!sand&&!rock)slabRoof('red',x,z,y+h*.77,w,1.63,.87);
    else {
      box(base,x,y+h*.84,z,w+1,.75,1.78);
      for(let i=-3;i<=3;i++)box(colors.base,x+i*w*.139,y+h*.89,z,.37,.43,1.74);
    }
    box(sand?'cloth':'vermillion',x,y+h*.75,z+1.0,1.28,.78,.16);
    plaque(leaf?'忍':sand?'砂':'岩','#7b2722','#f4dbad',x,y+h*.75,z+1.085,1.08,.64);
  }

  function tower(x:number,z:number,diameter:number,height:number) {
    const y=ground(x,z),leaf=layout.map==='folha',sand=layout.map==='areia',mist=layout.map==='nevoa';
    const body:Surface=leaf?'vermillion':sand?'sand':mist?'slate':'stone';
    const roof:Surface=leaf?'gold':sand?'clay':mist?'blue':'dark';
    const plinth:Surface=leaf?'plaster':sand?'paving':'stone';
    cylinder('stone',x,y+.36,z,diameter,.72,diameter);
    cylinder(body,x,y+height*.234,z,diameter*.92,height*.34,diameter*.92);
    cylinder(plinth,x,y+height*.414,z,diameter*.95,.32,diameter*.95);
    cylinder(roof,x,y+height*.478,z,diameter,height*.13,diameter,.76);
    cylinder(body,x,y+height*.65,z,diameter*.74,height*.25,diameter*.74);
    cylinder(plinth,x,y+height*.773,z,diameter*.77,.29,diameter*.77);
    cylinder(roof,x,y+height*.84,z,diameter*.82,height*.13,diameter*.82,.59);
    if(sand)circular('clay',x,y+height*.91,z,diameter*.49,height*.39,diameter*.49);
    else cylinder(roof,x,y+height*.97,z,diameter*.48,height*.13,diameter*.48,.19);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      for(const [radius,level] of [[.46,.27],[.37,.66]] as const) {
        const px=x+diameter*radius*Math.sin(a),pz=z+diameter*radius*Math.cos(a);
        box('dark',px,y+height*level,pz,.62,.91,.12,0xffffff,a);
        box(mist?'gold':'glass',px+.085*Math.sin(a),y+height*level,pz+.085*Math.cos(a),.44,.69,.054,0xe3cbaa,a,mist);
      }
    }
    for(let i=0;i<4;i++)box('stone',x,y+.06+i*.11,z+diameter*.42+(4-i)*.39,2.5,.15,1.08);
    box('dark',x,y+1.36,z+diameter*.463,1.76,2.56,.24);
    plaque(leaf?'火':sand?'風':mist?'水':'土','#872a1d','#eed4a3',x,y+height*.67,z+diameter*.382,1.08,.69);
    const ledge=y+height*.41;
    solids.add(x,z,diameter*.49,true,ledge);
    solids.add(x,z,diameter*.37,true,y+height*.77,ledge);
    solids.add(x,z,diameter*.24,true,y+height*1.035,y+height*.77);
  }

  if(layout.map==='folha')tower(-1,-39,11.4,11.4);
  for(const b of layout.buildings.filter(item=>item.art==='regional'&&!item.gate))tower(b.x,b.z,b.width*.66,b.height*.88);

  // Unidades pequenas dão escala às fachadas. Cada trecho muda com o relevo e deixa as transversais livres.
  for(const side of [-1,1])for(let i=0;i<23;i++){
    const z=5-i*2.75,x=side*(3.36+.39*Math.sin(z*.14));
    if(layout.crossings.some(crossing=>Math.abs(crossing-z)<2)||Math.abs(layout.entry.z-z)<2.3)continue;
    if(layout.map==='nevoa'&&side>0)continue;
    const y=ground(x,z);
    box(colors.base,x,y+.045,z,.46,.13,2.62);
    if(i%4===1) {
      box('dark',x+side*.69,y+.72,z,.10,1.42,.10);
      lantern(x+side*.69,y+1.45,z,'gold');
    }
    if(i%7===4&&layout.map!=='areia'){
      const planter=x+side*1.38,base=ground(planter,z);
      box(colors.base,planter,base+.15,z,1.34,.30,1.32);
      circular('moss',planter,base+.51,z,1.07,.73,1.08,0x99bc9c);
      solids.addBox(planter,z,.67,.66,base+.30);
    }
  }

  if(layout.map==='folha') {
    // Escada exterior e terraço do lado da rua. Cada degrau tem o próprio apoio.
    const x=7.85,z=-15.4,base=ground(x,z+2.0);
    for(let i=0;i<8;i++){
      const stepZ=z+1.89-i*.54,top=base+.15*(i+1);
      box('stone',x,top-.22,stepZ,2.22,.44,.59);
      solids.addStair(x,stepZ,1.11,.295,top);
      for(const side of [-1,1])box('paving',x+side*1.2,top-.065,stepZ,.24,.43,.58);
    }
    const landing=base+1.2;
    box('paving',x,landing-.35,z-3.02,2.50,.70,1.80);
    solids.addStair(x,z-3.02,1.25,.9,landing);
  }

  const meshes:THREE.Mesh[]=[];
  for(const batch of batches.values()){
    const merged=mergeGeometries(batch.items);
    batch.items.forEach(geo=>geo.dispose());
    if(!merged)continue;
    merged.computeBoundingSphere();
    const mesh=new THREE.Mesh(merged,batch.lit?lanternMaterial:material);
    mesh.name='village-architecture';
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    root.add(mesh);meshes.push(mesh);
  }
  boxSource.dispose();sphere.dispose();cylinders.forEach(geo=>geo.dispose());roofs.forEach(geo=>geo.dispose());
  return {textures:[atlas,...placards]};
}
