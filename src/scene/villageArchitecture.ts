import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { MapId } from '../game/maps';
import type { createSolids } from './collision';
import { KONOHA_SQUARES, villageLots, villageRandom, type UrbanLot } from './villageDistricts';
import type { VillageLayout } from './villageLayout';

type Ground = (x:number,z:number)=>number;
type Solids = ReturnType<typeof createSolids>;
export const ARCHITECTURE_ATLAS = '/assets/vilas-arquitetura-v1.png';
const tile = {
  plaster:0,stone:1,red:2,gold:3,blue:4,wood:5,clay:6,sand:7,
  glass:8,vermillion:9,moss:10,cloth:11,bronze:12,slate:13,dark:14,paving:15,
} as const;
export type ArchitectureSurface=keyof typeof tile;
type Surface=ArchitectureSurface;
export function fitArchitectureTile(geometry:THREE.BufferGeometry,key:ArchitectureSurface) {
  const cell=tile[key],u=(cell%4)/4,v=(3-Math.floor(cell/4))/4;
  const uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,u+.002+uv.getX(i)*.246,v+.002+uv.getY(i)*.246);
}

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
  const batches=new Map<string,{items:THREE.BufferGeometry[];lit:boolean;name:string}>();
  const boxIndexed=new THREE.BoxGeometry(1,1,1);
  const boxSource=boxIndexed.toNonIndexed();boxIndexed.dispose();
  const cylinders=new Map<number,THREE.BufferGeometry>();
  const roofs=new Map<number,THREE.BufferGeometry>();
  const sphereIndexed=new THREE.SphereGeometry(.5,12,6);
  const sphere=sphereIndexed.toNonIndexed();sphereIndexed.dispose();
  const state=new THREE.Object3D();
  let frontage:UrbanLot|undefined;

  function add(geo:THREE.BufferGeometry,key:Surface,x:number,y:number,z:number,w:number,h:number,d:number,
    tint=0xffffff,axis=0,lit=false,name='village-architecture') {
    const g=geo.clone();
    if(frontage?.turns){
      const {x:cx,z:cz,turns}=frontage;
      const rotatedX=cx+(z-cz)*turns;
      z=cz-(x-cx)*turns;
      x=rotatedX;
      axis+=turns*Math.PI/2;
    }
    state.position.set(x,y,z);
    state.rotation.set(0,axis,0);
    state.scale.set(w,h,d);
    state.updateMatrix();
    g.applyMatrix4(state.matrix);
    fitArchitectureTile(g,key);
    const uv=g.attributes.uv;
    const color=new THREE.Color(tint);
    const vertices=new Float32Array(uv.count*3);
    for(let i=0;i<uv.count;i++){
      vertices.set([color.r,color.g,color.b],i*3);
    }
    g.setAttribute('color',new THREE.BufferAttribute(vertices,3));
    const id=`${Math.floor(x/24)},${Math.floor(z/24)},${Number(lit)}`+'/'+name;
    let batch=batches.get(id);
    if(!batch){batch={items:[],lit,name};batches.set(id,batch);}
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
    if(frontage?.turns){
      const turn=frontage.turns,rx=frontage.x+(z-frontage.z)*turn;
      z=frontage.z-(x-frontage.x)*turn;
      x=rx;label.rotation.y=turn*Math.PI/2;
    }
    label.position.set(x,y,z);
    root.add(label);placards.push(map);
    return label;
  }

  function academy(lot:UrbanLot,y:number) {
    const {x,z,width:w,depth:d,body:h}=lot;
    box('stone',x,y+.15,z,w+.3,.30,d+.3);
    box('vermillion',x,y+h*.44,z,w,h*.88,d,0xe69a82);
    slabRoof('red',x,z,y+h*.88,w,d,.66);
    const doorZ=z+d/2;
    box('wood',x,y+.98,doorZ,.98,1.82,.21);
    box('dark',x,y+1,doorZ+.09,.76,1.52,.12);
    for(const side of [-1,1]){
      const towerX=x+side*(w*.467);
      cylinder('plaster',towerX,y+h*.5,z-.22,1.47,h,2.3);
      cylinder('red',towerX,y+h+.36,z-.22,1.72,.79,2.44,.55);
      sash(towerX,y+2.68,z+.96,.52,.65,1,false,'wood');
      solids.add(towerX,z-.22,.72,true,y+h+.76);
    }
    box('moss',x,y+h*.85,doorZ+.16,1.9,1.65,.16);
    plaque('忍','#4a2721','#d98f78',x,y+h*.85,doorZ+.254,1.61,1.38);
    solids.addBox(x,z,w/2,d/2,y+h*.88+.73);
  }

  const colors=palettes[layout.map];
  function building(lot:UrbanLot) {
    const {x,z,width:w,depth:d,body,shape,front,use,palette,style}=lot;
    const round=shape==='round';
    const pier=layout.map==='nevoa'&&x>18?.46:.18;
    const y=ground(x,z);
    if(style==='academy'){academy(lot,y);return;}
    const wall=colors.wall[palette],trim=colors.trim;
    const roof=style==='uzumaki'?'red':style==='bathhouse'?'blue':colors.roof[palette];
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
      slabRoof(roof,x,z,y+pier+body,w,d,rise,style==='bathhouse'?0xaed092:0xffffff);
      for(const s of [-1,1])for(const a of [-1,1])
        box(trim,x+s*(w/2-.055),y+pier+body/2,z+a*(d/2-.058),.14,body,.14);
    }
    const top=y+pier+body+rise+.17;
    if(round) {
      // A forma circular da fundação segue o corpo e exclui o vão dos beirais.
      solids.add(x,z,Math.min(w,d)*.49,true,top);
    } else solids.addBox(x,z,(lot.turns?d:w)*.5,(lot.turns?w:d)*.5,top);
    box(trim,x,y+pier+.82,sideZ,1.08,1.67,.13);
    box('dark',x,y+pier+.80,sideZ+front*.075,.79,1.51,.13);
    box('bronze',x+.24,y+pier+.84,sideZ+front*.15,.075,.09,.07);
    box(colors.base,x,y+.096,sideZ+front*.23,1.56,.18,.52);
    for(const side of [-1,1]) {
      sash(x+side*w*.27,y+pier+body*.67,z+front*d*(round?.425:.5),.69,.69,front,layout.map==='nevoa',trim);
      if(body>=3.55)sash(x+side*w*.31,y+pier+1.25,z+front*d*(round?.40:.5),.53,.52,front,false,trim);
      sash(x+side*w*.23,y+pier+body*.62,z-front*d*(round?.45:.5),.61,.63,-front,false,trim);
    }
    if(layout.map==='folha'&&lot.turns){
      slabRoof(roof,x,sideZ+front*.38,y+pier+1.91,w*.86,1.04,.41);
      for(const side of [-1,1]){
        box('wood',x+side*w*.41,y+pier+.91,sideZ+front*.89,.10,1.77,.13);
        cylinder('wood',x+side*w*.39,y+.25,sideZ+front*.54,.45,.50,.45,.94);
        cylinder('dark',x+side*w*.39,y+.41,sideZ+front*.54,.46,.05,.46);
      }
    }
    if(use==='shop'){
      if(!lot.turns)awning(x,y+pier+1.97,sideZ,w*.66,front,layout.map==='nevoa'?'blue':layout.map==='areia'?'cloth':'vermillion');
      lantern(x+w*.36,y+pier+1.78,sideZ+front*.21,'gold');
      for(const s of [-1,1])box('wood',x+s*w*.42,y+.27,sideZ+front*.32,.49,.53,.51);
    } else if (use==='terrace') {
      box(colors.base,x,y+pier+1.93,sideZ+front*.30,w*.71,.18,.72);
      box(trim,x,y+pier+2.30,sideZ+front*.61,w*.70,.10,.10);
      for(let i=-2;i<=2;i++)box(trim,x+i*w*.156,y+pier+2.10,sideZ+front*.61,.078,.37,.10);
      if(layout.map==='folha'){
        const tankX=x+w*.10;
        cylinder('slate',tankX,top+.37,z-.26,.81,.76,.81);
        cylinder('stone',tankX,top+.73,z-.26,.86,.15,.86,.70);
        for(const offset of [.18,.51])cylinder('dark',tankX,top+offset,z-.26,.84,.055,.84);
      }
    }
    if(style==='uzumaki'){
      const floor=top-.12;
      cylinder('plaster',x,floor+.67,z,w*.54,1.46,d*.54);
      cylinder('dark',x,floor+1.30,z,w*.58,.13,d*.58);
      cylinder('red',x,floor+1.58,z,w*.64,.54,d*.64,.58);
      sash(x,floor+.63,z+d*.262,.65,.65,1,false,'wood');
      sash(x,floor+.63,z-d*.262,.65,.65,-1,false,'wood');
      cylinder('stone',x-.38,floor+1.90,z-.32,.56,.61,.56);
      box('glass',x+.48,floor+1.91,z+.13,.67,.10,.50,0x7091a6);
      solids.add(x,z,w*.31,true,floor+1.84,top);
    }else if(style==='bathhouse'){
      const facade=sideZ+front*.115;
      box('moss',x,y+1.03,facade,1.54,1.78,.17,0xe0ead5);
      for(let i=-4;i<=4;i++)box('dark',x+i*.162,y+1.03,facade+.10,.028,1.72,.03);
      box('wood',x,y+2.56,facade,.95,.65,.20);
      plaque('ゆ','#77312a','#e3d2ac',x,y+2.56,facade+.105,.79,.57);
      for(const side of [-1,1])box('vermillion',x+side*w*.29,y+.72,sideZ+.77,.055,1.31,.065);
    }else if(style==='apartments'){
      const terrace=top-.04;
      cylinder('stone',x-.48,terrace+.29,z-.06,.87,.56,.87);
      circular('plaster',x-.48,terrace+.79,z-.06,1.12,.90,1.07,0xc6d0d2);
      cylinder('bronze',x+.69,terrace+.60,z-.40,.14,1.14,.14);
      box('dark',x+w*.48,y+body*.52,z+.41,.12,body*.9,.11);
      box('wood',x,y+body*.51,sideZ+front*.24,w*.60,.075,.28);
    }else if(style==='sand-rotunda'){
      // O adobe tem nervuras, sombreamento na entrada e uma cúpula acima do mercado.
      for(const level of [.31,.87])
        cylinder('clay',x,y+pier+body*level,z,w+.12,.14,d+.12,1,0xd8b78e);
      for(const side of [-1,1]){
        const facade=sideZ+front*.29;
        box('sand',x+side*w*.36,y+1.03,facade,.34,2.06,.49);
        box('bronze',x+side*w*.36,y+1.96,facade,.47,.12,.55);
      }
      cylinder('sand',x,top+.22,z,w*.43,.46,d*.43);
      circular('clay',x,top+.46,z,w*.49,.58,d*.49,0xf4c8a0);
      cylinder('bronze',x,top+.81,z,.10,.22,.10);
      solids.add(x,z,w*.235,true,top+.76,top-.04);
    }else if(style==='stone-watchtower'){
      for(const side of [-1,1]){
        cylinder('slate',x+side*w*.445,y+body*.43,z,.57,body*.86,.68,.72);
        box('stone',x+side*w*.445,y+.16,z,.71,.32,.80);
      }
      cylinder('stone',x,top+.29,z,w*.49,.65,d*.49);
      cylinder('blue',x,top+.69,z,w*.56,.42,d*.56,.62,0xb1a8d4);
      box('dark',x,top+.32,z+d*.244,.40,.37,.10);
      solids.add(x,z,w*.255,true,top+.91,top-.04);
    }else if(style==='mist-dockhouse'){
      const dockZ=sideZ+front*.97;
      box('slate',x,y+.16,dockZ,w+.39,.26,1.13);
      for(const s of [-1,1]){
        const px=x+s*w*.46;
        box('dark',px,y+.49,dockZ,.11,.82,.13);
        box('wood',px,y+.99,dockZ,.20,.12,.21);
        box('blue',px,y+.71,dockZ+front*.47,.11,.09,.83);
      }
      awning(x,y+pier+2.23,sideZ,w*.68,front,'moss');
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
  for(const lot of layout.lots??villageLots(layout.map,0)){
    frontage=lot;
    building(lot);
  }
  frontage=undefined;

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
        box('moss',cx,level+2.07,z-1.47,.21,3.81,2.24,0xc5dcc8);
        for(let i=0;i<4;i++)box('wood',cx,level+.39+i*1.11,z-1.47,.23,.092,2.29);
        box('stone',cx,level+2.01,z+.03,pier+.13,4.00,.61,0xe4d8c8);
        const doorSign=plaque(s>0?'ノ':'木','#a5463b','#92a682',cx-.115*s,level+2.40,z-1.51,1.27,1.53);
        doorSign.rotation.y=-s*Math.PI/2;
        solids.addBox(cx,z-1.47,.105,1.12,level+3.98);
      }
      solids.addBox(cx,z,pier*.5,(pier+.26)*.5,level+h*.80);
    }
    box(sand?'paving':rock?'slate':'dark',x,y+h*.75,z,w,.43,1.48);
    if(leaf){
      box('plaster',x,y+h*.714,z+.45,w*.88,.52,.73,0xf1e1cf);
      box('vermillion',x,y+h*.766,z,w,.26,1.45);
      slabRoof('red',x,z,y+h*.79,w,1.76,1.02);
    }
    else {
      box(base,x,y+h*.84,z,w+1,.75,1.78);
      for(let i=-3;i<=3;i++)box(colors.base,x+i*w*.139,y+h*.89,z,.37,.43,1.74);
    }
    box(sand?'cloth':'vermillion',x,y+h*.75,z+1.0,1.28,.78,.16);
    plaque(leaf?'忍':sand?'砂':'岩','#7b2722','#f4dbad',x,y+h*.75,z+1.085,1.08,.64);
    if(leaf){
      buildStairs(x,3.24,
        steps(z-2.59,z-.49,y,y+.75),{from:z-.49,to:z+.49,top:y+.75},
        steps(z+.49,z+2.59,y+.75,y));
    }
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

  type Tread={from:number;to:number;top:number};
  function steps(from:number,to:number,start:number,end:number,count=Math.max(1,Math.ceil(Math.abs(end-start)/.17))):Tread[] {
    const depth=(to-from)/count;
    return Array.from({length:count},(_,i)=>({
      from:from+i*depth,to:from+(i+1)*depth,
      top:start+(end-start)*(start<end?i+1:i)/count,
    }));
  }

  function buildStairs(x:number,width:number,...sections:(Tread|Tread[])[]) {
    const profile=sections.flat();
    const half=width/2,left=x-half,right=x+half;
    const end=profile.at(-1)!;
    const base=Math.min(...profile.map(step=>Math.min(ground(left,step.from),ground(right,step.from),step.top)),
      ground(left,end.to),ground(right,end.to))-.30;
    const floor:number[]=[],wall:number[]=[];
    function quad(list:number[],a:number[],b:number[],c:number[],d:number[]) {
      list.push(...a,...b,...c,...a,...c,...d);
    }
    function riser(z:number,before:number,after:number) {
      if(Math.abs(before-after)<.0001)return;
      quad(wall,[right,before,z],[left,before,z],[left,after,z],[right,after,z]);
    }
    for(const [i,{from,to,top}] of profile.entries()){
      quad(floor,[left,top,to],[right,top,to],[right,top,from],[left,top,from]);
      quad(wall,[left,base,from],[left,base,to],[left,top,to],[left,top,from]);
      quad(wall,[right,base,to],[right,base,from],[right,top,from],[right,top,to]);
      riser(from,profile[i-1]?.top??base,top);
      solids.addStair(x,(from+to)/2,half,(to-from)/2,top);
    }
    riser(end.to,end.top,base);
    for(const [key,positions,tint] of [
      ['stone',floor,0xf1e8d8],['stone',wall,0xccba9f],
    ] as const){
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      const uv:number[]=[];
      for(let i=0;i<positions.length;i+=18)uv.push(0,0,1,0,1,1,0,0,1,1,0,1);
      geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      geometry.computeVertexNormals();
      add(geometry,key,0,0,0,1,1,1,tint,0,false,'village-stairs');
      geometry.dispose();
    }
  }

  if(layout.map==='folha') {
    const x=7.85,from=-13.24,landing=-17.56,court=-21.10,to=-25.70,width=2.22;
    const base=ground(x,-13.4),top=base+1.20,courtBase=ground(x,to-.20);
    buildStairs(x,width,steps(to,court,courtBase,top),{from:court,to:landing,top},steps(landing,from,top,base,8));
    // O patamar abre para o pátio elevado junto à fachada do quarteirão.
    const patioEdge=x+width/2,patioWidth=3.30;
    buildStairs(patioEdge+patioWidth/2,patioWidth,{from:court-.24,to:landing+.24,top});
    function railing(edge:number,from:number,to:number) {
      const length=to-from,center=(from+to)/2,foot=ground(edge,center)-.20;
      box('stone',edge,(top+foot)/2,center,.19,top-foot,length);
      box('dark',edge,top+.37,center,.13,.10,length-.08);
      for(let i=0;i<5;i++)box('wood',edge,top+.17,from+.18+i*(length-.36)/4,.155,.34,.15);
      solids.addBox(edge,center,.095,length/2,top+.42);
    }
    railing(x-width/2-.10,court,landing);
    railing(patioEdge+patioWidth+.095,court-.24,landing+.24);
    for(const sign of [-1,1]) {
      const z=sign<0?court-.24:landing+.24;
      const planterX=patioEdge+patioWidth*.65;
      box('stone',planterX,top+.16,z-sign*.43,1.34,.32,.69);
      circular('moss',planterX,top+.40,z-sign*.43,1.13,.38,.57,0x9fb46a);
      solids.addBox(planterX,z-sign*.43,.67,.345,top+.32);
    }

    // Arquitetura baixa nos limites das praças mantém o centro aberto para circulação e eventos.
    for(const [i,square] of KONOHA_SQUARES.entries()){
      const posts=i===2?[-2,0,2]:[-2.5,2.5];
      for(const dx of posts){
        const sx=square.x+dx,sz=square.z-square.rz+.8,sy=ground(sx,sz);
        if(i===2){
          cylinder('wood',sx,sy+.74,sz,.31,1.48,.31);
          cylinder('cloth',sx,sy+1.07,sz,.37,.31,.37,.94,0xd4bb95);
          solids.add(sx,sz,.16,false,sy+1.48);
        }else{
          box('stone',sx,sy+.26,sz,1.56,.15,.53);
          for(const offset of [-.55,.55])box('stone',sx+offset,sy+.094,sz,.22,.19,.38);
          solids.addBox(sx,sz,.78,.265,sy+.335);
        }
      }
    }

    // Pedras baixas e tufos compõem o acostamento. A passagem central fica livre.
    const random=villageRandom((layout.seed??0)^0xb053);
    for(const side of [-1,1])for(let i=0;i<52;i++){
      const z=11-i*.67+(random()-.5)*.32;
      if(Math.abs(z-layout.entry.z)<2.25||layout.crossings.some(crossing=>Math.abs(crossing-z)<1.55))continue;
      const x=side*(2.42+random()*.98);
      const y=ground(x,z),size=.12+random()*.25;
      circular('stone',x,y+.028,z,size,.082,size*.81,i%4?0xbdb09c:0xe0d4bd);
      if(i%3===0){
        const shrubX=side*(3.66+random()*.46);
        const shrubY=ground(shrubX,z);
        circular('moss',shrubX,shrubY+.09,z,.48,.25,.37,0xb7d481);
        circular('moss',shrubX+side*.13,shrubY+.12,z-.14,.34,.31,.36,0x96b568);
      }
    }
  }

  const meshes:THREE.Mesh[]=[];
  for(const batch of batches.values()){
    const merged=mergeGeometries(batch.items);
    batch.items.forEach(geo=>geo.dispose());
    if(!merged)continue;
    merged.computeBoundingSphere();
    const mesh=new THREE.Mesh(merged,batch.lit?lanternMaterial:material);
    mesh.name=batch.name;
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    root.add(mesh);meshes.push(mesh);
  }
  boxSource.dispose();sphere.dispose();cylinders.forEach(geo=>geo.dispose());roofs.forEach(geo=>geo.dispose());
  return {textures:[atlas,...placards]};
}
