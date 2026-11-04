"""Captioned storyboard sheet: python3 scripts/storyboard.py out.png DIR (stills named frame-NNNN.png)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, d = sys.argv[1], sys.argv[2]
SHOTS = [
    (110, '1 HOOK', 'Wide two-shot: both phones at $10,000, the same gold chart. "Same gold. Same day."'),
    (150, '1 HOOK', '"Two different results." Scoreboards under the phones: X no plan / check with Miran Gold (illustrative).'),
    (216, '2 ENTRY', 'Left: a Sell/Buy ticket, 3.00 lots, "no plan, no alerts" - Buy gets tapped. Right: the Miran signal card builds.'),
    (300, '2 ENTRY', '"Both bought gold." Left: Buy 3.00 lots, STOP LOSS: NONE. Right: entry 4,002, SL 3,997, target 4,012, risk 1%.'),
    (470, '2 ENTRY', 'Gold drifts up. The left looks great (+$2,000 open) while the right is up +$100: the temptation.'),
    (545, '3 WARNING', 'Camera favours the right: the Miran market update - high-impact USD news in 10 min, take profit now.'),
    (640, '3 WARNING', 'Profit taken: +$140, the right board turns green ($10,140). The left is still holding, no alerts.'),
    (740, '4 NEWS', '"Then the news hit." Heartbeat under the calm.'),
    (770, '4 NEWS', 'The same news candle hits both charts on the same frame: jolt + push. The left screen floods red.'),
    (830, '4 NEWS', 'Left: MARGIN CALL, -$4,800, board $5,200 (-48%). Right: PROTECTED, profit kept +$140.'),
    (900, '5 PAYOFF', 'Slow pull back, both results side by side. "It isn\'t luck..."'),
    (1000, '5 PAYOFF', '"...it\'s the plan." (cover frame)'),
    (1088, '6 SWITCH', 'Boards fade; low 3/4 hero. A gold bar streaks across (real motion blur).'),
    (1140, '6 SWITCH', 'The left phone flips 360 degrees: the back, camera plateau and three lenses.'),
    (1166, '6 SWITCH', 'Impact frame on the landing: navy/gold two-tone, 3 frames.'),
    (1240, '6 SWITCH', 'Left now connected to Miran Gold (its $5,200 stays: no magic recovery). "Trade with a plan with Miran Gold."'),
    (1430, '7 END', 'Navy, gold particles, logo, gold CTA; risk disclaimer on screen 3.5s+.'),
    (1545, '7 END', 'Held last second.'),
]
W, H = 360, 640
cols = 9
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
