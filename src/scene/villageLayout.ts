import type { MapId } from '../game/maps';

export type MapLayout = 'mapas_basicos' | 'vilas';
export const missionMapLayout = (save?: { mapLayout?: MapLayout } | null): MapLayout =>
  save ? save.mapLayout ?? 'mapas_basicos' : 'vilas';

type Position = { x: number; z: number };
type Landmark = Position & { art: 'environment' | 'regional' | 'leaf'; index: number; width: number; height: number; gate?: boolean };
export type Bridge = Position & { halfSpan: number; width: number; rise: number; wood: boolean };
type Wall = { from: number; to: number; z: number; height: number; width: number };
export type VillageLayout = {
  map: MapId;
  entry: Position;
  plaza: Position;
  bounds: { x: number; south: number; north: number };
  buildings: Landmark[];
  walls: Wall[];
  bridges: Bridge[];
  crossings: number[];
  sites: Position[];
};

const rows = (art: Landmark['art'], index: number, width: number, height: number, positions: number[][]): Landmark[] =>
  positions.map(([x, z], i) => ({ art, index, x, z, width: width + i % 3 * .4, height: height + i % 3 * .25 }));

const walls = (z: number, width: number, opening: number, height: number): Wall[] =>
  [{ from: -width, to: -opening, z, height, width: 1.05 }, { from: opening, to: width, z, height, width: 1.05 }];

export const villageCanalX = (z: number) => 10.5 + Math.sin((z + 2) * .08) * 1.2;
const canalBridges = [-13, -30, -46].map(z => ({ x: villageCanalX(z), z, halfSpan: 6.4, width: 2.8, rise: 1.12, wood: true }));
const inlandStreets=[-8,8,-24,24];
const canalStreets=[3.05,17.05];

export const VILLAGES: Record<MapId, VillageLayout> = {
  folha: {
    map: 'folha', entry: { x: 0, z: -8 }, plaza: { x: 0, z: -26 },
    bounds: { x: 26, south: -8, north: -58 }, walls: walls(-8, 25, 3.1, 2.45),
    crossings: [-16, -26, -43], bridges: [],
    buildings: [
      { art: 'environment', index: 4, x: 0, z: -8, width: 7.6, height: 6.1, gate: true },
      { art: 'leaf', index: 0, x: 0, z: -66, width: 34, height: 19 },
      { art: 'leaf', index: 1, x: 42, z: 25, width: 6.6, height: 10 },
      { art: 'leaf', index: 2, x: 54, z: 32, width: 6.6, height: 10 },
      ...rows('environment', 7, 5.6, 5.1, [[-10,-12],[9,-12],[-15,-18],[15,-17],[-9,-22],[10,-22],
        [-22,-21],[23,-22],[-12,-31],[11,-32],[-20,-35],[20,-37],[-12,-47],[10,-48],[-20,-50],[19,-49],
        [-9,-56],[11,-57],[-9,-2],[13,-1]]),
    ],
    sites: [[-6,-16],[6,-16],[-16,-26],[16,-26],[0,-26],[-5,-32],[6,-33],[-18,-43],[17,-43],[-7,-45],[6,-45],[0,-51],[0,-33]]
      .map(([x,z]) => ({x,z})),
  },
  areia: {
    map: 'areia', entry: { x: 0, z: -10 }, plaza: { x: 0, z: -28 },
    bounds: { x: 31, south: -10, north: -65 }, walls: walls(-10, 28, 4.35, 3.5),
    crossings: [-18, -28, -45], bridges: [],
    buildings: [
      { art: 'regional', index: 1, x: 0, z: -10, width: 12, height: 8.9, gate: true },
      { art: 'regional', index: 0, x: 0, z: -49, width: 17.6, height: 13.4 },
      ...rows('regional', 2, 6.7, 5.4, [[-10,-14],[10,-14],[-20,-15],[20,-15],[-9,-23],[10,-23],
        [-18,-24],[19,-23],[-11,-34],[11,-34],[-21,-39],[21,-39],[-11,-53],[13,-55],[-21,-59],[22,-60],[-16,-4],[18,-4]]),
    ],
    sites: [[-6,-18],[6,-18],[-16,-18],[17,-18],[0,-28],[-6,-33],[6,-33],[-17,-28],[17,-28],[-19,-45],[19,-45],[0,-39],[1,-21]]
      .map(([x,z]) => ({x,z})),
  },
  pedra: {
    map: 'pedra', entry: { x: 0, z: -8 }, plaza: { x: 0, z: -27 },
    bounds: { x: 30, south: -8, north: -65 }, walls: [],
    crossings: [-17, -27, -43],
    bridges: [{ x: 0, z: -17, halfSpan: 9.4, width: 3.2, rise: .72, wood: false },
      { x: 0, z: -43, halfSpan: 9.4, width: 3.2, rise: .86, wood: false }],
    buildings: [
      { art: 'regional', index: 4, x: 0, z: -8, width: 10.6, height: 6.4, gate: true },
      { art: 'regional', index: 3, x: -8, z: -53, width: 15.4, height: 12.2 },
      ...rows('regional', 5, 6.5, 5.7, [[-11,-13],[10,-13],[-20,-17],[20,-17],[-12,-23],[11,-22],
        [-18,-33],[12,-34],[-25,-39],[21,-38],[-19,-48],[10,-51],[19,-56],[23,-22],[-20,-6],[17,-4]]),
    ],
    sites: [[-11,-17],[11,-17],[-5,-25],[5,-25],[0,-29],[-12,-28],[12,-28],[-20,-26],[19,-27],[-6,-37],[6,-37],[-13,-43],[13,-43]]
      .map(([x,z]) => ({x,z})),
  },
  nevoa: {
    map: 'nevoa', entry: { x: 0, z: -7 }, plaza: { x: -2, z: -26 },
    bounds: { x: 31, south: -7, north: -61 }, walls: [], crossings: [-13,-26,-46], bridges: canalBridges,
    buildings: [
      { art: 'regional', index: 6, x: -12, z: -43, width: 14.8, height: 13 },
      { art: 'regional', index: 6, x: 25, z: -60, width: 8.2, height: 8.2 },
      ...rows('regional', 8, 6.6, 5.4, [[-7,-10],[22,-10],[-10,-18],[21,-19],[-8,-24],[24,-24],
        [-9,-33],[21,-34],[-17,-29],[28,-32],[-8,-49],[21,-51],[-17,-55],[19,-58],[-10,-3],[21,-2]]),
    ],
    sites: [[-3,-13],[1,-18],[-5,-20],[19,-14],[28,-15],[-2,-26],[2,-31],[-1,-37],[18,-27],[21,-42],[-5,-46],[18,-46],[-2,-52]]
      .map(([x,z]) => ({x,z})),
  },
};

export function villageSurface(layout: VillageLayout, x: number, z: number): 'road' | 'plaza' | undefined {
  const trail = Math.sin((z + 8) * .08) * .8;
  const plaza = Math.abs(z - layout.plaza.z) < 4.8 && Math.abs(x - layout.plaza.x) < 9.6;
  if (plaza) return 'plaza';
  if (Math.abs(x - trail) < 2.5 && z < 25 && z > layout.bounds.north) return 'road';
  if (z > layout.bounds.south && z < 2) return;
  const streets = layout.map === 'nevoa' ? canalStreets : inlandStreets;
  if (z < layout.bounds.south && z > layout.bounds.north && streets.some(side => Math.abs(x - side) < 1.45)) return 'road';
  if (Math.abs(x) < layout.bounds.x && layout.crossings.some(crossing => Math.abs(z - crossing) < 1.65)) return 'road';
}

export function insideVillage(layout: VillageLayout, x: number, z: number) {
  return Math.abs(x) < layout.bounds.x && z < layout.bounds.south && z > layout.bounds.north;
}

export function villageEventSite(layout: VillageLayout, index:number, available:(point:Position)=>boolean) {
  for(let i=0;i<layout.sites.length;i++) {
    const point=layout.sites[(index+i)%layout.sites.length];
    if(insideVillage(layout,point.x,point.z)&&available(point))return point;
  }
  for(const z of layout.crossings) {
    for(let x=-layout.bounds.x+2;x<layout.bounds.x-1;x+=3) {
      const point={x,z};
      if(insideVillage(layout,x,z)&&available(point))return point;
    }
  }
}

export function bridgeHeight(bridge: Bridge, x: number, ground: (x: number, z: number) => number) {
  const t = (x - bridge.x) / bridge.halfSpan;
  const left = ground(bridge.x - bridge.halfSpan, bridge.z);
  const right = ground(bridge.x + bridge.halfSpan, bridge.z);
  return left + (right - left) * (t + 1) / 2 + Math.max(0, 1 - t * t) * bridge.rise + .09;
}

export function villageDeck(layout: VillageLayout, ground: (x: number, z: number) => number, x: number, z: number) {
  for (const bridge of layout.bridges) {
    if (Math.abs(z - bridge.z) <= bridge.width / 2 && Math.abs(x - bridge.x) <= bridge.halfSpan)
      return bridgeHeight(bridge, x, ground);
  }
  return -Infinity;
}
