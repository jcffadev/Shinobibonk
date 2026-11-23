import type { MapId } from '../game/maps';
import { inHagoromoClearing, KONOHA_SQUARES, KONOHA_STATUES, villageLots, villageRandom, type UrbanLot } from './villageDistricts';
import { leafRiver } from './water';

export type MapLayout = 'mapas_basicos' | 'vilas';
export const missionMapLayout = (save?: { mapLayout?: MapLayout } | null): MapLayout =>
  save ? save.mapLayout ?? 'mapas_basicos' : 'vilas';

type Position = { x: number; z: number };
type Landmark = Position & { art: 'environment' | 'regional' | 'leaf'; index: number; width: number; height: number; gate?: boolean };
export type Bridge = Position & { halfSpan: number; width: number; rise: number; wood: boolean };
type Wall = { from: number; to: number; z: number; height: number; width: number };
export type VillageLayout = {
  map: MapId;
  seed?: number;
  lots?: readonly UrbanLot[];
  entry: Position;
  plaza: Position;
  bounds: { x: number; south: number; north: number };
  buildings: Landmark[];
  walls: Wall[];
  bridges: Bridge[];
  crossings: number[];
  sites: Position[];
};

const walls = (z: number, width: number, opening: number, height: number): Wall[] =>
  [{ from: -width, to: -opening, z, height, width: 1.05 }, { from: opening, to: width, z, height, width: 1.05 }];

export const villageCanalX = (z: number) => 10.5 + Math.sin((z + 2) * .08) * 1.2;
const canalBridges = [-13, -30, -46].map(z => ({ x: villageCanalX(z), z, halfSpan: 6.4, width: 2.8, rise: 1.12, wood: true }));
const inlandStreets=[-8,8,-24,24];
const konohaStreets=[-69,-58,-48,-40,-33,-25,-8,8,25,33,40,48,58,69];
const konohaBridges=[19,40,59].map(z=>({x:leafRiver(z),z,halfSpan:4.5,width:3.1,rise:.68,wood:true}));
const canalStreets=[3.05,17.05];

export const VILLAGES: Record<MapId, VillageLayout> = {
  folha: {
    map: 'folha', entry: { x: 0, z: -8 }, plaza: { x: 0, z: -26 },
    bounds: { x: 73, south: 67, north: -71 }, walls: walls(-8, 25, 3.1, 2.45),
    crossings: [-55,-43,-26,-16,-6,11,19,30,40,50,59], bridges: konohaBridges,
    buildings: [
      { art: 'environment', index: 4, x: 0, z: -8, width: 7.6, height: 6.1, gate: true },
      { art: 'leaf', index: 0, x: 10, z: -64, width: 43, height: 22 },
      ...KONOHA_STATUES.map(statue=>({...statue,art:'leaf' as const,width:6.6,height:10})),
    ],
    sites: [[-6,-16],[6,-16],[-16,-26],[16,-26],[0,-26],[-5,-32],[6,-33],[-18,-43],[17,-43],[-7,-45],[6,-45],[0,-51],[0,-33],[-39,-16],[39,-16],[-34,-26],[35,-26],[-39,-43],[39,-43],[-32,-55],[34,-55]]
      .map(([x,z]) => ({x,z})),
  },
  areia: {
    map: 'areia', entry: { x: 0, z: -10 }, plaza: { x: 0, z: -28 },
    bounds: { x: 31, south: -10, north: -65 }, walls: walls(-10, 28, 4.35, 3.5),
    crossings: [-18, -28, -45], bridges: [],
    buildings: [
      { art: 'regional', index: 1, x: 0, z: -10, width: 12, height: 8.9, gate: true },
      { art: 'regional', index: 0, x: 0, z: -49, width: 17.6, height: 13.4 },
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
    ],
    sites: [[-3,-13],[1,-18],[-5,-20],[19,-14],[28,-15],[-2,-26],[2,-31],[-1,-37],[18,-27],[21,-42],[-5,-46],[18,-46],[-2,-52]]
      .map(([x,z]) => ({x,z})),
  },
};

export function createVillageLayout(map:MapId,seed:number) {
  return {...VILLAGES[map],seed,lots:villageLots(map,seed)};
}

export function villageSurface(layout: VillageLayout, x: number, z: number): 'road' | 'plaza' | 'rock' | undefined {
  if(layout.map==='folha'){
    if(inHagoromoClearing(x,z))return;
    if(((x-10)/25)**2+((z+67)/9.3)**2<1)return 'rock';
    if(KONOHA_SQUARES.some(square=>Math.abs(x-square.x)<square.rx&&Math.abs(z-square.z)<square.rz))return 'plaza';
    if(z>8&&z<layout.bounds.south&&Math.abs(x)<2.65)return 'road';
  }
  const trail = Math.sin((z + 8) * .08) * .8;
  const plaza = Math.abs(z - layout.plaza.z) < 4.8 && Math.abs(x - layout.plaza.x) < 9.6;
  if (plaza) return 'plaza';
  if (Math.abs(x - trail) < 2.5 && z < 25 && z > layout.bounds.north) return 'road';
  if (z > layout.bounds.south && z < 2) return;
  const streets=layout.map==='nevoa'?canalStreets:layout.map==='folha'?konohaStreets:inlandStreets;
  if (z < layout.bounds.south && z > layout.bounds.north && streets.some(side => Math.abs(x - side) < 1.45)) return 'road';
  if (Math.abs(x) < layout.bounds.x && layout.crossings.some(crossing => Math.abs(z - crossing) < 1.65)) return 'road';
}

export function insideVillage(layout: VillageLayout, x: number, z: number) {
  return Math.abs(x)<layout.bounds.x&&z<layout.bounds.south&&z>layout.bounds.north
    &&(layout.map!=='folha'||!inHagoromoClearing(x,z));
}

function eventCandidates(layout:VillageLayout) {
  const candidates=[...layout.sites];
  for(const z of layout.crossings) {
    for(let x=-layout.bounds.x+2;x<layout.bounds.x-1;x+=3) candidates.push({x,z});
  }
  return candidates.filter(p=>insideVillage(layout,p.x,p.z));
}

export function shuffledVillageSites(layout:VillageLayout,seed:number) {
  const candidates=eventCandidates(layout),random=villageRandom(seed);
  for(let i=candidates.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }
  return candidates;
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
