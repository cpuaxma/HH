"""Captioned storyboard sheet: python3 scripts/storyboard.py out.png DIR (stills named frame-NNNN.png)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, d = sys.argv[1], sys.argv[2]
SHOTS = [
    (40, '1 HOOK', 'Wide two-shot, slow push + arc. Left already red (stacking alerts), right calm gold. "Same market. Same gold."'),
    (150, '1 HOOK', '"Two different results." Labels pinned under each phone with live balances (illustrative).'),
    (210, '2 STRATEGY', 'Speed-ramped whip into a macro on the left: copied + random trades, "?" where a reason should be.'),
    (280, '2 STRATEGY', 'Whip to the right macro: the Miran signal card builds line by line (entry, SL, TP1, TP2, reason, Risk 1%).'),
    (400, '2 RISK', 'Low 3/4 across both: "SL: —", 1:500, 8.00 lots, red meter vs Risk 1%, SL at break-even, green meter.'),
    (452, '2 UPDATES', 'Overhead crane over the leaning phones: the Miran market update lands on the right; the left calendar is unopened.'),
    (486, '2 UPDATES', 'The news candle hits both screens on the same frame: camera jolt + speed-ramped push. Margin level 112%.'),
    (520, '2 UPDATES', 'Left: margin call under a red pool. Right: protected (TP1 +$212, rest closed at BE) under a gold pool.'),
    (600, '3 TWIST', 'Push-in on the right screen: the Miran Gold checklist card reveals. "It isn\'t luck..."'),
    (708, '3 TWIST', 'Three gold ticks: strategy, risk management, market updates; the "signal source" tag glints. "...it\'s the plan."'),
    (745, '4 FLIP', 'Pull back to the low 3/4 hero; the gold bar streak whips across (real motion blur).'),
    (805, '4 FLIP', 'The left phone flips 360 degrees (speed ramp, motion blur).'),
    (836, '4 FLIP', 'Impact frame on the landing: navy/gold two-tone silhouette, 3 frames.'),
    (940, '4 FLIP', 'Both on Miran Gold, pulsing gold in sync. Left: first signal, Risk 1%, recovering +1.2%. "Trade with a plan..."'),
    (1100, '5 END', 'Soft blur to navy, gold particles, logo, gold CTA; risk disclaimer on screen 2.5s+.'),
    (1180, '5 END', 'Held last second.'),
]
W, H = 360, 640
cols = 8
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
