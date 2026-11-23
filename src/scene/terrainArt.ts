import * as THREE from 'three';
import type { GameMap } from '../game/maps';
import { MAP_SIZE } from '../game/worldScale';
import { carveWater, waterDistance, WATER, type WaterBody } from './water';

export const RENDERED_GROUND_SIZE = MAP_SIZE + 180;
export const trailX = (z: number) => Math.sin(z * .09) * 5;
export const REGIONAL_PLACES = [
  {x:0,z:-36,w:14,h:12,column:0},
  {x:34,z:18,w:18,h:13,column:1},
  {x:-32,z:-23,w:12,h:10,column:2},
  {x:-10,z:-15,w:6,h:6,column:2},
  {x:10,z:-18,w:6,h:6,column:2},
  {x:-12,z:19,w:6,h:6,column:2},
  {x:13,z:25,w:6,h:6,column:2},
];
const mound = (x: number, z: number, cx: number, cz: number, rx: number, rz: number, height: number) =>
  height * Math.exp(-(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2));

/**
 * Rodada 85 (pedido do usuário: "as montanhas do mapa ainda estão muito grandes, e o terreno deveria ter vários locais para
 * pular, esse terreno todo plano com umas montanhas está bem esquisito"): o relevo vira TERRAÇOS baixos — platôs em degraus
 * de `TERRAIN.step` m com encosta curta (`TERRAIN.riser` da altura de cada degrau), bons para pular de um nível ao outro.
 * Montanhas altas só fora da área de jogo, no horizonte (`TERRAIN.ridge`).
 */
export const TERRAIN = { step: 2, riser: .22, ridge: .4, maxInside: 6.2 } as const;
/** Degrau: platô plano e encosta curta e suave (sem quina vertical, para andar e pular). */
export function terrace(height: number, step:number = TERRAIN.step, riser:number = TERRAIN.riser) {
  if (height <= 0) return height;
  const level = Math.floor(height / step), part = height / step - level;
  const t = Math.min(1, Math.max(0, (part - (1 - riser)) / riser));
  return (level + t * t * (3 - 2 * t)) * step;
}
/**
 * Rodada 87: horizonte com a cara de cada vila (referências de anime enviadas pelo usuário). `offset` = distância ao eixo da
 * cordilheira. Folha: montes arredondados. Areia: paredão de platô com topo reto em volta do vale. Pedra: picos altos e
 * pontudos. Névoa: agulhas de pedra finas.
 */
export function horizonProfile(map: GameMap['id'], angle: number, offset: number) {
  if (map === 'areia') {
    const wall = 1 - THREE.MathUtils.smoothstep(Math.abs(offset), 11, 15);
    return (17 + 1.5 * Math.sin(3 * angle)) * wall;
  }
  if (map === 'pedra') {
    const spires = 11 + 12 * Math.abs(Math.sin(9 * angle)) ** 3 + 5 * Math.abs(Math.sin(23 * angle)) ** 4;
    return spires * Math.exp(-(offset ** 2) / 150);
  }
  if (map === 'nevoa') {
    const needles = 9 + 17 * Math.abs(Math.sin(13 * angle)) ** 6 + 5 * Math.abs(Math.sin(31 * angle)) ** 8;
    return needles * Math.exp(-(offset ** 2) / 110);
  }
  const hills = 13 + 6 * Math.sin(3 * angle) ** 2 + 3 * Math.cos(7 * angle) ** 2;
  return hills * Math.exp(-(offset ** 2) / 420);
}

/** Relevo de base suave (antes dos degraus): colinas espalhadas, todas abaixo de `TERRAIN.maxInside`. */
function rollingBase(x: number, z: number) {
  return .9 + .7 * Math.sin(x * .07 + 1.3) * Math.cos(z * .06 - .4) + .45 * Math.sin((x + z) * .11)
    + mound(x, z, -24, -12, 20, 15, 1.6)
    + mound(x, z, 25, 11, 18, 16, 1.8)
    + mound(x, z, -49, 32, 19, 15, 2.6)
    + mound(x, z, 53, -37, 18, 20, 2.9)
    + mound(x, z, -44, -42, 15, 17, 2.8)
    + mound(x, z, -35, 8, 6, 4.5, 1.2)
    + mound(x, z, 28, -13, 5.5, 5, 1.1)
    + mound(x, z, 49, 28, 6, 4.8, 1.3);
}

/**
 * Rodada 86: áreas planas da Folha sob construções e estátuas (retângulo de meia-largura rx × rz, +4 m de transição), na
 * altura do centro — com terraços, uma casa na beira do degrau flutuava. A praça central cobre todas as casas do centro.
 */
export const LEAF_PLACES = [
  {x:0,z:-18.5,rx:13.5,rz:11},{x:-10,z:18,rx:3.5,rz:3.5},{x:12,z:19,rx:3.5,rz:3.5},
  {x:30,z:24,rx:4,rz:4},{x:53,z:24,rx:4,rz:4},{x:0,z:-52,rx:11,rz:11},
  // Rodada 92: clareira da Pedra Memorial (memorialStone.ts).
  {x:-38,z:-26,rx:7,rz:7},
] as const;
/** Construções e estátuas da Folha (as mesmas coordenadas do GameCanvas). */
export const LEAF_BUILDINGS = [[0,-12],[-7,-17],[7,-18],[-10,18],[12,19],[-9,-15],[8,-17],[-10,-22],[9,-25],[30,24],[53,24],[0,-52],[-38,-26]] as const;
const leafPlaceHeight = new Map<number, number>();

/**
 * Rodada 97: clareira do Treinamento do Hagoromo (campo de treino cercado de floresta). Plana em todos os mapas, longe do
 * começo, das construções e da água. O jogador é levado para cá durante o evento.
 */
export const HAGOROMO_ARENA = { x: -56, z: 56, r: 16 } as const;
function flattenArena(x: number, z: number, height: number) {
  const d = Math.hypot(x - HAGOROMO_ARENA.x, z - HAGOROMO_ARENA.z);
  if (d >= HAGOROMO_ARENA.r + 5) return height;
  return THREE.MathUtils.lerp(0, height, THREE.MathUtils.smoothstep(d, HAGOROMO_ARENA.r, HAGOROMO_ARENA.r + 5));
}

export function groundHeight(map: GameMap['id'], x: number, z: number) {
  // Rodada 89: lagos e rios cavados por cima do relevo (src/scene/water.ts).
  return carveWater(map, x, z, flattenArena(x, z, placedGroundHeight(map, x, z)));
}

function placedGroundHeight(map: GameMap['id'], x: number, z: number) {
  if (map !== 'folha') return rawGroundHeight(map, x, z);
  let height = rawGroundHeight(map, x, z);
  for (let i = 0; i < LEAF_PLACES.length; i++) {
    const place = LEAF_PLACES[i], distance = Math.max(0, Math.abs(x - place.x) - place.rx, Math.abs(z - place.z) - place.rz);
    if (distance >= 4) continue;
    let center = leafPlaceHeight.get(i);
    if (center === undefined) { center = rawGroundHeight(map, place.x, place.z); leafPlaceHeight.set(i, center); }
    height = THREE.MathUtils.lerp(center, height, THREE.MathUtils.smoothstep(distance, 0, 4));
  }
  return height;
}

function rawGroundHeight(map: GameMap['id'], x: number, z: number) {
  const edge = Math.max(Math.abs(x), Math.abs(z));
  let ridge = 0;
  if (edge > MAP_SIZE / 2) {
    const angle = Math.atan2(z, x);
    const center = 111 + 7 * Math.sin(5 * angle) + 4 * Math.sin(11 * angle);
    const blend = Math.min(1, (edge - MAP_SIZE / 2) / 17);
    ridge = horizonProfile(map, angle, edge - center) * blend ** 2;
  }
  // Terraços dentro do mapa; perto do centro (onde o ninja começa) o chão fica plano.
  const calm = THREE.MathUtils.smoothstep(Math.hypot(x, z), 6, 18);
  const hills = terrace(Math.min(TERRAIN.maxInside, rollingBase(x, z) * 1.3) * calm) + ridge * TERRAIN.ridge;
  if (map !== 'folha') {
    let height=hills+terrace(mound(x,z,3,-26,22,11,2.2));
    for(const place of REGIONAL_PLACES) {
      const distance=Math.max(Math.abs(x-place.x),Math.abs(z-place.z));
      const edge=place.w*.46;
      const blend=THREE.MathUtils.smoothstep(distance,edge,edge+5);
      height=THREE.MathUtils.lerp(3.5,height,blend);
    }
    return height * .58;
  }
  const monument = terrace(mound(x, z, 0, -45, 22, 17, 4.4));
  // Perto das estátuas, mantenha um topo largo sob toda a base do sprite.
  const pedestal = (center: number) =>
    mound(center + Math.sign(x - center) * Math.max(0, Math.abs(x - center) - 3.5),
      24 + Math.sign(z - 24) * Math.max(0, Math.abs(z - 24) - 2.5), center, 24, 6.5, 12, 6);
  return (hills + monument + pedestal(30) + pedestal(53)) * .58;
}

/** Verifica se a direção de visão encontra uma encosta antes de chegar ao ator. */
export function terrainOccludesActor(x:number,y:number,z:number,yaw:number,pitch:number,maxDistance:number,ground:(x:number,z:number)=>number) {
  const dx=Math.sin(yaw), dz=Math.cos(yaw), rise=Math.tan(pitch);
  for(let d=.75;d<maxDistance;d+=d<7?.75:2.5){
    if(ground(x+dx*d,z+dz*d)>y+d*rise+.07)return true;
  }
  return false;
}

/** Céu acompanha o clima, com a cor da névoa no horizonte. */
export function createSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 128;
  const paint = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  return {
    texture,
    update(color: string) {
      const horizon = new THREE.Color(color);
      const upper = horizon.clone().lerp(new THREE.Color('#315f99'), .48);
      const gradient = paint.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, upper.getStyle());
      gradient.addColorStop(.63, horizon.getStyle());
      gradient.addColorStop(1, horizon.getStyle());
      paint.fillStyle = gradient;
      paint.fillRect(0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
    },
  };
}

const rgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));

/**
 * Pinta o chão (cores e máscara de superfícies) sem DOM. Rodada 95 (desempenho do carregamento, pedido do usuário: "o
 * carregamento esta meio lento, demora alguns segundos"): `ground` é a grade de alturas já pronta do jogo
 * (createHeightField), não a fórmula exata — antes eram 3 alturas exatas por pixel (~3 milhões de cálculos, ~0,9 s por
 * partida). O desenho é o mesmo (o teste compara com a fórmula exata).
 */
type GroundStyle = {
  surface(x:number,z:number): 'road'|'plaza'|'rock'|undefined;
  waters: readonly WaterBody[];
  seed?: number;
  bands?(x:number,z:number): { road:number; plaza:number };
};

export function paintGround(map: GameMap, ground: (x: number, z: number) => number = (x, z) => groundHeight(map.id, x, z), size = 1024, style?: GroundStyle) {
  const pixels = { data: new Uint8ClampedArray(size * size * 4) };
  const surfaces = new Uint8Array(size * size * 4);
  const grass = rgb(map.terrain.low), dirt = rgb(map.terrain.trail), rock = rgb(map.terrain.high);
  const plaza = rgb(map.id === 'folha' ? '#a3967d' : map.terrain.accent);
  const water = rgb('#4b5d4c'), sand = rgb('#d4bf8b');
  const seed = (x: number, z: number) => ((Math.imul(x + 215, 73428767) ^ Math.imul(z + 311, 912931)) >>> 0) % 1021 / 1021;
  for (let j = 0; j < size; j++) {
    const z = (j / size - .5) * RENDERED_GROUND_SIZE;
    for (let i = 0; i < size; i++) {
      const x = (i / size - .5) * RENDERED_GROUND_SIZE;
      const fleck = seed(i, j), patch = Math.sin(x * .5 + Math.sin(z * .3)) * Math.cos(z * .63);
      const location=style?.surface(x,z);
      const onPath = style ? location==='road' : Math.abs(x - trailX(z)) < 2.25 + patch * .45;
      const inPlaza = style ? location==='plaza' : Math.abs(x) < 9 && z > -22 && z < -11;
      // Rodada 89: a água tem malha própria (water.ts); o chão embaixo dela é leito escuro e a margem é areia.
      const h0 = ground(x, z), shoreDistance = waterDistance(map.id, x, z, style?.waters).outside;
      const river = h0 < WATER.level + .02, shore = !river && shoreDistance < 1.4;
      // Rodada 85: pedra nas encostas dos terraços (inclinação alta), com estrias horizontais como paredão de rocha.
      const slope = Math.hypot(ground(x + .5, z) - h0, ground(x, z + .5) - h0) / .5;
      const stone = !shore && (location==='rock'||slope > .55 || h0 > 4.2);
      const color = river ? water : shore ? sand : inPlaza ? plaza : onPath ? dirt : stone ? rock : grass;
      let shade = .88 + .18 * fleck + .08 * patch;
      if (inPlaza && !river) {
        const row = Math.floor(j / 6);
        const joint = j % 6 === 0 || (i + (row % 2) * 4) % 8 === 0;
        shade *= joint ? .72 : .93 + seed(Math.floor(i / 8), row) * .16;
      } else if (river) {
        // Varia por metro no leito raso, sem o granulado por texel que aparecia através da água.
        shade = .86 + .068 * Math.sin(x*.69 + Math.cos(z*.37)) + .040 * patch;
      } else if (shore) {
        shade = (.89 + .075*patch) * THREE.MathUtils.lerp(.82,1,THREE.MathUtils.smoothstep(shoreDistance,.25,1.35));
      } else if (stone) {
        shade *= (h0 * 4.2) % 1 < .5 ? .84 : 1.02;
      } else if (!onPath && fleck > .94) shade += .14;
      const offset = 4 * (j * size + i);
      const maskOffset = 4 * ((size - 1 - j) * size + i);
      if (!river && !shore && style?.bands) {
        const bands=style.bands(x,z);
        const paving=Math.round(bands.plaza*255);
        const path=Math.round(bands.road*(255-paving));
        surfaces[maskOffset+(stone?2:0)] = 255-paving-path;
        surfaces[maskOffset+1] = path;
        surfaces[maskOffset+3] = paving;
        for (let channel=0; channel<3; channel++) {
          const earth=stone?rock[channel]:grass[channel];
          pixels.data[offset+channel]=(earth*(255-paving-path)+dirt[channel]*path+plaza[channel]*paving)*shade/255;
        }
        pixels.data[offset+3]=255;
        continue;
      }
      if (!river) surfaces[maskOffset + (inPlaza ? 3 : onPath || shore ? 1 : stone ? 2 : 0)] = 255;
      for (let channel = 0; channel < 3; channel++) pixels.data[offset + channel] = color[channel] * shade;
      pixels.data[offset + 3] = 255;
    }
  }
  return { data: pixels.data, surfaces };
}

/** Rodada 95: o chão pintado do último mapa fica guardado — jogar de novo o mesmo mapa não repinta. */
let paintedGround: { id: GameMap['id']; village: boolean; seed?:number; size: number; data: Uint8ClampedArray; surfaces: Uint8Array } | null = null;

/** Textura ortográfica: trilha e materiais usam as mesmas coordenadas do terreno. */
export function groundArt(map: GameMap, ground?: (x: number, z: number) => number, style?: GroundStyle) {
  const size = 1024;
  if (!paintedGround || paintedGround.id !== map.id || paintedGround.size !== size || paintedGround.village!==!!style || paintedGround.seed!==style?.seed)
    paintedGround = { id: map.id, size, village:!!style, seed:style?.seed, ...paintGround(map, ground, size, style) };
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(size, size);
  image.data.set(paintedGround.data);
  context.putImageData(image, 0, 0);
  const surfaces = paintedGround.surfaces.slice();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = style?.bands?THREE.LinearFilter:THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return { texture, surfaces, size };
}


/** Alta resolução local mesmo quando a máscara tem o tamanho da região inteira. */
export function createGroundMaterial(map: GameMap, ground?: (x: number, z: number) => number, style?: GroundStyle) {
  const { texture, surfaces, size } = groundArt(map, ground, style);
  const detailedStreets=Boolean(style?.bands);
  const mask = new THREE.DataTexture(surfaces, size, size);
  mask.minFilter = mask.magFilter = THREE.LinearFilter;
  mask.needsUpdate = true;
  const atlas = new THREE.TextureLoader().load(map.id==='folha'?'/assets/ground-materials-v1.png':`/assets/ground-${map.id}-v2.png`);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = detailedStreets?8:4;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1, flatShading: !detailedStreets });
  material.customProgramCacheKey=()=>detailedStreets?'ground-village':'ground-standard';
  material.onBeforeCompile = shader => {
    shader.uniforms.terrainAtlas = { value: atlas };
    shader.uniforms.terrainMask = { value: mask };
    shader.uniforms.leafPalette = { value: 1 };
    shader.fragmentShader = `
      uniform sampler2D terrainAtlas;
      uniform sampler2D terrainMask;
      uniform float leafPalette;
      vec3 terrainSample(vec2 uv, vec2 cell, float meters) {
        vec2 tile = 1.0 - abs(fract(uv * (${RENDERED_GROUND_SIZE.toFixed(1)} / meters) * .5) * 2.0 - 1.0);
        return texture2D(terrainAtlas, cell * .5 + .002 + tile * .496).rgb;
      }
    ` + shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      vec4 coverage = texture2D(terrainMask, vMapUv);
      vec3 tiles = terrainSample(vMapUv, vec2(0., 1.), ${detailedStreets?'5.5':'9.'}) * coverage.r
        + terrainSample(vMapUv, vec2(1., 1.), ${detailedStreets?'4.5':'7.'}) * coverage.g
        + terrainSample(vMapUv, vec2(0., 0.), 8.) * coverage.b
        + terrainSample(vMapUv, vec2(1., 0.), ${detailedStreets?'4.5':'6.'}) * coverage.a;
      float amount = dot(coverage, vec4(1.));
      vec3 tinted = diffuseColor.rgb * clamp(dot(tiles, vec3(.299,.587,.114)) * 2.6, .55, 1.3);
      diffuseColor.rgb = mix(diffuseColor.rgb, mix(tinted, tiles, leafPalette), amount * .91);
    `);
  };
  return { material, dispose: () => { texture.dispose(); mask.dispose(); atlas.dispose(); } };
}
