import * as THREE from 'three';
import type { Technique } from '../game/heroes';
import { currentSettings } from '../game/settings';

/**
 * Partículas procedurais das técnicas (natureza × forma).
 *
 * - Dois pools fixos de quads instanciados (aditivo para fogo/raio/brilho; alfa normal para fumaça, pedra, areia,
 *   sombra). Nada é alocado por cast: cada partícula é uma faixa de um Float32Array, removida por troca com a última.
 * - Atlas 4×2 desenhado em canvas uma única vez (brilho, chama, faísca, estilhaço, fumaça, anel, rastro, lâmina).
 * - Modos do quad: 0 = billboard (gira em tela), 1 = esticado num eixo do mundo (rastros, raios, estacas),
 *   2 = deitado no chão (anéis de choque, manchas, lâminas horizontais).
 * - Atraso por partícula (idade negativa) sequencia baforadas, voo da bola de fogo e explosão sem emissores por quadro.
 * - Qualidade (alta/média/baixa) muda capacidade e densidade; perto do limite a densidade cai sozinha.
 * - Só visual: nenhum cálculo de dano passa por aqui.
 */

type Col = readonly [number, number, number];
const hex = (h: string): Col => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

// Campos de cada partícula no buffer de simulação.
const PX = 0, PY = 1, PZ = 2, VX = 3, VY = 4, VZ = 5, AGE = 6, LIFE = 7, S0 = 8, S1 = 9, R0 = 10, G0 = 11, B0 = 12, A0 = 13,
  R1 = 14, G1 = 15, B1 = 16, A1 = 17, DRAG = 18, GRAV = 19, ROT = 20, SPIN = 21, CELL = 22, MODE = 23, AX = 24, AY = 25, AZ = 26,
  STR = 27, FLOOR = 28, STRIDE = 29;
// Células do atlas.
export const GLOW = 0, FLAME = 1, SPARK = 2, SHARD = 3, SMOKE = 4, RING = 5, STREAK = 6, BLADE = 7;
const BILL = 0, AXIS = 1, GROUND = 2;

let atlas: THREE.CanvasTexture | null = null;
function atlasTexture() {
  if (atlas) return atlas;
  const C = 128, canvas = document.createElement('canvas');
  canvas.width = C * 4; canvas.height = C * 2;
  const g = canvas.getContext('2d')!;
  const radial = (cx: number, cy: number, r: number, stops: [number, string][]) => {
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    for (const [o, c] of stops) grad.addColorStop(o, c);
    g.fillStyle = grad; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  };
  const cell = (i: number, draw: (x: number, y: number) => void) => { g.save(); draw((i % 4) * C, Math.floor(i / 4) * C); g.restore(); };
  // Pseudoaleatório fixo: o atlas é idêntico a cada carga.
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  cell(GLOW, (x, y) => radial(x + 64, y + 64, 62, [[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,255,255,.75)'], [.6, 'rgba(255,255,255,.18)'], [1, 'rgba(255,255,255,0)']]));
  cell(FLAME, (x, y) => {
    for (let k = 0; k < 9; k++) {
      const t = k / 8, cx = x + 64 + (rnd() - .5) * 26 * (1 - t), cy = y + 84 - t * 52, r = 40 - t * 22;
      radial(cx, cy, r, [[0, 'rgba(255,255,255,.55)'], [.55, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);
    }
  });
  cell(SPARK, (x, y) => {
    radial(x + 64, y + 64, 22, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]);
    g.translate(x + 64, y + 64);
    for (let k = 0; k < 2; k++) {
      g.rotate(Math.PI / 2 * k);
      const grad = g.createLinearGradient(-62, 0, 62, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(.5, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad; g.beginPath(); g.ellipse(0, 0, 62, 5, 0, 0, Math.PI * 2); g.fill();
    }
  });
  cell(SHARD, (x, y) => {
    const pts: [number, number][] = [[64, 8], [104, 40], [116, 86], [74, 120], [24, 104], [12, 52]];
    g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(x + px, y + py) : g.moveTo(x + px, y + py)); g.closePath();
    g.fillStyle = 'rgb(205,205,205)'; g.fill();
    g.beginPath(); g.moveTo(x + 64, y + 8); g.lineTo(x + 104, y + 40); g.lineTo(x + 70, y + 62); g.lineTo(x + 12, y + 52); g.closePath();
    g.fillStyle = 'rgb(255,255,255)'; g.fill();
    g.beginPath(); g.moveTo(x + 70, y + 62); g.lineTo(x + 116, y + 86); g.lineTo(x + 74, y + 120); g.closePath();
    g.fillStyle = 'rgb(140,140,140)'; g.fill();
  });
  cell(SMOKE, (x, y) => {
    for (let k = 0; k < 12; k++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 26;
      radial(x + 64 + Math.cos(a) * d, y + 64 + Math.sin(a) * d, 26 + rnd() * 14, [[0, 'rgba(255,255,255,.4)'], [1, 'rgba(255,255,255,0)']]);
    }
  });
  cell(RING, (x, y) => radial(x + 64, y + 64, 62, [[0, 'rgba(255,255,255,0)'], [.62, 'rgba(255,255,255,0)'], [.8, 'rgba(255,255,255,1)'], [.9, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]));
  cell(STREAK, (x, y) => {
    const grad = g.createLinearGradient(x, 0, x + 128, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(.3, 'rgba(255,255,255,.85)'); grad.addColorStop(.7, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    for (let k = 0; k < 3; k++) { g.globalAlpha = k === 2 ? 1 : .35; g.beginPath(); g.ellipse(x + 64, y + 64, 62, [26, 14, 5][k], 0, 0, Math.PI * 2); g.fill(); }
  });
  cell(BLADE, (x, y) => {
    // Lâmina em meia-lua com o lado convexo para +X (direção do golpe).
    g.beginPath(); g.arc(x + 40, y + 64, 70, -1.15, 1.15); g.arc(x + 14, y + 64, 66, .98, -.98, true); g.closePath();
    g.shadowColor = 'white'; g.shadowBlur = 10; g.fillStyle = 'rgba(255,255,255,1)'; g.fill();
  });
  atlas = new THREE.CanvasTexture(canvas);
  atlas.colorSpace = THREE.NoColorSpace; atlas.generateMipmaps = true; atlas.minFilter = THREE.LinearMipmapLinearFilter;
  return atlas;
}

const VERT = /* glsl */`
attribute vec3 iPos; attribute vec3 iAxis; attribute vec4 iParams; attribute vec4 iColor;
varying vec2 vUv; varying vec4 vColor;
void main(){
  float size=iParams.x, rot=iParams.y, cell=iParams.z, mode=iParams.w;
  vec2 corner=position.xy; float c=cos(rot), s=sin(rot);
  vec2 rc=vec2(c*corner.x-s*corner.y, s*corner.x+c*corner.y);
  vec4 mv;
  if(mode<.5){ mv=viewMatrix*vec4(iPos,1.); mv.xy+=rc*size; }
  else if(mode<1.5){
    vec4 a=viewMatrix*vec4(iPos-iAxis*.5,1.), b=viewMatrix*vec4(iPos+iAxis*.5,1.);
    vec2 d=b.xy-a.xy; float L=length(d); vec2 dir=L>1e-5?d/L:vec2(1.,0.); vec2 n=vec2(-dir.y,dir.x);
    mv=(a+b)*.5; mv.xy+=dir*corner.x*(L+size)+n*corner.y*size;
  } else { mv=viewMatrix*vec4(iPos+vec3(rc.x*size,0.,rc.y*size),1.); }
  gl_Position=projectionMatrix*mv;
  vec2 uv=corner+.5; float cx=mod(cell,4.), cy=floor(cell/4.+.01);
  vUv=vec2((cx+uv.x)*.25, 1.-(cy+1.-uv.y)*.5);
  vColor=iColor;
}`;
const FRAG = /* glsl */`
uniform sampler2D map; varying vec2 vUv; varying vec4 vColor;
void main(){ vec4 t=texture2D(map,vUv); float a=t.a*vColor.a; if(a<.004)discard; gl_FragColor=vec4(vColor.rgb*t.rgb,a); }`;

class Pool {
  readonly data: Float32Array; count = 0; readonly mesh: THREE.Mesh;
  private pos: THREE.InstancedBufferAttribute; private axis: THREE.InstancedBufferAttribute;
  private params: THREE.InstancedBufferAttribute; private color: THREE.InstancedBufferAttribute;
  private geo: THREE.InstancedBufferGeometry;
  constructor(readonly cap: number, additive: boolean) {
    this.data = new Float32Array(cap * STRIDE);
    const geo = this.geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, .5, 0], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const dyn = (size: number) => { const a = new THREE.InstancedBufferAttribute(new Float32Array(cap * size), size); a.setUsage(THREE.DynamicDrawUsage); return a; };
    geo.setAttribute('iPos', this.pos = dyn(3)); geo.setAttribute('iAxis', this.axis = dyn(3));
    geo.setAttribute('iParams', this.params = dyn(4)); geo.setAttribute('iColor', this.color = dyn(4));
    geo.instanceCount = 0;
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { map: { value: atlasTexture() } }, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.frustumCulled = false; this.mesh.renderOrder = additive ? 8 : 7;
  }
  spawn(): number { if (this.count >= this.cap) return -1; const b = this.count++ * STRIDE; this.data.fill(0, b, b + STRIDE); this.data[b + FLOOR] = -1e9; return b; }
  update(dt: number) {
    const d = this.data, P = this.pos.array as Float32Array, X = this.axis.array as Float32Array, M = this.params.array as Float32Array, C = this.color.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      let b = i * STRIDE;
      d[b + AGE] += dt;
      if (d[b + AGE] >= d[b + LIFE]) {
        const last = --this.count * STRIDE;
        if (last !== b) d.copyWithin(b, last, last + STRIDE);
        i--; continue;
      }
      const age = d[b + AGE], i3 = i * 3, i4 = i * 4;
      if (age < 0) { M[i4] = 0; C[i4 + 3] = 0; P[i3] = d[b + PX]; P[i3 + 1] = d[b + PY]; P[i3 + 2] = d[b + PZ]; continue; }
      const k = Math.max(0, 1 - d[b + DRAG] * dt);
      d[b + VX] *= k; d[b + VZ] *= k; d[b + VY] = d[b + VY] * k - d[b + GRAV] * dt;
      d[b + PX] += d[b + VX] * dt; d[b + PY] += d[b + VY] * dt; d[b + PZ] += d[b + VZ] * dt;
      if (d[b + PY] < d[b + FLOOR]) { d[b + PY] = d[b + FLOOR]; d[b + VY] *= -.25; d[b + VX] *= .5; d[b + VZ] *= .5; d[b + SPIN] *= .5; }
      d[b + ROT] += d[b + SPIN] * dt;
      const t = age / d[b + LIFE], fadeIn = Math.min(1, age * 30);
      const size = d[b + S0] + (d[b + S1] - d[b + S0]) * t;
      let x = d[b + PX], y = d[b + PY], z = d[b + PZ], ax = d[b + AX], ay = d[b + AY], az = d[b + AZ];
      const str = d[b + STR];
      if (str > 0) { ax = d[b + VX] * str; ay = d[b + VY] * str; az = d[b + VZ] * str; }
      else if (str < 0) { const grow = Math.min(1, t * 5); ax *= grow; ay *= grow; az *= grow; x += ax * .5; y += ay * .5; z += az * .5; }
      P[i3] = x; P[i3 + 1] = y; P[i3 + 2] = z; X[i3] = ax; X[i3 + 1] = ay; X[i3 + 2] = az;
      M[i4] = size; M[i4 + 1] = d[b + ROT]; M[i4 + 2] = d[b + CELL]; M[i4 + 3] = d[b + MODE];
      C[i4] = d[b + R0] + (d[b + R1] - d[b + R0]) * t; C[i4 + 1] = d[b + G0] + (d[b + G1] - d[b + G0]) * t;
      C[i4 + 2] = d[b + B0] + (d[b + B1] - d[b + B0]) * t; C[i4 + 3] = (d[b + A0] + (d[b + A1] - d[b + A0]) * t) * fadeIn;
    }
    this.geo.instanceCount = this.count;
    for (const [attr, size] of [[this.pos, 3], [this.axis, 3], [this.params, 4], [this.color, 4]] as const) {
      attr.clearUpdateRanges(); if (this.count) { attr.addUpdateRange(0, this.count * size); attr.needsUpdate = true; }
    }
  }
  dispose() { this.geo.dispose(); (this.mesh.material as THREE.Material).dispose(); }
}

// Paletas por natureza: brilho/núcleo, meio, borda, fumaça/sombra.
type Palette = { core: Col; mid: Col; edge: Col; dark: Col };
const pal = (core: string, mid: string, edge: string, dark: string): Palette => ({ core: hex(core), mid: hex(mid), edge: hex(edge), dark: hex(dark) });
const PAL = {
  fire: pal('#fff4b0', '#ff9a2e', '#d8321a', '#3a2a26'),
  blueFire: pal('#effcff', '#79d0ff', '#2a6dff', '#24304a'),
  blackFire: pal('#b884ff', '#5a2a8c', '#120a16', '#0c0610'),
  water: pal('#f2fdff', '#7fd2ff', '#2a86d6', '#9fc8e0'),
  wind: pal('#ffffff', '#b8f7e2', '#5fcfaa', '#d9e8dc'),
  bolt: pal('#ffffff', '#c4e8ff', '#5b8dff', '#2a3560'),
  purpleBolt: pal('#ffffff', '#e2c4ff', '#9a5bff', '#2b1f4a'),
  earth: pal('#e8d2b0', '#b48c66', '#7a5b42', '#a89276'),
  wood: pal('#d6f5a8', '#a0703f', '#6b4528', '#7cc85a'),
  sand: pal('#fbe6b4', '#e2b675', '#a87a44', '#d4b384'),
  shadow: pal('#d7b6ff', '#8a5cc8', '#2a1840', '#120a1c'),
  sage: pal('#fffbe0', '#f5da86', '#e09a38', '#c48a3c'),
  neutral: pal('#ffffff', '#dce8ff', '#9fb4d8', '#a9aab0'),
  heal: pal('#f2fff0', '#8dffb0', '#36c46a', '#a8e8b8'),
  gold: pal('#fffbe0', '#ffd860', '#d89a20', '#b88c40'),
  gates: pal('#f4fff0', '#8af0c0', '#2fae7a', '#d8f0e8'),
  chakraBlue: pal('#f0faff', '#8fd8ff', '#3a8cff', '#bcd8f0'),
  smoke: pal('#ffffff', '#cfd2d8', '#8d9098', '#6d7078'),
} as const;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const tri = () => Math.random() - Math.random();

export type ParticleFx = ReturnType<typeof createParticleFx>;

export function createParticleFx(scene: THREE.Scene, ground: (x: number, z: number) => number) {
  const caps = { alta: 7000, media: 4200, baixa: 1800 } as const;
  const quality = currentSettings().quality;
  const add = new Pool(caps[quality] ?? 7000, true), norm = new Pool(Math.round((caps[quality] ?? 7000) * .6), false);
  scene.add(norm.mesh, add.mesh);
  let hidden = false, density = 1, impactsThisFrame = 0, recentImpacts = 0, recentTimer = 0, emitted = 0;
  let cur: Float32Array = add.data, cb = -1;

  /** Emite uma partícula; os ajustes (drag, gravidade…) valem para a última emitida. */
  function emit(additive: boolean, x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, s0: number, s1: number,
    c0: Col, a0: number, c1: Col, a1: number, cell: number, mode = BILL, delay = 0) {
    const pool = additive ? add : norm; cb = pool.spawn(); cur = pool.data;
    if (cb < 0) return false;
    const d = cur, b = cb; emitted++;
    d[b + PX] = x; d[b + PY] = y; d[b + PZ] = z; d[b + VX] = vx; d[b + VY] = vy; d[b + VZ] = vz;
    d[b + AGE] = -delay; d[b + LIFE] = life; d[b + S0] = s0; d[b + S1] = s1;
    d[b + R0] = c0[0]; d[b + G0] = c0[1]; d[b + B0] = c0[2]; d[b + A0] = a0; d[b + R1] = c1[0]; d[b + G1] = c1[1]; d[b + B1] = c1[2]; d[b + A1] = a1;
    d[b + CELL] = cell; d[b + MODE] = mode; d[b + ROT] = Math.random() * 6.283;
    return true;
  }
  const set = (field: number, v: number) => { if (cb >= 0) cur[cb + field] = v; };
  const drag = (v: number) => set(DRAG, v), grav = (v: number) => set(GRAV, v), spin = (v: number) => set(SPIN, v), rot = (v: number) => set(ROT, v);
  const floor = (y: number) => set(FLOOR, y), stretch = (v: number) => set(STR, v);
  const axis = (x: number, y: number, z: number, grow = false) => { set(AX, x); set(AY, y); set(AZ, z); if (grow) set(STR, -1); };
  /** Quantidade escalada por qualidade e pela folga do pool (densidade adaptativa). */
  const N = (k: number) => { const room = Math.min(1 - add.count / add.cap, 1 - norm.count / norm.cap); const f = density * (room < .35 ? Math.max(.08, room / .35) : 1); const v = k * f; return Math.floor(v) + (Math.random() < v % 1 ? 1 : 0); };
  const gy = (x: number, z: number) => ground(x, z);

  function paletteOf(t: Technique): Palette {
    const n = t.name;
    switch (t.element) {
      case 'Fogo': return n === 'Amaterasu' ? PAL.blackFire : (t.color === '#69c9ff' || t.color === '#81e5ff') ? PAL.blueFire : PAL.fire;
      case 'Água': return PAL.water;
      case 'Vento': return /Rasen|Chakra/.test(n) ? PAL.chakraBlue : PAL.wind;
      case 'Raio': return /Púrpura|Indra|Kirin/.test(n) ? PAL.purpleBolt : PAL.bolt;
      case 'Terra': return PAL.earth;
      case 'Madeira': return PAL.wood;
      case 'Areia': return PAL.sand;
      case 'Sombra': return PAL.shadow;
      case 'Sábio': return PAL.sage;
      default:
        if (/Mística|Palma Mística|Criação/.test(n)) return PAL.heal;
        if (/Correntes|Selamento/.test(n)) return PAL.gold;
        if (/Bijūdama|Esferas|Limbo/.test(n)) return PAL.shadow;
        if (/Fumaça/.test(n)) return PAL.smoke;
        if (/Kaiten|Palma de Ar|Punho Gentil|Palmas|Tigre|Bansho|Shinra/.test(n)) return PAL.chakraBlue;
        return PAL.neutral;
    }
  }

  // ---------- Peças reutilizáveis ----------
  function flash(x: number, y: number, z: number, size: number, p: Palette, life = .16, delay = 0) {
    emit(true, x, y, z, 0, 0, 0, life, size * .6, size, p.core, .95, p.mid, 0, GLOW, BILL, delay);
  }
  function shockRing(x: number, z: number, radius: number, p: Palette, life = .38, delay = 0, additive = true, alpha = .85) {
    // A textura do anel tem o contorno em ~80% do raio do quad: tamanho 2,5×R cobre o raio real do golpe.
    emit(additive, x, gy(x, z) + .08, z, 0, 0, 0, life, radius * .5, radius * 2.5, p.core, alpha, p.edge, 0, RING, GROUND, delay);
  }
  function sparks(x: number, y: number, z: number, n: number, speed: number, p: Palette, life = .35, delay = 0, gravity = 4) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, up = rand(-.2, 1);
      emit(true, x, y, z, Math.cos(a) * speed * rand(.4, 1), up * speed * .8, Math.sin(a) * speed * rand(.4, 1), life * rand(.6, 1), .07, .03, p.core, 1, p.mid, 0, STREAK, AXIS, delay);
      stretch(.05); grav(gravity); drag(1.5);
    }
  }
  function smokePuff(x: number, y: number, z: number, n: number, radius: number, p: Palette, life = .7, delay = 0, alpha = .38) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, r = Math.random() * radius;
      emit(false, x + Math.cos(a) * r, y + rand(0, .3), z + Math.sin(a) * r, Math.cos(a) * radius, rand(.4, 1.1), Math.sin(a) * radius, life * rand(.7, 1.1), radius * .5, radius * 1.4, p.dark, alpha, p.dark, 0, SMOKE, BILL, delay + rand(0, .08));
      drag(2); spin(rand(-1, 1));
    }
  }
  function shards(x: number, z: number, n: number, radius: number, p: Palette, delay = 0, power = 1) {
    const g = gy(x, z);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, r = Math.random() * radius * .4, s = rand(.08, .22) * Math.min(1.6, .7 + radius * .4);
      emit(false, x + Math.cos(a) * r, g + .1, z + Math.sin(a) * r, Math.cos(a) * radius * rand(1, 2.4) * power, rand(2.2, 4.8) * power, Math.sin(a) * radius * rand(1, 2.4) * power, rand(.6, .9), s, s * .8, i % 2 ? p.mid : p.edge, 1, p.edge, .0, SHARD, BILL, delay + rand(0, .05));
      grav(11); floor(g + .06); spin(rand(-9, 9)); drag(.4);
    }
  }
  /** Raio quebrado de A até B como segmentos esticados (núcleo branco + halo colorido). */
  function bolt(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, p: Palette, delay: number, life: number, jitter: number, segs: number, width = .07) {
    let px = x0, py = y0, pz = z0;
    for (let i = 1; i <= segs; i++) {
      const t = i / segs, j = i === segs ? 0 : jitter;
      const nx = x0 + (x1 - x0) * t + tri() * j, ny = y0 + (y1 - y0) * t + tri() * j * .6, nz = z0 + (z1 - z0) * t + tri() * j;
      const mx = (px + nx) / 2, my = (py + ny) / 2, mz = (pz + nz) / 2;
      emit(true, mx, my, mz, 0, 0, 0, life, width, width * .7, p.core, 1, p.mid, .2, STREAK, AXIS, delay); axis(nx - px, ny - py, nz - pz);
      emit(true, mx, my, mz, 0, 0, 0, life * 1.3, width * 4, width * 3, p.mid, .38, p.edge, 0, STREAK, AXIS, delay); axis(nx - px, ny - py, nz - pz);
      if (Math.random() < .18 && i < segs) {
        const bx = nx + tri() * jitter * 2.2, by = ny + tri() * jitter, bz = nz + tri() * jitter * 2.2;
        emit(true, (nx + bx) / 2, (ny + by) / 2, (nz + bz) / 2, 0, 0, 0, life * .8, width * .7, width * .4, p.core, .9, p.edge, 0, STREAK, AXIS, delay); axis(bx - nx, by - ny, bz - nz);
      }
      px = nx; py = ny; pz = nz;
    }
  }
  function crescent(x: number, y: number, z: number, dx: number, dz: number, size: number, speed: number, p: Palette, life: number, delay: number, additive = true, alpha = .9) {
    emit(additive, x, y, z, dx * speed, 0, dz * speed, life, size * .7, size * 1.15, p.core, alpha, p.mid, 0, BLADE, GROUND, delay);
    rot(Math.atan2(dz, dx)); drag(2.5);
  }
  function groundStain(x: number, z: number, size: number, p: Palette, life: number, delay: number, alpha = .55, vx = 0, vz = 0) {
    emit(false, x, gy(x, z) + .07, z, vx, 0, vz, life, size * .5, size, p.dark, alpha, p.dark, 0, SMOKE, GROUND, delay); drag(3);
  }

  // ---------- Formas ----------
  function cone(t: Technique, p: Palette, ox: number, oy: number, oz: number, dx: number, dz: number, range: number) {
    const el = t.element, n = t.name, spread = .8;
    const dir = (a: number): [number, number] => { const c = Math.cos(a), s = Math.sin(a); return [dx * c - dz * s, dx * s + dz * c]; };
    if (el === 'Fogo') {
      // Baforada: chamas saem da boca, abrem até a largura real do cone e somem em fumaça.
      flash(ox + dx * .3, oy, oz + dz * .3, .9, p, .22);
      const life = .45;
      for (let i = N(54); i-- > 0;) {
        const [vx, vz] = dir(tri() * spread), sp = range / life * rand(.75, 1.08), delay = rand(0, .24);
        emit(true, ox + dx * .3, oy - .1, oz + dz * .3, vx * sp, rand(.1, .7), vz * sp, life * rand(.85, 1.1), .16, range * rand(.34, .5), i % 3 ? p.core : p.mid, .95, p.edge, 0, FLAME, BILL, delay);
        spin(rand(-2.5, 2.5));
      }
      for (let i = N(12); i-- > 0;) { const [vx, vz] = dir(tri() * spread); emit(false, ox + dx * range * .4, oy, oz + dz * range * .4, vx * range * 1.1, rand(.6, 1.4), vz * range * 1.1, .7, range * .2, range * .5, p.dark, .32, p.dark, 0, SMOKE, BILL, rand(.15, .32)); drag(1.6); }
      for (let i = N(14); i-- > 0;) { const [vx, vz] = dir(tri() * spread), sp = range * rand(2, 3.4); emit(true, ox + dx * .3, oy, oz + dz * .3, vx * sp, rand(.5, 2), vz * sp, .55, .06, .03, p.core, 1, p.edge, 0, STREAK, AXIS, rand(0, .25)); stretch(.04); grav(3); drag(1.8); }
      return;
    }
    if (el === 'Vento' || /Leque/.test(n)) {
      // Rajada: rastros rápidos e lâminas em meia-lua do tamanho do cone.
      for (let i = N(30); i-- > 0;) {
        const [vx, vz] = dir(tri() * spread), sp = range / .3 * rand(.7, 1.1);
        emit(true, ox + vx * .3, oy + rand(-.4, .3), oz + vz * .3, vx * sp, 0, vz * sp, .3, .06, .04, p.core, .85, p.mid, 0, STREAK, AXIS, rand(0, .18)); stretch(.07);
      }
      for (let i = 0; i < Math.max(1, N(4)); i++) crescent(ox + dx * .4, oy - .2 + i * .1, oz + dz * .4, dx, dz, range * .75, range * 3.3, p, .3, i * .06);
      for (let i = N(8); i-- > 0;) { const [vx, vz] = dir(tri() * spread); groundStain(ox + vx * range * .5, oz + vz * range * .5, .6, PAL.smoke, .5, rand(0, .15), .18, vx * 2, vz * 2); }
      return;
    }
    if (el === 'Areia') {
      for (let i = N(46); i-- > 0;) {
        const [vx, vz] = dir(tri() * spread), sp = range / .4 * rand(.6, 1.1), s = rand(.05, .11);
        emit(false, ox + dx * .3, oy - .2, oz + dz * .3, vx * sp, rand(.2, 1.4), vz * sp, .42, s, s, p.mid, 1, p.edge, 0, SHARD, BILL, rand(0, .18)); spin(rand(-8, 8)); grav(2);
      }
      for (let i = N(8); i-- > 0;) { const [vx, vz] = dir(tri() * spread); emit(false, ox + vx * range * .5, oy - .4, oz + vz * range * .5, vx, .5, vz, .6, range * .2, range * .45, p.dark, .4, p.dark, 0, SMOKE, BILL, rand(.05, .2)); }
      if (/Garra/.test(n)) for (let k = -1; k <= 1; k++) { const [cx, cz] = dir(k * .35); crescent(ox + cx * range * .6, oy - .3, oz + cz * range * .6, cx, cz, range * .45, 0, p, .3, .1 + Math.abs(k) * .04, false, .8); }
      return;
    }
    if (el === 'Sombra') {
      // Sombra rastejando pelo chão até a borda do cone, com fios finos.
      for (let i = N(26); i-- > 0;) {
        const [vx, vz] = dir(tri() * spread * .9), r = Math.random() * range;
        groundStain(ox + vx * r, oz + vz * r, rand(.35, .7), p, .55, r / range * .2, .7);
      }
      for (let i = N(5); i-- > 0;) { const [vx, vz] = dir(tri() * spread); emit(false, ox, gy(ox, oz) + .1, oz, 0, 0, 0, .5, .08, .06, p.edge, .9, p.dark, 0, STREAK, AXIS, 0); axis(vx * range, 0, vz * range, true); }
      return;
    }
    if (el === 'Raio') { for (let k = 0; k < Math.max(2, N(5)); k++) { const [vx, vz] = dir(tri() * spread), r = range * rand(.7, 1); bolt(ox, oy, oz, ox + vx * r, oy - .4, oz + vz * r, p, k * .04, .1, .22, 6); } return; }
    if (el === 'Água') {
      for (let i = N(40); i-- > 0;) { const [vx, vz] = dir(tri() * spread), sp = range / .35 * rand(.6, 1.1); emit(true, ox, oy - .1, oz, vx * sp, rand(.5, 2), vz * sp, .45, .12, .06, p.core, .9, p.mid, 0, GLOW, BILL, rand(0, .15)); grav(7); }
      return;
    }
    if (/Senbon|Agulhas|Mil Braços|Chuva/.test(n)) {
      for (let i = N(24); i-- > 0;) { const [vx, vz] = dir(tri() * spread), sp = range / .22 * rand(.8, 1.1); emit(true, ox, oy - .1, oz, vx * sp, 0, vz * sp, .22, .04, .03, p.core, 1, p.mid, .3, STREAK, AXIS, rand(0, .15)); stretch(.03); }
      return;
    }
    // Taijutsu / armas em cone: arcos de golpe varrendo a área, estrelas de impacto e poeira.
    for (let k = 0; k < Math.max(1, N(3)); k++) {
      const a = (k - 1) * .45, [cx, cz] = dir(a);
      crescent(ox + cx * range * .35, oy - .25 + k * .12, oz + cz * range * .35, cx, cz, range * .8, range * 1.2, p, .22, k * .05);
    }
    for (let i = N(4); i-- > 0;) { const [vx, vz] = dir(tri() * spread), r = range * rand(.4, 1); emit(true, ox + vx * r, oy - .2, oz + vz * r, 0, 0, 0, .14, .3, .75, p.core, 1, p.mid, 0, SPARK, BILL, rand(.03, .12)); }
    for (let i = N(6); i-- > 0;) { const [vx, vz] = dir(tri() * spread); groundStain(ox + vx * range * .5, oz + vz * range * .5, .5, PAL.smoke, .45, rand(0, .1), .2, vx * 1.5, vz * 1.5); }
  }

  function line(t: Technique, p: Palette, ox: number, oy: number, oz: number, dx: number, dz: number, range: number, half: number) {
    const el = t.element, n = t.name, px = -dz, pz = dx;
    const ex = ox + dx * range, ez = oz + dz * range;
    if (el === 'Raio') {
      // Chidori/Raikiri: chakra crepitando na mão + relâmpagos sequenciais até o fim da linha.
      flash(ox + dx * .25, oy - .1, oz + dz * .25, /Chidori|Raikiri/.test(n) ? 1.3 : .8, p, .3);
      for (let k = 0; k < Math.max(2, N(4)); k++) {
        const a = Math.random() * 6.283;
        bolt(ox + dx * .25, oy - .1, oz + dz * .25, ox + dx * .25 + Math.cos(a) * .55, oy + rand(-.4, .3), oz + dz * .25 + Math.sin(a) * .55, p, k * .03, .08, .1, 3, .04);
      }
      const flick = Math.max(2, N(4));
      for (let k = 0; k < flick; k++) {
        const off = tri() * half * .8;
        bolt(ox + dx * .25, oy - .1, oz + dz * .25, ex + px * off, gy(ex, ez) + .4, ez + pz * off, p, .02 + k * .05, .09, .24, Math.max(5, Math.round(range * 2)), /Flecha|Indra/.test(n) ? .12 : .07);
      }
      for (let i = N(16); i-- > 0;) { const r = Math.random() * range; sparks(ox + dx * r, oy - .2, oz + dz * r, 1, 3, p, .3, rand(0, .2)); }
      flash(ex, gy(ex, ez) + .5, ez, .8, p, .18, .05);
      return;
    }
    if (el === 'Água') {
      // Jato de alta pressão: núcleo esticado + gotas correndo pela linha + borrifo no fim.
      const mx = ox + dx * range / 2, mz = oz + dz * range / 2;
      emit(true, mx, oy - .2, mz, 0, 0, 0, .22, half * .35, half * .2, p.core, .9, p.mid, 0, STREAK, AXIS, 0); axis(dx * range, 0, dz * range);
      emit(true, mx, oy - .2, mz, 0, 0, 0, .28, half * 1.4, half, p.mid, .35, p.edge, 0, STREAK, AXIS, 0); axis(dx * range, 0, dz * range);
      for (let i = N(40); i-- > 0;) { const r = Math.random() * range, off = tri() * half * .6; emit(true, ox + dx * r + px * off, oy - .2 + tri() * .1, oz + dz * r + pz * off, dx * 8, rand(0, .6), dz * 8, .22, .12, .05, p.core, .85, p.mid, 0, GLOW, BILL, r / range * .1); grav(4); }
      for (let i = N(14); i-- > 0;) { const a = Math.random() * 6.283; emit(true, ex, oy - .3, ez, Math.cos(a) * 2 + dx * 2, rand(1.5, 3.5), Math.sin(a) * 2 + dz * 2, .5, .13, .06, p.core, .9, p.mid, 0, GLOW, BILL, .1); grav(9); }
      return;
    }
    if (el === 'Madeira') {
      // Estacas brotando do chão em sequência ao longo da linha.
      const count = Math.max(3, N(Math.round(range * 3)));
      for (let k = 0; k < count; k++) {
        const r = (k + .5) / count * range, off = tri() * half * .7, x = ox + dx * r + px * off, z = oz + dz * r + pz * off, g = gy(x, z), h = rand(.7, 1.3), delay = r / range * .18;
        emit(false, x, g - .05, z, 0, 0, 0, .7, .2, .16, p.mid, 1, p.edge, .0, SHARD, AXIS, delay); axis(dx * .18 + tri() * .2, h, dz * .18 + tri() * .2, true);
        shards(x, z, Math.max(1, N(2)), .3, PAL.earth, delay, .5);
        if (Math.random() < .5) { emit(false, x, g + h, z, rand(-1, 1), rand(.3, 1), rand(-1, 1), .7, .1, .08, p.dark, 1, p.dark, 0, BLADE, BILL, delay + .1); grav(1.5); spin(rand(-6, 6)); }
      }
      return;
    }
    if (el === 'Terra') {
      // Muro: placas de pedra subindo + poeira.
      const count = Math.max(3, N(Math.round(range * 2.6)));
      for (let k = 0; k < count; k++) {
        const r = (k + .5) / count * range, x = ox + dx * r, z = oz + dz * r, g = gy(x, z), delay = r / range * .15;
        emit(false, x, g - .1, z, 0, 0, 0, .8, half * 1.1, half, k % 2 ? p.mid : p.core, 1, p.edge, 0, SHARD, AXIS, delay); axis(0, rand(.9, 1.3), 0, true);
        shards(x, z, Math.max(1, N(2)), .5, p, delay, .7);
      }
      for (let i = N(10); i-- > 0;) { const r = Math.random() * range; smokePuff(ox + dx * r, gy(ox + dx * r, oz + dz * r) + .1, oz + dz * r, 1, .5, p, .7, r / range * .15, .3); }
      return;
    }
    if (el === 'Sombra') {
      // Costura: fios de sombra esticando pelo chão e espetando o alvo.
      for (let k = 0; k < Math.max(3, N(6)); k++) {
        const off = tri() * half, tx = ex + px * off, tz = ez + pz * off;
        emit(false, ox, gy(ox, oz) + .12, oz, 0, 0, 0, .5, .07, .05, p.dark, .95, p.dark, 0, STREAK, AXIS, k * .02); axis(tx - ox, .3, tz - oz, true);
        emit(true, ox, gy(ox, oz) + .14, oz, 0, 0, 0, .5, .14, .1, p.mid, .35, p.edge, 0, STREAK, AXIS, k * .02); axis(tx - ox, .3, tz - oz, true);
      }
      for (let i = N(16); i-- > 0;) { const r = Math.random() * range; groundStain(ox + dx * r, oz + dz * r, rand(.4, .7), p, .55, r / range * .15, .6); }
      return;
    }
    if (el === 'Fogo' || el === 'Vento' || el === 'Areia') {
      for (let i = N(40); i-- > 0;) {
        const r = Math.random() * range, off = tri() * half;
        if (el === 'Fogo') { emit(true, ox + dx * r + px * off, oy - .2, oz + dz * r + pz * off, dx, rand(.5, 1.5), dz, .4, .2, .5, p.core, .9, p.edge, 0, FLAME, BILL, r / range * .15); }
        else if (el === 'Vento') { emit(true, ox + dx * r + px * off, oy - .2, oz + dz * r + pz * off, dx * 9, 0, dz * 9, .25, .05, .03, p.core, .85, p.mid, 0, STREAK, AXIS, r / range * .1); stretch(.06); }
        else { emit(false, ox + dx * r + px * off, oy - .3, oz + dz * r + pz * off, dx * 3, rand(.3, 1.2), dz * 3, .4, .08, .07, p.mid, 1, p.edge, 0, SHARD, BILL, r / range * .15); grav(3); spin(5); }
      }
      return;
    }
    // Neutro: sequência de golpes ao longo da linha (palmas, investidas, correntes, serpentes).
    const chain = /Corrente|Correntes|Serpentes/.test(n);
    if (chain) {
      const links = Math.max(4, N(Math.round(range * 4)));
      for (let k = 0; k < links; k++) { const r = (k + .5) / links * range; emit(true, ox + dx * r, oy - .25 + Math.sin(k) * .08, oz + dz * r, 0, 0, 0, .3, .2, .14, p.core, .95, p.mid, 0, GLOW, BILL, r / range * .12); }
    } else {
      emit(true, ox + dx * range / 2, oy - .2, oz + dz * range / 2, 0, 0, 0, .18, half * .8, half * .3, p.core, .7, p.mid, 0, STREAK, AXIS, 0); axis(dx * range, 0, dz * range);
    }
    const hits = Math.max(2, N(5));
    for (let k = 0; k < hits; k++) { const r = (k + 1) / hits * range, off = tri() * half * .6; emit(true, ox + dx * r + px * off, oy - .2, oz + dz * r + pz * off, 0, 0, 0, .14, .35, .8, p.core, 1, p.mid, 0, SPARK, BILL, k * .04); }
  }

  function area(t: Technique, p: Palette, cx: number, cy: number, cz: number, R: number) {
    const el = t.element, n = t.name, g = gy(cx, cz);
    if (el === 'Fogo' && n === 'Amaterasu') {
      for (let i = N(44); i-- > 0;) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R; emit(false, cx + Math.cos(a) * r, g + .1, cz + Math.sin(a) * r, 0, rand(1.2, 2.4), 0, rand(.5, .8), .25, .55, p.edge, .95, p.dark, 0, FLAME, BILL, rand(0, .2)); spin(rand(-2, 2)); }
      for (let i = N(14); i-- > 0;) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R; emit(true, cx + Math.cos(a) * r, g + .3, cz + Math.sin(a) * r, 0, 1.5, 0, .5, .2, .4, p.core, .5, p.mid, 0, FLAME, BILL, rand(0, .2)); }
      groundStain(cx, cz, R * 2.3, p, 1, 0, .5);
      return;
    }
    if (el === 'Fogo' || /Explosiva/.test(n)) { explosion(cx, cz, R, el === 'Fogo' ? p : PAL.fire, /Cinzas/.test(n)); return; }
    if (el === 'Água') {
      // Onda que se abre até o raio real, com espuma e gotas.
      shockRing(cx, cz, R, p, .45); shockRing(cx, cz, R * .7, PAL.water, .4, .08, true, .5);
      for (let i = N(44); i-- > 0;) { const a = Math.random() * 6.283, s = R / .4 * rand(.85, 1.05); emit(true, cx, g + .2, cz, Math.cos(a) * s, rand(.3, 1.2), Math.sin(a) * s, .4, .18, .1, p.core, .9, p.mid, 0, GLOW, BILL, rand(0, .05)); grav(3); }
      for (let i = N(26); i-- > 0;) { const a = Math.random() * 6.283, r = Math.random() * R; emit(true, cx + Math.cos(a) * r, g + .2, cz + Math.sin(a) * r, Math.cos(a) * .8, rand(2, 4), Math.sin(a) * .8, .6, .14, .08, p.core, .9, p.mid, 0, GLOW, BILL, rand(0, .15)); grav(9); floor(g); }
      return;
    }
    if (el === 'Vento') {
      // Rasengan: espiral azul que converge e estoura até o raio do golpe.
      for (let i = N(40); i-- > 0;) { const a = Math.random() * 6.283, r = R * rand(.7, 1.1), tx = -Math.sin(a), tz = Math.cos(a); emit(true, cx + Math.cos(a) * r, cy - .2 + tri() * .3, cz + Math.sin(a) * r, tx * 9 - Math.cos(a) * R * 2.5, 0, tz * 9 - Math.sin(a) * R * 2.5, .25, .05, .03, p.core, .9, p.mid, 0, STREAK, AXIS, 0); stretch(.05); }
      flash(cx, cy - .2, cz, R * 1.4, p, .22, .12);
      shockRing(cx, cz, R, p, .32, .14);
      sparks(cx, cy - .2, cz, N(12), R * 4, p, .35, .14, 1);
      return;
    }
    if (el === 'Terra') {
      flash(cx, g + .3, cz, R * .9, p, .12);
      shockRing(cx, cz, R, p, .5, 0, false, .55);
      shards(cx, cz, N(30), R, p);
      for (let i = N(12); i-- > 0;) { const a = Math.random() * 6.283; smokePuff(cx + Math.cos(a) * R * .8, g + .15, cz + Math.sin(a) * R * .8, 1, R * .5, p, .8, rand(0, .1), .35); }
      return;
    }
    if (el === 'Madeira' || el === 'Sábio') {
      // Raízes/estacas brotando em pontos do disco; Sábio acrescenta brilho dourado.
      for (let i = Math.max(4, N(Math.round(6 + R * 4))); i-- > 0;) {
        const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, gg = gy(x, z), h = rand(.6, 1.3), delay = r / R * .15;
        emit(false, x, gg - .05, z, 0, 0, 0, .75, .18, .14, PAL.wood.mid, 1, PAL.wood.edge, 0, SHARD, AXIS, delay); axis(Math.cos(a) * .4, h, Math.sin(a) * .4, true);
        if (Math.random() < .5) { emit(false, x, gg + h, z, rand(-1, 1), rand(.3, 1.2), rand(-1, 1), .8, .12, .09, PAL.wood.dark, 1, PAL.wood.dark, 0, BLADE, BILL, delay + .12); grav(1.5); spin(rand(-6, 6)); }
      }
      shockRing(cx, cz, R, PAL.wood, .45, 0, false, .45);
      if (el === 'Sábio') for (let i = N(24); i-- > 0;) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R; emit(true, cx + Math.cos(a) * r, g + .2, cz + Math.sin(a) * r, 0, rand(.8, 1.8), 0, .7, .14, .05, p.core, 1, p.edge, 0, SPARK, BILL, rand(0, .3)); }
      return;
    }
    if (el === 'Areia') {
      // Caixão/Sepultamento: areia gira para dentro, sobe e fecha num estouro de poeira.
      for (let i = N(56); i-- > 0;) {
        const a = Math.random() * 6.283, r = R * rand(.6, 1.15), s = rand(.05, .12);
        emit(false, cx + Math.cos(a) * r, g + rand(.1, .5), cz + Math.sin(a) * r, -Math.sin(a) * 5 - Math.cos(a) * r * 1.6, rand(.8, 2.4), Math.cos(a) * 5 - Math.sin(a) * r * 1.6, .5, s, s * .7, p.mid, 1, p.edge, 0, SHARD, BILL, rand(0, .12)); spin(rand(-8, 8)); drag(1);
      }
      smokePuff(cx, g + .3, cz, N(12), R * .7, p, .7, .25, .45);
      shockRing(cx, cz, R, p, .5, .25, false, .5);
      return;
    }
    if (el === 'Sombra') {
      // Mancha de sombra se espalhando pelo chão até o raio + fumaça/fios roxos.
      for (let i = N(26); i-- > 0;) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R; groundStain(cx + Math.cos(a) * r * .3, cz + Math.sin(a) * r * .3, rand(.5, .9), p, .7, r / R * .15, .7, Math.cos(a) * r * 2.6, Math.sin(a) * r * 2.6); }
      const fog = /Névoa/.test(n), moon = /Tsukuyomi/.test(n);
      for (let i = N(fog ? 18 : 12); i-- > 0;) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R; emit(!fog, cx + Math.cos(a) * r, g + .2, cz + Math.sin(a) * r, 0, rand(.6, 1.4), 0, .8, fog ? R * .4 : .2, fog ? R * .9 : .05, fog ? hex('#7ab06a') : moon ? hex('#ff4a5a') : p.mid, fog ? .35 : .9, p.dark, 0, fog ? SMOKE : FLAME, BILL, rand(0, .3)); }
      shockRing(cx, cz, R, moon ? PAL.fire : p, .5, 0, true, .5);
      return;
    }
    if (el === 'Raio') { for (let k = 0; k < Math.max(3, N(6)); k++) { const a = Math.random() * 6.283, r = Math.random() * R; bolt(cx, cy + 2.5, cz, cx + Math.cos(a) * r, g + .1, cz + Math.sin(a) * r, p, k * .04, .1, .3, 7, .08); } shockRing(cx, cz, R, p, .3); return; }
    // Neutro: fumaça, Shinra Tensei, Bijūdama, Lótus, invocações → onda de choque + estrelas + poeira.
    if (/Fumaça/.test(n)) { smokePuff(cx, g + .2, cz, N(26), R * .9, PAL.smoke, 1.1, 0, .55); return; }
    const big = /Shinra|Bijūdama/.test(n);
    flash(cx, g + .5, cz, R * (big ? 1.6 : .9), p, .18);
    shockRing(cx, cz, R, p, .4); if (big) shockRing(cx, cz, R * .8, p, .5, .08);
    for (let i = N(5); i-- > 0;) { const a = Math.random() * 6.283, r = Math.random() * R; emit(true, cx + Math.cos(a) * r, g + .5, cz + Math.sin(a) * r, 0, 0, 0, .14, .3, .8, p.core, 1, p.mid, 0, SPARK, BILL, rand(0, .12)); }
    for (let i = N(10); i-- > 0;) { const a = Math.random() * 6.283; groundStain(cx + Math.cos(a) * R * .5, cz + Math.sin(a) * R * .5, .7, PAL.smoke, .55, 0, .22, Math.cos(a) * R * 2, Math.sin(a) * R * 2); }
  }

  function explosion(cx: number, cz: number, R: number, p: Palette, ash = false, delay = 0) {
    const g = gy(cx, cz);
    flash(cx, g + .5, cz, R * 2, p, .2, delay);
    shockRing(cx, cz, R, p, .35, delay);
    for (let i = N(ash ? 24 : 42); i-- > 0;) {
      const a = Math.random() * 6.283, s = R / .3 * rand(.4, 1);
      emit(true, cx, g + .35, cz, Math.cos(a) * s, rand(.6, 2.4), Math.sin(a) * s, rand(.4, .6), R * .3, R * .7, i % 3 ? p.core : p.mid, .95, p.edge, 0, FLAME, BILL, delay + rand(0, .06)); drag(3.2); spin(rand(-2, 2));
    }
    for (let i = N(14); i-- > 0;) { const a = Math.random() * 6.283, r = Math.random() * R * .7; emit(false, cx + Math.cos(a) * r, g + .4, cz + Math.sin(a) * r, Math.cos(a), rand(1, 2), Math.sin(a), .9, R * .35, R * .8, p.dark, ash ? .55 : .35, p.dark, 0, SMOKE, BILL, delay + rand(.12, .25)); drag(1.2); }
    sparks(cx, g + .4, cz, N(ash ? 26 : 14), R * 4, p, .6, delay, 5);
    groundStain(cx, cz, R * 2.2, p, 1.1, delay, .4);
  }

  function orbit(t: Technique, p: Palette, ox: number, oy: number, oz: number, R: number) {
    const n = t.name, g = gy(ox, oz);
    if (/Corvos/.test(n)) {
      for (let i = N(26); i-- > 0;) { const a = Math.random() * 6.283, r = R * rand(.5, 1.1); emit(false, ox + Math.cos(a) * r, oy + rand(-.3, .8), oz + Math.sin(a) * r, -Math.sin(a) * 6, rand(.5, 1.5), Math.cos(a) * 6, .55, .18, .12, hex('#1a1424'), 1, hex('#1a1424'), 0, BLADE, BILL, rand(0, .15)); spin(rand(-10, 10)); }
      for (let i = N(10); i-- > 0;) { const a = Math.random() * 6.283; emit(true, ox + Math.cos(a) * R, oy, oz + Math.sin(a) * R, 0, .5, 0, .4, .15, .05, hex('#ff3048'), .9, p.edge, 0, GLOW, BILL, rand(0, .2)); }
      return;
    }
    // Giro: rastros tangenciais no raio real + lâminas girando + anel no chão.
    const additive = t.element !== 'Sombra';
    for (let i = N(40); i-- > 0;) {
      const a = Math.random() * 6.283, r = R * rand(.55, 1.05), w = rand(7, 11);
      emit(additive, ox + Math.cos(a) * r, (t.element === 'Vento' ? g + .1 : oy - .5) + rand(0, .9), oz + Math.sin(a) * r, -Math.sin(a) * w, t.element === 'Vento' ? rand(1, 3) : 0, Math.cos(a) * w, .3, .06, .04, p.core, .9, p.mid, 0, STREAK, AXIS, rand(0, .12)); stretch(.05);
    }
    for (let k = 0; k < Math.max(2, N(4)); k++) { const a = k / 4 * 6.283; emit(additive, ox + Math.cos(a) * R * .8, oy - .4, oz + Math.sin(a) * R * .8, 0, 0, 0, .3, R * .6, R * .8, p.core, .8, p.mid, 0, BLADE, GROUND, k * .03); rot(a + Math.PI / 2); spin(12); }
    shockRing(ox, oz, R, p, .3, 0, additive, .6);
    if (/Mística/.test(n)) for (let i = N(14); i-- > 0;) { const a = Math.random() * 6.283, r = Math.random() * R; emit(true, ox + Math.cos(a) * r, g + .2, oz + Math.sin(a) * r, 0, 1.4, 0, .6, .12, .05, p.core, 1, p.mid, 0, SPARK, BILL, rand(0, .2)); }
  }

  function melee(t: Technique, p: Palette, ox: number, oy: number, oz: number, dx: number, dz: number, range: number) {
    const hx = ox + dx * range * .6, hz = oz + dz * range * .6;
    crescent(ox + dx * .2, oy - .3, oz + dz * .2, dx, dz, range * .9, range * 1.5, p, .2, 0);
    emit(true, hx, oy - .2, hz, 0, 0, 0, .14, .4, 1.1, p.core, 1, p.mid, 0, SPARK, BILL, .04);
    sparks(hx, oy - .2, hz, N(8), 4, p, .3, .04, 3);
    if (t.element === 'Terra') { shockRing(hx, hz, range * .8, p, .4, .04, false, .6); shards(hx, hz, N(14), range * .7, p, .04); }
  }

  // ---------- API ----------
  function cast(t: Technique, origin: THREE.Vector3, direction: THREE.Vector3, center: THREE.Vector3, radius: number, range: number, half: number) {
    if (hidden) return;
    const p = paletteOf(t), dx = direction.x, dz = direction.z, oy = origin.y;
    switch (t.shape) {
      case 'Cone': cone(t, p, origin.x, oy, origin.z, dx, dz, range); break;
      case 'Linha': line(t, p, origin.x, oy, origin.z, dx, dz, range, half); break;
      case 'Área': area(t, p, center.x, center.y, center.z, radius); break;
      case 'Órbita': orbit(t, p, origin.x, oy, origin.z, radius); break;
      case 'Corpo a corpo': melee(t, p, origin.x, oy, origin.z, dx, dz, range); break;
      case 'Buff': aura(t, origin, true); break;
      default: area(t, p, center.x, center.y, center.z, radius);
    }
  }

  /** Contorno do golpe, projetado no relevo com as mesmas medidas usadas no hit. */
  function footprint(t: Technique, origin: THREE.Vector3, direction: THREE.Vector3, center: THREE.Vector3, radius: number, range: number, half: number) {
    if (hidden) return;
    const p=paletteOf(t);
    const point=(x:number,z:number)=>emit(true,x,gy(x,z)+.065,z,0,0,0,.28,.11,.065,p.core,.92,p.mid,0,GLOW,GROUND);
    const edge=(x:number,z:number,dx:number,dz:number)=>{
      const steps=Math.min(16,Math.max(3,Math.ceil(Math.hypot(dx,dz)*3)));
      for(let i=0;i<=steps;i++)point(x+dx*i/steps,z+dz*i/steps);
    };
    const x=origin.x,z=origin.z,dx=direction.x,dz=direction.z;
    if(t.shape==='Linha'){
      const sx=-dz*half,sz=dx*half,fx=dx*range,fz=dz*range;
      edge(x+sx,z+sz,fx,fz);edge(x-sx,z-sz,fx,fz);
      edge(x+sx,z+sz,-2*sx,-2*sz);edge(x+fx+sx,z+fz+sz,-2*sx,-2*sz);
      return;
    }
    const cone=t.shape==='Cone',angle=Math.atan2(dz,dx),spread=cone?Math.acos(.65):Math.PI;
    const cx=cone?x:center.x,cz=cone?z:center.z,r=cone?range:radius;
    const steps=cone?18:32;
    for(let i=0;i<=steps;i++){const a=angle-spread+2*spread*i/steps;point(cx+Math.cos(a)*r,cz+Math.sin(a)*r);}
    if(cone)for(const a of [angle-spread,angle+spread])edge(cx,cz,Math.cos(a)*r,Math.sin(a)*r);
  }

  /** Preparo antes do acerto: bola de fogo voando até o alvo, chakra na mão, sombra/areia avançando. */
  function windup(t: Technique, origin: THREE.Vector3, target: THREE.Vector3, time: number) {
    if (hidden || time <= .02) return;
    const p = paletteOf(t), ox = origin.x, oy = origin.y - .1, oz = origin.z;
    if (t.element === 'Fogo' && t.shape === 'Área' && t.name !== 'Amaterasu') {
      const tx = target.x, ty = target.y, tz = target.z, vx = (tx - ox) / time, vy = (ty - oy) / time, vz = (tz - oz) / time;
      // Núcleo da bola + rastro de chamas deixadas pelo caminho.
      emit(true, ox, oy, oz, vx, vy, vz, time, .7, .95, p.core, 1, p.mid, 1, GLOW, BILL, 0);
      emit(true, ox, oy, oz, vx, vy, vz, time, .9, 1.1, p.mid, .8, p.edge, .8, FLAME, BILL, 0); spin(6);
      const steps = Math.max(4, N(16));
      for (let k = 0; k < steps; k++) {
        const f = k / steps, d = f * time;
        emit(true, ox + (tx - ox) * f, oy + (ty - oy) * f, oz + (tz - oz) * f, rand(-.4, .4), rand(.4, 1), rand(-.4, .4), .32, .45, .15, p.mid, .85, p.edge, 0, FLAME, BILL, d); spin(rand(-3, 3));
      }
      return;
    }
    if (t.element === 'Raio' && t.shape === 'Linha') {
      flash(ox, oy, oz, .9, p, time + .05);
      for (let k = 0; k < Math.max(2, N(4)); k++) { const a = Math.random() * 6.283; bolt(ox, oy, oz, ox + Math.cos(a) * .5, oy + rand(-.3, .4), oz + Math.sin(a) * .5, p, k * time / 4, .07, .1, 3, .04); }
      return;
    }
    if (t.element === 'Vento' && /Rasengan/.test(t.name)) {
      for (let i = N(16); i-- > 0;) { const a = Math.random() * 6.283; emit(true, ox + Math.cos(a) * .5, oy, oz + Math.sin(a) * .5, -Math.sin(a) * 4 - Math.cos(a) * 1.5, 0, Math.cos(a) * 4 - Math.sin(a) * 1.5, time, .05, .03, p.core, .9, p.mid, 0, STREAK, AXIS, rand(0, time * .5)); stretch(.05); }
      flash(ox, oy, oz, .7, p, time);
    }
  }

  const trailAcc = new WeakMap<object, number>();
  /** Rastro contínuo dos projéteis (chamado por quadro, sem alocação além do acumulador por tiro). */
  function trail(t: Technique, key: object, pos: THREE.Vector3, dir: THREE.Vector3, radius: number, dt: number, head: boolean) {
    if (hidden) return;
    const p = paletteOf(t), el = t.element, wave = t.shape === 'Onda', x = pos.x, y = pos.y - .1, z = pos.z, px = -dir.z, pz = dir.x;
    const rate = (wave ? 90 : 45) * density, acc = (trailAcc.get(key) ?? 0) + rate * dt;
    let n = Math.floor(acc); trailAcc.set(key, acc - n);
    if (head) {
      // Cabeça do projétil quando não há malha própria (dura 1 quadro e meio).
      const life = Math.max(.03, dt * 1.6);
      if (el === 'Fogo') { emit(true, x, y, z, 0, 0, 0, life, .7, .7, p.core, 1, p.mid, 1, GLOW, BILL); emit(true, x, y, z, 0, 0, 0, life, .55, .55, p.mid, .9, p.edge, .9, FLAME, BILL); }
      else if (el === 'Terra') { emit(false, x, y, z, 0, 0, 0, life, .55, .55, p.mid, 1, p.mid, 1, SHARD, BILL); rot(pos.x * 3); }
      else if (el === 'Sombra') { emit(false, x, y, z, 0, 0, 0, life, .12, .12, p.dark, 1, p.dark, 1, STREAK, AXIS); axis(dir.x * .6, 0, dir.z * .6); emit(true, x, y, z, 0, 0, 0, life, .3, .3, p.mid, .5, p.mid, .5, GLOW, BILL); }
      else if (wave && (el === 'Vento' || el === 'Neutro')) { emit(true, x, y - .3, z, 0, 0, 0, life, radius * 2.4, radius * 2.4, p.core, .7, p.core, .7, BLADE, GROUND); rot(Math.atan2(dir.z, dir.x)); }
      else if (el === 'Vento') { emit(true, x, y, z, 0, 0, 0, life, .5, .5, p.core, .9, p.core, .9, BLADE, GROUND); rot(Math.atan2(dir.z, dir.x)); }
      else if (wave && el === 'Areia') { /* só o rastro */ }
      else if (!wave) { emit(true, x, y, z, 0, 0, 0, life, .14, .14, p.core, 1, p.core, 1, STREAK, AXIS); axis(dir.x * .7, 0, dir.z * .7); emit(true, x, y, z, 0, 0, 0, life, .4, .4, p.mid, .5, p.mid, .5, GLOW, BILL); }
    }
    while (n-- > 0) {
      const off = wave ? tri() * radius * 1.2 : tri() * .08, sx = x + px * off, sz = z + pz * off;
      switch (el) {
        case 'Fogo': emit(true, sx, wave ? gy(sx, sz) + .2 : y, sz, -dir.x * .8, rand(.6, 1.8), -dir.z * .8, wave ? .5 : .3, wave ? .35 : .3, wave ? .7 : .1, p.core, .9, p.edge, 0, FLAME, BILL); spin(rand(-3, 3)); break;
        case 'Água': emit(true, sx, y + tri() * .2, sz, rand(-.5, .5), rand(.5, 2), rand(-.5, .5), .4, .14, .06, p.core, .85, p.mid, 0, GLOW, BILL); grav(7); break;
        case 'Vento': emit(true, sx, y + tri() * .3, sz, -dir.x * 3, 0, -dir.z * 3, .2, .05, .03, p.core, .8, p.mid, 0, STREAK, AXIS); stretch(.06); break;
        case 'Raio': emit(true, sx, y, sz, tri() * 3, tri() * 3, tri() * 3, .18, .05, .02, p.core, 1, p.mid, 0, STREAK, AXIS); stretch(.04); break;
        case 'Terra': { const gg = gy(sx, sz); if (wave) { emit(false, sx, gg, sz, tri(), rand(2, 4), tri(), .55, .16, .12, p.mid, 1, p.edge, 0, SHARD, BILL); grav(10); floor(gg + .05); spin(rand(-8, 8)); } else { emit(false, sx, y - .2, sz, 0, .5, 0, .4, .15, .35, p.dark, .3, p.dark, 0, SMOKE, BILL); } break; }
        case 'Areia': emit(false, sx, wave ? gy(sx, sz) + .2 : y, sz, tri(), rand(.5, 1.5), tri(), .45, .09, .07, p.mid, 1, p.edge, 0, SHARD, BILL); grav(3); spin(6); break;
        case 'Sombra': emit(false, sx, y, sz, 0, .3, 0, .35, .15, .3, p.dark, .5, p.dark, 0, SMOKE, BILL); break;
        case 'Madeira': emit(false, sx, y, sz, tri(), rand(.3, 1), tri(), .5, .08, .06, PAL.wood.dark, 1, PAL.wood.dark, 0, BLADE, BILL); spin(6); grav(1); break;
        default: emit(true, sx, y + tri() * (wave ? .4 : 0), sz, -dir.x * .5, 0, -dir.z * .5, wave ? .25 : .14, wave ? .06 : .04, .02, p.core, .7, p.mid, 0, STREAK, AXIS); if (wave) stretch(.06); else axis(dir.x * .5, 0, dir.z * .5);
      }
    }
  }

  /** Impacto no alvo coerente com a natureza; limitado por quadro para não explodir com hordas. */
  function impact(t: Technique, pos: THREE.Vector3) {
    if (hidden) return;
    const cap = density >= 1 ? 36 : density >= .6 ? 20 : 8;
    if (impactsThisFrame >= cap) return;
    impactsThisFrame++; recentImpacts++;
    const p = paletteOf(t), x = pos.x, y = pos.y + .1, z = pos.z;
    emit(true,x,gy(x,z)+.075,z,0,0,0,.22,.48,.78,p.core,.85,p.mid,0,RING,GROUND);
    switch (t.element) {
      case 'Fogo': for (let i = 0; i < 4; i++) { emit(true, x + tri() * .2, y, z + tri() * .2, tri(), rand(.8, 1.8), tri(), .35, .25, .45, p.core, .9, p.edge, 0, FLAME, BILL); spin(rand(-3, 3)); } sparks(x, y, z, 3, 3, p, .35); break;
      case 'Água': for (let i = 0; i < 6; i++) { const a = i * 1.05; emit(true, x, y, z, Math.cos(a) * 1.6, rand(1.5, 3), Math.sin(a) * 1.6, .4, .12, .06, p.core, .9, p.mid, 0, GLOW, BILL); grav(9); } break;
      case 'Vento': for (let k = 0; k < 2; k++) { const a = rand(0, 3.14); emit(true, x, y, z, 0, 0, 0, .14, .07, .04, p.core, 1, p.mid, 0, STREAK, AXIS); axis(Math.cos(a) * .9, k ? .5 : -.5, Math.sin(a) * .9); } break;
      case 'Raio': emit(true, x, y, z, 0, 0, 0, .1, .3, .7, p.core, 1, p.mid, 0, SPARK, BILL); for (let k = 0; k < 2; k++) { const a = Math.random() * 6.283; bolt(x, y, z, x + Math.cos(a) * .6, y + rand(-.2, .5), z + Math.sin(a) * .6, p, 0, .08, .12, 3, .04); } break;
      case 'Terra': smokePuff(x, y - .3, z, 1, .3, p, .45, 0, .35); shards(x, z, 3, .3, p, 0, .6); break;
      case 'Madeira': for (let i = 0; i < 4; i++) { emit(false, x, y, z, tri() * 2, rand(1, 2.5), tri() * 2, .45, .1, .07, i % 2 ? PAL.wood.mid : PAL.wood.dark, 1, PAL.wood.edge, 0, i % 2 ? SHARD : BLADE, BILL); grav(6); spin(9); } break;
      case 'Areia': for (let i = 0; i < 6; i++) { emit(false, x, y, z, tri() * 2.4, rand(.8, 2), tri() * 2.4, .4, .07, .05, p.mid, 1, p.edge, 0, SHARD, BILL); grav(6); } break;
      case 'Sombra': emit(false, x, y, z, 0, .6, 0, .4, .3, .6, p.dark, .6, p.dark, 0, SMOKE, BILL); emit(true, x, y, z, 0, .4, 0, .3, .2, .4, p.mid, .7, p.edge, 0, GLOW, BILL); break;
      case 'Sábio': emit(true, x, y, z, 0, 0, 0, .16, .3, .8, p.core, 1, p.mid, 0, SPARK, BILL); sparks(x, y, z, 3, 2.5, p, .4, 0, 1); break;
      default: emit(true, x, y, z, 0, 0, 0, .12, .25, .7, p.core, 1, p.mid, 0, SPARK, BILL); rot(rand(0, .8)); sparks(x, y, z, 3, 3.5, p, .25);
    }
  }

  /** Aura de setup (Portões, Byakugou, Modo Sábio…): rajada ao ativar e fluxo leve enquanto dura. */
  function aura(t: Technique, pos: THREE.Vector3, burst: boolean, dt = 0) {
    if (hidden) return;
    const n = t.name, p = /Portão|Portões|Port/.test(n) ? PAL.gates : /Byakugou|Sakura|Cura/.test(n) ? pal('#fff0fb', '#ff9ad8', '#b04ab0', '#e8c0e0') : /Sábio|Sennin|Sapo/.test(n) || t.element === 'Sábio' ? PAL.sage : paletteOf(t);
    const g = gy(pos.x, pos.z);
    const count = burst ? N(30) : N(18 * dt) ;
    for (let i = count; i-- > 0;) {
      const a = Math.random() * 6.283, r = rand(.25, .55);
      emit(true, pos.x + Math.cos(a) * r, g + rand(.05, .9), pos.z + Math.sin(a) * r, Math.cos(a) * .3, rand(1.2, 2.4), Math.sin(a) * .3, rand(.5, .8), .26, .08, p.mid, .85, p.edge, 0, FLAME, BILL); spin(rand(-2, 2));
    }
    if (burst) { shockRing(pos.x, pos.z, 1.1, p, .45); flash(pos.x, pos.y, pos.z, 1.6, p, .25); }
  }

  function update(dt: number) {
    const q = currentSettings().quality;
    density = q === 'baixa' ? .3 : q === 'media' ? .6 : 1;
    impactsThisFrame = 0;
    recentTimer += dt; if (recentTimer > 1) { recentTimer = 0; recentImpacts = 0; }
    add.update(dt); norm.update(dt);
  }
  function setHidden(value: boolean) { hidden = value; add.mesh.visible = norm.mesh.visible = !value; if (value) clear(); }
  function clear() { add.count = 0; norm.count = 0; add.update(0); norm.update(0); }
  function dispose() { scene.remove(add.mesh, norm.mesh); add.dispose(); norm.dispose(); }
  const stats = () => ({ additive: add.count, normal: norm.count, capacity: add.cap + norm.cap, emitted, recentImpacts, density });

  return { cast, footprint, windup, trail, impact, aura, explosion, update, setHidden, clear, dispose, stats, emitRaw: emit,
    lastAxis: (x: number, y: number, z: number) => axis(x, y, z), lastStretch: stretch, isHidden: () => hidden };
}
