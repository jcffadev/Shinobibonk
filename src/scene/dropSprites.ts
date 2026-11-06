import * as THREE from 'three';

/**
 * Sprites procedurais dos drops no chão (desenhados em canvas, sem assets de terceiros):
 * - chakra: orbe azul de essência da Ultimate, com espiral;
 * - xp: essência roxa em forma de chama (maior para elites/mega elites/guardiões);
 * - ryu: moeda dourada com o kanji 両 (ryō, a moeda do mundo ninja);
 * - ramen: tigela de lamen que cura 35% do HP;
 * - pill: cápsula rosa; item: pergaminho laranja.
 * As texturas são criadas uma vez e compartilhadas; ao coletar, só o material do sprite é descartado.
 */
export type DropVisual = 'xp' | 'chakra' | 'ryu' | 'ramen' | 'pill' | 'item';

const SIZE = 128;
const cache = new Map<DropVisual, THREE.Texture>();

function canvas() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  return { c, g: c.getContext('2d')! };
}

function glow(g: CanvasRenderingContext2D, color: string, radius = 60) {
  const halo = g.createRadialGradient(64, 64, 4, 64, 64, radius);
  halo.addColorStop(0, color);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = halo;
  g.fillRect(0, 0, SIZE, SIZE);
}

function drawChakra(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(80,170,255,.55)');
  const body = g.createRadialGradient(54, 50, 4, 64, 64, 34);
  body.addColorStop(0, '#f2fbff');
  body.addColorStop(.35, '#7fd0ff');
  body.addColorStop(.8, '#1f7ae0');
  body.addColorStop(1, '#0c3f99');
  g.fillStyle = body;
  g.beginPath(); g.arc(64, 64, 32, 0, Math.PI * 2); g.fill();
  // Espiral de chakra.
  g.strokeStyle = 'rgba(235,250,255,.85)'; g.lineWidth = 3.2; g.lineCap = 'round';
  g.beginPath();
  for (let a = 0; a < Math.PI * 4.2; a += .12) { const r = 3 + a * 2; const x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); }
  g.stroke();
  g.strokeStyle = '#0a2c6b'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 32, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(50, 48, 7, 4.5, -.6, 0, Math.PI * 2); g.fill();
}

function drawXp(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(170,90,255,.55)');
  const flame = new Path2D('M64 14 C78 34 96 50 92 76 C89 98 76 112 64 112 C52 112 39 98 36 76 C33 56 46 46 52 30 C55 44 60 50 64 52 C62 40 60 28 64 14 Z');
  const body = g.createLinearGradient(64, 14, 64, 112);
  body.addColorStop(0, '#f4dcff');
  body.addColorStop(.4, '#b46cff');
  body.addColorStop(1, '#5a1fa8');
  g.fillStyle = body; g.fill(flame);
  g.strokeStyle = '#2e0b5e'; g.lineWidth = 3.5; g.stroke(flame);
  // Núcleo claro.
  const core = g.createRadialGradient(64, 82, 2, 64, 82, 18);
  core.addColorStop(0, 'rgba(255,255,255,.95)'); core.addColorStop(1, 'rgba(230,200,255,0)');
  g.fillStyle = core; g.beginPath(); g.arc(64, 82, 18, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(52, 64, 4, 9, .3, 0, Math.PI * 2); g.fill();
}

function drawRyu(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(255,205,70,.45)', 56);
  const rim = g.createLinearGradient(30, 30, 98, 98);
  rim.addColorStop(0, '#fff3b0'); rim.addColorStop(.5, '#f2b81d'); rim.addColorStop(1, '#9a6200');
  g.fillStyle = rim; g.beginPath(); g.arc(64, 64, 36, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a3600'; g.lineWidth = 3.5; g.stroke();
  const face = g.createRadialGradient(56, 54, 4, 64, 64, 28);
  face.addColorStop(0, '#fff6c8'); face.addColorStop(1, '#e6a514');
  g.fillStyle = face; g.beginPath(); g.arc(64, 64, 27, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(122,74,0,.65)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#7a4300'; g.font = '900 34px "Noto Sans JP","Yu Gothic","Meiryo","MS Gothic",sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('両', 64, 66);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(48, 44, 7, 3.5, -.7, 0, Math.PI * 2); g.fill();
}

function drawRamen(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(120,255,160,.38)', 58);
  // Vapor.
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.lineCap = 'round';
  for (const x of [50, 64, 78]) { g.beginPath(); g.moveTo(x, 50); g.bezierCurveTo(x - 7, 40, x + 7, 32, x, 20); g.stroke(); }
  // Caldo e macarrão.
  g.fillStyle = '#f1b452'; g.beginPath(); g.ellipse(64, 64, 38, 11, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#fff0b8'; g.lineWidth = 2.4;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(34 + i * 6, 63); g.bezierCurveTo(50 + i * 4, 56, 60 + i * 4, 72, 90 - i * 3, 62); g.stroke(); }
  // Naruto (kamaboko) e cebolinha.
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(78, 61, 7, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ff5f8a'; g.lineWidth = 2; g.beginPath();
  for (let a = 0; a < Math.PI * 3; a += .2) { const r = .6 + a * .65; const x = 78 + Math.cos(a) * r, y = 61 + Math.sin(a) * r; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); }
  g.stroke();
  g.fillStyle = '#4fb54a'; for (const [x, y] of [[48, 60], [55, 66], [66, 58], [42, 66]]) { g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); }
  // Tigela.
  const bowl = g.createLinearGradient(26, 64, 102, 64);
  bowl.addColorStop(0, '#9c1f1f'); bowl.addColorStop(.5, '#e0443a'); bowl.addColorStop(1, '#7a1414');
  g.fillStyle = bowl; g.beginPath(); g.moveTo(24, 64); g.quadraticCurveTo(28, 104, 64, 106); g.quadraticCurveTo(100, 104, 104, 64); g.closePath(); g.fill();
  g.strokeStyle = '#3d0909'; g.lineWidth = 3.2; g.stroke();
  g.strokeStyle = '#ffd36b'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(34, 80); g.quadraticCurveTo(64, 88, 94, 80); g.stroke();
  g.fillStyle = '#ffd36b'; g.font = '900 15px "Noto Sans JP","Yu Gothic","Meiryo",sans-serif'; g.textAlign = 'center'; g.fillText('一楽', 64, 99);
  // Hashi.
  g.strokeStyle = '#c98b4a'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(80, 20); g.lineTo(100, 62); g.moveTo(88, 18); g.lineTo(106, 60); g.stroke();
}

function drawPill(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(255,110,180,.45)', 52);
  g.save(); g.translate(64, 64); g.rotate(-.6);
  const left = g.createLinearGradient(0, -14, 0, 14); left.addColorStop(0, '#ffd0e6'); left.addColorStop(1, '#e0367f');
  const right = g.createLinearGradient(0, -14, 0, 14); right.addColorStop(0, '#ffffff'); right.addColorStop(1, '#c9c2d8');
  g.fillStyle = left; g.beginPath(); g.moveTo(0, -15); g.lineTo(-22, -15); g.arc(-22, 0, 15, -Math.PI / 2, Math.PI / 2, true); g.lineTo(0, 15); g.closePath(); g.fill();
  g.fillStyle = right; g.beginPath(); g.moveTo(0, -15); g.lineTo(22, -15); g.arc(22, 0, 15, -Math.PI / 2, Math.PI / 2); g.lineTo(0, 15); g.closePath(); g.fill();
  g.strokeStyle = '#5a0f33'; g.lineWidth = 3; g.beginPath(); g.moveTo(-22, -15); g.lineTo(22, -15); g.arc(22, 0, 15, -Math.PI / 2, Math.PI / 2); g.lineTo(-22, 15); g.arc(-22, 0, 15, Math.PI / 2, -Math.PI / 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(-26, -10, 30, 4);
  g.restore();
}

function drawItem(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(255,150,70,.45)', 54);
  const paper = g.createLinearGradient(0, 40, 0, 88); paper.addColorStop(0, '#fff2d6'); paper.addColorStop(1, '#e8c58c');
  g.fillStyle = paper; g.fillRect(36, 42, 56, 44);
  g.strokeStyle = '#6b3a12'; g.lineWidth = 3; g.strokeRect(36, 42, 56, 44);
  for (const x of [32, 96]) { const rod = g.createLinearGradient(x - 6, 0, x + 6, 0); rod.addColorStop(0, '#7a2d0e'); rod.addColorStop(.5, '#e0703a'); rod.addColorStop(1, '#5a1f08'); g.fillStyle = rod; g.fillRect(x - 6, 36, 12, 56); g.strokeStyle = '#3a1205'; g.strokeRect(x - 6, 36, 12, 56); }
  g.fillStyle = '#c0392b'; g.font = '900 26px "Noto Sans JP","Yu Gothic","Meiryo",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('忍', 64, 65);
}

const DRAW: Record<DropVisual, (g: CanvasRenderingContext2D) => void> = { chakra: drawChakra, xp: drawXp, ryu: drawRyu, ramen: drawRamen, pill: drawPill, item: drawItem };

export function dropTexture(kind: DropVisual) {
  let texture = cache.get(kind);
  if (!texture) {
    const { c, g } = canvas();
    DRAW[kind](g);
    texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    cache.set(kind, texture);
  }
  return texture;
}

/** Tamanho do sprite: XP cresce com o valor (comum < elite < mega elite/guardião). */
export function dropScale(kind: DropVisual, value: number) {
  if (kind === 'xp') return value >= 90 ? 1.55 : value >= 20 ? 1.15 : .85;
  if (kind === 'ramen') return 1.15;
  if (kind === 'ryu') return 1;
  if (kind === 'chakra') return 1;
  return 1.05;
}

export function makeDropSprite(kind: DropVisual, value: number) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dropTexture(kind), transparent: true, depthWrite: false }));
  const s = dropScale(kind, value);
  sprite.scale.set(s, s, 1);
  sprite.userData.baseScale = s;
  return sprite;
}
