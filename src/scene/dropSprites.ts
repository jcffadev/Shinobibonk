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
/**
 * Rodada 92 (pedido do usuário: "Aprenda vários tipos de pergaminhos para colocar os pergaminhos no chão, serem diferentes,
 * só o sprite mesmo... para ficar mais bonito o jogo"): estilos inspirados nos pergaminhos da obra (imagens enviadas pelo
 * usuário). Só visual: todos continuam sendo o mesmo pergaminho de recompensa. O estilo 0 é o pergaminho original.
 */
export type ScrollStyle = { name: string; open: boolean; paper: string; border: string; rod: string; rodEnd: string; kanji: string; ink: string; band?: string };
export const SCROLL_STYLES: readonly ScrollStyle[] = [
  { name: 'Pergaminho ninja', open: true, paper: '#fff3d8', border: '#6b3a12', rod: '#e0703a', rodEnd: '#5a1f08', kanji: '忍', ink: '#c0392b' },
  { name: 'Pergaminho de selamento', open: true, paper: '#f7f4ec', border: '#2b2b34', rod: '#c8423a', rodEnd: '#2a2a33', kanji: '封', ink: '#1d1d24' },
  { name: 'Pergaminho de invocação', open: true, paper: '#efe2c4', border: '#5c6e8a', rod: '#8b2c2c', rodEnd: '#1f1f26', kanji: '口寄', ink: '#2c2c36' },
  { name: 'Pergaminho dos Sapos', open: true, paper: '#f1ead2', border: '#3f8a46', rod: '#d8c28c', rodEnd: '#b03a2e', kanji: '蝦', ink: '#2f6b35' },
  { name: 'Pergaminho do Céu', open: false, paper: '#2f5fae', border: '#16294d', rod: '#e9eef6', rodEnd: '#16294d', kanji: '天', ink: '#16294d', band: '#f2f4f8' },
  { name: 'Pergaminho da Terra', open: false, paper: '#f2f0ea', border: '#3b3b44', rod: '#2f5fae', rodEnd: '#16294d', kanji: '地', ink: '#2b2b33', band: '#2f5fae' },
  { name: 'Pergaminho de técnica secreta', open: true, paper: '#cfe3b8', border: '#4d7a3c', rod: '#c9b27a', rodEnd: '#6e5a2e', kanji: '秘術', ink: '#2c4a22' },
  { name: 'Pergaminho Proibido', open: false, paper: '#e9dcc0', border: '#4a3a28', rod: '#7a2d0e', rodEnd: '#2a160a', kanji: '禁', ink: '#7a1f12', band: '#3a2a1c' },
];
/** Estilo de um pergaminho no chão (sorteado ao nascer; o mesmo índice sempre dá o mesmo desenho). */
export const scrollStyle = (variant: number) => SCROLL_STYLES[((Math.floor(variant) % SCROLL_STYLES.length) + SCROLL_STYLES.length) % SCROLL_STYLES.length];

function drawStyledScroll(g: CanvasRenderingContext2D, style: ScrollStyle) {
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const jp = '"Noto Sans JP","Yu Gothic","Meiryo",sans-serif';
  if (style.open) { // aberto: papel entre dois rolos
    g.fillStyle = style.paper; g.fillRect(40, 32, 48, 62);
    g.strokeStyle = style.border; g.lineWidth = 4; g.strokeRect(42, 34, 44, 58);
    g.strokeStyle = style.border + '66'; g.lineWidth = 1.4;
    for (const y of [44, 84]) { g.beginPath(); g.moveTo(48, y); g.lineTo(80, y); g.stroke(); }
    for (const x of [34, 94]) {
      const rod = g.createLinearGradient(x - 7, 0, x + 7, 0); rod.addColorStop(0, style.rodEnd); rod.addColorStop(.5, style.rod); rod.addColorStop(1, style.rodEnd);
      g.fillStyle = rod; g.fillRect(x - 7, 26, 14, 74); g.fillStyle = style.rodEnd; g.fillRect(x - 8, 24, 16, 6); g.fillRect(x - 8, 96, 16, 6);
      g.strokeStyle = '#1a0d05'; g.lineWidth = 2; g.strokeRect(x - 7, 26, 14, 74);
    }
    g.fillStyle = style.ink; g.font = `900 ${style.kanji.length > 1 ? 18 : 26}px ${jp}`;
    if (style.kanji.length > 1) { g.fillText(style.kanji[0], 64, 54); g.fillText(style.kanji[1], 64, 74); } else g.fillText(style.kanji, 64, 64);
    return;
  }
  // fechado: rolo deitado com faixa e kanji (como os pergaminhos do Céu e da Terra do exame Chunin)
  const body = g.createLinearGradient(0, 40, 0, 92); body.addColorStop(0, style.paper); body.addColorStop(.5, '#ffffff33'); body.addColorStop(1, style.border);
  g.fillStyle = style.paper; g.fillRect(24, 44, 80, 42); g.fillStyle = body; g.fillRect(24, 44, 80, 42);
  g.strokeStyle = '#120a05'; g.lineWidth = 2.6; g.strokeRect(24, 44, 80, 42);
  for (const x of [18, 104]) { g.fillStyle = style.rodEnd; g.fillRect(x, 48, 6, 34); g.fillStyle = style.rod; g.fillRect(x + 1, 52, 4, 26); }
  if (style.band) { g.fillStyle = style.band; g.fillRect(50, 44, 28, 42); g.strokeStyle = '#120a05'; g.lineWidth = 1.6; g.strokeRect(50, 44, 28, 42); }
  g.fillStyle = style.ink; g.font = `900 24px ${jp}`; g.fillText(style.kanji, 64, 66);
}
function drawKunai(g: CanvasRenderingContext2D, variant = 0) { glow(g, 'rgba(255,190,90,.5)', 58); if (variant) drawStyledScroll(g, scrollStyle(variant)); else drawScrollShape(g); }
function drawKunaiFree(g: CanvasRenderingContext2D, variant = 0) { glow(g, 'rgba(90,255,150,.6)', 62); if (variant) drawStyledScroll(g, scrollStyle(variant)); else drawScrollShape(g); g.fillStyle = '#5bff9a'; g.font = '900 22px sans-serif'; g.textAlign = 'center'; g.fillText('✦', 98, 34); }
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

const DRAW: Record<DropVisual, (g: CanvasRenderingContext2D, variant?: number) => void> = { chakra: drawChakra, xp: drawXp, ryu: drawOnigiri, coin: drawCoin, onigiri: drawOnigiriDrop, ramen: drawRamen, pill: drawPill, item: drawItem, kunai: drawKunai, kunaiFree: drawKunaiFree, shuriken: drawKunai, cursed: drawCursed, enemyKunai: drawEnemyKunai, enemyShuriken: drawShurikenShape, enemyShurikenFuma: drawShurikenShape };

const isScroll = (kind: DropVisual) => kind === 'kunai' || kind === 'kunaiFree' || kind === 'shuriken';
const cacheKey = (kind: DropVisual, variant: number) => (isScroll(kind) && variant ? `${kind}:${variant}` : kind) as DropVisual;

export function dropTexture(kind: DropVisual, variant = 0) {
  const key = cacheKey(kind, variant);
  let texture = cache.get(key);
  if (!texture) {
    const { c, g } = canvas();
    DRAW[kind](g, variant);
    texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    cache.set(key, texture);
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
function dropMaterial(kind: DropVisual, variant = 0) {
  const key = cacheKey(kind, variant);
  let m = materials.get(key);
  if (!m) { m = new THREE.SpriteMaterial({ map: dropTexture(kind, variant), transparent: true, depthWrite: false }); materials.set(key, m); }
  return m;
}

/** `variant`: estilo do pergaminho (só kunai/kunaiFree); por padrão sorteia um dos SCROLL_STYLES. */
export function makeDropSprite(kind: DropVisual, value: number, variant = isScroll(kind) ? Math.floor(Math.random() * SCROLL_STYLES.length) : 0) {
  const sprite = new THREE.Sprite(dropMaterial(kind, variant));
  const s = dropScale(kind, value);
  sprite.scale.set(s, s, 1);
  sprite.userData.baseScale = s;
  // O material é COMPARTILHADO por tipo (ver dropMaterial): marca como shared para disposeObject (techniqueEffects.ts)
  // pular o descarte — senão a limpeza dos projéteis inimigos descarta o material do cache e ele é re-linkado a cada tiro.
  sprite.userData.shared = true;
  return sprite;
}

/** Ancora na borda do desenho útil, dentro da margem transparente do atlas. */
export function groundDropAnchor(kind:DropVisual,variant=0) {
  if(isScroll(kind))return scrollStyle(variant).open?.203:.313;
  if(kind==='cursed')return .146;
  if(kind==='ryu'||kind==='onigiri'||kind==='coin')return .105;
  if(kind==='xp')return .117;
  if(kind==='chakra')return .233;
  return .19;
}

/** Um material e uma geometria para todas as sombras de itens colocados no mapa. */
export function createPickupShadows(surface:(x:number,z:number)=>number) {
  const {c,g}=canvas();
  glow(g,'rgba(22,16,9,.66)');
  const map=new THREE.CanvasTexture(c);
  const material=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
  const geometry=new THREE.PlaneGeometry(1,1);
  geometry.rotateX(-Math.PI/2);
  const up=new THREE.Vector3(0,1,0),normal=new THREE.Vector3();
  return {
    place(x:number,z:number,width:number) {
      const mesh=new THREE.Mesh(geometry,material);
      const step=.36;
      normal.set(surface(x-step,z)-surface(x+step,z),step*2,
        surface(x,z-step)-surface(x,z+step)).normalize();
      mesh.quaternion.setFromUnitVectors(up,normal);
      mesh.position.y=.018;
      mesh.scale.set(width,1,width*.74);
      return mesh;
    },
    dispose(){geometry.dispose();material.dispose();map.dispose();},
  };
}
