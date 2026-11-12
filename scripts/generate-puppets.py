#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rodada 41 — Marionetes únicas (Kuri · Kuroari)
Gerador de folhas de movimento 2.5D chibi para as marionetes, no mesmo padrão da arte
programática do projeto (scripts/generate-sprites.mjs: grade 64×64, volume 0,78/1,14,
contorno 1 pixel #181624, pixel art chibi, câmera elevada, fundo transparente, pés ancorados).

Saída (public/assets/shinobi-motion/):
  kuri-1-walk-v1.png        4×2 (1280×640)   · fileira 1 frente, fileira 2 costas
  kuri-1-action-v3.png      4×4 (1280×1280)  · 1–2 ataque frente/costas, 3–4 pulo/dash frente/costas
  kuroari-1-walk-v1.png     4×2 (1280×640)
  kuroari-1-action-v3.png   4×4 (1280×1280)

Célula de 320 px (grade 64 × 5), pés em y≈60/64, margem transparente nas bordas
(mesma convenção de ancoragem do pack-sprite-atlas.ps1: célula 320, pés na base).

Uso: python scripts/generate-puppets.py [pasta-de-saída]
     (sem argumento, grava em public/assets/shinobi-motion/)
Dependências: Pillow (PIL).
"""
import math
import os
import sys

from PIL import Image

W = 64          # grade lógica por célula
OUT = 5         # escala → célula 320 px (1 "pixel" de desenho = 5 px finais, como no generate-sprites.mjs)
OUTLINE = (24, 22, 36)          # #181624 — contorno padrão do atlas
TONE_DARK = 0.78                # borda direita/inferior da silhueta (luz vinda da esquerda)
TONE_LIGHT = 1.14               # borda superior/esquerda


# ------------------------------------------------------------------ primitivas
class Cell:
    """Célula 64×64 com rasterização em ponto de centro (mesma receita do generate-sprites.mjs)."""

    def __init__(self):
        self.g = [[None] * W for _ in range(W)]

    def _set(self, x, y, c):
        if 0 <= x < W and 0 <= y < W:
            if c is not None:
                self.g[y][x] = c

    def px(self, x, y, c):
        self._set(int(round(x)), int(round(y)), c)

    def rect(self, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                self._set(x, y, c)

    def ellipse(self, cx, cy, rx, ry, c):
        x0, x1 = int(cx - rx), int(cx + rx + 1)
        y0, y1 = int(cy - ry), int(cy + ry + 1)
        for y in range(max(0, y0), min(W - 1, y1) + 1):
            for x in range(max(0, x0), min(W - 1, x1) + 1):
                dx = (x + 0.5 - cx) / rx
                dy = (y + 0.5 - cy) / ry
                if dx * dx + dy * dy <= 1:
                    self._set(x, y, c)

    def poly(self, pts, c):
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0, x1 = max(0, int(min(xs))), min(W - 1, int(max(xs) + 1))
        y0, y1 = max(0, int(min(ys))), min(W - 1, int(max(ys) + 1))

        def inside(x, y):
            test = False
            j = len(pts) - 1
            for i in range(len(pts)):
                xi, yi = pts[i]
                xj, yj = pts[j]
                if (yi > y + 0.5) != (yj > y + 0.5) and x + 0.5 < (xj - xi) * (y + 0.5 - yi) / (yj - yi) + xi:
                    test = not test
                j = i
            return test

        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if inside(x, y):
                    self._set(x, y, c)

    def line(self, x0, y0, x1, y1, c, thick=1):
        """Linha interpolada com espessura inteira (agulhas, pernas do escorpião).

        Bug corrigido (rodada 41): `r = thick/2` era float e `range()` exigia
        inteiros. Agora o raio é arredondado para cima e a condição de círculo
        mantém a espessura visual correta (1 px → 1 pixel; 2 px → losango 5 px).
        """
        steps = int(max(abs(x1 - x0), abs(y1 - y0))) or 1
        r = max(0.5, thick / 2.0)
        rad = int(math.ceil(r))
        for i in range(steps + 1):
            t = i / steps
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            for dy in range(-rad, rad + 1):
                for dx in range(-rad, rad + 1):
                    if dx * dx + dy * dy <= r * r + 0.25:
                        self._set(int(round(x + dx)), int(round(y + dy)), c)

    def mirror_copy(self, cx=31.5):
        """Cópia espelhada em torno do eixo vertical (usada para quadros de costas)."""
        h = [row[:] for row in self.g]
        for y in range(W):
            for x in range(W):
                if h[y][x] is not None:
                    nx = int(round(2 * cx - x))
                    if 0 <= nx < W and h[y][nx] is None:
                        self.g[y][nx] = h[y][x]

    def finish(self):
        """Volume (borda inferior/direita escura, superior/esquerda clara) + contorno de 1 px."""
        g = [row[:] for row in self.g]

        def tone(c, f):
            return tuple(max(0, min(255, int(v * f))) for v in c)

        def empty(x, y):
            return not (0 <= x < W and 0 <= y < W) or g[y][x] is None

        for y in range(W):
            for x in range(W):
                c = g[y][x]
                if not c:
                    continue
                if empty(x + 1, y) or empty(x + 2, y) or empty(x, y + 1):
                    g[y][x] = tone(c, TONE_DARK)
                elif empty(x - 1, y) or empty(x, y - 1):
                    g[y][x] = tone(c, TONE_LIGHT)
        for y in range(W):
            for x in range(W):
                if g[y][x] is None:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < W and 0 <= ny < W and g[ny][nx] is not None and g[ny][nx] != OUTLINE:
                            g[y][x] = OUTLINE
                            break
        return g

    def to_image(self):
        g = self.finish()
        img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
        d = img.load()
        for y in range(W):
            for x in range(W):
                c = g[y][x]
                if c:
                    d[x, y] = c + (255,)
        return img.resize((W * OUT, W * OUT), Image.NEAREST)


def make_sheet(cols, rows, cells):
    """Monta a folha: cells[col][row] → PIL Image (células 320 px)."""
    sheet = Image.new("RGBA", (cols * W * OUT, rows * W * OUT), (0, 0, 0, 0))
    for r in range(rows):
        for c in range(cols):
            cell = cells[c][r]
            if not isinstance(cell, Image.Image):
                cell = cell.to_image()
            sheet.paste(cell, (c * W * OUT, r * W * OUT))
    return sheet


def anchor_feet(img, target_bottom, cell_h=320):
    """Âncora os pés na base da célula, POR FILEIRA (convenção pack-sprite-atlas.ps1: y≈305–310/320).

    O sprite do jogo ancora o fundo na linha do chão (playerMotion: position.y =
    floor + scale.y*.5), então a folga abaixo dos pés vira flutuação. Cada faixa de
    fileiro (320 px) é deslocada de forma independente: o quadro mais baixo da
    fileira define o chão, e quadros de pulo/apoio da mesma fileira ficam
    naturalmente mais altos.

    (Bug corrigido na 1ª versão: o shift era global na folha inteira, o que
    sobreponhia a fileira 2 sobre a 1 — a âncora precisa ser por fileira.)
    """
    w, h = img.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for ry in range(0, h, cell_h):
        strip = img.crop((0, ry, w, ry + cell_h))
        bbox = strip.getchannel("A").getbbox()
        if not bbox:
            continue
        dy = int(round(target_bottom - bbox[3]))
        if dy == 0:
            out.paste(strip, (0, ry))
        else:
            shifted = Image.new("RGBA", strip.size, (0, 0, 0, 0))
            shifted.paste(strip, (0, dy))
            out.paste(shifted, (0, ry))
    return out


# ------------------------------------------------------------------ paletas
# Kuri — marionete de Kankuro: máscara de raposa dourada, quimono vermelho, faixa creme,
# rabo fofo, manoplas com agulhas (referência da obra: Kuri, Vila da Areia).
K = {
    "mask": (226, 165, 62), "mask_hi": (244, 199, 107), "mask_lo": (179, 125, 43),
    "cream": (242, 232, 213), "cream_lo": (216, 201, 168),
    "red": (194, 59, 50), "red_lo": (143, 42, 34),
    "dark": (42, 36, 56), "dark_lo": (29, 25, 48),
    "steel": (207, 214, 228), "eye": (36, 31, 46), "white": (255, 255, 255),
}
# Kuroari — marionete escorpião (Sasori/Kankuro): armadura vermelho-escura, articulações escuras,
# pinças grandes, olhos âmbar, ferrão com brilho de veneno.
S = {
    "red": (168, 50, 50), "red_hi": (201, 79, 66), "red_lo": (124, 34, 34),
    "dark": (42, 36, 56), "dark_hi": (61, 53, 82), "dark_lo": (29, 25, 48),
    "bone": (239, 227, 207), "bone_lo": (207, 193, 164),
    "eye": (255, 210, 62), "eye_hi": (255, 240, 179),
    "sting": (255, 90, 60), "sting_hi": (255, 210, 62),
}


# ================================================================== KURI
def kuri_tail(cell, side, lift=0):
    """Rabo fofo atrás do corpo (side -1 = esquerda, +1 = direita); lift ergue a ponta."""
    sx = side
    cell.ellipse(32 + sx * 14, 34 - lift * 0.3, 4, 5, K["cream"])
    cell.ellipse(32 + sx * 17, 29 - lift * 0.6, 3.5, 4.5, K["cream"])
    cell.ellipse(32 + sx * 18, 24 - lift, 3, 4, K["cream"])
    cell.ellipse(32 + sx * 17, 19 - lift * 1.4, 2.5, 3, K["mask"])
    cell.ellipse(32 + sx * 15, 17 - lift * 1.4, 1.5, 1.5, K["mask_hi"])


def kuri_legs(cell, phase=0):
    """phase 0 = pernas juntas; 1 = perna direita à frente; 2 = juntas (variação); 3 = esquerda à frente."""
    pants, sandal = (58, 51, 80), K["dark"]
    if phase in (0, 2):
        cell.rect(27, 46, 30, 53, pants)
        cell.rect(34, 46, 37, 53, pants)
        cell.rect(26, 53, 31, 57, sandal)
        cell.rect(33, 53, 38, 57, sandal)
        cell.rect(26, 53, 31, 53, K["red_lo"])
        cell.rect(33, 53, 38, 53, K["red_lo"])
    elif phase == 1:  # direita à frente
        cell.rect(25, 45, 29, 51, pants)
        cell.rect(24, 51, 30, 55, sandal)
        cell.rect(34, 46, 38, 54, pants)
        cell.rect(33, 54, 39, 58, sandal)
    else:  # esquerda à frente (espelho)
        cell.rect(35, 45, 39, 51, pants)
        cell.rect(34, 51, 40, 55, sandal)
        cell.rect(26, 46, 30, 54, pants)
        cell.rect(25, 54, 31, 58, sandal)


def kuri_arms(cell, left=(24, 30), right=(40, 30), needles=False, extend_r=0):
    """Braços; extend_r estica o braço direito (lançando agulhas)."""
    lx, ly = left
    rx, ry = right
    # esquerdo
    cell.ellipse(lx, ly, 2.5, 3.5, K["red"])
    cell.rect(lx - 2, ly + 3, lx + 1, ly + 6, K["dark"])
    cell.px(lx - 1, ly + 1, K["steel"])
    # direito
    if extend_r:
        cell.rect(rx - 2, ry - 1, rx + 4, ry + 1, K["red"])
        cell.rect(rx + 4, ry - 1, rx + 6, ry + 1, K["dark"])
        if needles:
            cell.line(rx + 7, ry - 2, rx + 10, ry - 4, K["steel"], 1)
            cell.line(rx + 7, ry + 1, rx + 11, ry - 1, K["steel"], 1)
    else:
        cell.ellipse(rx, ry, 2.5, 3.5, K["red"])
        cell.rect(rx - 1, ry + 3, rx + 2, ry + 6, K["dark"])
        cell.px(rx, ry + 1, K["steel"])


def kuri_head(cell, back=False, dy=0, dx=0):
    cx = 32 + dx
    cy = 16 + dy
    # orelhas
    cell.poly([(cx - 7, cy + 2 - dy), (cx - 4, cy - 12 - dy), (cx - 1, cy - 5 - dy)], K["mask"])
    cell.poly([(cx + 7, cy + 2 - dy), (cx + 4, cy - 12 - dy), (cx + 1, cy - 5 - dy)], K["mask"])
    cell.px(cx - 4, cy - 6 - dy, K["mask_lo"])
    cell.px(cx + 4, cy - 6 - dy, K["mask_lo"])
    # máscara
    cell.ellipse(cx, cy, 9, 8, K["mask"])
    cell.ellipse(cx, cy - 2, 7.5, 5.5, K["mask_hi"])
    if back:
        # vista de costas: costura central e fivela, sem rosto
        cell.rect(cx, cy - 5, cx, cy + 6, K["mask_lo"])
        cell.rect(cx - 2, cy - 4, cx + 2, cy - 2, K["dark"])
        return
    # bigodes de raposa
    cell.poly([(cx - 9, cy + 3), (cx - 6, cy + 1), (cx - 6, cy + 5)], K["cream"])
    cell.poly([(cx + 9, cy + 3), (cx + 6, cy + 1), (cx + 6, cy + 5)], K["cream"])
    # olhos
    cell.rect(cx - 5, cy - 1, cx - 3, cy + 1, K["eye"])
    cell.rect(cx + 3, cy - 1, cx + 5, cy + 1, K["eye"])
    cell.px(cx - 5, cy - 1, K["white"])
    cell.px(cx + 3, cy - 1, K["white"])
    cell.px(cx - 6, cy, K["eye"])
    cell.px(cx + 6, cy, K["eye"])
    # focinho
    cell.ellipse(cx, cy + 4, 3, 2, K["mask_hi"])
    cell.px(cx, cy + 3, K["eye"])
    cell.rect(cx - 1, cy + 6, cx + 1, cy + 6, K["mask_lo"])


def kuri_body(cell, lean=0, dy=0):
    cell.poly([(26 + lean, 25 + dy), (38 + lean, 25 + dy), (40 + lean, 38 + dy), (24 + lean, 38 + dy)], K["red"])
    cell.poly([(29 + lean, 25 + dy), (35 + lean, 25 + dy), (32 + lean, 29 + dy)], K["cream"])
    cell.rect(24 + lean, 33 + dy, 40 + lean, 35 + dy, K["cream"])
    cell.rect(37 + lean, 35 + dy, 39 + lean, 37 + dy, K["cream_lo"])
    cell.poly([(24 + lean, 38 + dy), (40 + lean, 38 + dy), (42 + lean, 46 + dy), (22 + lean, 46 + dy)], K["red_lo"])


def kuri_cell(back=False, phase=0, arm_state="idle", dy=0):
    """
    arm_state: idle | back | cast1 | cast2 | guard_up | lean_back
    """
    c = Cell()
    tail_lift = 1 if arm_state in ("cast1", "cast2") else 0
    kuri_tail(c, -1 if not back else 1, lift=tail_lift)
    kuri_body(c, lean=(1 if arm_state in ("cast1", "cast2") else 0), dy=dy)
    kuri_legs(c, phase)
    if arm_state == "idle":
        kuri_arms(c)
    elif arm_state == "back":
        kuri_arms(c, left=(25, 31), right=(42, 32))
    elif arm_state == "cast1":
        kuri_arms(c, left=(25, 31), right=(41, 30), needles=False, extend_r=1)
    elif arm_state == "cast2":
        kuri_arms(c, left=(26, 32), right=(42, 29), needles=True, extend_r=1)
    elif arm_state == "guard_up":
        kuri_arms(c, left=(23, 27), right=(41, 27))
    kuri_head(c, back=back, dy=dy)
    return c


def kuri_walk_cells():
    front = [
        kuri_cell(False, 1, "back", dy=0),      # contato: perna dir. à frente
        kuri_cell(False, 0, "idle", dy=-1),     # passagem
        kuri_cell(False, 3, "back", dy=0),      # contato: perna esq. à frente
        kuri_cell(False, 0, "idle", dy=-1),     # passagem
    ]
    backr = [
        kuri_cell(True, 1, "back", dy=0),
        kuri_cell(True, 0, "idle", dy=-1),
        kuri_cell(True, 3, "back", dy=0),
        kuri_cell(True, 0, "idle", dy=-1),
    ]
    return [[front[r], backr[r]] for r in range(4)]


def kuri_action_cells():
    # ataque frente: preparação, selo/soltura, agulhas em voo, recuperação
    atk_f = [
        kuri_cell(False, 1, "back", dy=0),
        kuri_cell(False, 1, "cast1", dy=0),
        kuri_cell(False, 2, "cast2", dy=0),
        kuri_cell(False, 0, "idle", dy=-1),
    ]
    atk_b = [
        kuri_cell(True, 1, "back", dy=0),
        kuri_cell(True, 1, "cast1", dy=0),
        kuri_cell(True, 2, "cast2", dy=0),
        kuri_cell(True, 0, "idle", dy=-1),
    ]
    # pulo/dash frente: decolagem, ápice, dash, frenagem
    def jump_cell(phase, arms, dy):
        return kuri_cell(False, phase, arms, dy)

    def jump_cell_b(phase, arms, dy):
        return kuri_cell(True, phase, arms, dy)

    jmp_f = [
        jump_cell(0, "guard_up", -2),
        jump_cell(0, "guard_up", -4),
        jump_cell(1, "cast1", -2),
        jump_cell(2, "idle", -1),
    ]
    jmp_b = [
        jump_cell_b(0, "guard_up", -2),
        jump_cell_b(0, "guard_up", -4),
        jump_cell_b(1, "cast1", -2),
        jump_cell_b(2, "idle", -1),
    ]
    return [
        [atk_f[r], atk_b[r], jmp_f[r], jmp_b[r]] for r in range(4)
    ]


# ================================================================== KUROARI
def kuroari_legs(cell, phase=0, dy=0):
    """Três pares de pernas; fase alterna o escoteio."""
    dark, hi = S["dark"], S["dark_hi"]
    off = [0, 1, 0, 1][phase % 4]
    for i, (bx, by, lx, ly) in enumerate([
        (16, 44, 9, 52 + off * 2),   # par 1 (exterior)
        (19, 47, 12, 56 - off * 2),  # par 2
        (22, 50, 16, 59 + off),      # par 3 (interior)
    ]):
        cell.line(bx, by, lx, ly, dark, 2)
        cell.px(lx, ly, hi)
        # espelho
        cell.line(64 - bx, by, 64 - lx, ly, dark, 2)
        cell.px(64 - lx, ly, hi)
        if dy:
            pass
    # apoio (pés)
    cell.rect(8, 56, 14, 58, S["dark_lo"])
    cell.rect(50, 56, 56, 58, S["dark_lo"])


def kuroari_tail(cell, pose="mid"):
    """pose: mid (neutra), up (ferrão erguido), strike (ferrão desce à frente), coil (recolhida)"""
    seg, seg_hi = S["red_lo"], S["red"]
    if pose == "mid":
        cell.ellipse(22, 34, 3, 4, seg)
        cell.ellipse(27, 25, 3, 4, seg)
        cell.ellipse(34, 19, 4, 3, seg)
        cell.ellipse(42, 17, 4, 3, seg)
        cell.ellipse(47, 20, 3, 3, seg)
        cell.ellipse(48, 24, 2.5, 2.5, S["sting"])
        cell.px(48, 24, S["sting_hi"])
    elif pose == "coil":
        cell.ellipse(20, 38, 3, 4, seg)
        cell.ellipse(18, 31, 3, 4, seg)
        cell.ellipse(21, 25, 3, 3, seg)
        cell.ellipse(25, 22, 2.5, 2.5, S["sting"])
        cell.px(25, 22, S["sting_hi"])
    elif pose == "up":
        cell.ellipse(24, 32, 3, 4, seg)
        cell.ellipse(28, 23, 3, 4, seg)
        cell.ellipse(33, 15, 4, 3, seg)
        cell.ellipse(41, 12, 4, 3, seg)
        cell.ellipse(47, 14, 3, 3, seg)
        cell.ellipse(49, 18, 2.5, 2.5, S["sting"])
        cell.px(49, 18, S["sting_hi"])
        cell.px(51, 17, S["sting_hi"])
        cell.px(49, 16, S["sting_hi"])
        cell.px(49, 20, S["sting_hi"])
    elif pose == "strike":
        cell.ellipse(24, 32, 3, 4, seg)
        cell.ellipse(30, 24, 3, 4, seg)
        cell.ellipse(36, 20, 4, 3, seg)
        cell.ellipse(42, 24, 3, 3, seg)
        cell.ellipse(40, 30, 3, 3, seg)
        # estoura do ferrão
        cell.ellipse(38, 34, 3, 3, S["sting"])
        for dx, dy in ((0, -3), (0, 3), (-3, 0), (3, 0), (-2, -2), (2, -2), (-2, 2), (2, 2)):
            cell.px(38 + dx, 34 + dy, S["sting_hi"])


def kuroari_head(cell, dy=0):
    cell.ellipse(32, 42 + dy, 7, 6, S["red"])
    cell.ellipse(32, 40 + dy, 5.5, 4, S["red_hi"])
    # mandíbulas
    cell.poly([(29, 47 + dy), (31, 47 + dy), (30, 50 + dy)], S["dark"])
    cell.poly([(35, 47 + dy), (33, 47 + dy), (34, 50 + dy)], S["dark"])
    # olhos
    cell.rect(28, 40 + dy, 30, 42 + dy, S["eye"])
    cell.rect(34, 40 + dy, 36, 42 + dy, S["eye"])
    cell.px(28, 40 + dy, S["eye_hi"])
    cell.px(34, 40 + dy, S["eye_hi"])
    # corpo
    cell.ellipse(32, 50 + dy, 8, 5, S["red_lo"])
    cell.ellipse(32, 50 + dy, 5, 3, S["red"])


def kuroari_pincers(cell, open_=False, dy=0):
    if open_:
        cell.ellipse(19, 47 + dy, 5, 4, S["red"])
        cell.ellipse(45, 47 + dy, 5, 4, S["red"])
        cell.ellipse(16, 49 + dy, 2.5, 2, S["red_hi"])
        cell.ellipse(48, 49 + dy, 2.5, 2, S["red_hi"])
        cell.ellipse(22, 51 + dy, 3.5, 3, S["dark"])
        cell.ellipse(42, 51 + dy, 3.5, 3, S["dark"])
    else:
        cell.ellipse(21, 50 + dy, 4.5, 3.5, S["red"])
        cell.ellipse(43, 50 + dy, 4.5, 3.5, S["red"])
        cell.ellipse(24, 52 + dy, 3, 2.5, S["dark"])
        cell.ellipse(40, 52 + dy, 3, 2.5, S["dark"])
        cell.px(21, 48 + dy, S["bone"])
        cell.px(43, 48 + dy, S["bone"])


def kuroari_cell(tail="mid", open_=False, phase=0, dy=0, dust=0):
    c = Cell()
    kuroari_legs(c, phase, dy)
    kuroari_tail(c, tail)
    kuroari_head(c, dy)
    kuroari_pincers(c, open_, dy)
    if dust:
        for dx in (-6, 0, 6):
            c.px(32 + dx, 59 - dx % 2, K["cream_lo"])
    return c


def kuroari_walk_cells():
    front = [
        kuroari_cell("mid", True, 0),
        kuroari_cell("mid", False, 1),
        kuroari_cell("mid", True, 2),
        kuroari_cell("mid", False, 3),
    ]
    # costas: mesmo escoteio (o rabo já aparece atrás no desenho)
    return [[front[r], front[r]] for r in range(4)]


def kuroari_action_cells():
    atk_f = [
        kuroari_cell("coil", True, 0),
        kuroari_cell("up", True, 0),
        kuroari_cell("strike", True, 0, dust=1),
        kuroari_cell("mid", False, 0),
    ]
    jmp_f = [
        kuroari_cell("mid", True, 0, dy=-3),
        kuroari_cell("up", True, 0, dy=-6),
        kuroari_cell("mid", True, 1, dy=-2),
        kuroari_cell("mid", False, 0, dy=-1, dust=1),
    ]
    return [[atk_f[r], atk_f[r], jmp_f[r], jmp_f[r]] for r in range(4)]


# ================================================================== main
def main(outdir=None):
    here = os.path.dirname(os.path.abspath(__file__))
    if outdir is None:
        outdir = os.path.join(here, "..", "public", "assets", "shinobi-motion")
    os.makedirs(outdir, exist_ok=True)

    kuri_walk = make_sheet(4, 2, kuri_walk_cells())
    kuri_act = make_sheet(4, 4, kuri_action_cells())
    kuroari_walk = make_sheet(4, 2, kuroari_walk_cells())
    kuroari_act = make_sheet(4, 4, kuroari_action_cells())

    jobs = [
        ("kuri-1-walk-v1.png", kuri_walk),
        ("kuri-1-action-v3.png", kuri_act),
        ("kuroari-1-walk-v1.png", kuroari_walk),
        ("kuroari-1-action-v3.png", kuroari_act),
    ]
    for name, img in jobs:
        img = anchor_feet(img, 310)
        path = os.path.join(outdir, name)
        img.save(path)
        print("ok", path, img.size)
        print("   bbox:", img.getchannel("A").getbbox())


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
