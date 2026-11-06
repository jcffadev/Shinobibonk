import * as THREE from 'three';

/**
 * Renderização em lote (instancing) dos inimigos comuns/elite e dos avisos de golpe no chão.
 *
 * Antes: cada inimigo era um THREE.Sprite com SpriteMaterial e textura próprios → 1 draw call por inimigo (+1 por contorno de
 * elite, +1 por aviso de golpe com RingGeometry nova). Com 1600 inimigos isso passava de 3000 draw calls por quadro.
 * Agora: o THREE.Sprite do inimigo continua existindo como "dados" (posição, escala, cor de acerto em material.color), mas fica
 * fora da cena; a cada quadro estes lotes copiam os dados para buffers instanciados e desenham tudo em ~3 draw calls.
 * Mega elites, guardiões, Bijuu, totem e clones (sprites de herói) continuam como sprites normais.
 */

const billboardVertex = /* glsl */`
attribute vec3 iOffset;
attribute vec2 iSize;
attribute vec4 iUv;
attribute vec4 iColor;
uniform float uDepthOffset;
varying vec2 vUv;
varying vec4 vColor;
#include <fog_pars_vertex>
void main() {
  vUv = iUv.xy + uv * iUv.zw;
  vColor = iColor;
  vec4 mvPosition = viewMatrix * vec4(iOffset, 1.0);
  mvPosition.xy += position.xy * iSize;
  mvPosition.z -= uDepthOffset;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const billboardFragment = /* glsl */`
uniform sampler2D map;
uniform float alphaTest;
varying vec2 vUv;
varying vec4 vColor;
#include <fog_pars_fragment>
void main() {
  vec4 tex = texture2D(map, vUv);
  #ifdef SOLID
  vec4 c = vec4(vColor.rgb, tex.a * vColor.a);
  #else
  vec4 c = tex * vColor;
  #endif
  if (c.a < alphaTest) discard;
  gl_FragColor = c;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

const groundVertex = /* glsl */`
attribute vec3 iOffset;
attribute float iRadius;
attribute float iOpacity;
varying float vOpacity;
#include <fog_pars_vertex>
void main() {
  vOpacity = iOpacity;
  vec4 mvPosition = viewMatrix * vec4(iOffset + vec3(position.x, 0.0, -position.y) * iRadius, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const groundFragment = /* glsl */`
uniform vec3 diffuse;
varying float vOpacity;
#include <fog_pars_fragment>
void main() {
  gl_FragColor = vec4(diffuse, vOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

type Attr = THREE.InstancedBufferAttribute;
/** Lote instanciado com capacidade que dobra sob demanda. */
class Batch {
  readonly geometry = new THREE.InstancedBufferGeometry();
  readonly mesh: THREE.Mesh;
  private capacity = 0;
  count = 0;
  private attrs: Record<string, Attr> = {};
  constructor(base: THREE.BufferGeometry, material: THREE.Material, private layout: Record<string, number>, scene: THREE.Scene) {
    this.geometry.index = base.index;
    for (const [name, attr] of Object.entries(base.attributes)) this.geometry.setAttribute(name, attr);
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.grow(256);
    scene.add(this.mesh);
  }
  private grow(min: number) {
    let cap = Math.max(this.capacity, 256);
    while (cap < min) cap *= 2;
    if (cap === this.capacity) return;
    for (const [name, size] of Object.entries(this.layout)) {
      const next = new Float32Array(cap * size), old = this.attrs[name];
      if (old) next.set(old.array as Float32Array);
      const attr = new THREE.InstancedBufferAttribute(next, size);
      attr.setUsage(THREE.DynamicDrawUsage);
      this.geometry.setAttribute(name, attr);
      this.attrs[name] = attr;
    }
    this.capacity = cap;
  }
  /** Garante espaço para mais uma instância e devolve os arrays. */
  next() { if (this.count >= this.capacity) this.grow(this.count + 1); return this.count++; }
  arr(name: string) { return this.attrs[name].array as Float32Array; }
  commit() {
    for (const [name, size] of Object.entries(this.layout)) {
      const a = this.attrs[name];
      a.clearUpdateRanges();
      if (this.count) { a.addUpdateRange(0, this.count * size); a.needsUpdate = true; }
    }
    this.geometry.instanceCount = this.count;
    this.mesh.visible = this.count > 0;
  }
  dispose() { this.mesh.removeFromParent(); this.geometry.dispose(); (this.mesh.material as THREE.Material).dispose(); }
}

function billboardMaterial(map: THREE.Texture, solid: boolean) {
  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { alphaTest: { value: solid ? .1 : .5 }, uDepthOffset: { value: solid ? .02 : 0 } }]),
    // Corpo: opaco com alphaTest (oclusão correta pela profundidade, sem ordenar milhares de instâncias).
    // Contorno: passa transparente sem escrever profundidade, para não cobrir corpos de outros inimigos.
    vertexShader: billboardVertex, fragmentShader: billboardFragment, fog: true, transparent: solid, depthWrite: !solid,
  });
  material.uniforms.map = { value: map };
  if (solid) material.defines = { SOLID: '' };
  return material;
}

/** Folha de sprites dos inimigos: 4 colunas × 3 linhas (mesmo recorte de spriteMaterial em GameCanvas). */
const ATLAS_COLS = 4, ATLAS_ROWS = 3;

/** Sprite-dado de um inimigo em lote: índice no atlas e cor do contorno (elite). */
export type BatchedSprite = THREE.Sprite & { userData: { atlas?: number; outline?: THREE.Color } };

export function createEnemyRenderer(scene: THREE.Scene, atlas: THREE.Texture) {
  const quad = new THREE.PlaneGeometry(1, 1);
  const layout = { iOffset: 3, iSize: 2, iUv: 4, iColor: 4 };
  const bodies = new Batch(quad, billboardMaterial(atlas, false), layout, scene);
  const outlines = new Batch(quad, billboardMaterial(atlas, true), layout, scene);
  const ringShape = new THREE.RingGeometry(.1 / 1.35, 1, 32);
  const markerMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { diffuse: { value: new THREE.Color('#ff3b55') } }]),
    vertexShader: groundVertex, fragmentShader: groundFragment, fog: true, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const markers = new Batch(ringShape, markerMaterial, { iOffset: 3, iRadius: 1, iOpacity: 1 }, scene);
  /** Objeto-dado compartilhado dos avisos de golpe (nunca vai para a cena; descartá-lo não afeta o lote). */
  const markerGeometry = new THREE.BufferGeometry(), markerData = new THREE.MeshBasicMaterial();

  function pushBody(batch: Batch, sp: THREE.Sprite, sx: number, sy: number, r: number, g: number, b: number) {
    const i = batch.next(), index = sp.userData.atlas as number;
    const o = batch.arr('iOffset'), s = batch.arr('iSize'), u = batch.arr('iUv'), c = batch.arr('iColor');
    o[i * 3] = sp.position.x; o[i * 3 + 1] = sp.position.y; o[i * 3 + 2] = sp.position.z;
    s[i * 2] = sx; s[i * 2 + 1] = sy;
    u[i * 4] = (index % ATLAS_COLS) / ATLAS_COLS + .001; u[i * 4 + 1] = (ATLAS_ROWS - 1 - Math.floor(index / ATLAS_COLS)) / ATLAS_ROWS + .001;
    u[i * 4 + 2] = 1 / ATLAS_COLS; u[i * 4 + 3] = 1 / ATLAS_ROWS;
    c[i * 4] = r; c[i * 4 + 1] = g; c[i * 4 + 2] = b; c[i * 4 + 3] = 1;
  }

  return {
    /** Marca um sprite como inimigo em lote (fica fora da cena; a posição/escala/cor viram instâncias). */
    adopt(sprite: THREE.Sprite, atlasIndex: number) { sprite.userData.atlas = atlasIndex; },
    isBatched(sprite: THREE.Sprite) { return sprite.userData.atlas !== undefined; },
    /** Contorno sólido do elite (cópia da silhueta 14%×8% maior, desenhada atrás). */
    outline(sprite: THREE.Sprite, color: string) { sprite.userData.outline = new THREE.Color(color); },
    /** Cria o objeto-dado do aviso de golpe (opacidade em userData.opacity, raio em userData.radius). */
    marker(radius: number) { const m = new THREE.Mesh(markerGeometry, markerData); m.userData.radius = radius; m.userData.opacity = .3; return m; },
    /** Copia os inimigos vivos para os buffers instanciados (1 vez por quadro, antes do render). */
    sync(enemies: readonly { sprite: THREE.Sprite; marker?: THREE.Mesh }[]) {
      bodies.count = 0; outlines.count = 0; markers.count = 0;
      for (const e of enemies) {
        const sp = e.sprite;
        if (sp.userData.atlas !== undefined) {
          if (sp.parent) sp.parent.remove(sp);
          const col = sp.material.color;
          pushBody(bodies, sp, sp.scale.x, sp.scale.y, col.r, col.g, col.b);
          const oc = sp.userData.outline as THREE.Color | undefined;
          if (oc) pushBody(outlines, sp, sp.scale.x * 1.14, sp.scale.y * 1.08, oc.r, oc.g, oc.b);
        }
        const m = e.marker;
        if (m && m.userData.radius !== undefined) {
          if (m.parent) m.parent.remove(m);
          const i = markers.next(), o = markers.arr('iOffset');
          o[i * 3] = m.position.x; o[i * 3 + 1] = m.position.y; o[i * 3 + 2] = m.position.z;
          markers.arr('iRadius')[i] = m.userData.radius; markers.arr('iOpacity')[i] = m.userData.opacity;
        }
      }
      bodies.commit(); outlines.commit(); markers.commit();
    },
    dispose() { bodies.dispose(); outlines.dispose(); markers.dispose(); quad.dispose(); ringShape.dispose(); markerGeometry.dispose(); markerData.dispose(); },
  };
}
