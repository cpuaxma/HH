"""Traces assets/logo-primary.png into vector paths for the reel.

Writes src/lib/logoTrace.ts with:
  LOGO_VIEWBOX   crop of the 1600px artboard around the artwork
  LOGO_RED       the red lettering ("hot pepper MEDIA") as SVG path data
  LOGO_INK       the black pepper outline as SVG path data
  PEPPER_OUTLINE the pepper's outer silhouette as an ordered list of points,
                 used as the shape of the route through the city

Needs: pip install potracer numpy pillow
Usage: python3 scripts/trace-logo.py ../assets/logo-primary.png src/lib/logoTrace.ts
"""
import json
import sys

import numpy as np
import potrace
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
SCALE = 2  # trace at 2x for smoother curves
im = Image.open(src).convert('RGB')
im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
a = np.asarray(im).astype(int)
R, G, B = a[..., 0], a[..., 1], a[..., 2]

ink = (R < 125) & (G < 125) & (B < 125)
red = (R > 140) & (G < 160) & (R - G > 60)

def dilate(mask, size):
    return np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(size))) > 0


# The letters sit on top of the pepper line: continue the line underneath the
# letters (where it runs into them), so there are no seams. Ink is drawn first.
ink_fill = ink | (red & dilate(ink, 9) & ~dilate(~ink & ~red, 5))


def to_path(mask, turdsize=30):
    # potracer traces the False pixels, so pass the inverse.
    bmp = potrace.Bitmap(~mask)
    plist = bmp.trace(turdsize=turdsize, alphamax=1.0, opticurve=True, opttolerance=0.2)
    parts = []
    for curve in plist:
        s = curve.start_point
        d = [f'M{s.x / SCALE:.2f} {s.y / SCALE:.2f}']
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f'L{seg.c.x / SCALE:.2f} {seg.c.y / SCALE:.2f}L{seg.end_point.x / SCALE:.2f} {seg.end_point.y / SCALE:.2f}')
            else:
                d.append(
                    f'C{seg.c1.x / SCALE:.2f} {seg.c1.y / SCALE:.2f} {seg.c2.x / SCALE:.2f} {seg.c2.y / SCALE:.2f} '
                    f'{seg.end_point.x / SCALE:.2f} {seg.end_point.y / SCALE:.2f}'
                )
        d.append('Z')
        parts.append(''.join(d))
    return ''.join(parts), plist


red_d, _ = to_path(red)
ink_d, _ = to_path(ink_fill, turdsize=8)

# Silhouette: everything the outside background can't reach.
# The pepper's outer silhouette, used as the route. The letters hide long
# stretches of the line, so the outline is defined by hand-placed points
# (clockwise from the base of the stem), each snapped onto the visible line
# when one is nearby, then joined by a centripetal Catmull-Rom spline.
GUIDE = [
    (1283, 205), (1300, 240), (1322, 300), (1332, 380), (1318, 450), (1290, 510), (1255, 560),
    (1212, 612), (1160, 662), (1100, 715), (1010, 770), (920, 815), (810, 862), (700, 900),
    (600, 930), (520, 945), (420, 960), (330, 955), (250, 945), (170, 928), (100, 905),
    (55, 880), (38, 850), (52, 824), (92, 810), (160, 803), (215, 799), (280, 795), (380, 775),
    (480, 738), (560, 698), (628, 652), (700, 580), (745, 522), (775, 485), (805, 430),
    (850, 330), (890, 262), (930, 205), (980, 152), (1030, 116), (1075, 100), (1112, 104),
    (1142, 130), (1175, 143), (1212, 148), (1245, 154), (1268, 143), (1292, 118), (1322, 88),
    (1350, 57), (1367, 40), (1384, 54), (1391, 80), (1376, 106), (1340, 137), (1302, 170), (1283, 205),
]
# Preview pixels → logo artboard pixels (the guide was drawn on a 2x preview of the viewBox crop).
guide = np.array([(430.5 + x * 0.515, 545.5 + y * 0.515) for x, y in GUIDE])

ys_i, xs_i = np.where(ink_fill)
ink_pts = np.stack([xs_i, ys_i], axis=1) / SCALE
snapped = []
for gx, gy in guide:
    d = np.hypot(ink_pts[:, 0] - gx, ink_pts[:, 1] - gy)
    k = d.argmin()
    snapped.append(tuple(ink_pts[k]) if d[k] < 9 else (gx, gy))
P = np.array(snapped)

def catmull(P, n=24, alpha=0.5):
    out = []
    Q = np.vstack([P[-2], P, P[1]])  # closed loop: wrap the ends
    for i in range(1, len(Q) - 2):
        p0, p1, p2, p3 = Q[i - 1], Q[i], Q[i + 1], Q[i + 2]
        t0 = 0
        t1 = t0 + np.linalg.norm(p1 - p0) ** alpha + 1e-6
        t2 = t1 + np.linalg.norm(p2 - p1) ** alpha + 1e-6
        t3 = t2 + np.linalg.norm(p3 - p2) ** alpha + 1e-6
        for t in np.linspace(t1, t2, n, endpoint=False):
            a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
            a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
            a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
            b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2
            b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
            out.append((t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2)
    out.append(P[-1])
    return np.array(out)

pts = catmull(P)
seg = np.hypot(*np.diff(pts, axis=0).T)
cum = np.concatenate([[0], np.cumsum(seg)])
L = cum[-1]
ts = np.arange(0, L, 4.0)
xs = np.interp(ts, cum, pts[:, 0])
ys = np.interp(ts, cum, pts[:, 1])
# Light circular smoothing to iron out small jogs from snapping.
kernel = np.array([1, 2, 3, 2, 1], float)
kernel /= kernel.sum()
for _ in range(2):
    xs = np.convolve(np.concatenate([xs[-3:-1], xs, xs[1:3]]), kernel, 'valid')
    ys = np.convolve(np.concatenate([ys[-3:-1], ys, ys[1:3]]), kernel, 'valid')

ys_ink, xs_ink = np.where(ink | red)
x0, y0 = xs_ink.min() / SCALE - 16, ys_ink.min() / SCALE - 16
x1, y1 = xs_ink.max() / SCALE + 16, ys_ink.max() / SCALE + 16

with open(out, 'w') as f:
    f.write('// Generated by scripts/trace-logo.py from assets/logo-primary.png. Do not edit by hand.\n')
    f.write('// Coordinates are in the 1600px logo artboard.\n\n')
    f.write(f'export const LOGO_VIEWBOX = {json.dumps([round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)])};\n\n')
    f.write(f'export const LOGO_RED =\n  {json.dumps(red_d)};\n\n')
    f.write(f'export const LOGO_INK =\n  {json.dumps(ink_d)};\n\n')
    f.write('/** Outer silhouette of the pepper (body + stem), clockwise from the base of the stem, as [x, y] pairs. */\n')
    flat = [[round(float(x), 1), round(float(y), 1)] for x, y in zip(xs, ys)]
    f.write(f'export const PEPPER_OUTLINE: [number, number][] = {json.dumps(flat)};\n')
print('red path chars', len(red_d), 'ink path chars', len(ink_d), 'outline pts', len(xs), 'length px', round(L))
print('viewbox', x0, y0, x1 - x0, y1 - y0)
