"""Builds the static images in public/ from the brand files in ../assets.

- public/logo-reversed.png: the reversed logo, recoloured from pure white to
  Cream (#FEF9EF) and cropped to its visible pixels plus a small margin.
- public/grain.png: a 512px tileable monochrome noise tile for <Grain>.

Usage: python3 scripts/prepare-assets.py
"""
import random
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CREAM = (0xFE, 0xF9, 0xEF)

src = Image.open(ROOT.parent / 'assets' / 'logo-reversed.png').convert('RGBA')
alpha = src.getchannel('A')
x0, y0, x1, y1 = alpha.getbbox()
pad = 12
box = (max(0, x0 - pad), max(0, y0 - pad), min(src.width, x1 + pad), min(src.height, y1 + pad))
alpha = alpha.crop(box)
logo = Image.new('RGBA', alpha.size, CREAM + (0,))
logo.putalpha(alpha)
logo.save(ROOT / 'public' / 'logo-reversed.png', optimize=True)
print('logo-reversed.png', logo.size, 'crop', box)

rng = random.Random(7)
size = 512
grain = Image.new('L', (size, size))
grain.putdata([rng.randint(0, 255) for _ in range(size * size)])
grain.save(ROOT / 'public' / 'grain.png', optimize=True)
print('grain.png', grain.size)
