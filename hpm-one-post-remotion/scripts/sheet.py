"""Contact sheet of stills: python3 scripts/sheet.py out.png dir frame..."""
import sys
from PIL import Image, ImageDraw
out, d, *fs = sys.argv[1:]
ims = [Image.open(f'{d}/{int(f):04d}.png').resize((432, 768)) for f in fs]
sheet = Image.new('RGB', (442 * len(ims) - 10, 800), (255, 255, 255))
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fs, ims)):
    sheet.paste(im, (i * 442, 32))
    dr.text((i * 442 + 8, 8), f'frame {f}', fill=(0, 0, 0))
sheet.save(out)
