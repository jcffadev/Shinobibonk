import * as THREE from 'three';

/**
 * Rodada 55 — corpo caído do Mega Elite (contorno vermelho) e do Shinobi para selar (contorno ciano).
 *
 * A arte da forma é separada em segmentos de perna e tronco durante o cambaleio, apoio de joelho e tombo.
 * No repouso a malha acompanha o chão, com respiração leve. Seu centro é a referência dos 10 m do E.
 *
 * Luz: halo no chão na cor do contorno (disco suave + anel), que acompanha o relevo, pulsa devagar e em baixa
 * intensidade (mistura normal, sem aditivo → não estoura nem gera bloom), sem névoa (fog:false) para ser visto
 * de longe e na névoa; um feixe vertical bem fraco ajuda a achar o corpo à distância. No modo H (efeitos
 * reduzidos) fica só o anel, fixo e mais fraco, sem feixe nem pulsação.
 *
 * Rodada 73 (pedido: "Colocar uma luz nos Mega Elites mortos e uma área ao redor deles pra indicar que estão mortos"):
 * - Facho de luz mais forte e mais alto (6 m), visível de longe; continua sem aditivo e some no modo H.
 * - Área de captura: círculo no chão com o raio do E (`areaRadius`, 10 m), na cor do contorno, preenchimento
 *   bem fraco e borda marcada, acompanhando o relevo. Pulsa devagar; no modo H fica fixo.
 */
export const FALLEN_TIMING = { stagger: .24, kneel: .63, fall: 1.09, settle: 1.36 } as const;
type FallPhase = 'stagger' | 'kneel' | 'fall' | 'settle' | 'down';

export type FallenBody = {
  /** Centro do corpo deitado no chão (fixo no mundo). */
  readonly position: THREE.Vector3;
  readonly ready: boolean;
  update(dt: number, hidden: boolean): void;
  debug(): { phase: FallPhase; angle: number; knee: number; halo: number; beam: number; area: number; areaRadius: number; x: number; z: number };
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
  /** Raio da área de captura desenhada no chão (o alcance do E). Padrão: FALLEN_AREA.radius. */
  areaRadius?: number;
};

/** Rodada 73: área de captura ao redor do corpo caído (mesmo raio do E em GameCanvas). */
export const FALLEN_AREA = { radius: 10, opacity: .5, hiddenOpacity: .4 } as const;

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
/** Área de captura: interior quase transparente e borda nítida perto do raio. */
const areaTexture = () => radialTexture('area', (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,.05)');
  g.addColorStop(.8, 'rgba(255,255,255,.12)');
  g.addColorStop(.93, 'rgba(255,255,255,.35)');
  g.addColorStop(.97, 'rgba(255,255,255,1)');
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
  const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, alphaTest: .1, side: THREE.DoubleSide });
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

  const bodyGeo=new THREE.PlaneGeometry(1,1,4,20);
  const outlineGeo=bodyGeo.clone();
  const body = new THREE.Mesh(bodyGeo,new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: .1, depthWrite: false, side: THREE.DoubleSide }));
  const outline = new THREE.Mesh(outlineGeo,outlineMaterial(map, color));
  body.name='shinobi-em-queda';
  body.frustumCulled=outline.frustumCulled=false;
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
  beam.scale.set(1.3, 6, 1);
  beam.position.set(rest.x, restY + .05, rest.z);
  beam.renderOrder = 1;
  const dust = new THREE.Mesh(new THREE.RingGeometry(.55, .8, 28), new THREE.MeshBasicMaterial({ color: '#d9c7a4', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  dust.rotation.x = -Math.PI / 2; dust.position.set(rest.x, restY + .12, rest.z); dust.visible = false;
  const areaRadius = o.areaRadius ?? FALLEN_AREA.radius;
  const area = new THREE.Mesh(groundDisc(areaRadius, rest.x, rest.z, restY, ground, .06),
    new THREE.MeshBasicMaterial({ map: areaTexture(), color: haloColor, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  area.position.copy(rest);
  area.renderOrder = 0;
  scene.add(area, shadow, halo, outline, body, beam, dust);

  let t = o.instant ? FALLEN_TIMING.settle + 1 : 0;
  let angle = 0, knee = 0, haloShown = 0, beamShown = 0, areaShown = 0;
  let phase: FallPhase = 'stagger';
  const tint = new THREE.Color();
  const front=new THREE.Vector3(-right.z,0,right.x);
  const poseUv=bodyGeo.attributes.uv,vertices=bodyGeo.attributes.position,edgeVertices=outlineGeo.attributes.position;

  const place = (hidden: boolean) => {
    const { stagger, kneel, fall, settle } = FALLEN_TIMING;
    let lean: number,bend=0;
    if (t < stagger) {
      phase = 'stagger';
      const k = t / stagger;
      lean = Math.sin(t * 22) * .1 * (1 - k) + .14 * k;
    } else if(t<kneel){
      phase='kneel';
      bend=THREE.MathUtils.smoothstep(t,stagger,kneel);
      lean=.14+.24*bend;
    } else if (t < fall) {
      phase = 'fall';
      const k = (t - kneel) / (fall - kneel);
      bend=1-THREE.MathUtils.smoothstep(k,0,.98);
      lean = .38 + (Math.PI / 2 - .38) * k * k;
    } else if (t < settle) {
      phase = 'settle';
      lean = Math.PI / 2 - .08 * Math.sin(Math.PI * (t - fall) / (settle - fall));
    } else {
      phase = 'down';
      lean = Math.PI / 2;
    }
    angle = lean;
    knee=bend;
    const shinAngle=lean-1.17*bend,thighAngle=lean+1.48*bend,torsoAngle=lean+.13*bend;
    const shinSin=Math.sin(shinAngle),thighSin=Math.sin(thighAngle),torsoSin=Math.sin(torsoAngle);
    const shinCos=Math.cos(shinAngle),thighCos=Math.cos(thighAngle),torsoCos=Math.cos(torsoAngle);
    const flat=THREE.MathUtils.smoothstep(lean,.56,Math.PI/2);
    const width=w*(phase==='down'?1+.019*Math.sin(t*2.3):1);
    // Os pés permanecem no ponto original. O joelho recua, o quadril baixa, depois o tronco apoia no terreno.
    for(let i=0;i<poseUv.count;i++){
      const v=poseUv.getY(i);
      const shin=Math.min(v,.23),thigh=Math.min(Math.max(0,v-.23),.21),torso=Math.max(0,v-.44);
      const lateral=h*side*(shin*shinSin+thigh*thighSin+torso*torsoSin);
      const vertical=h*(shin*shinCos+thigh*thighCos+torso*torsoCos);
      const across=(poseUv.getX(i)-.5)*width;
      const x=feet.x+lateral*right.x,z=feet.z+lateral*right.z;
      // Oriente a largura pelo tronco para o rosto não esticar quando a cabeça se inclina.
      const acrossUpright=(1-flat)*across;
      const dx=right.x*torsoCos*acrossUpright+front.x*flat*across;
      const dz=right.z*torsoCos*acrossUpright+front.z*flat*across;
      const support=ground(x+dx,z+dz);
      const y=support+Math.max(0,vertical-torsoSin*side*acrossUpright*THREE.MathUtils.smoothstep(v,.25,.53))+.055;
      vertices.setXYZ(i,x+dx,y,z+dz);
      edgeVertices.setXYZ(i,x+1.08*dx,y+.013,z+1.08*dz);
    }
    vertices.needsUpdate=edgeVertices.needsUpdate=true;
    // Tinta de impacto que volta ao branco durante a queda.
    const hitMix = Math.max(0, 1 - t / FALLEN_TIMING.fall);
    body.material.color.copy(tint.setRGB(1, 1 - .45 * hitMix, 1 - .45 * hitMix));
    // Sombra e luz aparecem conforme o corpo chega ao chão.
    const grounded = THREE.MathUtils.smoothstep(t,kneel,settle);
    shadow.material.opacity = .42 * grounded;
    const pulse = .5 + .5 * Math.sin(t * Math.PI * 2 / 2.6);
    haloShown = hidden ? .45 * grounded : (.52 + .2 * pulse) * grounded;
    beamShown = hidden ? 0 : (.32 + .13 * pulse) * grounded;
    areaShown = hidden ? FALLEN_AREA.hiddenOpacity * grounded : (FALLEN_AREA.opacity + .15 * pulse) * grounded;
    area.material.opacity = areaShown;
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
    get ready(){return phase==='down';},
    update(dt: number, hidden: boolean) { t += dt; place(hidden); },
    debug: () => ({ phase, angle: +angle.toFixed(3), knee:+knee.toFixed(3), halo: +haloShown.toFixed(3), beam: +beamShown.toFixed(3), area: +areaShown.toFixed(3), areaRadius, x: +rest.x.toFixed(2), z: +rest.z.toFixed(2) }),
    dispose() {
      for (const object of [area, shadow, halo, outline, body, beam, dust]) object.removeFromParent();
      area.geometry.dispose(); area.material.dispose();
      halo.geometry.dispose(); shadow.geometry.dispose(); dust.geometry.dispose();
      halo.material.dispose(); shadow.material.dispose(); beam.material.dispose(); dust.material.dispose();
      bodyGeo.dispose(); outlineGeo.dispose();
      body.material.dispose(); outline.material.dispose();
    },
  };
}
