"""Builds the static files in assets/ (the Remotion public dir).

- assets/logo-on-dark.png: ../../assets/logo-primary.png with the cream
  background keyed out, the red wordmark kept as-is and the black pepper
  outline turned off-white so it reads on charcoal. Cropped to the artwork.
- assets/grain.png: a 512px tileable monochrome noise tile for <Grain>.
- assets/fonts/: Montserrat Medium + ExtraBold (latin) from @fontsource, used
  only when Google Fonts can't be reached at render time.

Usage: python3 scripts/prepare-assets.py   (or: npm run assets)
"""
import random
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets'
BG = (255, 251, 239)          # cream background of the supplied logo
RED = (211, 61, 28)           # the logo's own red: brand artwork is not recoloured
OFF_WHITE = (250, 250, 250)   # the outline colour on dark backgrounds
BLACK = (0, 0, 0)

src = Image.open(ROOT.parent / 'assets' / 'logo-primary.png').convert('RGB')
w, h = src.size
out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
px, po = src.load(), out.load()
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        reddish = r - g > 40
        fg = RED if reddish else BLACK
        # Unmix the pixel from the cream background to recover its coverage.
        a = max((BG[i] - c) / max(1, BG[i] - fg[i]) for i, c in enumerate((r, g, b)))
        a = max(0.0, min(1.0, a))
        if a < 0.04:
            continue
        col = RED if reddish else OFF_WHITE
        po[x, y] = col + (round(a * 255),)
x0, y0, x1, y1 = out.getchannel('A').getbbox()
pad = 16
out = out.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
out.save(ASSETS / 'logo-on-dark.png', optimize=True)
print('logo-on-dark.png', out.size, 'crop', (x0 - pad, y0 - pad, x1 + pad, y1 + pad))

rng = random.Random(11)
size = 512
grain = Image.new('L', (size, size))
grain.putdata([rng.randint(0, 255) for _ in range(size * size)])
grain.save(ASSETS / 'grain.png', optimize=True)
print('grain.png', grain.size)

files = ROOT / 'node_modules' / '@fontsource' / 'montserrat' / 'files'
for weight in (500, 800):
    name = f'montserrat-latin-{weight}-normal.woff2'
    shutil.copy(files / name, ASSETS / 'fonts' / name)
    print('fonts/' + name)
