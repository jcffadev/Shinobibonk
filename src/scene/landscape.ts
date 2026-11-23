import * as THREE from 'three';
import type { MapId } from '../game/maps';

/**
 * Paisagem de fundo (Rodada 89 — pedido do usuário: "E a paisagem do jogo, não existe, né? Você precisa conseguir fazer essa
 * paisagem"). Um panorama em pixel art pintado no próprio jogo (canvas), num cilindro em volta do mapa, com o fundo de cada
 * vila descrito na skill criar-mapa-shinobibonk §5:
 * - Konoha: montanhas azuladas, colinas de floresta e o Monte Hokage com os rostos esculpidos.
 * - Suna: mesas de topo reto com estratos, paredões ocre e dunas.
 * - Iwa: picos cinza altos e pontudos com cachoeiras finas e uma faixa de névoa.
 * - Kiri: agulhas de pedra finas envoltas em névoa densa.
 */
export const LANDSCAPE = { radius: 240, bottom: -25, height: 100, width: 768, pixels: 200 } as const;
export const LANDSCAPE_FLOOR = { radius: LANDSCAPE.radius+10, height:-9 } as const;

type Paint = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

/** Silhueta periódica (dá a volta no cilindro): `top(u)` em 0..1 da altura da faixa, u em 0..1. */
function range(ctx: Paint, color: string, base: number, amp: number, top: (u: number) => number) {
  const { width, pixels } = LANDSCAPE;
  ctx.fillStyle = color;
  for (let x = 0; x < width; x++) {
    const h = Math.round(base + amp * top(x / width));
    ctx.fillRect(x, pixels - h, 1, h);
  }
}
function band(ctx: Paint, y0: number, y1: number, color: string, alpha: number) {
  const g = ctx.createLinearGradient(0, LANDSCAPE.pixels - y1, 0, LANDSCAPE.pixels - y0);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(.5, `rgba(${color},${alpha})`); g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, LANDSCAPE.pixels - y1, LANDSCAPE.width, y1 - y0);
}
const s = (u: number, k: number, p = 0) => Math.sin(u * TAU * k + p);

/** Altura das camadas de cada vila (exportado para os testes conferirem a forma). */
export const LANDSCAPE_SHAPES: Record<MapId, { far: (u: number) => number; near: (u: number) => number }> = {
  folha: {
    far: u => .55 + .25 * s(u, 3, 1) ** 2 + .12 * s(u, 7, .4),
    near: u => .35 + .12 * s(u, 5, 2) + .05 * Math.abs(s(u, 61)),
  },
  areia: {
    far: u => Math.round((.5 + .22 * s(u, 4, .7) + .1 * s(u, 9)) * 5) / 5,
    near: u => Math.round((.32 + .14 * s(u, 6, 2)) * 6) / 6,
  },
  pedra: {
    far: u => .45 + .55 * Math.abs(s(u, 11, .3)) ** 3 + .2 * Math.abs(s(u, 27)) ** 5,
    near: u => .3 + .45 * Math.abs(s(u, 17, 1.1)) ** 4,
  },
  nevoa: {
    far: u => .35 + .65 * Math.abs(s(u, 19, .5)) ** 24 + .15 * Math.abs(s(u, 7)) ** 8,
    near: u => .22 + .5 * Math.abs(s(u, 29, 2)) ** 10,
  },
};

const PALETTE: Record<MapId, { far: string; near: string; detail: string; mist: string }> = {
  folha: { far: '#8fa9c4', near: '#4f7d4a', detail: '#3c6339', mist: '235,242,248' },
  areia: { far: '#d9b98a', near: '#b9864e', detail: '#9a6c3c', mist: '246,224,186' },
  pedra: { far: '#a3a8b2', near: '#6f727b', detail: '#585b63', mist: '236,240,245' },
  nevoa: { far: '#9fb3b4', near: '#5c7471', detail: '#46605d', mist: '228,236,236' },
};

/** Pinta o panorama de um mapa num canvas (pixel art: 768 × 200, ampliado sem suavizar). */
export function paintLandscape(map: MapId, canvas: HTMLCanvasElement) {
  const { width, pixels } = LANDSCAPE;
  canvas.width = width; canvas.height = pixels;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, width, pixels);
  const shape = LANDSCAPE_SHAPES[map], color = PALETTE[map];
  range(ctx, color.far, 70, 70, shape.far);
  if (map === 'folha') {
    band(ctx, 75, 117, color.mist, .5);
    range(ctx, '#667f72', 54, 51, u=>.38+.16*s(u,6,2)+.09*Math.abs(s(u,17)));
  }
  if (map === 'pedra' || map === 'nevoa') band(ctx, 60, 120, color.mist, map === 'nevoa' ? .85 : .7);
  if (map === 'pedra') { // cachoeiras finas descendo dos picos
    ctx.fillStyle = 'rgba(240,248,255,.85)';
    for (let k = 0; k < 14; k++) { const x = Math.round((k * 0.0731 + .03) * width) % width; const top = 70 + 70 * shape.far(x / width) - 18; ctx.fillRect(x, pixels - top, 1, Math.max(8, top - 70)); }
  }
  range(ctx, color.near, 40, 60, shape.near);
  if (map === 'areia') { // estratos horizontais nos paredões e dunas na base
    ctx.fillStyle = 'rgba(120,80,40,.35)';
    for (let y = 46; y < 96; y += 7) for (let x = 0; x < width; x++) if (40 + 60 * shape.near(x / width) > y) ctx.fillRect(x, pixels - y, 1, 1);
    range(ctx, '#e3c58f', 18, 14, u => .5 + .5 * s(u, 23, 1));
  }
  if (map === 'folha') {
    ctx.fillStyle = color.detail;
    for (let x = 0; x < width; x += 3) {
      const h = 40+60*shape.near(x/width);
      const crown=3+Math.round(2*Math.abs(s(x/width,67,.5)));
      ctx.fillRect(x,pixels-h-crown,3,crown+4);
      ctx.fillRect(x,pixels-h+7,3,Math.round(7+4*s(x/width,41)));
    }
    range(ctx,'#385b3d',20,24,u=>.42+.22*s(u,8)+.10*Math.abs(s(u,43)));
  }
  if (map === 'nevoa') band(ctx, 30, 80, color.mist, .75);
  band(ctx, 0, 40, color.mist, map === 'areia' ? .35 : .5);
  return canvas;
}

/** Cilindro com o panorama em volta do mapa; sem névoa (é o fundo), atrás de tudo. */
export function createLandscape(scene: THREE.Scene, map: MapId) {
  const canvas = paintLandscape(map, document.createElement('canvas'));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  const geometry = new THREE.CylinderGeometry(LANDSCAPE.radius, LANDSCAPE.radius, LANDSCAPE.height, 96, 1, true);
  geometry.translate(0, LANDSCAPE.bottom + LANDSCAPE.height / 2, 0);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = -1;
  // O piso ao fundo fecha a vista entre o chão quadrado e o panorama circular.
  const floorGeometry=new THREE.CircleGeometry(LANDSCAPE_FLOOR.radius,128);
  floorGeometry.rotateX(-Math.PI/2);
  const floorMaterial=new THREE.MeshBasicMaterial({color:PALETTE[map].near,side:THREE.DoubleSide});
  const floor=new THREE.Mesh(floorGeometry,floorMaterial);
  floor.position.y=LANDSCAPE_FLOOR.height;
  floor.name='fundo-abaixo-do-terreno';
  scene.add(mesh,floor);
  return {
    /** Com névoa de clima o fundo some um pouco, para não destoar. */
    setFogged(fogged: boolean) { material.opacity = fogged ? .35 : 1; },
    dispose() {
      scene.remove(mesh,floor);
      geometry.dispose(); material.dispose(); texture.dispose();
      floorGeometry.dispose(); floorMaterial.dispose();
    },
  };
}
