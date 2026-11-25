# Contact sheet of preview stills with Instagram safe-zone guides (top 250px, bottom 340px).
import sys
from PIL import Image, ImageDraw
files = sys.argv[2:]
out = sys.argv[1]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
s = w / 1080
sheet = Image.new('RGB', (w * len(ims) + 10 * (len(ims) - 1), h), (40, 40, 40))
for i, im in enumerate(ims):
    d = ImageDraw.Draw(im)
    for y in (250 * s, (1920 - 340) * s):
        d.line([(0, y), (w, y)], fill=(0, 200, 255), width=1)
    d.text((6, 6), files[i].split('-')[-1].split('.')[0], fill=(0, 200, 255))
    sheet.paste(im, (i * (w + 10), 0))
sheet.save(out)
