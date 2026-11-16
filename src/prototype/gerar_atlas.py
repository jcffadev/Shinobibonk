"""Cria um atlas original 4K e a mesma imagem em 1K para comparação no protótipo."""

import sys
from pathlib import Path
import numpy as np
from PIL import Image

output = Path(sys.argv[1])
output.mkdir(parents=True, exist_ok=True)
N = 1024
y, x = np.mgrid[:N,:N].astype(np.float32) / N
rng = np.random.default_rng(90)

def noise(size):
    im = Image.fromarray(rng.integers(0,255,size=(size,size),dtype=np.uint8))
    return (np.asarray(im.resize((N,N),Image.Resampling.BICUBIC),dtype=np.float32)/255 - .5) * 2

wide, mid, fleck = noise(20), noise(78), noise(340)
u = x + wide*.006
v = y + mid*.003

palette = [
    (91,128,57), (194,146,96), (198,188,158), (166,71,38),
    (219,153,61), (109,82,57), (128,129,116), (174,51,40),
    (219,113,30), (61,66,74), (232,172,119), (235,183,55),
    (112,154,66), (128,102,75), (51,124,140), (73,89,111),
]

def rings(grid, grain):
    row = np.floor(v*grid)
    wall_y = (v*grid)%1
    wall_x = (u*grain + (row%2)*.5)%1
    return wall_x, wall_y, row

atlas = Image.new('RGB',(4096,4096))
for i, c in enumerate(palette):
    detail = 1 + wide*.085 + mid*.045 + fleck*.045
    if i in (0,12):
        grass = np.sin(229*x+113*y+mid*2)*np.sin(211*y-104*x+wide*.8)
        detail += np.maximum(0,grass-.40)*.14 - np.maximum(0,-grass-.45)*.11
        detail += .10*wide + .11*mid
    if i in (1,13):
        gravel = np.maximum(0, fleck-.58)**2
        detail += gravel*.98 - np.maximum(0,-fleck-.67)**2*.80
    if i in (3,4,7,6):
        tx,ty,row = rings(8 if i!=6 else 6,9 if i!=6 else 5)
        detail -= .26*np.exp(-(ty/.062)**2)
        detail -= .22*np.exp(-(np.minimum(tx,1-tx)/.033)**2)
        detail += .15*np.exp(-((ty-.15)/.10)**2)+.06*np.sin(row*2.9+2.4*tx)
    if i == 2:
        detail += .09*mid - np.clip(np.abs(wide)-.65,0,.6)*.27
    if i == 5:
        detail += .13*np.sin(v*375 + .78*np.sin(x*31)+wide*.65)
        detail += .055*np.cos(v*811 + .9*np.sin(x*19)+mid*.8)
    if i in (8,9,15):
        detail += .034*(np.sin(u*1245)*np.sin(v*1222))
    if i == 11:
        detail += .052*np.sin(v*205+u*36+wide*.47)
    if i == 14:
        detail += .14*np.sin(38*v+wide*1.4)*np.sin(29*u+mid*.42)
    rgb = np.uint8(np.clip(detail[:,:,None]*np.array(c),0,255))
    atlas.paste(Image.fromarray(rgb),(i%4*N,i//4*N))

atlas.save(output/'materiais-4096.jpg',quality=92,optimize=True,subsampling=0)
atlas.resize((1024,1024),Image.Resampling.LANCZOS).save(output/'materiais-1024.jpg',quality=92,optimize=True,subsampling=0)
