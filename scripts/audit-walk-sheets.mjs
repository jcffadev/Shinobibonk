// Auditoria das folhas de caminhada (SEM navegador). Uso: node scripts/audit-walk-sheets.mjs [--json]
//
// Padrão do projeto (Naruto Academia, Kakashi e os primeiros shinobis): a caminhada de FRENTE e a de COSTAS são
// desenhadas de TRÊS QUARTOS, viradas para a DIREITA; o jogo espelha para andar para a esquerda. Folhas que desenham o
// personagem reto para a câmera destoam (pedido do usuário em 14/11: "os primeiros… estão andando com uma animação…
// e os últimos que criamos estão andando de outro. Preciso de um padrão para TODOS").
//
// Como mede: lê o PNG (sem dependências), separa as células de caminhada da folha registrada em directionalArt e calcula
// a ASSIMETRIA da silhueta de cada quadro (máscara alfa espelhada sobre o próprio centro). Personagem reto de frente é
// quase simétrico; de três quartos, não. A direção (para onde está virado) vem do lado com mais massa na metade de cima.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { HEROES } from '../src/game/heroes.ts';
import { directionalArt } from '../src/game/directionalArt.ts';

export function decodePng(file) {
  const b = fs.readFileSync(file);
  let p = 8, width, height, depth, color, interlace; const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8), data = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; color = data[9]; interlace = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error(`${file}: PNG não suportado (bits ${depth}, entrelaçado ${interlace})`);
  const channels = { 6: 4, 2: 3, 4: 2, 0: 1 }[color];
  if (!channels) throw new Error(`${file}: tipo de cor ${color} não suportado`);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = width * channels, out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[o + x - channels] : 0, up = y ? out[o - stride + x] : 0, c = x >= channels && y ? out[o - stride + x - channels] : 0;
      const pa = Math.abs(up - c), pb = Math.abs(a - c), pc = Math.abs(a + up - 2 * c);
      const pred = f === 0 ? 0 : f === 1 ? a : f === 2 ? up : f === 3 ? (a + up) >> 1 : (pa <= pb && pa <= pc ? a : pb <= pc ? up : c);
      out[o + x] = (line[x] + pred) & 255;
    }
  }
  const alpha = (x, y) => channels === 4 ? out[(y * width + x) * 4 + 3] : channels === 2 ? out[(y * width + x) * 2 + 1] : 255;
  return { width, height, alpha };
}

/** Assimetria (0 = simétrico) e lado da massa da metade de cima (+1 direita, −1 esquerda) de uma célula. */
export function cellShape(img, x0, y0, w, h) {
  let minX = w, maxX = -1, minY = h, maxY = -1;
  const on = (x, y) => img.alpha(x0 + x, y0 + y) > 128;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (on(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  if (maxX < 0) return { empty: true };
  const cx = (minX + maxX) / 2; let diff = 0, total = 0, left = 0, right = 0;
  const topEnd = minY + (maxY - minY) * .45;
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const a = on(x, y), m = Math.round(2 * cx - x), b = m >= 0 && m < w && on(m, y);
    if (a) { total++; if (y <= topEnd) { if (x > cx) right++; else if (x < cx) left++; } }
    if (a !== b) diff++;
  }
  return { asym: diff / Math.max(1, 2 * total), side: right === left ? 0 : right > left ? 1 : -1 };
}

export function auditWalkSheets(root = '.') {
  const seen = new Map(), results = [];
  for (const h of HEROES) {
    const family = h.family ?? h.id, form = h.form ?? 1;
    const sheet = directionalArt(family, form);
    if (!sheet) { results.push({ id: h.id, family, form, status: 'SEM FOLHA DIRECIONAL' }); continue; }
    const key = sheet.path + '#' + (sheet.firstRow ?? 0);
    if (!seen.has(key)) {
      const img = decodePng(root + '/public' + sheet.path);
      const cw = Math.floor(img.width / 4), ch = Math.floor(img.height / sheet.rows), first = sheet.firstRow ?? 0;
      const rowShape = row => [0, 1, 2, 3].map(c => cellShape(img, c * cw, (first + row) * ch, cw, ch)).filter(s => !s.empty);
      const front = rowShape(0), back = rowShape(1);
      const avg = list => list.reduce((s, x) => s + x.asym, 0) / Math.max(1, list.length);
      seen.set(key, { path: sheet.path, frontAsym: +avg(front).toFixed(3), backAsym: +avg(back).toFixed(3), frontSide: Math.sign(front.reduce((s, x) => s + x.side, 0)) });
    }
    results.push({ id: h.id, family, form, ...seen.get(key) });
  }
  return results;
}

if (import.meta.url === new URL(process.argv[1], 'file:').href || process.argv[1]?.endsWith('audit-walk-sheets.mjs')) {
  const results = auditWalkSheets();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(results, null, 1)); }
  else {
    for (const r of results.sort((a, b) => (a.frontAsym ?? 9) - (b.frontAsym ?? 9))) console.log(`${(r.frontAsym ?? '-').toString().padEnd(6)} ${(r.backAsym ?? '-').toString().padEnd(6)} ${r.frontSide === 1 ? 'dir' : r.frontSide === -1 ? 'esq' : ' — '}  ${r.id.padEnd(22)} ${r.status ?? r.path}`);
  }
}
