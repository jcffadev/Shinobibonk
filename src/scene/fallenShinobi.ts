import * as THREE from 'three';

/**
 * Rodada 55 — corpo caído do Mega Elite (contorno vermelho) e do Shinobi para selar (contorno ciano).
 *
 * Sem arte nova: o sprite do próprio personagem (retrato estático da forma) é animado no WebGL.
 * 1. Cambaleia (0–0,40 s): balança com tinta de impacto e leve agachamento.
 * 2. Cai (0,40–0,95 s): gira 90° em torno dos PÉS, em queda acelerada, para o lado oposto ao jogador.
 * 3. Assenta (0,95–1,25 s): pequeno quique + poeira (sem poeira no modo H).
 * 4. Deitado: fica no chão, com respiração leve (espessura do corpo ±2,5%), até ser capturado (E),
 *    recusado (G no ritual) ou sumir na troca de zona.
 * O corpo é um billboard girado em espaço de tela: em qualquer ângulo da câmera (360°) ele aparece deitado
 * na horizontal. A posição de repouso (centro do corpo) é fixa no mundo; ela é a referência dos 10 m do E.
 *
 * Luz: halo no chão na cor do contorno (disco suave + anel), que acompanha o relevo, pulsa devagar e em baixa
 * intensidade (mistura normal, sem aditivo → não estoura nem gera bloom), sem névoa (fog:false) para ser visto
 * de longe e na névoa; um feixe vertical bem fraco ajuda a achar o corpo à distância. No modo H (efeitos
 * reduzidos) fica só o anel, fixo e mais fraco, sem feixe nem pulsação.
 */
export const FALLEN_TIMING = { stagger: .4, fall: .95, settle: 1.25 } as const;

export type FallenBody = {
  /** Centro do corpo deitado no chão (fixo no mundo). */
  readonly position: THREE.Vector3;
  update(dt: number, hidden: boolean): void;
  debug(): { phase: 'stagger' | 'fall' | 'settle' | 'down'; angle: number; halo: number; beam: number; x: number; z: number };
  dispose(): void;
};

type Options = {
  scene: THREE.Scene;
  /** Textura (compartilhada, NÃO é descartada aqui) do sprite estático do personagem. */
  map: THREE.Texture;
  width: number;
  height: number;
  /** Ponto da derrota (pés). Com `instant`, é o centro do corpo já deitado (restauração do save). */
  x: number;
  z: number;
  ground: (x: number, z: number) => number;
  color: string;
  /** Direita da câmera no chão no instante da derrota: o corpo cai ao longo dela. */
  right: THREE.Vector3;
  /** Posição do jogador: o corpo cai para o lado oposto. */
  awayFrom?: THREE.Vector3;
  instant?: boolean;
};

const textureCache = new Map<string, THREE.CanvasTexture>();
function radialTexture(key: string, paint: (ctx: CanvasRenderingContext2D, size: number) => void) {
  let texture = textureCache.get(key);
  if (texture) return texture;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  paint(ctx, 128);
  texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}
/** Disco suave + anel: branco com alfa (a cor vem do material). */
const haloTexture = () => radialTexture('halo', (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,.22)');
  g.addColorStop(.55, 'rgba(255,255,255,.30)');
  g.addColorStop(.78, 'rgba(255,255,255,.85)');
  g.addColorStop(.88, 'rgba(255,255,255,.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const shadowTexture = () => radialTexture('shadow', (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(0,0,0,.55)');
  g.addColorStop(.6, 'rgba(0,0,0,.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const beamTexture = () => radialTexture('beam', (ctx, s) => {
  const v = ctx.createLinearGradient(0, s, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,1)');
  v.addColorStop(.35, 'rgba(255,255,255,.45)');
  v.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, s, s);
  // Bordas laterais suaves.
  ctx.globalCompositeOperation = 'destination-in';
  const h = ctx.createLinearGradient(0, 0, s, 0);
  h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = h; ctx.fillRect(0, 0, s, s);
});

/** Disco que acompanha o relevo (vértices amostrados no terreno). */
function groundDisc(radius: number, cx: number, cz: number, baseY: number, ground: Options['ground'], lift: number) {
  const geometry = new THREE.RingGeometry(.0001, radius, 40, 6);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, ground(cx + pos.getX(i), cz + pos.getZ(i)) - baseY + lift);
  pos.needsUpdate = true;
  geometry.computeBoundingSphere();
  return geometry;
}

function outlineMaterial(map: THREE.Texture, color: string) {
  const material = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, alphaTest: .1 });
  const rgb = new THREE.Color(color);
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
      '#include <map_fragment>\n diffuseColor.rgb = vec3(' + rgb.r.toFixed(3) + ',' + rgb.g.toFixed(3) + ',' + rgb.b.toFixed(3) + ');');
  };
  material.customProgramCacheKey = () => 'fallen-outline-' + color;
  return material;
}

export function createFallenBody(o: Options): FallenBody {
  const { scene, map, width: w, height: h, ground, color } = o;
  const right = new THREE.Vector3(o.right.x, 0, o.right.z);
  if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
  right.normalize();
  // Cai para longe do jogador (ao longo da direita da câmera no instante da derrota).
  const side = o.awayFrom && ((o.x - o.awayFrom.x) * right.x + (o.z - o.awayFrom.z) * right.z) < 0 ? -1 : 1;
  const feet = new THREE.Vector3(o.x, 0, o.z);
  const rest = o.instant ? feet.clone() : feet.clone().addScaledVector(right, side * h / 2);
  if (o.instant) feet.copy(rest).addScaledVector(right, -side * h / 2);
  const restY = ground(rest.x, rest.z);
  rest.y = restY;

  const body = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, alphaTest: .1, depthWrite: false }));
  const outline = new THREE.Sprite(outlineMaterial(map, color));
  outline.renderOrder = 1; body.renderOrder = 2;
  const haloRadius = Math.max(1.3, h * .62);
  // Clareia 25% rumo ao branco: o vermelho puro some no gramado; ainda é a cor do contorno, sem estourar.
  const haloColor = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .25);
  const halo = new THREE.Mesh(groundDisc(haloRadius, rest.x, rest.z, restY, ground, .07),
    new THREE.MeshBasicMaterial({ map: haloTexture(), color: haloColor, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  const shadow = new THREE.Mesh(groundDisc(h * .48, rest.x, rest.z, restY, ground, .05),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), color: '#000000', transparent: true, opacity: 0, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  halo.position.copy(rest); shadow.position.copy(rest);
  halo.renderOrder = 1; shadow.renderOrder = 0;
  const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: beamTexture(), color: haloColor, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false }));
  beam.center.set(.5, 0);
  beam.scale.set(.95, 3.6, 1);
  beam.position.set(rest.x, restY + .05, rest.z);
  beam.renderOrder = 1;
  const dust = new THREE.Mesh(new THREE.RingGeometry(.55, .8, 28), new THREE.MeshBasicMaterial({ color: '#d9c7a4', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  dust.rotation.x = -Math.PI / 2; dust.position.set(rest.x, restY + .12, rest.z); dust.visible = false;
  scene.add(shadow, halo, outline, body, beam, dust);

  let t = o.instant ? FALLEN_TIMING.settle + 1 : 0;
  let angle = 0, haloShown = 0, beamShown = 0;
  let phase: 'stagger' | 'fall' | 'settle' | 'down' = 'stagger';
  const tint = new THREE.Color();

  const place = (hidden: boolean) => {
    const { stagger, fall, settle } = FALLEN_TIMING;
    let lean: number, squash = 1;
    if (t < stagger) {
      phase = 'stagger';
      const k = t / stagger;
      lean = Math.sin(t * 22) * .1 * (1 - k) + .14 * k;
      squash = 1 - .05 * Math.sin(Math.PI * k);
    } else if (t < fall) {
      phase = 'fall';
      const k = (t - stagger) / (fall - stagger);
      lean = .14 + (Math.PI / 2 - .14) * k * k;
    } else if (t < settle) {
      phase = 'settle';
      lean = Math.PI / 2 - .08 * Math.sin(Math.PI * (t - fall) / (settle - fall));
    } else {
      phase = 'down';
      lean = Math.PI / 2;
    }
    angle = lean;
    // Rotação no plano da tela: negativo = horário (cabeça vai para a direita da tela quando side = 1).
    const rot = -side * lean;
    const breath = phase === 'down' ? 1 + .025 * Math.sin(t * 2.3) : 1;
    body.material.rotation = outline.material.rotation = rot;
    body.scale.set(w * breath, h * squash, 1);
    outline.scale.set(w * breath * 1.14, h * squash * 1.08, 1);
    // Pivô nos pés: centro = pés + (−sen θ, cos θ)·h/2 na base (direita da câmera no momento da queda, vertical).
    const s = Math.sin(rot), c = Math.cos(rot);
    const lift = Math.abs(Math.sin(lean)) * w * .36;
    const fx = feet.x - s * (h * squash / 2) * right.x, fz = feet.z - s * (h * squash / 2) * right.z;
    const cx = phase === 'down' ? rest.x : fx, cz = phase === 'down' ? rest.z : fz;
    const floor = ground(cx, cz);
    body.position.set(cx, floor + c * h * squash / 2 + lift, cz);
    outline.position.copy(body.position);
    // Tinta de impacto que volta ao branco durante a queda.
    const hitMix = Math.max(0, 1 - t / FALLEN_TIMING.fall);
    body.material.color.copy(tint.setRGB(1, 1 - .45 * hitMix, 1 - .45 * hitMix));
    // Sombra e luz aparecem conforme o corpo chega ao chão.
    const grounded = Math.min(1, Math.max(0, (t - stagger) / (settle - stagger)));
    shadow.material.opacity = .42 * grounded;
    const pulse = .5 + .5 * Math.sin(t * Math.PI * 2 / 2.6);
    haloShown = hidden ? .45 * grounded : (.52 + .2 * pulse) * grounded;
    beamShown = hidden ? 0 : (.15 + .08 * pulse) * grounded;
    halo.material.opacity = haloShown;
    beam.material.opacity = beamShown;
    beam.visible = !hidden && beamShown > .001;
    // Poeira na batida no chão (não aparece no modo H).
    const dustT = t - fall;
    dust.visible = !hidden && dustT >= 0 && dustT < .5;
    if (dust.visible) { dust.scale.setScalar(1 + dustT * 2.6); dust.material.opacity = .55 * (1 - dustT / .5); }
  };
  place(false);

  return {
    position: rest,
    update(dt: number, hidden: boolean) { t += dt; place(hidden); },
    debug: () => ({ phase, angle: +angle.toFixed(3), halo: +haloShown.toFixed(3), beam: +beamShown.toFixed(3), x: +rest.x.toFixed(2), z: +rest.z.toFixed(2) }),
    dispose() {
      for (const object of [shadow, halo, outline, body, beam, dust]) object.removeFromParent();
      halo.geometry.dispose(); shadow.geometry.dispose(); dust.geometry.dispose();
      halo.material.dispose(); shadow.material.dispose(); beam.material.dispose(); dust.material.dispose();
      body.material.dispose(); outline.material.dispose();
    },
  };
}
