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
/** Rodada 99: 16 ondas ao mesmo tempo (o jogador, aliados e inimigos que passam pela água). */
export const RIPPLES = { max: 16, life: 1.6, speed: 2.4, step: .32 } as const;
/** Rodada 99: respingos (gotas) ao correr, no dash e no pouso; ondas dos outros atores a até `othersRange` m. */
export const SPLASH = { pool: 180, gravity: 9, life: .7, othersEvery: .45, othersRange: 22, othersMax: 6 } as const;

/** Raio da frente da onda `age` segundos depois do passo (0 quando já sumiu). */
export const rippleRadius = (age: number) => age < 0 || age > RIPPLES.life ? 0 : .15 + age * RIPPLES.speed;

/** Superfície da água, profundidade máxima do leito e largura da margem (m, em coordenadas do mundo). */
export const WATER = { level: -.35, bed: 1.3, bank: 5, shore: .12 } as const;

export const leafRiver = (z: number) => 41.5 + Math.sin(z * .13) * 2;

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
      varying vec3 vWaterWorld;
    ` + shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vWaterDepth = waterDepth;
      float move = sin(position.x * 1.15 + position.z * .47 - waterTime * 1.24)
        + sin(position.x * -.37 + position.z * 1.70 + waterTime * .79);
      transformed.y += move * .024 * smoothstep(.035, .38, waterDepth);
      vWaterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
    `);
    shader.fragmentShader = `
      uniform float waterTime;
      uniform vec4 waterRipples[${RIPPLES.max}];
      varying float vWaterDepth;
      varying vec3 vWaterWorld;
    ` + shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      float shoreWidth = .045 + fwidth(vWaterDepth);
      if (vWaterDepth <= 0.0) discard;
      vec2 channel = vWaterWorld.xz;
      float a = dot(channel, vec2(1.48, .57)) - waterTime * 1.23;
      float b = dot(channel, vec2(-.53, 1.95)) + waterTime * .81;
      float c = dot(channel + vec2(.2, -.32) * waterTime, vec2(3.65, 3.17));
      vec3 waterNormal = normalize(vec3(.11*cos(a) - .065*cos(b) + .027*cos(c), 1.0,
        .045*cos(a) + .10*cos(b) + .022*cos(c)));
      vec3 eye = normalize(cameraPosition - vWaterWorld);
      float fresnel = .032 + .66 * pow(1.0 - max(dot(eye, waterNormal), 0.0), 4.0);
      float depthMix = smoothstep(.025, 1.08, vWaterDepth);
      vec3 shallows = vec3(.105, .48, .40);
      vec3 deep = vec3(.018, .155, .29);
      vec3 reflection = mix(vec3(.49, .72, .75), vec3(.32, .56, .74), smoothstep(.1, .8, eye.y));
      float sunHighlight = pow(max(dot(reflect(-normalize(vec3(-.40, .85, .32)), waterNormal), eye), 0.0), 86.0);
      float stream = a * 1.8 + .72 * sin(b * .61) + .38 * sin(c * .41 + a * .27);
      float caustics = pow(.5 + .5 * sin(stream), 5.0)
        * (.35 + .65 * smoothstep(-.8, .9, sin(b * .48 + stream * .19)));
      vec3 water = mix(shallows + vec3(.085, .13, .088) * caustics * (1.0 - depthMix), deep, depthMix);
      water = mix(water, reflection, fresnel) + sunHighlight * vec3(.65, .71, .67) * .52;
      float breakup = .032 * sin(stream) + .018 * sin(c * .68 + b);
      float foam = (1.0 - smoothstep(.045, .19, vWaterDepth + breakup))
        * smoothstep(.015, .09, vWaterDepth) * (.24 + .34 * smoothstep(-.68,.85,sin(c * .68)));
      float rings = 0.0;
      for (int i = 0; i < ${RIPPLES.max}; i++) {
        vec4 r = waterRipples[i];
        float age = waterTime - r.z;
        if (age < 0.0 || age > ${RIPPLES.life.toFixed(2)}) continue;
        float front = .15 + age * ${RIPPLES.speed.toFixed(2)};
        float distanceToRing = abs(length(channel - r.xy) - front);
        rings += r.w * (1.0 - age / ${RIPPLES.life.toFixed(2)})
          * (1.0 - smoothstep(.027, .17 + age * .035, distanceToRing));
      }
      diffuseColor.rgb = mix(water, vec3(.78, .91, .88), clamp(foam + rings * .67, 0.0, .82));
      float shoreFade = smoothstep(0.0, shoreWidth, vWaterDepth);
      diffuseColor.a = shoreFade * (mix(.29, .91, smoothstep(.015, 1.05, vWaterDepth)) + foam * .14);
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>', `
      #include <normal_fragment_maps>
      normal = normalize(mat3(viewMatrix) * waterNormal);
    `);
  };
  for (const body of bodies) {
    const bends = body.kind==='river' ? Array.from({length:17},(_,i)=>body.at(body.from+(body.to-body.from)*i/16)) : [];
    const box = body.kind === 'lake'
      ? { x0: body.x - body.rx - 1, x1: body.x + body.rx + 1, z0: body.z - body.rz - 1, z1: body.z + body.rz + 1 }
      : { x0: Math.min(...bends) - body.width - 3, x1: Math.max(...bends) + body.width + 3, z0: body.from - body.width, z1: body.to + body.width };
    const w = box.x1 - box.x0, d = box.z1 - box.z0;
    const geometry = new THREE.PlaneGeometry(w, d, Math.ceil(w * 3.4), Math.ceil(d * 3.4));
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
  let glow = 0, flash = 0;
  return {
    /** Rodada 99: pulso a cada passo na água (o anel de chakra acompanha o ritmo dos pés). */
    step() { flash = 1; },
    /** `onWater`: pés na superfície; `time` em segundos para o pulso. */
    update(x: number, z: number, onWater: boolean, time: number, dt: number) {
      glow = THREE.MathUtils.damp(glow, onWater ? 1 : 0, 10, dt);
      mesh.visible = glow > .02;
      if (!mesh.visible) return;
      mesh.position.set(x, WATER.level + .03, z);
      flash = Math.max(0, flash - dt * 4);
      const pulse = (1 + .12 * Math.sin(time * 9)) * (1 + .35 * flash);
      mesh.scale.setScalar(pulse);
      material.opacity = Math.min(.9, (.55 + .3 * flash) * glow);
    },
    dispose() { scene.remove(mesh); mesh.geometry.dispose(); material.dispose(); },
  };
}

/** Rodada 99: gotas de água (pontos) que saltam e caem; um único objeto para todos os respingos. */
export function createSplashes(scene: THREE.Scene) {
  const n = SPLASH.pool, positions = new Float32Array(n * 3), velocity = new Float32Array(n * 3), life = new Float32Array(n);
  positions.fill(-9999);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: '#dff6ff', size: .14, transparent: true, opacity: .9, depthWrite: false });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false; points.renderOrder = 2;
  scene.add(points);
  let next = 0, alive = 0;
  return {
    /** `count` gotas a partir de (x, y, z); `power` 0–1,5 (passo .6, pouso 1,4). */
    burst(x: number, y: number, z: number, count: number, power = 1) {
      for (let k = 0; k < count; k++) {
        const i = next; next = (next + 1) % n;
        const angle = Math.random() * Math.PI * 2, out = (.6 + Math.random() * 1.2) * power;
        positions[i * 3] = x; positions[i * 3 + 1] = y + .05; positions[i * 3 + 2] = z;
        velocity[i * 3] = Math.cos(angle) * out; velocity[i * 3 + 1] = (1.8 + Math.random() * 1.6) * power; velocity[i * 3 + 2] = Math.sin(angle) * out;
        if (life[i] <= 0) alive++;
        life[i] = SPLASH.life * (.7 + Math.random() * .5);
      }
      geometry.attributes.position.needsUpdate = true;
    },
    update(dt: number) {
      if (!alive) return;
      alive = 0;
      for (let i = 0; i < n; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt;
        if (life[i] <= 0) { positions[i * 3 + 1] = -9999; continue; }
        alive++;
        velocity[i * 3 + 1] -= SPLASH.gravity * dt;
        positions[i * 3] += velocity[i * 3] * dt; positions[i * 3 + 1] += velocity[i * 3 + 1] * dt; positions[i * 3 + 2] += velocity[i * 3 + 2] * dt;
      }
      geometry.attributes.position.needsUpdate = true;
    },
    dispose() { scene.remove(points); geometry.dispose(); material.dispose(); },
  };
}
