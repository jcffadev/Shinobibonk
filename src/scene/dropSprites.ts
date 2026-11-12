import * as THREE from 'three';

/**
 * Sprites procedurais dos drops no chão (desenhados em canvas, sem assets de terceiros):
 * - chakra: orbe azul de essência da Ultimate, com espiral;
 * - xp: essência roxa em forma de chama (maior para elites/mega elites/guardiões);
 * - ryu: morro de bolinhos de arroz (onigiris com nori) — Rodada 49: substituiu a moeda 両;
 * - ramen: tigela de lamen que cura 35% do HP;
 * - pill: cápsula rosa; item: pergaminho laranja;
 * - kunai/shuriken: PERGAMINHOS no chão (recompensa — Rodada 49 trocou as armas no chão por pergaminhos);
 *   kunaiFree: pergaminho com brilho verde (recompensa grátis do mega elite/guardião);
 *   cursed: shuriken roxa (gatilho de emboscada — mantém a identidade de arma maldita);
 * - enemyKunai/enemyShuriken/enemyShurikenFuma: ARMAS INIMIGAS (projéteis de Kunai/Shuriken/Shuriken Fūma).
 *   Rodada 51 (pedido do usuário): os ataques inimigos voltam a ser kunai/shuriken — visuais separadas dos
 *   pickups do chão, que PERMANECEM pergaminhos. Cada tipo tem material próprio (dropMaterial é por tipo),
 *   então o tint do GameCanvas não vaza para outros sprites.
 * As texturas são criadas uma vez e compartilhadas; ao coletar, só o material do sprite é descartado.
 */
export type DropVisual = 'xp' | 'chakra' | 'ryu' | 'coin' | 'onigiri' | 'ramen' | 'pill' | 'item' | 'kunai' | 'kunaiFree' | 'shuriken' | 'cursed' | 'enemyKunai' | 'enemyShuriken' | 'enemyShurikenFuma';

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

/** Morro de bolinhos de arroz (Rodada 49 — substituiu a moeda 両): pilha de onigiris com nori. */
function drawOnigiri(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(255,240,200,.5)', 60);
  const rice = (x: number, y: number, s: number, rot = 0) => {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    const body = g.createLinearGradient(0, -18, 0, 18); body.addColorStop(0, '#ffffff'); body.addColorStop(1, '#e9e4d3');
    g.fillStyle = body; g.beginPath();
    g.moveTo(0, -18); g.quadraticCurveTo(17, -8, 15, 10); g.quadraticCurveTo(8, 17, 0, 17); g.quadraticCurveTo(-8, 17, -15, 10); g.quadraticCurveTo(-17, -8, 0, -18); g.closePath();
    g.fill(); g.strokeStyle = '#b3ab93'; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = '#1d3a2a'; g.fillRect(-9, 3, 18, 11); g.strokeStyle = '#0d1f15'; g.lineWidth = 1.6; g.strokeRect(-9, 3, 18, 11);
    g.restore();
  };
  rice(44, 68, .95, -.16); rice(84, 70, 1, .14); rice(64, 52, .92, 0); rice(64, 82, 1.22, 0);
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(50, 36, 6, 3.4, -.5, 0, Math.PI * 2); g.fill();
}

function drawCoin(g: CanvasRenderingContext2D) {
  g.fillStyle = '#523112';
  g.beginPath(); g.ellipse(64, 64, 43, 50, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e6a333';
  g.beginPath(); g.ellipse(62, 61, 39, 45, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffe29a'; g.lineWidth = 4;
  g.beginPath(); g.ellipse(62, 61, 32, 37, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#694411'; g.textAlign = 'center';
  g.font = '900 44px "Yu Gothic","Meiryo",sans-serif';
  g.fillText('両', 62, 77);
}

function drawOnigiriDrop(g: CanvasRenderingContext2D) {
  g.fillStyle = '#fff3d8';
  g.strokeStyle = '#635342';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(55, 25); g.quadraticCurveTo(64, 13, 73, 25);
  g.lineTo(101, 76); g.quadraticCurveTo(111, 101, 86, 104);
  g.lineTo(42, 104); g.quadraticCurveTo(17, 101, 27, 76);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#d8c9a9';
  for (const [x,y] of [[58,41],[69,47],[47,62],[77,60],[40,78],[86,81]]) g.fillRect(x,y,5,3);
  g.fillStyle = '#203d32'; g.fillRect(46, 72, 36, 32);
  g.fillStyle = '#46614a'; g.fillRect(49, 76, 4, 23);
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

/** Pergaminho ninja (Rodada 49 — as kunais/shurikens no chão viraram pergaminhos de recompensa). */
function drawScrollShape(g: CanvasRenderingContext2D) {
  const paper = g.createLinearGradient(0, 30, 0, 98); paper.addColorStop(0, '#fff3d8'); paper.addColorStop(1, '#e5c186');
  g.fillStyle = paper; g.fillRect(40, 32, 48, 62);
  g.strokeStyle = '#6b3a12'; g.lineWidth = 2.6; g.strokeRect(40, 32, 48, 62);
  g.strokeStyle = 'rgba(107,58,18,.35)'; g.lineWidth = 1.4;
  for (const y of [44, 52, 82]) { g.beginPath(); g.moveTo(46, y); g.lineTo(82, y); g.stroke(); }
  for (const x of [34, 94]) { const rod = g.createLinearGradient(x - 7, 0, x + 7, 0); rod.addColorStop(0, '#7a2d0e'); rod.addColorStop(.5, '#e0703a'); rod.addColorStop(1, '#5a1f08'); g.fillStyle = rod; g.fillRect(x - 7, 26, 14, 74); g.strokeStyle = '#3a1205'; g.lineWidth = 2; g.strokeRect(x - 7, 26, 14, 74); }
  g.fillStyle = '#c0392b'; g.font = '900 26px "Noto Sans JP","Yu Gothic","Meiryo",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('忍', 64, 64);
}
function drawKunai(g: CanvasRenderingContext2D) { glow(g, 'rgba(255,190,90,.5)', 58); drawScrollShape(g); }
function drawKunaiFree(g: CanvasRenderingContext2D) { glow(g, 'rgba(90,255,150,.6)', 62); drawScrollShape(g); g.fillStyle = '#5bff9a'; g.font = '900 22px sans-serif'; g.textAlign = 'center'; g.fillText('✦', 98, 34); }
function drawShurikenShape(g: CanvasRenderingContext2D) {
  g.save(); g.translate(64, 64);
  const steel = g.createRadialGradient(-6, -6, 2, 0, 0, 44); steel.addColorStop(0, '#ffffff'); steel.addColorStop(.6, '#aab6c4'); steel.addColorStop(1, '#4d5866');
  g.fillStyle = steel; g.beginPath();
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); g.lineTo(Math.cos(a + Math.PI / 4) * 12, Math.sin(a + Math.PI / 4) * 12); }
  g.closePath(); g.fill(); g.strokeStyle = '#1d232b'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#1d232b'; g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
  g.restore();
}

function drawCursed(g: CanvasRenderingContext2D) { glow(g, 'rgba(210,110,255,.6)', 60); drawShurikenShape(g); g.fillStyle = '#e8a5ff'; g.font = '900 20px sans-serif'; g.textAlign = 'center'; g.fillText('✦', 98, 34); }

/** Kunai inimiga (Rodada 51): lâmina de aço em pé, ponta para cima (a direção do voo), sulco central e cabo escuro com furo.
 *  Desenhada em aço neutro: o tint rosa/laranja aplicado em GameCanvas (mesmo que existia antes) dá o tom final. */
function drawEnemyKunai(g: CanvasRenderingContext2D) {
  glow(g, 'rgba(150,180,220,.4)', 54);
  const blade = g.createLinearGradient(48, 0, 80, 0);
  blade.addColorStop(0, '#f4f8fc'); blade.addColorStop(.55, '#c3ceda'); blade.addColorStop(1, '#77828f');
  g.fillStyle = blade;
  g.beginPath();
  g.moveTo(64, 12); g.quadraticCurveTo(80, 40, 78, 84); g.lineTo(50, 84); g.quadraticCurveTo(48, 40, 64, 12); g.closePath();
  g.fill(); g.strokeStyle = '#1d232b'; g.lineWidth = 3; g.stroke();
  // Sulco central da lâmina.
  g.strokeStyle = 'rgba(29,35,43,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 20); g.lineTo(64, 80); g.stroke();
  // Guardas e cabo (furo para corda, como as kunais do anime).
  g.fillStyle = '#1d232b'; g.fillRect(52, 82, 24, 5);
  const grip = g.createLinearGradient(58, 0, 70, 0);
  grip.addColorStop(0, '#2a2f38'); grip.addColorStop(.5, '#4a5260'); grip.addColorStop(1, '#20242c');
  g.fillStyle = grip; g.fillRect(58, 87, 12, 25); g.strokeStyle = '#12151a'; g.lineWidth = 2; g.strokeRect(58, 87, 12, 25);
  g.fillStyle = '#0c0e12'; g.beginPath(); g.arc(64, 107, 3, 0, Math.PI * 2); g.fill();
}

const DRAW: Record<DropVisual, (g: CanvasRenderingContext2D) => void> = { chakra: drawChakra, xp: drawXp, ryu: drawOnigiri, coin: drawCoin, onigiri: drawOnigiriDrop, ramen: drawRamen, pill: drawPill, item: drawItem, kunai: drawKunai, kunaiFree: drawKunaiFree, shuriken: drawKunai, cursed: drawCursed, enemyKunai: drawEnemyKunai, enemyShuriken: drawShurikenShape, enemyShurikenFuma: drawShurikenShape };

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
  if (kind === 'ryu') return 1.05;
  if (kind === 'chakra') return .8;
  return 1.05;
}

const materials = new Map<DropVisual, THREE.SpriteMaterial>();
/** Material COMPARTILHADO por tipo (performance: centenas de drops sem criar/descartar materiais). Nunca descarte. */
function dropMaterial(kind: DropVisual) {
  let m = materials.get(kind);
  if (!m) { m = new THREE.SpriteMaterial({ map: dropTexture(kind), transparent: true, depthWrite: false }); materials.set(kind, m); }
  return m;
}

export function makeDropSprite(kind: DropVisual, value: number) {
  const sprite = new THREE.Sprite(dropMaterial(kind));
  const s = dropScale(kind, value);
  sprite.scale.set(s, s, 1);
  sprite.userData.baseScale = s;
  // O material é COMPARTILHADO por tipo (ver dropMaterial): marca como shared para disposeObject (techniqueEffects.ts)
  // pular o descarte — senão a limpeza dos projéteis inimigos descarta o material do cache e ele é re-linkado a cada tiro.
  sprite.userData.shared = true;
  return sprite;
}
