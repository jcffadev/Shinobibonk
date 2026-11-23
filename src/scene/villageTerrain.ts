import type { MapId } from '../game/maps';
import { groundHeight, HAGOROMO_ARENA, terrace } from './terrainArt';
import { carveWater, WATER_BODIES, type WaterBody } from './water';
import { villageCanalX, villageSurface, type VillageLayout } from './villageLayout';
import { villageLots } from './villageDistricts';

const canal: WaterBody = { kind: 'river', width: 10.1, from: -74, to: 29, at: villageCanalX };
export const villageWater = (map: MapId) => map === 'nevoa' ? [...WATER_BODIES[map], canal] : WATER_BODIES[map];

function smoothstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

const mound = (x: number, z: number, cx: number, cz: number, rx: number, rz: number, h: number) =>
  h * Math.exp(-(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2));

export function createVillageGround(layout: VillageLayout, waters: readonly WaterBody[]) {
  const { map, bounds } = layout;
  const plots = layout.buildings.filter(building => !building.gate)
    .map(({x,z,width}) => ({x,z,radius:Math.min(5.8,width*.37)}));
  for(const lot of layout.lots??villageLots(map,0))plots.push({x:lot.x,z:lot.z,radius:Math.hypot(lot.width,lot.depth)*.50});
  if (map === 'folha') plots.push({ x: -1, z: -39, radius: 5.2 });

  function relief(x: number, z: number) {
    let rolling = .8 + .7 * Math.sin(x * .11 + 2) * Math.cos(z * .14) + .46 * Math.sin((x + z) * .14);
    rolling += mound(x,z,-25,-4,11,15,1.4) + mound(x,z,28,-32,14,16,1.65);
    let h = terrace(rolling, 1.15) * smoothstep((Math.hypot(x,z) - 5) / 9);
    if (map === 'folha') {
      h+=mound(x,z,10,-68,25,14,3.8);
      h+=mound(x,z,-20,-63,18,12,1.75)+mound(x,z,35,-60,15,12,1.10);
    }
    if (map === 'areia') h += 4.55 * smoothstep((Math.abs(x) - 30) / 11)
      * Math.max(mound(x,z,-38,-31,12,37,1), mound(x,z,38,-35,12,34,1));
    if (map === 'pedra') {
      h += 3.8 * smoothstep(mound(x,z,-10,-53,16,14,1)) + mound(x,z,23,-38,14,12,2.4);
      h -= 1.25 * mound(x,z,0,-21,5.1,12,1);
    }
    if (map === 'nevoa') h += mound(x,z,-16,-46,14,15,3.5) + mound(x,z,28,-43,10,17,2.4);
    return Math.min(4.8, h);
  }

  const leveled=plots.map(plot=>({...plot,y:relief(plot.x,plot.z)}));
  const cells=new Map<number,typeof leveled>();
  const cell=(x:number,z:number)=>x+z*128;
  const gridSize=8,shoulder=2.6;
  for(const plot of leveled){
    const extent=plot.radius+shoulder;
    for(let z=Math.floor((plot.z-extent)/gridSize);z<=Math.floor((plot.z+extent)/gridSize);z++){
      for(let x=Math.floor((plot.x-extent)/gridSize);x<=Math.floor((plot.x+extent)/gridSize);x++){
        const key=cell(x,z),previous=cells.get(key);
        if(previous)previous.push(plot);
        else cells.set(key,[plot]);
      }
    }
  }
  const noPlots:typeof leveled=[];
  return (x: number, z: number) => {
    const edge = Math.max(Math.abs(x), Math.abs(z));
    if (edge >= 84) return groundHeight(map,x,z);
    let h = relief(x,z);
    const surface = villageSurface(layout,x,z);
    if (surface === 'plaza') h = 0;
    if (surface === 'road') h *= z < bounds.north + 15 ? .83 : .57;
    for (const plot of cells.get(cell(Math.floor(x/gridSize),Math.floor(z/gridSize)))??noPlots) {
      const dx = Math.abs(x-plot.x), dz = Math.abs(z-plot.z), r = plot.radius;
      if (dx > r + shoulder || dz > r + shoulder) continue;
      const influence = smoothstep((Math.hypot(dx,dz)-r)/shoulder);
      h = plot.y + (h - plot.y) * influence;
    }
    if (Math.abs(z-layout.entry.z) < 4.2 && Math.abs(x-layout.entry.x) < 5) {
      h *= smoothstep((Math.abs(z-layout.entry.z)-.8)/3.4);
    }
    const arenaDistance=Math.hypot(x-HAGOROMO_ARENA.x,z-HAGOROMO_ARENA.z);
    if(arenaDistance<HAGOROMO_ARENA.r+5) {
      const merge=smoothstep((arenaDistance-HAGOROMO_ARENA.r)/5);
      h=groundHeight(map,x,z)*(1-merge)+h*merge;
    }
    const cityHeight = carveWater(map,x,z,h,waters);
    if (edge <= 73) return cityHeight;
    const outer = smoothstep((edge-73)/11);
    return cityHeight + (groundHeight(map,x,z)-cityHeight)*outer;
  };
}
