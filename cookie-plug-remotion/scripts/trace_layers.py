"""Split the poster into animation layers and vectorize each one with potrace.

Input : art/source.jpg (the original 736x863 poster)
Output: src/art/layers.json (absolute SVG path data in poster pixel units)
        art/debug_layers.png (colour-coded layer map, for checking the split)

Run: python3 scripts/trace_layers.py
"""

import json
import os
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "art", "source.jpg")
OUT_JSON = os.path.join(ROOT, "src", "art", "layers.json")
OUT_DEBUG = os.path.join(ROOT, "art", "debug_layers.png")

UP = 4  # trace at 4x so potrace curves stay smooth at 1080 wide

# ---------------------------------------------------------------- ink mask
img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
H0, W0 = img.shape[:2]
# Thin JPEG lines come out greyish-navy, so key on darkness of the red/green channels
# (paper is ~250). The grey Instagram mute icon in the corner is masked out.
ink = np.clip((235 - (img[..., 0] + img[..., 1]) / 2) / 140.0, 0, 1)
ink[760:, 640:] = 0
ink_up = np.asarray(
    Image.fromarray(ink, mode="F").resize((W0 * UP, H0 * UP), Image.BICUBIC)
)
B = ink_up > 0.5
H, W = B.shape
ys, xs = np.mgrid[0:H, 0:W]
X = (xs + 0.5) / UP  # poster pixel coords
Y = (ys + 0.5) / UP


def disk(r):
    r = int(round(r * UP))
    yy, xx = np.mgrid[-r : r + 1, -r : r + 1]
    return xx * xx + yy * yy <= r * r


def box(x0, y0, x1, y1):
    return (X >= x0) & (X < x1) & (Y >= y0) & (Y < y1)


def poly(points):
    """Rasterize a polygon given in poster coords to a mask at trace resolution."""
    from PIL import ImageDraw

    im = Image.new("1", (W, H), 0)
    ImageDraw.Draw(im).polygon([(x * UP, y * UP) for x, y in points], fill=1)
    return np.asarray(im, dtype=bool)


labels, n = ndi.label(B, structure=np.ones((3, 3)))
objs = ndi.find_objects(labels)
areas = ndi.sum(np.ones_like(labels), labels, index=np.arange(1, n + 1))

layer = np.zeros((H, W), dtype=np.int32)  # 0 = unassigned
NAMES = {}


def assign(name, mask):
    idx = NAMES.setdefault(name, len(NAMES) + 1)
    m = mask & B & (layer == 0)
    layer[m] = idx
    return m


def comp_info(i):
    sl = objs[i - 1]
    y0, y1 = sl[0].start / UP, sl[0].stop / UP
    x0, x1 = sl[1].start / UP, sl[1].stop / UP
    return x0, y0, x1, y1


# Drop specks (stray dots in the scan) — anything under ~8 poster px².
for i in range(1, n + 1):
    if areas[i - 1] < 8 * UP * UP:
        x0, y0, x1, y1 = comp_info(i)
        # keep cookie chips (they sit inside the panel) — they are bigger than this anyway
        B[labels == i] = False

# ---------------------------------------------------------------- typography
# Letters are re-labelled inside their own bands so the hat crown (which touches the bottom of
# "LOCAL") and the shoes (which touch the tops of "KI") can't merge them into the drawing.
hat_touch = box(350, 118, 452, 140)
headline_zone = box(160, 20, 625, 131) & ~(hat_touch & (Y >= 127.6))
# Where the crown line meets the letter bottoms, keep only ink that belongs to something tall
# (a vertical opening removes the thin crown line and its slivers between letters).
touch_band = box(340, 82, 462, 131)
tall = ndi.binary_opening(B & headline_zone & touch_band, structure=np.ones((int(6 * UP), 1)))
touch_band &= Y >= 122
headline_zone &= ~box(368.2, 119, 380, 131)  # crown corner spur on the R leg
headline_zone &= ~(touch_band & ~tall)
title_zone = box(175, 647.2, 600, 796)
# A few neighbouring letters touch in the scan: "R|L" in YOUR LOCAL and "K|I" in COOKIE.
cuts = (box(0, 82, 380, 131) & box(379.5, 0, 999, 999)) | (box(0, 647, 488.5, 716) & box(488, 0, 999, 999))
headline_zone &= ~cuts
title_zone &= ~cuts
letters = {"SUPPORT": [], "YOUR": [], "LOCAL": [], "COOKIE": [], "DEALER": []}
for zone in (headline_zone, title_zone):
    lab, k = ndi.label(B & zone, structure=np.ones((3, 3)))
    for i in range(1, k + 1):
        mm = lab == i
        if mm.sum() < 20 * UP * UP:
            continue
        cy, cx = Y[mm].mean(), X[mm].mean()
        if cy < 82:
            word = "SUPPORT"
        elif cy < 131:
            word = "YOUR" if cx < 380 else "LOCAL"
        else:
            word = "COOKIE" if cy < 716 else "DEALER"
        letters[word].append(mm)

for word, ms in letters.items():
    for j, mm in enumerate(sorted(ms, key=lambda q: X[q].min())):
        assign(f"{word}_{j}", mm)

# The hat crown sliver left under the letters belongs to the hat (handled below).
char_zone = box(195, 126.6, 565, 647.2) & (layer == 0)

# ---------------------------------------------------------------- shoes (filled blobs)
shoe_zone = box(300, 600, 530, 650)
blob = ndi.binary_opening(B & shoe_zone, structure=disk(4))
blob = ndi.binary_dilation(blob, structure=disk(1.5))
assign("shoe_left", blob & (X < 435) & (Y >= 604))
assign("shoe_right", blob & (X >= 435) & (Y >= 604))

# ---------------------------------------------------------------- sunglasses (filled blob)
g_zone = box(312, 186, 442, 246)
gblob = ndi.binary_opening(B & g_zone, structure=disk(4))
gblob = ndi.binary_dilation(gblob, structure=disk(1.5))
assign("glasses", gblob & g_zone)

# ---------------------------------------------------------------- hat
# The lower brim line runs almost straight from (296,179.5) to (490,187.5); the hat is
# everything above it. Over the ear the brim only goes down to y=183.5.
brim_bottom = 179.5 + (X - 296) * (8 / 194)
brim_bottom = np.where((X > 440) & (X < 470), np.minimum(brim_bottom, 183.5), brim_bottom)
hat_mask = box(290, 126.6, 498, 192) & (Y <= brim_bottom) & char_zone
assign("hat", hat_mask)

# ---------------------------------------------------------------- head (+ brows)
head_poly = poly(
    [(296, 160), (478, 160), (478, 240), (442.5, 240), (442.5, 300.2), (296, 300.2)]
)
head_zone = head_poly & char_zone & (layer == 0)
# Brows: the two little strokes between brim and lenses.
for i in range(1, n + 1):
    x0, y0, x1, y1 = comp_info(i)
    if x0 > 338 and x1 < 428 and y0 > 178 and y1 < 194:
        assign("brows", labels == i)
assign("head", head_zone)

# ---------------------------------------------------------------- cookies
# Rings are sometimes broken into several pieces, so cluster every small piece in the cookie
# field around the 11 cookie centres measured off the poster (reading order).
CENTRES = [(258, 375), (292, 375), (246, 416), (281, 419), (314, 420), (246, 459),
           (285, 464), (324, 468), (248, 502), (289, 507), (331, 514)]
groups = [np.zeros_like(B) for _ in CENTRES]
field = box(229, 352, 352, 532) & (layer == 0)
lab, k = ndi.label(B & field, structure=np.ones((3, 3)))
for i, sl in enumerate(ndi.find_objects(lab), start=1):
    w = (sl[1].stop - sl[1].start) / UP
    h = (sl[0].stop - sl[0].start) / UP
    if w > 44 or h > 44:
        continue  # panel outline / hand, not a cookie
    m = lab == i
    cx, cy = X[m].mean(), Y[m].mean()
    dist = [np.hypot(cx - a, cy - b) for a, b in CENTRES]
    j = int(np.argmin(dist))
    if dist[j] < 22:
        groups[j] |= m
cookies = []
for j, m in enumerate(groups):
    assign(f"cookie_{j}", m)
    cookies.append((float(X[m].mean()), float(Y[m].mean())))

# ---------------------------------------------------------------- cookie panel (open left coat half)
arm = poly([(305, 350), (360, 316), (366, 316), (366, 395), (352, 395), (305, 366)])
assign("panel", box(200, 296, 349.5, 572) & ~arm & char_zone)

# ---------------------------------------------------------------- right coat flap
flap = poly(
    [
        (442.5, 240), (478, 240), (478, 252), (562, 252), (562, 556.5),
        (420.5, 556.5), (420.5, 360), (400, 360), (400, 326), (421, 326),
        (421, 300.2), (442.5, 300.2),
    ]
)
assign("flap", flap & char_zone)

# ---------------------------------------------------------------- everything else = body
assign("body", char_zone)
# Slivers of the COOKIE letter tops that poke above the band cut are not part of the drawing.
blab, bk = ndi.label(layer == NAMES["body"], structure=np.ones((3, 3)))
for i, sl in enumerate(ndi.find_objects(blab), start=1):
    if sl[0].start / UP > 640:
        layer[blab == i] = 0

# ---------------------------------------------------------------- potrace + path flattening
NUM = r"-?\d+(?:\.\d+)?"


def potrace_paths(mask):
    """Trace a boolean mask; return a list of subpaths (absolute coords, poster units)."""
    with tempfile.TemporaryDirectory() as td:
        pbm = os.path.join(td, "l.pbm")
        svg = os.path.join(td, "l.svg")
        Image.fromarray(np.where(mask, 0, 255).astype(np.uint8)).convert("1").save(pbm)
        subprocess.run(
            ["potrace", pbm, "-s", "-o", svg, "-t", "6", "-a", "1.0", "-O", "0.3"],
            check=True,
        )
        text = open(svg).read()
    tr = re.search(r'translate\((%s),(%s)\) scale\((%s),(%s)\)' % (NUM, NUM, NUM, NUM), text)
    tx, ty, sx, sy = map(float, tr.groups())

    def P(x, y):
        return ((tx + sx * x) / UP, (ty + sy * y) / UP)

    subpaths = []
    for d in re.findall(r'<path d="([^"]+)"', text):
        toks = re.findall(r"[MmLlCcZz]|%s" % NUM, d)
        i = 0
        cur = (0.0, 0.0)
        start = (0.0, 0.0)
        cmd = None
        out = []
        while i < len(toks):
            t = toks[i]
            if t in "MmLlCcZz":
                cmd = t
                i += 1
                if cmd in "Zz":
                    out.append("Z")
                    cur = start
                    subpaths.append(out)
                    out = []
                continue
            if cmd in "Mm":
                x, y = float(toks[i]), float(toks[i + 1])
                i += 2
                cur = (x, y) if cmd == "M" else (cur[0] + x, cur[1] + y)
                start = cur
                if out:
                    subpaths.append(out)
                out = [("M", [cur])]
                cmd = "L" if cmd == "M" else "l"
            elif cmd in "Ll":
                x, y = float(toks[i]), float(toks[i + 1])
                i += 2
                cur = (x, y) if cmd == "L" else (cur[0] + x, cur[1] + y)
                out.append(("L", [cur]))
            elif cmd in "Cc":
                v = [float(t) for t in toks[i : i + 6]]
                i += 6
                if cmd == "c":
                    pts = [(cur[0] + v[0], cur[1] + v[1]), (cur[0] + v[2], cur[1] + v[3]),
                           (cur[0] + v[4], cur[1] + v[5])]
                else:
                    pts = [(v[0], v[1]), (v[2], v[3]), (v[4], v[5])]
                cur = pts[2]
                out.append(("C", pts))
        if out:
            subpaths.append(out)

    def fmt(sp):
        s = []
        for seg in sp:
            if seg == "Z":
                s.append("Z")
                continue
            c, pts = seg
            s.append(c + " ".join("%.2f %.2f" % P(*p) for p in pts))
        return "".join(s)

    return [fmt(sp) for sp in subpaths if len(sp) > 1]


# ---------------------------------------------------------------- paper-coloured fills
# Solid silhouettes (not ink) so moving parts can hide what's behind them: the hat falls behind
# the headline, and the coat panel swings over the torso.
def silhouette(mask):
    m = ndi.binary_closing(mask, structure=disk(1.5))
    return ndi.binary_fill_holes(m)


cookie_ink = np.isin(layer, [NAMES[f"cookie_{j}"] for j in range(len(CENTRES))])
fills = {
    "hat_fill": silhouette(layer == NAMES["hat"]),
    # close the panel along the hinge so it fills
    "panel_fill": silhouette((layer == NAMES["panel"]) | cookie_ink | box(347.4, 301, 349.6, 562)),
}

result = {"width": W0, "height": H0, "layers": {}, "fills": {}}
for name, m in fills.items():
    result["fills"][name] = "".join(potrace_paths(m))
debug = np.full((H, W, 3), 250, dtype=np.uint8)
rng = np.random.default_rng(3)
for name, idx in NAMES.items():
    m = layer == idx
    if m.sum() == 0:
        continue
    debug[m] = rng.integers(20, 220, 3)
    yy, xx = np.nonzero(m)
    subs = potrace_paths(m)
    result["layers"][name] = {
        "d": "".join(subs),
        "subpaths": subs,
        "bbox": [xx.min() / UP, yy.min() / UP, (xx.max() + 1) / UP, (yy.max() + 1) / UP],
    }
result["cookieCenters"] = cookies

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, "w") as f:
    json.dump(result, f)
for name, m in fills.items():
    debug[m & (layer == 0)] = (255, 225, 200)
Image.fromarray(debug).resize((W0 * 2, H0 * 2), Image.NEAREST).save(OUT_DEBUG)
print("layers:", ", ".join(f"{k}({len(v['subpaths'])})" for k, v in result["layers"].items()))
print("cookies:", len(cookies))
