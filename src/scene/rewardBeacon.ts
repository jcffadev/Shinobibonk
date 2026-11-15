import * as THREE from 'three';

/**
 * Rodada 73 — farol do pergaminho de recompensa grátis (`sealDrop`).
 * Pedido do usuário: "se apertar G, aparecer um pergaminho brilhando com uma luz que mostra no mapa todo,
 * inclusive no tab e no M pra indentificar drop de boss, fazer isso para todos amuletos que dropam dos bosses do jogo".
 *
 * Vale para todo `sealDrop`: o do G (selamento recusado), os do Guardião (boss da zona) e o do desafio.
 * - Facho vertical alto (BEACON_RULES.height) na cor verde do ícone do mapa, sem névoa (fog:false) para
 *   ser visto de longe; mistura normal, sem aditivo (não estoura nem gera bloom).
 * - Brilho em volta do pergaminho e halo no chão que acompanha o relevo; os três pulsam devagar.
 * - Modo H (efeitos reduzidos): o facho continua (é o que mostra onde está), mais fraco e fixo; sem brilho.
 * No minimapa, no Tab e no M o pergaminho aparece sempre, sem precisar ter sido visto (GameCanvas + MapOverlay).
 */
export const BEACON_RULES = { color: '#61ffa8', height: 30, width: 1.6, beam: .42, hiddenBeam: .3, halo: .55, glow: .6 } as const;

export type RewardBeacon = {
  update(dt: number, hidden: boolean): void;
  debug(): { beam: number; halo: number; glow: number; height: number };
  dispose(): void;
};

const cache = new Map<string, THREE.CanvasTexture>();
function texture(key: string, paint: (ctx: CanvasRenderingContext2D, s: number) => void) {
  let t = cache.get(key);
  if (t) return t;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  paint(canvas.getContext('2d')!, 128);
  t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}
const radial = (key: string, stops: [number, number][]) => texture(key, (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  for (const [at, a] of stops) g.addColorStop(at, `rgba(255,255,255,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const beamTexture = () => texture('beacon-beam', (ctx, s) => {
  const v = ctx.createLinearGradient(0, s, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,1)');
  v.addColorStop(.25, 'rgba(255,255,255,.6)');
  v.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, s, s);
  ctx.globalCompositeOperation = 'destination-in';
  const h = ctx.createLinearGradient(0, 0, s, 0);
  h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = h; ctx.fillRect(0, 0, s, s);
});

export function createRewardBeacon(scene: THREE.Scene, x: number, z: number, ground: (x: number, z: number) => number, scrollY: number): RewardBeacon {
  const y = ground(x, z);
  const color = new THREE.Color(BEACON_RULES.color);
  const basic = (map: THREE.Texture) => ({ map, color, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false });
  const beam = new THREE.Sprite(new THREE.SpriteMaterial(basic(beamTexture())));
  beam.center.set(.5, 0);
  beam.scale.set(BEACON_RULES.width, BEACON_RULES.height, 1);
  beam.position.set(x, y + .05, z);
  beam.renderOrder = 1;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial(basic(radial('beacon-glow', [[0, .9], [.4, .45], [1, 0]]))));
  glow.position.set(x, scrollY, z);
  glow.scale.set(2.6, 2.6, 1);
  glow.renderOrder = 0;
  const radius = 1.8;
  const geometry = new THREE.RingGeometry(.0001, radius, 32, 4);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, ground(x + pos.getX(i), z + pos.getZ(i)) - y + .07);
  pos.needsUpdate = true;
  geometry.computeBoundingSphere();
  const halo = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ ...basic(radial('beacon-halo', [[0, .35], [.7, .5], [.86, 1], [1, 0]])),
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  halo.position.set(x, y, z);
  halo.renderOrder = 1;
  scene.add(halo, glow, beam);

  let t = 0, beamShown = 0, haloShown = 0, glowShown = 0;
  const place = (hidden: boolean) => {
    const pulse = .5 + .5 * Math.sin(t * Math.PI * 2 / 1.8);
    beamShown = hidden ? BEACON_RULES.hiddenBeam : BEACON_RULES.beam + .12 * pulse;
    haloShown = hidden ? BEACON_RULES.halo : BEACON_RULES.halo + .15 * pulse;
    glowShown = hidden ? 0 : BEACON_RULES.glow + .2 * pulse;
    beam.material.opacity = beamShown;
    halo.material.opacity = haloShown;
    glow.material.opacity = glowShown;
    glow.visible = !hidden;
    if (!hidden) glow.scale.setScalar(2.4 + .5 * pulse);
  };
  place(false);
  return {
    update(dt, hidden) { t += dt; place(hidden); },
    debug: () => ({ beam: +beamShown.toFixed(3), halo: +haloShown.toFixed(3), glow: +glowShown.toFixed(3), height: beam.scale.y }),
    dispose() {
      for (const o of [halo, glow, beam]) o.removeFromParent();
      geometry.dispose();
      halo.material.dispose(); glow.material.dispose(); beam.material.dispose();
    },
  };
}
