import * as THREE from 'three';
import type { ParticleFx } from './particleFx';
import { GLOW, FLAME, STREAK, BLADE, SPARK } from './particleFx';

/**
 * Susanoo procedural (WebGL): silhueta translúcida em camadas — costelas → torso → braços → cabeça — com borda
 * brilhante (fresnel aditivo), chamas de chakra em partículas e a arma própria de cada usuário.
 * Referência de cor/armas (Narutopedia, página "Susanoo"): Madara azul-escuro com lâminas onduladas (kris);
 * Sasuke roxo com arco e flecha; Itachi vermelho/laranja (anime) com Espada de Totsuka e Espelho de Yata;
 * Kakashi azul-claro com shuriken do Kamui (não há versão com Susanoo no elenco atual — estilo pronto para uso futuro).
 * Rigs são criados uma vez por estilo e reaproveitados; nenhum material/geometria é criado por cast.
 */
export type SusanooStyle = 'madara' | 'sasuke' | 'itachi' | 'kakashi';
const STYLE: Record<SusanooStyle, { body: string; rim: string; flame: [string, string, string] }> = {
  madara: { body: '#2f4dff', rim: '#a8b8ff', flame: ['#e6ecff', '#6f86ff', '#2233c8'] },
  sasuke: { body: '#8b3dff', rim: '#e4c8ff', flame: ['#f6ecff', '#b27bff', '#5a1fb0'] },
  itachi: { body: '#ff4422', rim: '#ffcc88', flame: ['#fff2d8', '#ff8a4a', '#c4260e'] },
  kakashi: { body: '#36c8ff', rim: '#dafaff', flame: ['#f0fdff', '#7fe2ff', '#1d8cc8'] },
};
export function susanooStyleFor(family: string | undefined): SusanooStyle {
  return family === 'sasuke' ? 'sasuke' : family === 'itachi' ? 'itachi' : family === 'kakashi' ? 'kakashi' : 'madara';
}

const VERT = `varying vec3 vN; varying float vY; void main(){ vN=normalize(normalMatrix*normal); vec4 w=modelMatrix*vec4(position,1.); vY=w.y; gl_Position=projectionMatrix*viewMatrix*w; }`;
const FRAG = `uniform vec3 body; uniform vec3 rim; uniform float opacity; uniform float time; uniform float base;
varying vec3 vN; varying float vY;
void main(){ float f=1.-abs(vN.z); float r=pow(f,1.6); float wave=.75+.25*sin(vY*7.-time*9.);
  vec3 c=mix(body,rim,clamp(r*1.2,0.,1.)); float a=opacity*(base+r*1.4)*wave; gl_FragColor=vec4(c,a); }`;

let geos: Record<string, THREE.BufferGeometry> | null = null;
function geometries() {
  if (geos) return geos;
  const bone = new THREE.CylinderGeometry(.11, .08, 1, 7); bone.translate(0, -.5, 0);
  const wavy = new THREE.Shape(); wavy.moveTo(-.07, 0);
  for (let i = 0; i <= 8; i++) wavy.lineTo(-.09 + Math.sin(i * 1.3) * .07, i * .3);
  wavy.lineTo(0, 2.75);
  for (let i = 8; i >= 0; i--) wavy.lineTo(.09 + Math.sin(i * 1.3) * .07, i * .3);
  const kris = new THREE.ShapeGeometry(wavy);
  const blade = new THREE.ConeGeometry(.12, 3, 4); blade.translate(0, 1.5, 0);
  const arrow = new THREE.CylinderGeometry(.04, .04, 1.8, 5); arrow.translate(0, .9, 0);
  const shuriken = new THREE.TorusGeometry(.5, .12, 3, 3);
  geos = {
    rib: new THREE.TorusGeometry(.55, .05, 4, 16, Math.PI * 1.15), bone, joint: new THREE.IcosahedronGeometry(.16, 0),
    spine: new THREE.CylinderGeometry(.09, .12, 1.8, 7), chest: new THREE.SphereGeometry(.7, 12, 10), skull: new THREE.SphereGeometry(.42, 12, 10),
    horn: new THREE.ConeGeometry(.08, .55, 5), eye: new THREE.SphereGeometry(.07, 6, 5), hood: new THREE.ConeGeometry(.75, .9, 10, 1, true),
    kris, blade, arrow, tip: new THREE.ConeGeometry(.1, .3, 5), bow: new THREE.TorusGeometry(1.05, .05, 4, 22, Math.PI * 1.15),
    mirror: new THREE.CircleGeometry(.55, 20), mirrorRim: new THREE.TorusGeometry(.55, .06, 4, 20), gourd: new THREE.SphereGeometry(.22, 8, 6), shuriken,
  };
  return geos;
}

type Rig = {
  root: THREE.Group; mats: THREE.ShaderMaterial[]; style: SusanooStyle; age: number; life: number; active: boolean; scale: number;
  ribs: THREE.Object3D[]; spine: THREE.Object3D; chest: THREE.Object3D; head: THREE.Object3D; armL: THREE.Group; armR: THREE.Group;
  foreL: THREE.Group; foreR: THREE.Group; weaponL: THREE.Object3D; weaponR: THREE.Object3D;
  owner: THREE.Vector3; dir: THREE.Vector3; target: THREE.Vector3; radius: number; ultimate: boolean; fired: boolean; flameAcc: number;
  samples: THREE.Object3D[];
};

function buildRig(style: SusanooStyle): Rig {
  const G = geometries(), S = STYLE[style];
  const mat = (base: number) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { body: { value: new THREE.Color(S.body) }, rim: { value: new THREE.Color(S.rim) }, opacity: { value: 0 }, time: { value: 0 }, base: { value: base } } });
  const shell = mat(.16), solid = mat(.5);
  const root = new THREE.Group(); root.visible = false;
  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.renderOrder = 6; parent.add(o); return o; };
  const spine = add(root, G.spine, shell, 0, 1.75, -.15);
  const ribs: THREE.Object3D[] = [];
  for (let i = 0; i < 5; i++) {
    const r = add(root, G.rib, shell, 0, 2.45 - i * .26, -.15);
    r.rotation.set(Math.PI / 2, 0, -.075 * Math.PI); const s = 1.25 - Math.abs(i - 1.2) * .12; r.scale.set(s, s, s * 1.4); ribs.push(r);
  }
  const chest = add(root, G.chest, shell, 0, 2.05, -.1); chest.scale.set(1.25, 1.05, .75);
  const hood = add(chest, G.hood, shell, 0, .55, 0); hood.scale.set(1.1, .7, 1);
  const head = new THREE.Group(); head.position.set(0, 3.15, 0); root.add(head);
  const skull = add(head, G.skull, shell); skull.scale.set(1, 1.15, 1);
  for (const side of [-1, 1]) add(head, G.eye, solid, side * .16, .06, .36);
  if (style === 'sasuke') for (const side of [-1, 1]) { const h = add(head, G.horn, shell, side * .26, .42, -.05); h.rotation.z = -side * .55; }
  else if (style === 'madara') { const h = add(head, G.horn, shell, 0, .5, -.05); h.rotation.x = -.3; for (const side of [-1, 1]) { const t = add(head, G.horn, shell, side * .2, -.32, .25); t.scale.set(.5, .6, .5); t.rotation.x = Math.PI * .85; } }
  else { const nose = add(head, G.horn, shell, 0, .02, .45); nose.rotation.x = Math.PI / 2; nose.scale.set(.7, .8, .7); for (const side of [-1, 1]) { const lock = add(head, G.bone, shell, side * .4, .2, 0); lock.scale.set(.5, .7, .5); } }
  const arm = (side: number) => {
    const shoulder = new THREE.Group(); shoulder.position.set(side * 1.05, 2.55, -.1); root.add(shoulder);
    add(shoulder, G.joint, shell);
    const upper = add(shoulder, G.bone, shell); upper.scale.set(1.1, 1.1, 1.1);
    const fore = new THREE.Group(); fore.position.set(0, -1.1, 0); shoulder.add(fore);
    add(fore, G.joint, shell); add(fore, G.bone, shell).scale.set(.95, 1, .95);
    add(fore, G.joint, solid, 0, -1.02, 0).scale.setScalar(1.15);
    return { shoulder, fore };
  };
  const L = arm(-1), R = arm(1);
  // Armas por usuário.
  const weaponR = new THREE.Group(), weaponL = new THREE.Group(); R.fore.add(weaponR); L.fore.add(weaponL); weaponR.position.y = weaponL.position.y = -1.05;
  if (style === 'madara') { for (const w of [weaponR, weaponL]) { const k = add(w, G.kris, solid); k.rotation.x = Math.PI / 2; } }
  else if (style === 'itachi') {
    const sword = add(weaponR, G.blade, solid); sword.rotation.x = Math.PI / 2; sword.scale.set(.6, 1.1, .6);
    add(weaponR, G.gourd, shell, .25, .1, -.2); add(weaponR, G.gourd, shell, .25, .38, -.2).scale.setScalar(.7);
    const mirror = add(weaponL, G.mirror, shell, 0, 0, .35); add(mirror, G.mirrorRim, solid);
  } else if (style === 'sasuke') {
    const bow = add(weaponL, G.bow, solid, 0, 0, .2); bow.rotation.set(0, Math.PI / 2, -.575 * Math.PI);
    const arrow = add(weaponR, G.arrow, solid); arrow.rotation.x = Math.PI / 2; add(arrow, G.tip, solid, 0, 1.9, 0);
  } else { const s = add(weaponR, G.shuriken, solid); s.rotation.x = Math.PI / 2; s.scale.setScalar(1.4); const k = add(weaponL, G.blade, solid); k.rotation.x = Math.PI / 2; }
  const samples: THREE.Object3D[] = [L.shoulder, R.shoulder, L.fore, R.fore, head, spine, ...ribs, chest];
  return { root, mats: [shell, solid], style, age: 0, life: 1, active: false, scale: 1, ribs, spine, chest, head, armL: L.shoulder, armR: R.shoulder, foreL: L.fore, foreR: R.fore, weaponL, weaponR,
    owner: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), target: new THREE.Vector3(), radius: 1, ultimate: false, fired: false, flameAcc: 0, samples };
}

const ease = (v: number) => { const x = Math.min(1, Math.max(0, v)); return x * x * (3 - 2 * x); };

export function createSusanooFx(scene: THREE.Scene, fx: ParticleFx, ground: (x: number, z: number) => number) {
  const rigs = new Map<SusanooStyle, Rig>();
  let hidden = false, time = 0;
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const col = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255] as const; };
  const flameCols = new Map<SusanooStyle, (readonly [number, number, number])[]>();
  const colsOf = (s: SusanooStyle) => { let c = flameCols.get(s); if (!c) { c = STYLE[s].flame.map(col); flameCols.set(s, c); } return c; };

  /** Dispara o Susanoo do usuário: forma em camadas, ataca com a arma do estilo e desaparece. */
  function trigger(style: SusanooStyle, owner: THREE.Vector3, dir: THREE.Vector3, target: THREE.Vector3, radius: number, ultimate = false) {
    if (hidden) return;
    let rig = rigs.get(style);
    if (!rig) { rig = buildRig(style); rigs.set(style, rig); scene.add(rig.root); }
    rig.owner = owner; rig.dir.set(dir.x, 0, dir.z).normalize(); rig.target.copy(target); rig.radius = radius; rig.ultimate = ultimate;
    rig.age = 0; rig.life = ultimate ? 1.35 : .95; rig.active = true; rig.fired = false; rig.root.visible = true;
    rig.scale = Math.min(1.9, .85 + radius * .32) * (ultimate ? 1.25 : 1);
  }

  function attack(rig: Rig) {
    const [core, mid, edge] = colsOf(rig.style), o = rig.root.position, g = ground(o.x, o.z), R = rig.radius, d = rig.dir;
    const ox = rig.owner.x, oz = rig.owner.z;
    // Anel no chão do tamanho real da área atingida (Órbita/Ultimate ao redor do usuário).
    fx.emitRaw(true, ox, ground(ox, oz) + .08, oz, 0, 0, 0, .45, R * .6, R * 2.5, core, .9, edge, 0, 5, 2, 0);
    if (rig.style === 'madara' || rig.style === 'kakashi') {
      // Dois cortes horizontais girando ao redor (lâminas kris), deixando chamas azuis no chão.
      for (let k = 0; k < 2; k++) for (let j = 0; j < 6; j++) {
        const a = Math.atan2(d.z, d.x) + (k ? Math.PI : 0) + j * .5;
        fx.emitRaw(true, ox + Math.cos(a) * R * .75, g + .5 + k * .3, oz + Math.sin(a) * R * .75, 0, 0, 0, .3, R * .7, R * 1.05, core, .95, mid, 0, BLADE, 2, j * .025);
      }
      for (let i = 0; i < 22; i++) { const a = Math.random() * 6.283, r = R * (.6 + Math.random() * .45); fx.emitRaw(true, ox + Math.cos(a) * r, ground(ox + Math.cos(a) * r, oz + Math.sin(a) * r) + .15, oz + Math.sin(a) * r, 0, 1.2 + Math.random(), 0, .6, .3, .1, mid, .9, edge, 0, FLAME, 0, .05 + Math.random() * .15); }
    } else if (rig.style === 'itachi') {
      // Estocada da Espada de Totsuka até o alvo + redemoinho de selamento.
      const tx = rig.target.x, tz = rig.target.z, mx = (ox + tx) / 2, mz = (oz + tz) / 2, y = g + 1.4;
      fx.emitRaw(true, mx, y, mz, 0, 0, 0, .3, .22, .12, core, 1, mid, 0, STREAK, 1, 0); setAxis(fx, tx - ox, -.8, tz - oz);
      fx.emitRaw(true, mx, y, mz, 0, 0, 0, .38, .7, .4, mid, .45, edge, 0, STREAK, 1, 0); setAxis(fx, tx - ox, -.8, tz - oz);
      for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, r = R * Math.random(); fx.emitRaw(true, ox + Math.cos(a) * r, g + .3, oz + Math.sin(a) * r, -Math.sin(a) * 5, 1 + Math.random() * 1.5, Math.cos(a) * 5, .5, .28, .08, core, .9, edge, 0, FLAME, 0, Math.random() * .15); }
      fx.emitRaw(true, tx, ground(tx, tz) + .6, tz, 0, 0, 0, .25, .5, 1.6, core, 1, mid, 0, SPARK, 0, .05);
    } else {
      // Sasuke: flecha de chakra disparada do arco até o alvo, com explosão elétrica roxa.
      const hx = o.x + d.x * .6, hz = o.z + d.z * .6, hy = g + 2.1 * rig.scale, tx = rig.target.x, tz = rig.target.z, ty = ground(tx, tz) + .5;
      const steps = 8, flight = .12;
      for (let k = 0; k < steps; k++) { const f = k / steps; fx.emitRaw(true, hx + (tx - hx) * f, hy + (ty - hy) * f, hz + (tz - hz) * f, 0, 0, 0, .16, .18, .05, core, 1, mid, 0, STREAK, 1, f * flight); setAxis(fx, (tx - hx) / steps * 1.6, (ty - hy) / steps * 1.6, (tz - hz) / steps * 1.6); }
      fx.emitRaw(true, tx, ty, tz, 0, 0, 0, .25, R * .8, R * 2, core, 1, mid, 0, GLOW, 0, flight);
      for (let i = 0; i < 18; i++) { const a = Math.random() * 6.283, s = 3 + Math.random() * 4; fx.emitRaw(true, tx, ty, tz, Math.cos(a) * s, Math.random() * 3, Math.sin(a) * s, .35, .07, .03, core, 1, mid, 0, STREAK, 1, flight); setStretch(fx, .05); }
    }
  }

  function update(dt: number, camera: THREE.Camera) {
    time += dt;
    for (const rig of rigs.values()) {
      if (!rig.active) continue;
      rig.age += dt;
      const a = rig.age, T = rig.life;
      if (a >= T || hidden) { rig.active = false; rig.root.visible = false; continue; }
      const o = rig.owner, s = rig.scale;
      // Atrás e acima do usuário, voltado para a direção do golpe.
      rig.root.position.set(o.x - rig.dir.x * .55, ground(o.x, o.z) - .2, o.z - rig.dir.z * .55);
      rig.root.rotation.y = Math.atan2(rig.dir.x, rig.dir.z);
      rig.root.scale.setScalar(s * (1 + Math.sin(time * 6) * .015));
      // Camadas: costelas → coluna/torso → braços → cabeça → arma.
      rig.ribs.forEach((r, i) => { const k = ease((a - i * .02) / .1); r.visible = k > .01; r.scale.setScalar(Math.max(.01, k) * (1.25 - Math.abs(i - 1.2) * .12)); r.scale.z *= 1.4; });
      const sp = ease(a / .1); rig.spine.scale.set(1, Math.max(.01, sp), 1);
      const ch = ease((a - .08) / .1); rig.chest.visible = ch > .01; rig.chest.scale.set(1.25 * ch + .001, 1.05 * ch + .001, .75 * ch + .001);
      const ar = ease((a - .12) / .1); rig.armL.scale.setScalar(ar + .001); rig.armR.scale.setScalar(ar + .001);
      const hd = ease((a - .16) / .1); rig.head.scale.setScalar(hd + .001);
      const wp = ease((a - .18) / .08); rig.weaponL.scale.setScalar(wp + .001); rig.weaponR.scale.setScalar(wp + .001);
      // Golpe (≈ quando o acerto é resolvido: 0,24 s após o cast).
      const sw = ease((a - .2) / .2), back = ease((a - .12) / .1) * (1 - sw);
      if (rig.style === 'madara' || rig.style === 'kakashi') {
        rig.armR.rotation.set(-1.2 * back - .3 * sw, 0, .9 - 1.9 * sw); rig.armL.rotation.set(-1.2 * back - .3 * sw, 0, -.9 + 1.9 * sw);
        rig.foreR.rotation.x = -1 * (1 - sw) - .3; rig.foreL.rotation.x = -1 * (1 - sw) - .3;
      } else if (rig.style === 'itachi') {
        rig.armR.rotation.set(-.6 - 1.1 * sw + .5 * back, 0, .25); rig.foreR.rotation.x = -1.2 * (1 - sw);
        rig.armL.rotation.set(-1.1, 0, -.35); rig.foreL.rotation.x = -.9;
      } else {
        rig.armL.rotation.set(-1.5, 0, -.15); rig.foreL.rotation.x = -.1;
        const draw = 1 - sw; rig.armR.rotation.set(-1.5 + .2 * draw, 0, .5 * draw); rig.foreR.rotation.x = -1.5 * draw;
        rig.weaponR.visible = a < .24;
      }
      if (!rig.fired && a >= .22) { rig.fired = true; attack(rig); }
      const fade = a < .05 ? a / .05 : a > T - .25 ? Math.max(0, (T - a) / .25) : 1;
      for (const m of rig.mats) { m.uniforms.opacity.value = fade; m.uniforms.time.value = time; }
      // Chamas de chakra nas bordas da silhueta.
      rig.root.updateMatrixWorld(true);
      const [core, mid, edge] = colsOf(rig.style);
      rig.flameAcc += dt * 70 * fade; let n = Math.floor(rig.flameAcc); rig.flameAcc -= n;
      while (n-- > 0) {
        const part = rig.samples[(Math.random() * rig.samples.length) | 0];
        if (!part.visible) continue;
        part.getWorldPosition(tmp); tmp2.set((Math.random() - .5) * .8 * s, (Math.random() - .3) * .6 * s, (Math.random() - .5) * .5 * s); tmp.add(tmp2);
        fx.emitRaw(true, tmp.x, tmp.y, tmp.z, (Math.random() - .5) * .4, 1.2 + Math.random() * 1.4, (Math.random() - .5) * .4, .45, .45 * s, .12, Math.random() < .3 ? core : mid, .75, edge, 0, FLAME, 0, 0);
      }
      if (a < .05) fx.emitRaw(true, o.x, o.y + .4, o.z, 0, 0, 0, .25, 1.4 * s, 2.4 * s, core, .7, mid, 0, GLOW, 0, 0);
      void camera;
    }
  }
  function setHidden(v: boolean) { hidden = v; if (v) for (const rig of rigs.values()) { rig.active = false; rig.root.visible = false; } }
  function clear() { for (const rig of rigs.values()) { rig.active = false; rig.root.visible = false; } }
  function dispose() { for (const rig of rigs.values()) { scene.remove(rig.root); rig.mats.forEach(m => m.dispose()); } rigs.clear(); }
  const active = () => [...rigs.values()].filter(r => r.active).map(r => ({ style: r.style, age: +r.age.toFixed(2), scale: +r.scale.toFixed(2) }));
  return { trigger, update, setHidden, clear, dispose, active };
}

// Ajustes na última partícula emitida (o módulo de partículas expõe só emitRaw para o Susanoo).
function setAxis(fx: ParticleFx, x: number, y: number, z: number) { fx.lastAxis(x, y, z); }
function setStretch(fx: ParticleFx, v: number) { fx.lastStretch(v); }
