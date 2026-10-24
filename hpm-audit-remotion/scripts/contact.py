# Contact sheets for review: python3 scripts/contact.py <dir> <outPrefix> [cols] [rows]
import sys, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
rows = int(sys.argv[4]) if len(sys.argv) > 4 else 2
files = sorted(f for f in os.listdir(d) if f.endswith('.png') or f.endswith('.jpg'))
w, h = 360, 640
per = cols * rows
for s in range(0, len(files), per):
    sheet = Image.new('RGB', (cols * w, rows * (h + 30)), 'white')
    dr = ImageDraw.Draw(sheet)
    for i, f in enumerate(files[s:s + per]):
        im = Image.open(os.path.join(d, f)).convert('RGB').resize((w, h))
        x, y = (i % cols) * w, (i // cols) * (h + 30)
        sheet.paste(im, (x, y + 30))
        # safe-zone guides: right 140px, bottom 320px
        dr.line([(x + w - 140 / 3, y + 30), (x + w - 140 / 3, y + 30 + h)], fill=(0, 160, 255), width=1)
        dr.line([(x, y + 30 + h - 320 / 3), (x + w, y + 30 + h - 320 / 3)], fill=(0, 160, 255), width=1)
        dr.text((x + 6, y + 8), f, fill='black')
    sheet.save(f'{out}{s // per:02d}.jpg', quality=85)
    print(f'{out}{s // per:02d}.jpg')
