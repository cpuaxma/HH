# python3 scripts/sheet.py out.png cols width img1 img2 ...  -> contact sheet with frame labels
import sys
from PIL import Image, ImageDraw
out, cols, w, *files = sys.argv[1:]
cols, w = int(cols), int(w)
ims = [Image.open(f).convert('RGB') for f in files]
h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 28)), (0, 0, 0))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 28)
    sheet.paste(im.resize((w, h)), (x, y + 28))
    d.text((x + 6, y + 6), f.split('/')[-1], fill=(255, 255, 0))
sheet.save(out)
