#!/usr/bin/env python3
"""Makes the four film-grain frames in public/grain/ (seeded: identical every run).
Mid-grey noise, used with an overlay blend at low opacity (LOOK.grain in src/data.ts).
Usage: python3 scripts/make-grain.py   (needs numpy, pillow)"""
import os
import numpy as np
from PIL import Image, ImageFilter

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'grain')
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(424242)
for k in range(4):
    n = rng.normal(128, 34, (992, 572)).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(n, 'L').filter(ImageFilter.GaussianBlur(0.45))
    im.save(os.path.join(out, f'grain-{k}.png'), optimize=True)
    print(f'grain-{k}.png')
