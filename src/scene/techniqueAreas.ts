import * as THREE from 'three';
import type { Technique } from '../game/heroes';
import { currentSettings } from '../game/settings';

/**
 * Áreas de efeito das técnicas do jogador (rodada 55 — pedido: "deixar mais evidente os hitbox das habilidades/áreas
 * de efeito"). Desenha no chão, com contorno nítido + preenchimento translúcido, EXATAMENTE a região que o hit usa:
 *
 * - círculo  → Área (centro no alvo), Órbita e Corpo a corpo (centro no shinobi), Ultimate em área, invocações;
 * - setor    → Cone (raio = alcance, meia-abertura = acos(0,65) — o mesmo `dot > .65` do hit);
 * - retângulo→ Linha (comprimento = alcance, meia-largura = `half` do hit);
 * - cápsula  → trajeto de Projétil/Em V/Onda (raio = raio do tiro + 0,4, igual ao teste de colisão do tiro).
 *
 * Só visual: nenhum dano, alcance ou alvo passa por aqui. Desempenho: UMA malha com SLOTS fatias fixas (grade
 * GRID×GRID cada) e um único material; nada é alocado por quadro. Um cast escreve só a fatia do slot (≈225 vértices,
 * relevo amostrado uma vez) e o tempo de vida é resolvido no shader por um uniform de relógio — slot expirado é
 * descartado no vertex shader (sem fragmentos). Modo H (efeitos reduzidos) mantém só um contorno fino.
 */
const SLOTS = 64, GRID = 14, ROW = GRID + 1, VERTS = ROW * ROW;
const CIRCLE = 0, SECTOR = 1, RECT = 2, CAPSULE = 3;
/** Meia-abertura do Cone no hit: `delta.normalize().dot(direction) > .65`. */
export const CONE_COS = .65;

const ELEMENT_COLOR: Record<string, string> = {
  Neutro: '#eef4ff', Fogo: '#ff6a2b', Água: '#36b2ff', Vento: '#5ff0c2', Terra: '#e0a456', Raio: '#a9b9ff',
  Madeira: '#7fe04c', Areia: '#f2c46e', Sombra: '#b37bff', Sábio: '#ffd148',
};

const VERT = /* glsl */`
attribute vec2 aLocal; attribute vec4 aShape; attribute vec3 aColor; attribute vec4 aTime;
uniform float uTime;
varying vec2 vLocal; varying vec4 vShape; varying vec3 vColor; varying vec4 vTime;
void main(){
  vLocal=aLocal; vShape=aShape; vColor=aColor; vTime=aTime;
  if(uTime>aTime.z||uTime<aTime.x){gl_Position=vec4(2.,2.,2.,1.);return;}
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;

const FRAG = /* glsl */`
uniform float uTime;
varying vec2 vLocal; varying vec4 vShape; varying vec3 vColor; varying vec4 vTime;
float sdPie(vec2 p,float r,float cosHalf){
  float s=sqrt(max(0.,1.-cosHalf*cosHalf)); vec2 c=vec2(s,cosHalf);
  p=vec2(abs(p.y),p.x);
  float l=length(p)-r; float m=length(p-c*clamp(dot(p,c),0.,r));
  return max(l,m*sign(c.y*p.x-c.x*p.y));
}
void main(){
  float kind=vShape.x, sd;
  if(kind<.5) sd=length(vLocal)-vShape.y;
  else if(kind<1.5) sd=sdPie(vLocal,vShape.y,vShape.z);
  else if(kind<2.5){ vec2 q=abs(vLocal-vec2(vShape.y*.5,0.))-vec2(vShape.y*.5,vShape.z); sd=length(max(q,0.))+min(max(q.x,q.y),0.); }
  else { float h=clamp(vLocal.x/max(vShape.y,.001),0.,1.); sd=length(vLocal-vec2(vShape.y*h,0.))-vShape.z; }
  float aa=max(fwidth(sd),.004);
  float minimal=step(.5,vTime.w);
  float width=max(minimal>.5?.05:.085,(minimal>.5?1.4:2.2)*aa);
  float outline=1.-smoothstep(width*.5,width*.5+aa*1.2,abs(sd));
  float halo=(1.-smoothstep(width*.5,width*.5+aa*2.+.08,sd))*step(0.,sd)*(1.-outline);
  float inside=1.-smoothstep(-aa,aa,sd);
  float rim=exp(min(sd,0.)*1.8);
  // Envelope: entra em 0,06 s, telegrafa até o acerto (vTime.y), clareia no acerto e some suave até vTime.z.
  float t=uTime-vTime.x, hit=vTime.y-vTime.x, life=max(vTime.z-vTime.y,.05);
  float appear=smoothstep(0.,.06,t);
  float pre=step(uTime,vTime.y);
  float flash=(1.-pre)*exp(-(uTime-vTime.y)*9.);
  float fade=1.-smoothstep(0.,1.,(uTime-vTime.y)/life)*(1.-pre);
  float build=pre*clamp(t/max(hit,.001),0.,1.);
  float fillA=(minimal>.5?0.:(.10+.10*build+.30*flash)*(.45+.55*rim))*inside;
  float lineA=outline*(minimal>.5?.62:.78+.22*flash);
  float haloA=minimal>.5?0.:halo*.42;
  vec3 col=mix(vColor,vec3(1.),.35*flash+.18*outline);
  float a=(fillA+lineA)*appear*fade;
  float h=haloA*appear*fade;
  float alpha=a+h*(1.-a);
  if(alpha<.01)discard;
  gl_FragColor=vec4(mix(vec3(.04,.03,.06),col,a/max(alpha,.001)),alpha);
}`;

export type TechniqueAreas = ReturnType<typeof createTechniqueAreas>;

export function createTechniqueAreas(scene: THREE.Scene, ground: (x: number, z: number) => number) {
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(new Float32Array(SLOTS * VERTS * 3), 3);
  const local = new THREE.BufferAttribute(new Float32Array(SLOTS * VERTS * 2), 2);
  const shape = new THREE.BufferAttribute(new Float32Array(SLOTS * VERTS * 4), 4);
  const color = new THREE.BufferAttribute(new Float32Array(SLOTS * VERTS * 3), 3);
  const time = new THREE.BufferAttribute(new Float32Array(SLOTS * VERTS * 4), 4);
  for (const a of [position, local, shape, color, time]) a.setUsage(THREE.DynamicDrawUsage);
  // Todos os slots começam expirados (fim < início).
  for (let i = 0; i < SLOTS * VERTS; i++) { time.array[i * 4] = -10; time.array[i * 4 + 2] = -9; }
  const index: number[] = [];
  for (let s = 0; s < SLOTS; s++) for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) {
    const o = s * VERTS + j * ROW + i; index.push(o, o + ROW, o + 1, o + 1, o + ROW, o + ROW + 1);
  }
  geometry.setIndex(index);
  geometry.setAttribute('position', position); geometry.setAttribute('aLocal', local); geometry.setAttribute('aShape', shape);
  geometry.setAttribute('aColor', color); geometry.setAttribute('aTime', time);
  const uniforms = { uTime: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: true,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; mesh.renderOrder = -1; mesh.name = 'technique-areas';
  scene.add(mesh);
  let clock = 0, next = 0, spawned = 0;
  const ends = new Float32Array(SLOTS).fill(-9);
  const tmp = new THREE.Color();

  const enabled = () => currentSettings().showTechniqueAreas !== false;

  /** Escreve um slot: (ox,oz) origem, (dx,dz) eixo local +x, caixa local [x0,x1]×[y0,y1], forma e tempos. */
  function write(t: Technique | null, kind: number, ox: number, oz: number, dx: number, dz: number,
    x0: number, x1: number, y0: number, y1: number, p1: number, p2: number, hitDelay: number, life: number, minimal: boolean, hex?: string) {
    // Slot livre (expirado) a partir do cursor; se todos estão vivos, sobrescreve o mais antigo (o cursor).
    let slot = next;
    for (let k = 0; k < SLOTS; k++) { const s = (next + k) % SLOTS; if (ends[s] < clock) { slot = s; break; } }
    next = (slot + 1) % SLOTS;
    const start = clock, hit = clock + Math.max(0, hitDelay), end = hit + life;
    ends[slot] = end;
    tmp.set(hex ?? ELEMENT_COLOR[t?.element ?? 'Neutro'] ?? '#eef4ff');
    const len = Math.hypot(dx, dz) || 1, fx = dx / len, fz = dz / len, sx = -fz, sz = fx;
    const P = position.array as Float32Array, L = local.array as Float32Array, S = shape.array as Float32Array,
      C = color.array as Float32Array, T = time.array as Float32Array;
    const base = slot * VERTS;
    for (let j = 0; j < ROW; j++) for (let i = 0; i < ROW; i++) {
      const v = base + j * ROW + i, lx = x0 + (x1 - x0) * i / GRID, ly = y0 + (y1 - y0) * j / GRID;
      const wx = ox + fx * lx + sx * ly, wz = oz + fz * lx + sz * ly;
      P[v * 3] = wx; P[v * 3 + 1] = ground(wx, wz) + .07; P[v * 3 + 2] = wz;
      L[v * 2] = lx; L[v * 2 + 1] = ly;
      S[v * 4] = kind; S[v * 4 + 1] = p1; S[v * 4 + 2] = p2; S[v * 4 + 3] = 0;
      C[v * 3] = tmp.r; C[v * 3 + 1] = tmp.g; C[v * 3 + 2] = tmp.b;
      T[v * 4] = start; T[v * 4 + 1] = hit; T[v * 4 + 2] = end; T[v * 4 + 3] = minimal ? 1 : 0;
    }
    for (const [attr, size] of [[position, 3], [local, 2], [shape, 4], [color, 3], [time, 4]] as const) {
      attr.addUpdateRange(base * size, VERTS * size); attr.needsUpdate = true;
    }
    spawned++;
  }

  /**
   * Marca a área de uma técnica com as MESMAS medidas do hit (ver castTechnique em GameCanvas):
   * Cone → setor (origin, direction, range); Linha → retângulo (range × 2·half); demais → círculo (center, radius).
   * `hitDelay` > 0 telegrafa antes do acerto (Área: centro fixo no alvo).
   */
  function mark(t: Technique, origin: THREE.Vector3, direction: THREE.Vector3, center: THREE.Vector3, radius: number,
    range: number, half: number, hitDelay = 0, minimal = false, hex?: string) {
    if (!enabled()) return;
    const life = t.ultimate ? .7 : .42, pad = .25;
    if (t.shape === 'Cone') {
      const side = range * Math.sqrt(1 - CONE_COS * CONE_COS) + pad;
      write(t, SECTOR, origin.x, origin.z, direction.x, direction.z, -pad, range + pad, -side, side, range, CONE_COS, hitDelay, life, minimal, hex);
    } else if (t.shape === 'Linha') {
      write(t, RECT, origin.x, origin.z, direction.x, direction.z, -pad, range + pad, -half - pad, half + pad, range, half, hitDelay, life, minimal, hex);
    } else {
      const r = radius + pad;
      write(t, CIRCLE, center.x, center.z, 1, 0, -r, r, -r, r, radius, 0, hitDelay, life, minimal, hex);
    }
  }

  /** Trajeto de um projétil: cápsula de raio `width` da origem até `range` na direção do tiro, durante o voo. */
  function lane(t: Technique, origin: THREE.Vector3, direction: THREE.Vector3, range: number, width: number, flight: number, minimal = false) {
    if (!enabled()) return;
    const pad = .2;
    write(t, CAPSULE, origin.x, origin.z, direction.x, direction.z, -width - pad, range + width + pad, -width - pad, width + pad,
      range, width, 0, Math.min(1.2, Math.max(.3, flight + .15)), minimal);
  }

  function update(dt: number) { clock += dt; uniforms.uTime.value = clock; }
  function clear() { ends.fill(-9); const T = time.array as Float32Array; for (let i = 0; i < SLOTS * VERTS; i++) { T[i * 4] = -10; T[i * 4 + 2] = -9; } time.clearUpdateRanges(); time.needsUpdate = true; }
  function dispose() { scene.remove(mesh); geometry.dispose(); material.dispose(); }
  const stats = () => ({ active: Array.from(ends).filter((e) => e >= clock).length, spawned, slots: SLOTS });
  return { mark, lane, update, clear, dispose, enabled, stats };
}
