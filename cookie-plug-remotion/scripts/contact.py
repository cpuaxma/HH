"""Tile PNG frames into a labelled contact sheet: python3 scripts/contact.py <dir> <out.png> [cols] [width]"""
import sys, glob, os
from PIL import Image, ImageDraw

d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5
w = int(sys.argv[4]) if len(sys.argv) > 4 else 270
files = sorted(glob.glob(os.path.join(d, "f*.png")))
h = int(w * 1920 / 1080)
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), (40, 40, 40))
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h), Image.LANCZOS)
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    sheet.paste(im, (x, y + 22))
    ImageDraw.Draw(sheet).text((x + 6, y + 5), os.path.basename(f)[1:-4], fill=(255, 255, 0))
sheet.save(out)
