import type { MapId } from '../game/maps';
import { MEMORIAL } from './memorialStone';
import { HAGOROMO_ARENA } from './terrainArt';
import { waterDistance } from './water';

export const KONOHA_STATUES=[{x:33,z:29,index:1},{x:49,z:29,index:2}] as const;
export const KONOHA_SQUARES=[
  {x:-21,z:22,rx:7.4,rz:5.4},
  {x:57,z:-26,rx:6.7,rz:5.0},
  {x:25,z:53,rx:6.2,rz:5.8},
] as const;
export const inHagoromoClearing=(x:number,z:number,margin=2)=>
  Math.hypot(x-HAGOROMO_ARENA.x,z-HAGOROMO_ARENA.z)<HAGOROMO_ARENA.r+margin;


export type UrbanLot = {
  x: number; z: number; width: number; depth: number; body: number;
  front: -1 | 1; shape: 'round' | 'rect'; use: 'house' | 'shop' | 'terrace';
  palette: number;
  style?: 'academy' | 'uzumaki' | 'bathhouse' | 'apartments' | 'sand-rotunda' | 'stone-watchtower' | 'mist-dockhouse';
  turns?: -1 | 1;
};

type Block = { z: number; west: number[]; east: number[]; height: number };
const block = (z:number,west:number[],east:number[],height=0):Block => ({z,west,east,height});
const blocks:Record<MapId,Block[]> = {
  folha: [
    block(7,[-7.2,-15.1],[7.4,14.5]),
    block(0,[-7.1,-14.1],[7.5,14.8]),
    block(-12,[-11.5,-18,-24],[11.6,17.9,23.6],.30),
    block(-20,[-13.8,-20.7],[13.8,21.2],.20),
    block(-32,[-11.7,-17.8,-23.3],[10.7,17.4,24.3],.50),
    block(-38,[-10.7,-17.9,-23.8],[10.9,16.5,22.6],.34),
    block(-49,[-6.1,-13.2,-20.1,-25],[8.5,15.6,22.5],.95),
    block(-56,[-8.7,-14.9,-21.2],[8.9,15.1,21.7],1.21),
  ],
  areia: [
    block(4,[-10.8,-17.3],[10.6,18.7]),
    block(-4,[-10.6,-18.7,-26.3],[10.8,18,26],.32),
    block(-15,[-11.6,-19.2,-26.7],[11.8,19.6,27.2],.27),
    block(-23,[-10.9,-18.2,-26],[11.2,18.5,25.4],.63),
    block(-35,[-11.7,-17.8,-26.3],[11.9,19.5,27],.68),
    block(-40,[-13.2,-20.3],[13.2,20.9],.95),
    block(-53,[-12,-20,-28],[13.2,21.2,27.7],1.2),
    block(-61,[-10.8,-18.5,-26],[11.1,18.6,25.8],1.30),
  ],
  pedra: [
    block(5,[-8.2,-16.1],[8.5,15.2]),
    block(-2,[-8.8,-16.1,-21.7],[9.1,16.4,22.2],.8),
    block(-13,[-12.1,-19.1,-26.2],[12.2,19.3,26.3],.83),
    block(-21,[-12.4,-18.9,-26.3],[12.1,18.2,25.8],.51),
    block(-33,[-10.7,-17.8,-24.3],[10.6,17.8,24.5],.72),
    block(-38,[-12,-19.4,-27],[12.8,19.6,26.5],.9),
    block(-50,[-21.2,-27.5],[5.5,12.3,19.2,26.5],1.20),
    block(-59,[-20.7,-27.3],[5.8,12.9,19.1,27.2],1.43),
  ],
  nevoa: [
    block(6,[-6.1,-13.4],[19.7,26.2]),
    block(-3,[-7,-14.2,-20.9],[20.1,26.9],.32),
    block(-10,[-10.3,-17.7,-24.1],[23.8,29.2],.42),
    block(-19,[-7.6,-15.6,-22.7],[21.5,27.2],.35),
    block(-25,[-14.6,-21.6,-28.2],[23.2,28.8],.65),
    block(-36,[-8.9,-16.7,-23.8],[20.9,27.5],.63),
    block(-41,[-22.4,-28.1],[22.5,28.1],.82),
    block(-53,[-6.9,-15.6,-22.9],[19.9,26.1],.85),
    block(-59,[-7.6,-14.9,-22.2],[18.9,30.8],1.10),
  ],
};

export const VILLAGE_LOTS:Record<MapId,UrbanLot[]> = Object.fromEntries(
  Object.entries(blocks).map(([id,rows])=>[id,rows.flatMap((row,r)=>
    [...row.west,...row.east].map((x,i)=>{
      const n=(i*3+r*7)%11;
      const use=n%4===0?'shop':n%3===0?'terrace':'house';
      const shape=(id==='areia'||(id!=='nevoa'&&n%3===1))?'round':'rect';
      const width=3.65+n*.12;
      return { x,z:row.z+((n%3)-1)*.45,width,depth:shape==='round'?width:3.1+(n%4)*.26,
        body:2.65+row.height+(n%4)*.32,front:r%3===0&&r>2?-1:1,shape,use,palette:n%3 } as UrbanLot;
    })
  )])
) as Record<MapId,UrbanLot[]>;


/** Sementes independentes para lotes, árvores e eventos da zona. */
export function villageRandom(seed:number) {
  let value=seed>>>0;
  return () => {
    value=(Math.imul(value,1664525)+1013904223)>>>0;
    return value/0x1_0000_0000;
  };
}

function konohaExpansion():UrbanLot[] {
  const outskirts=[-13,-21,-32,-40,-51,-58].flatMap((z,i)=>
    [-36,-29,29,36].map((x,j)=>lotFor(x,z,i,j))
  );
  const flanks=[-60,-49,-36,-22,-12,-2,9,21,31,43,54,63].flatMap((z,i)=>
    [-64,-52,-43,43,52,64].map((x,j)=>lotFor(x,z,i+1,j))
  );
  const south=[15,25,36,46,56,64].flatMap((z,i)=>
    [-37,-29,-20,-13,-6,6,13,20,29,37].map((x,j)=>lotFor(x,z,i+2,j))
  );
  return [...outskirts,...flanks,...south.filter(clearKonohaLot)];
}

function lotFor(x:number,z:number,row:number,col:number):UrbanLot {
  const n=(row*7+col*3)%13;
  return {
    x,z,width:4.05+n%5*.18,depth:3.48+n%4*.16,body:2.95+n%5*.27,
    front:row%2===0?1:-1,
    shape:n%3===1?'round':'rect',use:n%5===0?'shop':n%3===0?'terrace':'house',palette:n%3,
  };
}

function clearKonohaLot(lot:UrbanLot) {
  const {x,z}=lot;
  if(inHagoromoClearing(x,z,5.2)||waterDistance('folha',x,z).outside<4.3)return false;
  if(Math.hypot(x-MEMORIAL.x,z-MEMORIAL.z)<5.8)return false;
  if(KONOHA_STATUES.some(statue=>Math.hypot(x-statue.x,z-statue.z)<6.8))return false;
  return KONOHA_SQUARES.every(square=>
    Math.abs(x-square.x)>square.rx+2.5||Math.abs(z-square.z)>square.rz+2.5);
}

const konohaLots=konohaExpansion();

function regionalExpansion(map:Exclude<MapId,'folha'>) {
  const rows=map==='areia'?[-56,-37,-19,-4,14,24]:map==='pedra'?[-55,-38,-21,-4,14,24]:[-55,-37,-21,-3,14,22];
  const sides=rows.flatMap((z,row)=>[-38,-33,34,40].map((x,col)=>lotFor(x,z,row,col)));
  const south=[[-24,15],[-15,16],[-7,20],[7,19],[16,16],[24,17],[-24,24],[27,25]];
  return [...sides,...south.map(([x,z],i)=>lotFor(x,z,6,i))];
}
const regionalLots={areia:regionalExpansion('areia'),pedra:regionalExpansion('pedra'),nevoa:regionalExpansion('nevoa')};

export function villageLots(map:MapId,seed:number):UrbanLot[] {
  const base=VILLAGE_LOTS[map];
  const random=villageRandom(seed);
  const candidates=[...base,...(map==='folha'?konohaLots:regionalLots[map])];
  return candidates.flatMap((lot,index)=>{
    const scale=seed ? 1.09+(random()-.5)*.13 : 1;
    const x=lot.x+(seed?(random()-.5)*1.24:0);
    const z=lot.z+(seed?(random()-.5)*1.05:0);
    const body=lot.body*(seed?1.12+(random()-.5)*.17:1);
    const turns=map==='folha'&&Math.abs(x)<9&&z> -8 ? x<0?1:-1 : undefined;
    const style=map==='areia'?index%7===3?'sand-rotunda':undefined
      :map==='pedra'?index%7===4?'stone-watchtower':undefined
      :map==='nevoa'?index%6===2?'mist-dockhouse':undefined
      :lot.x===-14.9&&lot.z< -54?'academy'
      :lot.x===-7.2&&lot.z>5?'uzumaki'
      :lot.x===29&&lot.z===36?'bathhouse'
      :lot.z< -28&&index%6===4?'apartments':undefined;
    const placed:UrbanLot={
      ...lot,x,z,body,width:lot.width*scale,depth:lot.depth*scale,turns,
      palette:seed?Math.floor(random()*3):lot.palette,style,
    };
    if(style==='academy'){placed.width=5.9;placed.depth=4.65;placed.body=4.25;placed.front=1;placed.shape='rect';}
    if(style==='uzumaki'){placed.shape='round';placed.depth=placed.width;placed.body*=.93;placed.front=1;}
    if(style==='bathhouse'){placed.shape='rect';placed.width=5.30;placed.front=1;}
    if(style==='apartments')placed.body*=1.25;
    if(map==='areia'){placed.shape='round';placed.depth=placed.width;}
    if(style==='sand-rotunda'){placed.body*=1.19;placed.use='shop';}
    if(style==='stone-watchtower'){placed.shape='round';placed.depth=placed.width*.92;placed.body*=1.38;}
    if(style==='mist-dockhouse'){placed.shape='rect';placed.use='terrace';}
    if(map==='folha'&&index>=base.length&&!clearKonohaLot(placed))return [];
    if(map!=='folha'&&index>=base.length
      &&(waterDistance(map,x,z).outside<3.35||(map==='nevoa'&&Math.abs(x-10.5)<8)))return [];
    return [placed];
  });
}
