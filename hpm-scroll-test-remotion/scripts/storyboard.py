"""Labelled storyboard sheet: python3 scripts/storyboard.py out.png 'frame:label' ... (stills in out/board)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, items = sys.argv[1], sys.argv[2:]
w, h = 324, 576
cols = 5
rows = (len(items) + cols - 1) // cols
pad, lab = 14, 64
sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + lab + pad) + pad), (24, 22, 21))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except OSError:
    font = small = ImageFont.load_default()
for i, it in enumerate(items):
    frame, label = it.split(':', 1)
    im = Image.open(f'out/board/frame-{int(frame):04d}.png').convert('RGB').resize((w, h), Image.LANCZOS)
    x = pad + (i % cols) * (w + pad)
    y = pad + (i // cols) * (h + lab + pad)
    title, _, sub = label.partition('|')
    d.text((x, y + 4), title, fill=(255, 255, 255), font=font)
    d.text((x, y + 26), f'{sub}  ·  f{frame} ({int(frame) / 60:.2f}s)', fill=(200, 196, 190), font=small)
    sheet.paste(im, (x, y + lab - 8))
sheet.save(out)
