"""Captioned storyboard sheet: python3 scripts/storyboard.py out.png DIR (stills named frame-NNNN.png)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, d = sys.argv[1], sys.argv[2]
SHOTS = [
    (60, '1 HOOK', 'Wide two-shot, slow push + arc. Notifications stacking, warm glow.'),
    (182, 'whip', 'Speed-ramped whip into the competitor screen (motion blur).'),
    (250, '2 GAP', 'Low 3/4 macro: likes 214→8,420, comments, +1,236 followers, Trending.'),
    (312, 'whip', 'Whip-pan across to your phone.'),
    (390, '2 GAP', 'Straight-on macro: 3 likes, clock 9:00→21:00, screen dims + greys.'),
    (490, '2 GAP', 'Overhead crane: warm pool under theirs, nothing under yours.'),
    (600, '3 TWIST', 'Push-in on their profile.'),
    (690, '3 TWIST', '"Managed by Hot Pepper Media" tag lands.'),
    (745, '4 FLIP', 'Pull back to low 3/4 hero; the red pepper streak whips across.'),
    (805, '4 FLIP', 'Your phone spins 360° (speed ramp, motion blur).'),
    (836, '4 FLIP', 'Impact frame on the landing (3 frames).'),
    (940, '4 FLIP', 'Both lit, pulsing in sync. Your numbers start to climb.'),
    (1070, '5 END', 'Blur to off-white, logo animates in, DM US.'),
    (1180, '5 END', 'Held last second.'),
]
W, H = 360, 640
cols = 7
rows = (len(SHOTS) + cols - 1) // cols
CAP = 92
sheet = Image.new('RGB', (cols * (W + 14) + 14, rows * (H + CAP + 14) + 14), (24, 22, 20))
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
    dr.text((x, y + H + 8), f'{tag}  ·  {f / 60:.2f}s (f{f})', font=bold, fill=(255, 122, 26) if tag != 'whip' else (200, 200, 200))
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
