"""Contact sheet: python3 scripts/sheet.py out.png cols width img1 img2 ... (labels = file names)"""
import sys
from PIL import Image, ImageDraw
out, cols, w, *imgs = sys.argv[1:]
cols, w = int(cols), int(w)
ims = [Image.open(p).convert('RGB') for p in imgs]
h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols + 1) * 12, rows * (h + 34) + 12), (20, 20, 24))
d = ImageDraw.Draw(sheet)
for i, (im, p) in enumerate(zip(ims, imgs)):
    x = 12 + (i % cols) * (w + 12); y = 12 + (i // cols) * (h + 34)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + 22))
    d.text((x, y + 4), p.split('/')[-1], fill=(220, 220, 220))
sheet.save(out)
