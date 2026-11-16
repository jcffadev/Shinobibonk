import type { MapId } from '../game/maps';
import { groundHeight, terrace } from './terrainArt';
import { carveWater, WATER_BODIES, type WaterBody } from './water';
import { villageCanalX, villageSurface, type VillageLayout } from './villageLayout';

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
    .map(building => ({ ...building, radius: Math.min(5.8, building.width * .37) }));
  if (map === 'folha') plots.push({ art: 'environment', index: 7, x: -1, z: -39, width: 10, height: 8, radius: 5.2 });

  function relief(x: number, z: number) {
    let rolling = .8 + .7 * Math.sin(x * .11 + 2) * Math.cos(z * .14) + .46 * Math.sin((x + z) * .14);
    rolling += mound(x,z,-25,-4,11,15,1.4) + mound(x,z,28,-32,14,16,1.65);
    let h = terrace(rolling, 1.15) * smoothstep((Math.hypot(x,z) - 5) / 9);
    if (map === 'folha') h += mound(x,z,0,-62,22,11,3.15);
    if (map === 'areia') h += 4.55 * smoothstep((Math.abs(x) - 30) / 11)
      * Math.max(mound(x,z,-38,-31,12,37,1), mound(x,z,38,-35,12,34,1));
    if (map === 'pedra') {
      h += 3.8 * smoothstep(mound(x,z,-10,-53,16,14,1)) + mound(x,z,23,-38,14,12,2.4);
      h -= 1.25 * mound(x,z,0,-21,5.1,12,1);
    }
    if (map === 'nevoa') h += mound(x,z,-16,-46,14,15,3.5) + mound(x,z,28,-43,10,17,2.4);
    return Math.min(4.8, h);
  }

  const leveled = plots.map(plot => ({ ...plot, y: relief(plot.x,plot.z) }));
  return (x: number, z: number) => {
    const edge = Math.max(Math.abs(x), Math.abs(z));
    if (edge >= 84) return groundHeight(map,x,z);
    let h = relief(x,z);
    const surface = villageSurface(layout,x,z);
    if (surface === 'plaza') h = 0;
    if (surface === 'road') h *= z < bounds.north + 15 ? .83 : .57;
    for (const plot of leveled) {
      const dx = Math.abs(x-plot.x), dz = Math.abs(z-plot.z), r = plot.radius;
      if (dx > r + 2.6 || dz > r + 2.6) continue;
      const influence = smoothstep((Math.hypot(dx,dz)-r)/2.6);
      h = plot.y + (h - plot.y) * influence;
    }
    if (Math.abs(z-layout.entry.z) < 4.2 && Math.abs(x-layout.entry.x) < 5) {
      h *= smoothstep((Math.abs(z-layout.entry.z)-.8)/3.4);
    }
    const cityHeight = carveWater(map,x,z,h,waters);
    if (edge <= 73) return cityHeight;
    const outer = smoothstep((edge-73)/11);
    return cityHeight + (groundHeight(map,x,z)-cityHeight)*outer;
  };
}
