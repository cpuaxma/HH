"""Captioned storyboard for the copy trading reel:
  python3 scripts/storyboard-copy.py out.png DIR   (stills named frame-NNNN.png, from
  COMP=MiranCopyTrading node scripts/stills.mjs DIR 0.5 <frames below>)."""
import sys
from PIL import Image, ImageDraw, ImageFont

out, d = sys.argv[1], sys.argv[2]
SHOTS = [
    (150, '1 HOOK', '"What is automatic copy trading?" The diagram: Miran Gold -> copies -> your account.'),
    (420, '2 CONNECT', 'Tap "connect": your (generic) trading account linked to Miran Gold. Board: linked, copying off.'),
    (600, '3 SETTINGS', 'Drag the copy ratio x1.0 -> x0.5 (placeholder). Note: copying does not remove risk.'),
    (700, '3 SETTINGS', 'Risk per trade 2% -> 1%, daily loss limit 3% on (placeholders), then save.'),
    (1040, '4 AUTO COPY', 'Tap the big switch: automatic copy trading ON. Chips: x0.5, risk 1%, daily 3%.'),
    (1250, '5 SIGNAL', 'Gold signal from Miran Gold: buy, entry 4,002 / SL 3,997 / TP 4,012. "Copied automatically".'),
    (1430, '6 NEWS ALERT', 'High-impact news in 15 min. The plan: close before the news, copied to your account.'),
    (1520, '6 CLOSED BY PLAN', 'Closed by plan, copied. Result +$70 (placeholder) - "can be a profit or a loss".'),
    (1590, '6 THE RELEASE', 'The news hits the chart; no open trade. Island: news released, no open trades.'),
    (1760, '7 IN CONTROL', 'Switch OFF: paused, no new signals copied. Board: paused.'),
    (1860, '7 IN CONTROL', 'Switch ON again: copying active.'),
    (2160, '8 END', 'Wordmark, "Signals - news alerts - auto copy", CTA, risk disclaimer.'),
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
