import * as THREE from 'three';

/**
 * Pedra Memorial de Konoha (Rodada 92 — pedido do usuário: "Fazer a pedra memorial em konoha, uma área para ela", com uma
 * cena do anime como referência). Desenhada no jogo em pixel art (canvas), sem arquivo externo:
 * pedra negra polida com nomes gravados e topo em ponta, duas lajes baixas nas laterais, piso de tijolos com juntas azuladas
 * saindo da pedra e um buquê de flores (rosa, branca e lilás) na base.
 * Fica numa clareira plana da Folha (`LEAF_PLACES`), cercada de árvores.
 */
export const MEMORIAL = { x: -38, z: -26, width: 7.5, height: 6.4, art: [96, 82] as const } as const;

/** Desenha a pedra num canvas de `MEMORIAL.art` pixels (ampliado sem suavizar no jogo). */
export function paintMemorial(canvas: HTMLCanvasElement) {
  const [w, h] = MEMORIAL.art;
  canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) return canvas;
  g.clearRect(0, 0, w, h);
  const px = (x: number, y: number, pw: number, ph: number, color: string) => { g.fillStyle = color; g.fillRect(x, y, pw, ph); };
  // Piso de tijolos (elipse achatada) com juntas azuladas saindo da pedra.
  for (let y = 62; y < 82; y++) {
    const half = Math.round(46 * Math.sqrt(Math.max(0, 1 - ((y - 72) / 10) ** 2)));
    for (let x = 48 - half; x < 48 + half; x++) {
      const brick = ((x + (Math.floor(y / 3) % 2) * 3) % 6 === 0) || y % 3 === 0;
      px(x, y, 1, 1, brick ? '#7d3f2f' : (x + y) % 5 === 0 ? '#b0644c' : '#a05843');
    }
  }
  for (const dx of [-30, -16, -6, 6, 16, 30]) for (let t = 0; t < 1; t += .05) px(Math.round(48 + dx * t), Math.round(66 + 14 * t), 1, 1, '#5d78b8');
  // Lajes laterais baixas.
  for (const [x0, dir] of [[10, 1], [86, -1]] as const) for (let k = 0; k < 26; k++) {
    const x = x0 + dir * k, top = 54 + Math.round(k * .12);
    px(Math.min(x, x0 + dir * 25), top, 1, 66 - top, k < 2 || k > 23 ? '#101418' : '#232a31');
    px(x, top, 1, 1, '#4f5f73');
  }
  // Pedra central: corpo, topo em ponta, contorno e brilho azul na borda.
  for (let y = 6; y < 66; y++) {
    const half = y < 22 ? Math.round(8 + (y - 6) * .95) : 23;
    for (let x = 48 - half; x <= 48 + half; x++) px(x, y, 1, 1, Math.abs(x - 48) === half || y === 6 ? '#0b0e12' : x < 48 - half + 3 ? '#3b4a5e' : '#1b2128');
  }
  // Nomes gravados: linhas curtas mais claras.
  for (let row = 0; row < 9; row++) for (let x = 34; x < 62; x += 4) if ((x * 7 + row * 13) % 5 !== 0) px(x, 26 + row * 3, 3, 1, '#4a5563');
  // Buquê de flores na base.
  const flowers: [number, number, string][] = [[40, 60, '#e69aac'], [43, 58, '#f4f4f4'], [46, 60, '#a98bd6'], [49, 58, '#f4f4f4'], [52, 60, '#e69aac'], [45, 62, '#3d7a3b'], [48, 62, '#3d7a3b']];
  for (const [x, y, c] of flowers) { px(x, y, 3, 3, c); px(x + 1, y + 1, 1, 1, '#ffffff99'); }
  px(38, 63, 18, 2, '#e8e2d2');
  return canvas;
}

/** Sprite da pedra assentado no chão (centro em baixo), com contorno escuro do próprio desenho. */
export function createMemorialSprite() {
  const texture = new THREE.CanvasTexture(paintMemorial(document.createElement('canvas')));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: .12 }));
  sprite.scale.set(MEMORIAL.width, MEMORIAL.height, 1);
  sprite.center.set(.5, .03);
  return sprite;
}
