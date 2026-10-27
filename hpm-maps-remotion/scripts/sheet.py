"""Contact sheet of PNG stills: python3 scripts/sheet.py out.png a.png b.png ... (labels from file names)."""
import sys
from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = 360, 640
cols = min(6, len(ims))
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + 34) + 8), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x = 8 + (i % cols) * (w + 8)
    y = 8 + (i // cols) * (h + 34)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + 26))
    d.text((x + 4, y + 6), f.split('/')[-1], fill=(255, 255, 255))
sheet.save(out)
