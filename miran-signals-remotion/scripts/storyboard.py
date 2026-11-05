"""Captioned storyboard sheet: python3 scripts/storyboard.py out.png DIR (stills named frame-NNNN.png)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, d = sys.argv[1], sys.argv[2]
SHOTS = [
    (60, '1 HOOK', '"Two traders. The same gold." Both phones at $10,000. Scoreboards: X no plan / check with Miran Gold.'),
    (130, '1 HOOK', '"Two different results."'),
    (270, '2 BOTH BUY', '"Both bought gold." Left: Buy gold - NO STOP LOSS, no limit on the loss. Right: Miran signal - with a stop loss, small risk (1%).'),
    (420, '2 GOLD RISES', '"Gold rises... and both are winning." The left balance climbs fast (green) - the temptation.'),
    (548, '3 THE ALERT', '"Miran Gold warned: big news coming." Right: Miran Gold alert, big news in 10 min - take profit now. Left dims.'),
    (652, '3 THE ALERT', '"So it took its profit before the news." Right: +$140, out before the news. Left still holding.'),
    (772, '4 THE NEWS', '"Then the news came out... and gold dropped." Same candle on both charts. Left floods red, balance crashing.'),
    (850, '4 THE NEWS', 'Left: A BIG LOSS -$4,800, you lost almost half your balance. Right: PROTECTED, profit kept.'),
    (905, '5 THE LESSON', '"The difference isn\'t luck... it\'s the plan." Boards: $5,200 (-48%) vs $10,140 (+1.4%).'),
    (1040, '5 THE LESSON', '"The plan: a stop loss + an alert before the news." (the one thing to learn)'),
    (1290, '6 SWITCH', 'After the streak and the flip, the left is connected to Miran Gold. "Trade with a plan with Miran Gold."'),
    (1480, '7 END', 'Logo, "Miran Gold", gold CTA, risk disclaimer.'),
]
W, H = 360, 640
cols = 6
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
