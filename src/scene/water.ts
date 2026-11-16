import * as THREE from 'three';
import type { MapId } from '../game/maps';

/**
 * Água dos mapas (Rodada 89 — pedido do usuário: "precisamos melhorar MUITO a qualidade da água, não está de acordo com o
 * nosso jogo"). Antes o rio da Folha era só pintado na textura do chão. Agora cada mapa tem lagos e rios CAVADOS no
 * terreno, com superfície animada (ondas, cor pela profundidade, espuma na margem, brilho em pixel art).
 * Na obra os ninjas andam sobre a água com chakra: os personagens ficam de pé na superfície.
 */
export type WaterBody =
  | { kind: 'lake'; x: number; z: number; rx: number; rz: number }
  | { kind: 'river'; width: number; from: number; to: number; at: (z: number) => number };

/**
 * Rodada 91 (pedido do usuário: "personagem ao pisar na água deve fazer a água mexer… deve ter um efeito dos pés de chakra,
 * azulzinho… igual no naruto anime"): ondas circulares onde o ninja pisa (até `RIPPLES.max` ao mesmo tempo, somem em
 * `RIPPLES.life` s) e um brilho azul de chakra sob os pés enquanto ele está sobre a água.
 * PARA O CODEX APRIMORAR: respingos em partículas ao correr/dash, ondas de aliados e inimigos, anel de chakra pulsando no
 * ritmo dos passos e arte própria do brilho (hoje é um disco aditivo procedural).
 */
export const RIPPLES = { max: 8, life: 1.6, speed: 2.4, step: .32 } as const;

/** Raio da frente da onda `age` segundos depois do passo (0 quando já sumiu). */
export const rippleRadius = (age: number) => age < 0 || age > RIPPLES.life ? 0 : .15 + age * RIPPLES.speed;

/** Superfície da água, profundidade máxima do leito e largura da margem (m, em coordenadas do mundo). */
export const WATER = { level: -.35, bed: 1.3, bank: 5, shore: .12 } as const;

const leafRiver = (z: number) => 41.5 + Math.sin(z * .13) * 2;

/** Corpos d'água por mapa. Longe do centro (onde o ninja nasce), da trilha e das construções. */
export const WATER_BODIES: Record<MapId, readonly WaterBody[]> = {
  folha: [
    { kind: 'river', width: 3.4, from: 12, to: 90, at: leafRiver },
    { kind: 'lake', x: -34, z: 34, rx: 7, rz: 6 },
  ],
  areia: [
    { kind: 'lake', x: -36, z: 34, rx: 6, rz: 5 },
    { kind: 'lake', x: 42, z: -24, rx: 5, rz: 4 },
  ],
  pedra: [
    { kind: 'lake', x: 26, z: -42, rx: 8, rz: 6 },
    { kind: 'lake', x: -42, z: 38, rx: 6, rz: 5 },
  ],
  nevoa: [
    { kind: 'lake', x: -36, z: 6, rx: 10, rz: 7 },
    { kind: 'lake', x: 30, z: -36, rx: 9, rz: 7 },
    { kind: 'lake', x: 8, z: 46, rx: 8, rz: 6 },
  ],
};

/** Distância normalizada ao corpo d'água (< 1 = dentro) e distância em metros fora dele. */
function bodyDistance(body: WaterBody, x: number, z: number) {
  if (body.kind === 'lake') {
    const s = Math.hypot((x - body.x) / body.rx, (z - body.z) / body.rz);
    return { s, outside: Math.max(0, s - 1) * Math.min(body.rx, body.rz) };
  }
  const half = body.width / 2, cz = Math.min(body.to, Math.max(body.from, z));
  const d = Math.hypot(x - body.at(cz), z - cz);
  return { s: d / half, outside: Math.max(0, d - half) };
}

/** O corpo d'água mais próximo deste ponto (menor distância normalizada). */
export function waterDistance(map: MapId, x: number, z: number, bodies: readonly WaterBody[] = WATER_BODIES[map]) {
  let best = { s: Infinity, outside: Infinity };
  for (const body of bodies) {
    const d = bodyDistance(body, x, z);
    if (d.s < best.s) best = d;
  }
  return best;
}

/** Cava o leito e baixa a margem até o nível do chão da água (0), por cima do relevo em terraços. */
export function carveWater(map: MapId, x: number, z: number, height: number, bodies?: readonly WaterBody[]) {
  const { s, outside } = waterDistance(map, x, z, bodies);
  if (s < 1) return -WATER.bed * (1 - s * s);
  if (outside >= WATER.bank) return height;
  return THREE.MathUtils.lerp(0, height, THREE.MathUtils.smoothstep(outside, 0, WATER.bank));
}

/** Altura da superfície da água aqui, ou -Infinity fora da água. */
export function waterSurfaceAt(map: MapId, x: number, z: number, bodies?: readonly WaterBody[]) {
  const { s } = waterDistance(map, x, z, bodies);
  return s < 1 && -WATER.bed * (1 - s * s) < WATER.level ? WATER.level : -Infinity;
}

/**
 * Malha da água de cada corpo, com shader animado sobre o MeshStandardMaterial (mantém luz e névoa do clima).
 * `ground` = altura do chão já com o leito cavado; a profundidade de cada vértice decide cor, espuma e transparência.
 */
export function createWater(scene: THREE.Scene, map: MapId, ground: (x: number, z: number) => number, bodies: readonly WaterBody[] = WATER_BODIES[map]) {
  const meshes: THREE.Mesh[] = [];
  const uniforms = { waterTime: { value: 0 }, waterRipples: { value: Array.from({ length: RIPPLES.max }, () => new THREE.Vector4(0, 0, -99, 0)) } };
  let nextRipple = 0;
  const material = new THREE.MeshStandardMaterial({ color: '#3f9bc4', roughness: .18, metalness: .05, transparent: true, depthWrite: false });
  material.onBeforeCompile = shader => {
    shader.uniforms.waterTime = uniforms.waterTime;
    shader.uniforms.waterRipples = uniforms.waterRipples;
    shader.vertexShader = `
      attribute float waterDepth;
      uniform float waterTime;
      varying float vWaterDepth;
      varying vec2 vWaterXZ;
    ` + shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vWaterDepth = waterDepth;
      vWaterXZ = position.xz;
      transformed.y += (sin(waterTime * 1.7 + position.x * .9) + cos(waterTime * 1.3 + position.z * .8)) * .035 * smoothstep(.0, .3, waterDepth);
    `);
    shader.fragmentShader = `
      uniform float waterTime;
      uniform vec4 waterRipples[${RIPPLES.max}];
      varying float vWaterDepth;
      varying vec2 vWaterXZ;
    ` + shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      if (vWaterDepth <= 0.0) discard;
      // Pixel art: o padrão das ondas usa células de 25 cm, como os pixels do chão.
      vec2 cell = floor(vWaterXZ * 4.0) / 4.0;
      float ripple = sin(cell.x * 1.7 + waterTime * 1.9) * cos(cell.y * 1.5 - waterTime * 1.4);
      float band = step(.78, ripple);
      vec3 shallow = vec3(.45, .82, .86), deep = vec3(.10, .36, .58);
      vec3 water = mix(shallow, deep, smoothstep(.0, .9, vWaterDepth));
      water = floor(water * 9.0) / 9.0;
      float foam = 1.0 - smoothstep(${WATER.shore.toFixed(2)}, ${(WATER.shore * 2.6).toFixed(2)}, vWaterDepth + ripple * .03);
      float sparkle = step(.985, fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453 + waterTime * .25));
      // Ondas dos passos: anel claro que cresce e some (x, z, início, força).
      float rings = 0.0;
      for (int i = 0; i < ${RIPPLES.max}; i++) {
        vec4 r = waterRipples[i];
        float age = waterTime - r.z;
        if (age < 0.0 || age > ${RIPPLES.life.toFixed(2)}) continue;
        float front = .15 + age * ${RIPPLES.speed.toFixed(2)};
        float d = length(cell - r.xy);
        rings += r.w * (1.0 - age / ${RIPPLES.life.toFixed(2)}) * (1.0 - smoothstep(.0, .22, abs(d - front)));
      }
      diffuseColor.rgb = mix(water + band * .07, vec3(.93, .98, 1.0), clamp(max(max(foam, sparkle * .8), rings * .85), 0.0, 1.0));
      diffuseColor.a = mix(.62, .9, smoothstep(.0, .8, vWaterDepth)) + foam * .1;
    `);
  };
  for (const body of bodies) {
    const bends = body.kind==='river' ? Array.from({length:17},(_,i)=>body.at(body.from+(body.to-body.from)*i/16)) : [];
    const box = body.kind === 'lake'
      ? { x0: body.x - body.rx - 1, x1: body.x + body.rx + 1, z0: body.z - body.rz - 1, z1: body.z + body.rz + 1 }
      : { x0: Math.min(...bends) - body.width - 3, x1: Math.max(...bends) + body.width + 3, z0: body.from - body.width, z1: body.to };
    const w = box.x1 - box.x0, d = box.z1 - box.z0;
    const geometry = new THREE.PlaneGeometry(w, d, Math.ceil(w * 1.5), Math.ceil(d * 1.5));
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(box.x0 + w / 2, WATER.level, box.z0 + d / 2);
    const position = geometry.attributes.position, depth = new Float32Array(position.count);
    for (let i = 0; i < position.count; i++) depth[i] = WATER.level - ground(position.getX(i), position.getZ(i));
    geometry.setAttribute('waterDepth', new THREE.BufferAttribute(depth, 1));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;
    scene.add(mesh); meshes.push(mesh);
  }
  return {
    update(time: number) { uniforms.waterTime.value = time; },
    /** Onda circular a partir de (x, z) agora; `strength` 0–1 (passo .6, pouso de pulo 1). */
    ripple(x: number, z: number, strength = .6) { uniforms.waterRipples.value[nextRipple].set(x, z, uniforms.waterTime.value, strength); nextRipple = (nextRipple + 1) % RIPPLES.max; },
    dispose() { for (const mesh of meshes) { scene.remove(mesh); mesh.geometry.dispose(); } material.dispose(); },
  };
}

/** Brilho azul de chakra sob os pés do ninja enquanto ele está sobre a água (disco aditivo pulsando). */
export function createChakraFeet(scene: THREE.Scene) {
  const material = new THREE.MeshBasicMaterial({ color: '#6fd8ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.RingGeometry(.12, .42, 24), material);
  mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 2; mesh.visible = false;
  scene.add(mesh);
  let glow = 0;
  return {
    /** `onWater`: pés na superfície; `time` em segundos para o pulso. */
    update(x: number, z: number, onWater: boolean, time: number, dt: number) {
      glow = THREE.MathUtils.damp(glow, onWater ? 1 : 0, 10, dt);
      mesh.visible = glow > .02;
      if (!mesh.visible) return;
      mesh.position.set(x, WATER.level + .03, z);
      const pulse = 1 + .12 * Math.sin(time * 9);
      mesh.scale.setScalar(pulse);
      material.opacity = .55 * glow;
    },
    dispose() { scene.remove(mesh); mesh.geometry.dispose(); material.dispose(); },
  };
}
