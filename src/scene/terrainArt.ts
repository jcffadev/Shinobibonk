import * as THREE from 'three';
import type { GameMap } from '../game/maps';
import { MAP_SIZE } from '../game/worldScale';

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

export function groundHeight(map: GameMap['id'], x: number, z: number) {
  const edge = Math.max(Math.abs(x), Math.abs(z));
  let ridge = 0;
  if (edge > MAP_SIZE / 2) {
    const angle = Math.atan2(z, x);
    const center = 111 + 7 * Math.sin(5 * angle) + 4 * Math.sin(11 * angle);
    const peaks = 15 + 8 * Math.sin(7 * angle) ** 2 + 4 * Math.cos(13 * angle) ** 2;
    const blend = Math.min(1, (edge - MAP_SIZE / 2) / 17);
    ridge = peaks * Math.exp(-((edge - center) ** 2) / 340) * blend ** 2;
  }
  const hills = .36 * Math.sin(x * .14) * Math.cos(z * .12)
    + mound(x, z, -16, -9, 15, 12, 3.8)
    + mound(x, z, 16, 7, 12, 13, 3.3)
    + mound(x, z, -42, 26, 18, 14, 9.5)
    + mound(x, z, 48, -31, 16, 19, 12)
    + mound(x, z, -44, -42, 15, 17, 10)
    + ridge;
  if (map !== 'folha') {
    let height=hills+mound(x,z,3,-26,22,11,4.8);
    for(const place of REGIONAL_PLACES) {
      const distance=Math.max(Math.abs(x-place.x),Math.abs(z-place.z));
      const edge=place.w*.46;
      const blend=THREE.MathUtils.smoothstep(distance,edge,edge+5);
      height=THREE.MathUtils.lerp(3.5,height,blend);
    }
    return height;
  }
  const monument = mound(x, z, 0, -45, 22, 17, 10);
  // Perto das estátuas, mantenha um topo largo sob toda a base do sprite.
  const pedestal = (center: number) =>
    mound(center + Math.sign(x - center) * Math.max(0, Math.abs(x - center) - 3.5),
      24 + Math.sign(z - 24) * Math.max(0, Math.abs(z - 24) - 2.5), center, 24, 6.5, 12, 6);
  return hills + monument + pedestal(30) + pedestal(53);
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

/** Textura ortográfica: trilha e materiais usam as mesmas coordenadas do terreno. */
export function groundArt(map: GameMap) {
  const canvas = document.createElement('canvas');
  const size = canvas.width = canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(size, size);
  const surfaces = new Uint8Array(size * size * 4);
  const grass = rgb(map.terrain.low), dirt = rgb(map.terrain.trail), rock = rgb(map.terrain.high);
  const plaza = rgb(map.id === 'folha' ? '#a3967d' : map.terrain.accent);
  const water = rgb('#4d8392');
  const seed = (x: number, z: number) => ((Math.imul(x + 215, 73428767) ^ Math.imul(z + 311, 912931)) >>> 0) % 1021 / 1021;
  for (let j = 0; j < size; j++) {
    const z = (j / size - .5) * RENDERED_GROUND_SIZE;
    for (let i = 0; i < size; i++) {
      const x = (i / size - .5) * RENDERED_GROUND_SIZE;
      const fleck = seed(i, j), patch = Math.sin(x * .5 + Math.sin(z * .3)) * Math.cos(z * .63);
      const onPath = Math.abs(x - trailX(z)) < 2.25 + patch * .45;
      const inPlaza = Math.abs(x) < 9 && z > -22 && z < -11;
      const river = map.id === 'folha' && Math.abs(x - 41.5 - Math.sin(z * .13) * 2) < 3.1 && z > 12;
      const stone = groundHeight(map.id, x, z) > 4.2 + patch;
      const color = river ? water : inPlaza ? plaza : onPath ? dirt : stone ? rock : grass;
      let shade = .88 + .18 * fleck + .08 * patch;
      if (inPlaza && !river) {
        const row = Math.floor(j / 6);
        const joint = j % 6 === 0 || (i + (row % 2) * 4) % 8 === 0;
        shade *= joint ? .72 : .93 + seed(Math.floor(i / 8), row) * .16;
      } else if (river) {
        shade += Math.sin(x * 2 + z * 6) > .94 ? .25 : 0;
      } else if (!onPath && fleck > .94) shade += .14;
      const offset = 4 * (j * size + i);
      if (!river) surfaces[4 * ((size - 1 - j) * size + i) + (inPlaza ? 3 : onPath ? 1 : stone ? 2 : 0)] = 255;
      for (let channel = 0; channel < 3; channel++) pixels.data[offset + channel] = color[channel] * shade;
      pixels.data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return { texture, surfaces, size };
}


/** Alta resolução local mesmo quando a máscara tem o tamanho da região inteira. */
export function createGroundMaterial(map: GameMap) {
  const { texture, surfaces, size } = groundArt(map);
  const mask = new THREE.DataTexture(surfaces, size, size);
  mask.minFilter = mask.magFilter = THREE.LinearFilter;
  mask.needsUpdate = true;
  const atlas = new THREE.TextureLoader().load(map.id==='folha'?'/assets/ground-materials-v1.png':`/assets/ground-${map.id}-v2.png`);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1, flatShading: true });
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
      vec3 tiles = terrainSample(vMapUv, vec2(0., 1.), 9.) * coverage.r
        + terrainSample(vMapUv, vec2(1., 1.), 7.) * coverage.g
        + terrainSample(vMapUv, vec2(0., 0.), 8.) * coverage.b
        + terrainSample(vMapUv, vec2(1., 0.), 6.) * coverage.a;
      float amount = dot(coverage, vec4(1.));
      vec3 tinted = diffuseColor.rgb * clamp(dot(tiles, vec3(.299,.587,.114)) * 2.6, .55, 1.3);
      diffuseColor.rgb = mix(diffuseColor.rgb, mix(tinted, tiles, leafPalette), amount * .91);
    `);
  };
  return { material, dispose: () => { texture.dispose(); mask.dispose(); atlas.dispose(); } };
}
