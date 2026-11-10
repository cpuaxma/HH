"""Captioned storyboard for the animals reel:
  python3 scripts/storyboard-animals.py out.png DIR   (stills named frame-NNNN.png, from
  COMP=MiranAnimals node scripts/stills.mjs DIR 0.5 <frames below>)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, d = sys.argv[1], sys.argv[2]
SHOTS = [
    (120, '1 HOOK', '"What do animals have to do with trading?" A gold bull and a silver bear face off. The chart chops sideways.'),
    (330, '2 BULL', 'Rising market, buyers in control: the horns thrust up and the chart climbs. Label: "the bull".'),
    (700, '3 BEAR', 'Falling market, sellers in control: the paw swipes down and the chart drops. Label: "the bear".'),
    (812, '4 WHALE', 'The whale surfaces through the floor (ripples). Label: "the whale".'),
    (900, '4 WHALE', 'Big players, large orders: one big candle forms (the chart clock slows to watch it).'),
    (1062, '5 HAWK', 'Hawkish: the hawk dives to the floor; the gold chart dips.'),
    (1180, '5 HAWK', 'Label "the hawk" + note: "Not always - many factors move the market".'),
    (1450, '6 DOVE', 'Dovish: the dove rises and the chart lifts. The same note stays on screen.'),
    (1710, 'TIE-IN', 'Miran Gold news alert on the phone: "an upcoming rate decision" (generic, no date). Hawk and dove either side.'),
    (1980, '7 END', 'Wordmark, "signals - news alerts - auto copy", CTA, risk disclaimer.'),
]
W, H = 360, 640
cols = 5
rows = (len(SHOTS) + cols - 1) // cols
CAP = 110
sheet = Image.new('RGB', (cols * (W + 14) + 14, rows * (H + CAP + 14) + 14), (10, 14, 24))
dr = ImageDraw.Draw(sheet)
try:
    bold = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    reg = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except OSError:
    bold = reg = ImageFont.load_default()
for i, (f, tag, desc) in enumerate(SHOTS):
    x = 14 + (i % cols) * (W + 14)
    y = 14 + (i // cols) * (H + CAP + 14)
    im = Image.open(f'{d}/frame-{f:04d}.png').convert('RGB').resize((W, H), Image.LANCZOS)
    sheet.paste(im, (x, y))
    dr.text((x, y + H + 8), f'{tag}  ·  {f / 60:.2f}s (f{f})', font=bold, fill=(243, 210, 122))
    words, line, ly = desc.split(), '', y + H + 34
    for w in words:
        if dr.textlength(line + ' ' + w, font=reg) > W - 4:
            dr.text((x, ly), line.strip(), font=reg, fill=(225, 220, 212))
            ly += 18
            line = ''
        line += ' ' + w
    dr.text((x, ly), line.strip(), font=reg, fill=(225, 220, 212))
sheet.save(out)
print(out, sheet.size)
