#!/usr/bin/env python3
"""Café Mate "Pick your vibe" reel: a reusable edit script.

    python3 edit.py [INPUT.mov]

Pipeline (in this order):
    tone-map HDR -> speed ramp (+ minterpolate) -> face blur -> focus/grade
    -> drink names -> hook -> logo end card -> encode (H.264 + retimed AAC)

Everything you are likely to change lives in the VARIABLES block below.
Cup positions and timings are detected from the real frames at run time
(the values below are starting guesses / fallbacks) and printed in the log.
"""

# =============================================================================
# VARIABLES
# =============================================================================

# ---- Files ------------------------------------------------------------------
INPUT        = "input.mov"            # overridden by the first CLI argument
OUTPUT       = "cafe_mate_edit.mp4"
REVIEW_DIR   = "review"               # review stills are written here
WORK_DIR     = ".work"                # cached intermediates (safe to delete)
LOGO_PATH    = "logo.png"             # used if it exists, else a placeholder

FONT_DIR     = "fonts"
FONT_NAME    = "Montserrat_600SemiBold.ttf"   # drink names + end-card lines
FONT_HOOK    = "Montserrat_700Bold.ttf"       # hook text
FONT_LOGO    = "Montserrat_800ExtraBold.ttf"  # placeholder logo wordmark
FONT_FALLBACK_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_FALLBACK_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_EMOJI   = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

# ---- Output -----------------------------------------------------------------
OUT_W, OUT_H, FPS = 1080, 1920, 30
CRF          = 17
X264_PRESET  = "slow"
AUDIO_BITRATE = "192k"
MAX_LENGTH   = 12.0                   # seconds, hard limit

# ---- HDR -> SDR (iPhone HLG / Dolby Vision clips) ---------------------------
TONEMAP      = "hable"                # used only when the source is HDR
TONEMAP_NPL  = 203                    # nominal peak luminance for HLG

# ---- Cups (src = seconds in the ORIGINAL clip) --------------------------------
REF_TIME     = 9.5                    # a clean frame of the final 3-cup row
SINGLE_TIME  = 2.0                    # a clean frame of the single opening cup
CUPS = [  # left -> right in the 3-cup shot; x = starting guess, refined from frames
    {"name": "Mocha Cloud",  "x": 340},
    {"name": "Pink Velvet",  "x": 560},
    {"name": "Mango Breeze", "x": 725},
]
SINGLE_CUP   = {"name": "Mocha Cloud", "x": 540}
LANDING_CUPS = [1, 2]                 # cups the barista brings in (the "third cup lands" = last of these)
CUP_Y_RANGE        = (790, 1130)      # lid top .. cup bottom, 3-cup shot
SINGLE_CUP_Y_RANGE = (770, 1135)      # lid top .. cup bottom, opening cup
COUNTER_EDGE_Y     = 1170
CUP_SEED_Y   = 925                    # row used to sample each drink's colour
CUP_BAND     = (900, 1090)            # rows used to measure each cup's width
CUP_COLOR_TOL = 38                    # Lab distance for the colour segmentation
SETTLE_DIFF   = 6.0                   # max mean diff vs reference = "in place"
SETTLE_MOTION = 2.5                   # max frame-to-frame diff = "still"
SETTLE_FRAMES = 3                     # must stay still this many frames
MOVE_MOTION   = 2.0                   # frame-to-frame diff around the opening cup that
MOVE_FRAMES   = 3                     #   counts as "being picked up" (for this many frames)

# ---- Speed ramp (output seconds unless noted) --------------------------------
SPEED_FAST   = 1.5                    # placing / arranging
SPEED_SLOW   = 0.7                    # slow-mo as the third cup lands
SPEED_NORMAL = 1.0
RAMP_DOWN    = 0.4                    # ease 1.5x -> 0.7x
SLOW_HOLD    = 1.0                    # hold slow-mo
RAMP_UP      = 0.3                    # ease 0.7x -> 1x
SLOW_LEAD    = 0.15                   # src s before the landing at which 0.7x is reached
SRC_END      = 10.0                   # src s where the live footage ends (end card follows)
INTERP_FPS   = 120                    # minterpolate rate for the motion section
INTERP_PAD   = 0.3                    # src s of padding around the motion section
AUDIO_CMD_STEP = 0.04                 # src s between atempo updates in the ramps

# ---- 1. Face blur ------------------------------------------------------------
BLUR_SIGMA   = 25
BLUR_BOTTOM  = 720                    # blur is fully gone by this row
BLUR_FEATHER = 80                     # fades out over the 80 rows above BLUR_BOTTOM
BLUR_CHECK_SRC = [3.0, 5.0, 7.0]      # src seconds exported as blur-check stills

# ---- 2. Focus + grade --------------------------------------------------------
FOCUS_BRIGHTNESS = 0.15
FOCUS_CONTRAST   = 0.10
FOCUS_SATURATION = 0.15
FOCUS_PAD_X      = 45                 # mask padding around each cup
FOCUS_PAD_Y      = 45
FOCUS_FEATHER    = 40                 # gaussian sigma of the mask edge
VIGNETTE_AMOUNT  = 0.22               # how much darker the rest of the frame gets
VIGNETTE_PAD     = (170, 170)         # inner clear zone around the cups
VIGNETTE_FEATHER = 160
WARM_GAIN        = (1.035, 1.00, 0.95) # R, G, B multipliers (multiplicative -> blacks stay black)
BLACK_POINT      = 0.012              # small black clip so the marble stays deep

# ---- 3. Drink names ----------------------------------------------------------
NAME_SIZE    = 34
NAME_Y       = 1152                   # centre of the name block (sits just above the counter edge)
NAME_STACK   = "auto"                 # "auto": two lines when neighbouring names would touch; True/False to force
NAME_LINE_HEIGHT = 34
NAME_MIN_GAP = 16                     # px between neighbouring names before stacking kicks in
NAME_COLOR   = (255, 255, 255)
NAME_SHADOW  = dict(offset=(0, 2), blur=3, opacity=0.70)
NAME_FADE    = 0.3
SINGLE_NAME_IN = 0.30                 # output s; the opening cup is still from frame 0
SINGLE_NAME_OUT_FADE = 0.2            # fades out just before the cup is picked up

# ---- 4. Hook -----------------------------------------------------------------
HOOK_TEXT    = "Pick your vibe"
HOOK_EMOJI   = "\U0001F447"           # 👇 (set to "" to drop it)
HOOK_SIZE    = 64
HOOK_Y       = 350
HOOK_START   = 0.0
HOOK_END     = 2.0                    # fully faded out at this output time
HOOK_POP     = 0.25                   # scale 90 -> 100 %
HOOK_SCALE_FROM = 0.90
HOOK_FADE_OUT = 0.25
HOOK_SHADOW  = dict(offset=(0, 4), blur=10, opacity=0.65)

# ---- 6. End card -------------------------------------------------------------
END_DURATION = 1.5
END_ZOOM     = (1.00, 1.06)
END_ZOOM_CENTER = (540, 980)
END_DARKEN   = 0.30
END_DARKEN_IN = 0.30
LOGO_Y       = 600
LOGO_SIZE    = 300                    # diameter (placeholder) / max box (logo.png)
LOGO_FADE_IN = (0.10, 0.45)           # start, duration (end-card seconds)
BRAND_GREEN  = "#1E7A3C"
LOGO_WORDS   = ("CAFÉ", "MATE")
END_LINE1    = "Now serving"
END_LINE2    = "@cafemate.lb"
END_TEXT_SIZE = 40
END_TEXT_GAP = 58                     # first line sits this far below the logo
END_LINE_SPACING = 54
END_TEXT_FADE_IN = (0.30, 0.40)
END_SCRIM    = 0.40                   # extra soft darkening behind the logo + lines
END_SCRIM_SIZE = (330, 300)           # ellipse half-axes
FADE_TO_BLACK = 0.3

# ---- 7. Platform safe zone ----------------------------------------------------
SAFE_BOTTOM  = 300                    # keep text above OUT_H - SAFE_BOTTOM
SAFE_RIGHT   = 150                    # keep text left of OUT_W - SAFE_RIGHT

# ---- Review stills (output seconds; None = picked automatically) --------------
STILL_HOOK   = 0.6
STILL_NAMES  = None                   # last live frame
STILL_END    = None                   # just before the fade to black

# =============================================================================
# END OF VARIABLES
# =============================================================================

import json
import math
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))


def P(path):
    return path if os.path.isabs(path) else os.path.join(HERE, path)


def log(*a):
    print("[edit]", *a, flush=True)


def run(cmd, **kw):
    subprocess.run(cmd, check=True, **kw)


# ----------------------------------------------------------------------------- io
def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path],
        check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def make_sdr(src, dst):
    """Tone-map (if HDR), scale to the output size and cache as a near-lossless file."""
    info = probe(src)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    trc = v.get("color_transfer", "")
    hdr = trc in ("arib-std-b67", "smpte2084")
    tin = trc if hdr else "bt709"
    chain = []
    if hdr:
        chain += [f"zscale=tin={tin}:min={v.get('color_space', 'bt2020nc')}:pin={v.get('color_primaries', 'bt2020')}"
                  f":rin=tv:t=linear:npl={TONEMAP_NPL}",
                  "format=gbrpf32le", "zscale=p=bt709", f"tonemap={TONEMAP}:desat=0",
                  "zscale=t=bt709:m=bt709:r=tv"]
    chain += [f"scale={OUT_W}:{OUT_H}:force_original_aspect_ratio=increase",
              f"crop={OUT_W}:{OUT_H}", f"fps={FPS}", "format=yuv420p"]
    log(f"source {v['width']}x{v['height']} {v.get('codec_name')} trc={trc or '?'} "
        f"-> {'tone-mapping HDR' if hdr else 'SDR'}")
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", ",".join(chain), "-an",
         "-c:v", "libx264", "-preset", "fast", "-crf", "10",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", dst])


def read_frames(path, vf=None):
    """Decode a file to a list of BGR uint8 frames with an explicit BT.709 matrix."""
    chain = ([vf] if vf else []) + ["scale=in_color_matrix=bt709:in_range=tv", "format=bgr24"]
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", ",".join(chain),
                          "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    n = OUT_W * OUT_H * 3
    frames = []
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        frames.append(np.frombuffer(buf, np.uint8).reshape(OUT_H, OUT_W, 3))
    p.wait()
    return frames


# ------------------------------------------------------------------- detection
def refine_cup(img, cx, seed_y=None, band=None):
    """Segment a cup by its drink colour around a seed point; returns centre/left/right."""
    seed_y = seed_y or CUP_SEED_Y
    band = band or CUP_BAND
    lab = cv2.cvtColor(cv2.GaussianBlur(img, (0, 0), 2), cv2.COLOR_BGR2LAB).astype(np.float32)
    seed = np.median(lab[seed_y - 10:seed_y + 10, cx - 15:cx + 15].reshape(-1, 3), 0)
    m = (np.linalg.norm(lab - seed, axis=2) < CUP_COLOR_TOL).astype(np.uint8)
    m[:band[0]] = 0
    m[band[1]:] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    _, lbl, _, _ = cv2.connectedComponentsWithStats(m)
    k = lbl[seed_y, cx]
    if k == 0:
        return None
    occ = (lbl[band[0]:band[1]] == k).mean(0)
    xs = np.where(occ > 0.4)[0]
    if len(xs) < 60:
        return None
    return {"x": int((xs[0] + xs[-1]) // 2), "L": int(xs[0]), "R": int(xs[-1])}


def region_diff(a, b, cx, half=55, y0=920, y1=1090):
    return float(np.abs(a[y0:y1, cx - half:cx + half].astype(np.int16)
                        - b[y0:y1, cx - half:cx + half].astype(np.int16)).mean())


def settle_frame(frames, cx, ref_idx):
    """First frame from which the cup matches the reference and is still."""
    ref = frames[ref_idx]
    dref = np.array([region_diff(frames[i], ref, cx) for i in range(ref_idx + 1)])
    mot = np.array([0.0] + [region_diff(frames[i], frames[i - 1], cx) for i in range(1, ref_idx + 1)])
    ok_tail = np.flip(np.minimum.accumulate(np.flip(dref < SETTLE_DIFF)))  # true from here to ref
    for f in range(1, ref_idx - SETTLE_FRAMES):
        if ok_tail[f] and (mot[f:f + SETTLE_FRAMES] < SETTLE_MOTION).all():
            return f
    return ref_idx


def detect(frames):
    ref_idx = min(int(round(REF_TIME * FPS)), len(frames) - 1)
    one_idx = min(int(round(SINGLE_TIME * FPS)), len(frames) - 1)
    cups = []
    for c in CUPS:
        r = refine_cup(frames[ref_idx], c["x"])
        cups.append({**c, **(r or {"L": c["x"] - 80, "R": c["x"] + 80}),
                     "detected": r is not None})
        if r:
            cups[-1]["x"] = r["x"]
    r = refine_cup(frames[one_idx], SINGLE_CUP["x"])
    single = {**SINGLE_CUP, **(r or {"L": SINGLE_CUP["x"] - 100, "R": SINGLE_CUP["x"] + 100}),
              "detected": r is not None}
    if r:
        single["x"] = r["x"]

    # When the opening cup gets picked up: sustained motion around it.
    mot = [region_diff(frames[i], frames[i - 1], single["x"], half=150, y0=780, y1=1140)
           for i in range(1, ref_idx + 1)]
    move_f = next((i + 1 for i in range(one_idx, ref_idx - MOVE_FRAMES)
                   if min(mot[i:i + MOVE_FRAMES]) > MOVE_MOTION), one_idx)
    for c in cups:
        c["settle_src"] = settle_frame(frames, c["x"], ref_idx) / FPS
    t_land = max(cups[i]["settle_src"] for i in LANDING_CUPS)
    t_all = max(c["settle_src"] for c in cups)
    return cups, single, move_f / FPS, t_land, t_all


# ---------------------------------------------------------------- speed ramp
def ease(a, b, p):
    p = min(max(p, 0.0), 1.0)
    return a + (b - a) * (1 - math.cos(math.pi * p)) / 2


def build_timemap(t_land):
    """Speed as a function of output time; returns (u_grid, src_grid, phases)."""
    slow_src = t_land - SLOW_LEAD                       # src time at which 0.7x is reached
    ramp_src = RAMP_DOWN * (SPEED_FAST + SPEED_SLOW) / 2
    u1 = (slow_src - ramp_src) / SPEED_FAST
    if u1 <= 0:
        raise SystemExit("ramp starts before the clip; lower SLOW_LEAD/RAMP_DOWN")
    u2 = u1 + RAMP_DOWN
    u3 = u2 + SLOW_HOLD
    u4 = u3 + RAMP_UP

    def speed(u):
        if u < u1:
            return SPEED_FAST
        if u < u2:
            return ease(SPEED_FAST, SPEED_SLOW, (u - u1) / RAMP_DOWN)
        if u < u3:
            return SPEED_SLOW
        if u < u4:
            return ease(SPEED_SLOW, SPEED_NORMAL, (u - u3) / RAMP_UP)
        return SPEED_NORMAL

    du = 1.0 / 6000
    us = np.arange(0, 30, du)
    sp = np.array([speed(u) for u in us])
    src = np.concatenate([[0.0], np.cumsum((sp[1:] + sp[:-1]) / 2 * du)])
    keep = src <= SRC_END + 1e-9
    us, src, sp = us[keep], src[keep], sp[keep]
    return us, src, sp, (u1, u2, u3, u4)


# ------------------------------------------------------------ frame sampling
class Sampler:
    def __init__(self, frames, interp, i0):
        self.frames, self.interp, self.i0 = frames, interp, i0
        self.t0 = i0 / FPS
        self.t1 = self.t0 + (len(interp) - 1) / INTERP_FPS if interp else -1

    def get(self, t, speed):
        if self.interp and self.t0 <= t <= self.t1:
            k = int(round((t - self.t0) * INTERP_FPS))
            return self.interp[min(k, len(self.interp) - 1)].astype(np.float32) / 255
        f = t * FPS
        i = int(math.floor(f))
        frac = f - i
        n = len(self.frames) - 1
        a = self.frames[min(i, n)]
        if abs(speed - 1) < 0.01 or frac < 0.2:          # 1x: always a whole frame
            return (self.frames[min(int(round(f)), n)] if abs(speed - 1) < 0.01 else a
                    ).astype(np.float32) / 255
        b = self.frames[min(i + 1, n)]
        if frac > 0.8:
            return b.astype(np.float32) / 255
        return (a.astype(np.float32) * (1 - frac) + b.astype(np.float32) * frac) / 255


# -------------------------------------------------------------------- effects
def blur_alpha():
    y = np.arange(OUT_H, dtype=np.float32)
    top = BLUR_BOTTOM - BLUR_FEATHER
    a = np.clip((BLUR_BOTTOM - y) / BLUR_FEATHER, 0, 1)
    a = a * a * (3 - 2 * a)                               # smoothstep feather
    a[y < top] = 1
    return a[:, None, None]


def apply_blur(img, alpha):
    rows = min(OUT_H, BLUR_BOTTOM + 3 * BLUR_SIGMA)
    top = img[:rows]
    blurred = cv2.GaussianBlur(top, (0, 0), BLUR_SIGMA, borderType=cv2.BORDER_REFLECT)
    a = alpha[:rows]
    out = img.copy()
    out[:rows] = top * (1 - a) + blurred * a
    return out


def ellipse_mask(centers, feather):
    m = np.zeros((OUT_H, OUT_W), np.float32)
    for (cx, cy, ax, ay) in centers:
        cv2.ellipse(m, (int(cx), int(cy)), (int(ax), int(ay)), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), feather)
    return np.clip(m, 0, 1)[..., None]


def layout_masks(cups, y_range):
    cy = (y_range[0] + y_range[1]) / 2
    ay = (y_range[1] - y_range[0]) / 2 + FOCUS_PAD_Y
    focus = ellipse_mask([(c["x"], cy, (c["R"] - c["L"]) / 2 + FOCUS_PAD_X, ay) for c in cups],
                         FOCUS_FEATHER)
    left, right = min(c["L"] for c in cups), max(c["R"] for c in cups)
    big = ellipse_mask([((left + right) / 2, cy, (right - left) / 2 + VIGNETTE_PAD[0],
                         ay + VIGNETTE_PAD[1])], VIGNETTE_FEATHER)
    vign = 1 - VIGNETTE_AMOUNT * (1 - big)
    return focus, vign


LUMA = np.array([0.0722, 0.7152, 0.2126], np.float32)    # BGR order


def focus_grade(img, focus, vign):
    lift = img * (1 + FOCUS_BRIGHTNESS)
    lift = (lift - 0.5) * (1 + FOCUS_CONTRAST) + 0.5
    g = (lift @ LUMA)[..., None]
    lift = g + (lift - g) * (1 + FOCUS_SATURATION)
    out = img * (1 - focus) + np.clip(lift, 0, 1) * focus
    out = out * vign
    out = out * np.array(WARM_GAIN[::-1], np.float32)       # BGR gains
    out = (out - BLACK_POINT) / (1 - BLACK_POINT)
    return np.clip(out, 0, 1)


# ----------------------------------------------------------------------- text
def font(name, size, fallback):
    for path in (P(os.path.join(FONT_DIR, name)), fallback):
        if path and os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit(f"no font for {name}")


def emoji_image(ch, height):
    if not ch or not os.path.exists(FONT_EMOJI):
        return None
    f = ImageFont.truetype(FONT_EMOJI, 109)                # Noto Color Emoji is bitmap-only at 109
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((10, 10), ch, font=f, embedded_color=True)
    bb = im.getbbox()
    if not bb:
        return None
    im = im.crop(bb)
    return im.resize((max(1, round(im.width * height / im.height)), height), Image.LANCZOS)


def text_sprite(text, fnt, color, shadow, emoji=None, pad=30, line_h=None):
    """RGBA float sprite (straight alpha) with a soft drop shadow; "\n" stacks centred lines."""
    asc, desc = fnt.getmetrics()
    lines = text.split("\n")
    line_h = line_h or (asc + desc)
    tw = max(fnt.getlength(t) for t in lines)
    gap = int(fnt.size * 0.25) if emoji else 0
    ew = emoji.width if emoji else 0
    w = int(tw + gap + ew) + 2 * pad
    block_h = (len(lines) - 1) * line_h + asc + desc
    h = block_h + 2 * pad
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i, t in enumerate(lines):
        d.text((pad + (tw - fnt.getlength(t)) / 2, pad + i * line_h), t, font=fnt, fill=color + (255,))
    if emoji:
        ey = pad + (asc + desc - emoji.height) // 2 - int(fnt.size * 0.04)
        layer.alpha_composite(emoji, (int(pad + tw + gap), ey))
    a = layer.split()[3]
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sh_alpha = a.filter(ImageFilter.GaussianBlur(shadow["blur"])).point(lambda v: int(v * shadow["opacity"]))
    sh.putalpha(sh_alpha)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.alpha_composite(sh, shadow["offset"])
    out.alpha_composite(layer)
    bb = out.getbbox()
    out = out.crop(bb)
    # centre of the glyph box (not the shadow) relative to the crop
    cx = pad + (tw + gap + ew) / 2 - bb[0]
    cy = pad + block_h / 2 - bb[1]
    arr = np.asarray(out).astype(np.float32) / 255
    return {"rgb": arr[..., 2::-1].copy(), "a": arr[..., 3:4].copy(), "cx": cx, "cy": cy}


def sprite_box(spr, x, y, scale=1.0):
    h, w = spr["a"].shape[:2]
    x0 = int(round(x - spr["cx"] * scale))
    y0 = int(round(y - spr["cy"] * scale))
    return x0, y0, x0 + int(round(w * scale)), y0 + int(round(h * scale))


def overlay(img, spr, x, y, opacity=1.0, scale=1.0):
    if opacity <= 0.001:
        return img
    rgb, a = spr["rgb"], spr["a"]
    if abs(scale - 1) > 1e-3:
        h, w = a.shape[:2]
        size = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
        rgb = cv2.resize(rgb, size, interpolation=cv2.INTER_AREA)
        a = cv2.resize(a, size, interpolation=cv2.INTER_AREA)[..., None]
    x0, y0, _, _ = sprite_box(spr, x, y, scale)
    h, w = a.shape[:2]
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(OUT_W, x0 + w), min(OUT_H, y0 + h)
    if dx1 <= dx0 or dy1 <= dy0:
        return img
    rs = rgb[sy0:sy0 + dy1 - dy0, sx0:sx0 + dx1 - dx0]
    al = a[sy0:sy0 + dy1 - dy0, sx0:sx0 + dx1 - dx0] * opacity
    roi = img[dy0:dy1, dx0:dx1]
    img[dy0:dy1, dx0:dx1] = roi * (1 - al) + rs * al
    return img


def logo_sprite():
    path = P(LOGO_PATH)
    if os.path.exists(path):
        im = Image.open(path).convert("RGBA")
        im.thumbnail((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)
        log(f"logo: {path}")
    else:
        log("logo: no logo.png, drawing the placeholder")
        ss = 4
        D = LOGO_SIZE * ss
        im = Image.new("RGBA", (D, D), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        green = tuple(int(BRAND_GREEN[i:i + 2], 16) for i in (1, 3, 5))
        d.ellipse((0, 0, D - 1, D - 1), fill=green + (255,))
        r = int(D * 0.035)
        d.ellipse((r * 2, r * 2, D - 1 - r * 2, D - 1 - r * 2), outline=(255, 255, 255, 235), width=int(D * 0.012))
        f = font(FONT_LOGO, int(D * 0.17), FONT_FALLBACK_BOLD)
        d.text((D / 2, D / 2 - D * 0.10), LOGO_WORDS[0], font=f, fill=(255, 255, 255, 255), anchor="mm")
        d.text((D / 2, D / 2 + D * 0.10), LOGO_WORDS[1], font=f, fill=(255, 255, 255, 255), anchor="mm")
        im = im.resize((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)
    sh = Image.new("RGBA", (im.width + 80, im.height + 80), (0, 0, 0, 0))
    a = Image.new("L", sh.size, 0)
    a.paste(im.split()[3], (40, 46))
    sh.putalpha(a.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55)))
    sh.alpha_composite(im, (40, 40))
    arr = np.asarray(sh).astype(np.float32) / 255
    return {"rgb": arr[..., 2::-1].copy(), "a": arr[..., 3:4].copy(),
            "cx": 40 + im.width / 2, "cy": 40 + im.height / 2}


def ramp(t, start, dur):
    return float(np.clip((t - start) / dur, 0, 1)) if dur > 0 else float(t >= start)


def smooth(p):
    return p * p * (3 - 2 * p)


# ---------------------------------------------------------------------- audio
def build_audio(src, us, srcs, sps, total, live_dur, dst):
    """Retime the original audio with atempo driven by asendcmd, then add the end-card tail."""
    cmds = []
    t = 0.0
    last = None
    while t < SRC_END:
        s = float(np.interp(t + AUDIO_CMD_STEP / 2, srcs, sps))
        s = round(min(max(s, 0.5), 100.0), 4)
        if s != last:
            cmds.append(f"{t:.3f} atempo@ramp tempo {s};")
            last = s
        t += AUDIO_CMD_STEP
    cmd_file = P(os.path.join(WORK_DIR, "atempo_cmds.txt"))
    with open(cmd_file, "w") as f:
        f.write("\n".join(cmds) + "\n")
    fc = (f"[0:a]atrim=0:{SRC_END},asetpts=PTS-STARTPTS,asendcmd=f='{cmd_file}',"
          f"atempo@ramp=tempo={sps[0]},apad,atrim=0:{live_dur:.4f}[live];"
          f"[0:a]atrim=start={SRC_END},asetpts=PTS-STARTPTS,apad,atrim=0:{total - live_dur:.4f}[tail];"
          f"[live][tail]concat=n=2:v=0:a=1,afade=t=out:st={total - max(FADE_TO_BLACK, 0.4):.3f}"
          f":d={max(FADE_TO_BLACK, 0.4)}[a]")
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[a]",
         "-c:a", "pcm_s16le", dst])
    return len(cmds)


# ----------------------------------------------------------------------- main
def main():
    global INPUT
    if len(sys.argv) > 1:
        INPUT = sys.argv[1]
    src = P(INPUT)
    work, review = P(WORK_DIR), P(REVIEW_DIR)
    os.makedirs(work, exist_ok=True)
    os.makedirs(review, exist_ok=True)

    sdr = os.path.join(work, "sdr.mp4")
    if not (os.path.exists(sdr) and os.path.getmtime(sdr) > os.path.getmtime(src)):
        make_sdr(src, sdr)
    frames = read_frames(sdr)
    log(f"{len(frames)} source frames")

    # ---- detection on real frames
    cups, single, t_move, t_land, t_all = detect(frames)
    for c in cups:
        log(f"cup '{c['name']}': x={c['x']} (L{c['L']}-R{c['R']}, "
            f"{'detected' if c['detected'] else 'FALLBACK'}), in place & still at src {c['settle_src']:.2f}s")
    log(f"opening cup '{single['name']}': x={single['x']} ({'detected' if single['detected'] else 'FALLBACK'}), "
        f"picked up at src {t_move:.2f}s")
    log(f"third cup lands (still) at src {t_land:.2f}s; all three cups in place at src {t_all:.2f}s")

    # ---- speed ramp
    us, srcs, sps, (u1, u2, u3, u4) = build_timemap(t_land)
    live_dur = float(us[-1])
    n_live = int(math.floor(live_dur * FPS))
    live_dur = n_live / FPS
    n_end = int(round(END_DURATION * FPS))
    total = (n_live + n_end) / FPS
    to_out = lambda t: float(np.interp(t, srcs, us))
    to_src = lambda u: float(np.interp(u, us, srcs))
    log(f"ramp (output s): 1.5x until {u1:.2f}, ease to 0.7x by {u2:.2f}, hold to {u3:.2f}, "
        f"back to 1x by {u4:.2f}; live ends at {live_dur:.2f}, total {total:.2f}s")
    if total > MAX_LENGTH + 1e-6:
        raise SystemExit(f"total {total:.2f}s exceeds {MAX_LENGTH}s: lower SRC_END or END_DURATION")

    # ---- minterpolate the motion section (cached)
    i0 = max(0, int(math.floor((t_move - INTERP_PAD) * FPS)))
    i1 = min(len(frames) - 1, int(math.ceil((to_src(u4) + INTERP_PAD) * FPS)))
    mi = os.path.join(work, f"interp_{i0}_{i1}_{INTERP_FPS}.mp4")
    if not (os.path.exists(mi) and os.path.getmtime(mi) > os.path.getmtime(sdr)):
        log(f"minterpolate src frames {i0}-{i1} to {INTERP_FPS} fps (slow, cached afterwards)")
        run(["ffmpeg", "-v", "error", "-y", "-i", sdr, "-vf",
             f"trim=start_frame={i0}:end_frame={i1 + 1},setpts=PTS-STARTPTS,"
             f"minterpolate=fps={INTERP_FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
             "-c:v", "libx264", "-preset", "fast", "-crf", "10", mi])
    interp = read_frames(mi)
    sampler = Sampler(frames, interp, i0)

    # ---- precompute masks, sprites, timings
    b_alpha = blur_alpha()
    f_one, v_one = layout_masks([single], SINGLE_CUP_Y_RANGE)
    f_three, v_three = layout_masks(cups, CUP_Y_RANGE)

    f_name = font(FONT_NAME, NAME_SIZE, FONT_FALLBACK_REG)
    f_hook = font(FONT_HOOK, HOOK_SIZE, FONT_FALLBACK_BOLD)
    f_end = font(FONT_NAME, END_TEXT_SIZE, FONT_FALLBACK_REG)
    stack = NAME_STACK
    if stack == "auto":
        wid = [f_name.getlength(c["name"]) for c in cups]
        stack = any((wid[i] + wid[i + 1]) / 2 + NAME_MIN_GAP > cups[i + 1]["x"] - cups[i]["x"]
                    for i in range(len(cups) - 1))
    fmt = (lambda n: n.replace(" ", "\n", 1)) if stack else (lambda n: n)
    log(f"names on {'two lines (single-line names would overlap)' if stack else 'one line'}")
    name_sprites = [text_sprite(fmt(c["name"]), f_name, NAME_COLOR, NAME_SHADOW, line_h=NAME_LINE_HEIGHT)
                    for c in cups]
    single_sprite = text_sprite(fmt(single["name"]), f_name, NAME_COLOR, NAME_SHADOW, line_h=NAME_LINE_HEIGHT)
    hook = text_sprite(HOOK_TEXT, f_hook, (255, 255, 255), HOOK_SHADOW,
                       emoji=emoji_image(HOOK_EMOJI, int(HOOK_SIZE * 1.0)))
    logo = logo_sprite()
    line1_y = LOGO_Y + LOGO_SIZE / 2 + END_TEXT_GAP
    line1 = text_sprite(END_LINE1, f_end, (255, 255, 255), NAME_SHADOW)
    line2 = text_sprite(END_LINE2, f_end, (255, 255, 255), NAME_SHADOW)

    line2_y = line1_y + END_LINE_SPACING
    scrim = ellipse_mask([(OUT_W / 2, (LOGO_Y - LOGO_SIZE / 2 + line2_y + 30) / 2,
                           END_SCRIM_SIZE[0], END_SCRIM_SIZE[1])], 90)

    # safe-zone check for every text element
    placed = [(c["name"], name_sprites[i], c["x"], NAME_Y) for i, c in enumerate(cups)]
    placed += [(single["name"] + " (opening)", single_sprite, single["x"], NAME_Y),
               ("hook", hook, OUT_W / 2, HOOK_Y), ("end line 1", line1, OUT_W / 2, line1_y),
               ("end line 2", line2, OUT_W / 2, line1_y + END_LINE_SPACING),
               ("logo", logo, OUT_W / 2, LOGO_Y)]
    boxes = []
    for label, spr, x, y in placed:
        x0, y0, x1, y1 = sprite_box(spr, x, y)
        if label in [c["name"] for c in cups]:
            boxes.append((x0, x1))
        ok = y1 <= OUT_H - SAFE_BOTTOM and x1 <= OUT_W - SAFE_RIGHT and x0 >= 0 and y0 >= 0
        log(f"text '{label}': box x{x0}-{x1} y{y0}-{y1} {'OK' if ok else 'OUTSIDE SAFE ZONE'}")
        if not ok:
            raise SystemExit(f"'{label}' is outside the safe zone")
    for (a0, a1), (b0, b1) in zip(boxes, boxes[1:]):
        if a1 > b0:
            raise SystemExit("drink names overlap: shorten them, lower NAME_SIZE or set NAME_STACK=True")
    lid_top = min(CUP_Y_RANGE[0], SINGLE_CUP_Y_RANGE[0])
    log(f"blur: full to y{BLUR_BOTTOM - BLUR_FEATHER}, feathered out by y{BLUR_BOTTOM}; "
        f"highest lid y{lid_top} -> {lid_top - BLUR_BOTTOM}px clear")
    if BLUR_BOTTOM >= lid_top:
        raise SystemExit("blur would touch the cup lids")

    name_in = [to_out(c["settle_src"]) for c in cups]
    single_out_end = to_out(t_move)
    single_out_start = single_out_end - SINGLE_NAME_OUT_FADE
    w_lo, w_hi = to_out(t_move), to_out(t_land)
    for c, u in zip(cups, name_in):
        log(f"name '{c['name']}' fades in at output {u:.2f}s")
    log(f"opening name visible {SINGLE_NAME_IN:.2f}-{single_out_end:.2f}s")

    still_names = STILL_NAMES if STILL_NAMES is not None else live_dur - 1 / FPS
    still_end = STILL_END if STILL_END is not None else total - FADE_TO_BLACK - 0.1
    stills = {"01_hook.png": STILL_HOOK, "02_three_cups_names.png": still_names,
              "03_end_card.png": still_end}
    for s in BLUR_CHECK_SRC:
        stills[f"blur_check_src{s:g}s.png"] = to_out(s)
    still_frames = {name: int(round(t * FPS)) for name, t in stills.items()}

    # ---- encoder
    audio = os.path.join(work, "audio.wav")
    n_cmds = build_audio(src, us, srcs, sps, total, live_dur, audio)
    log(f"audio retimed with {n_cmds} atempo updates")
    out_path = P(OUTPUT)
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
         "-s", f"{OUT_W}x{OUT_H}", "-r", str(FPS), "-i", "-", "-i", audio,
         "-map", "0:v", "-map", "1:a",
         "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
         "-c:v", "libx264", "-preset", X264_PRESET, "-crf", str(CRF), "-profile:v", "high",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", AUDIO_BITRATE, "-movflags", "+faststart",
         "-t", f"{total:.4f}", out_path], stdin=subprocess.PIPE)

    def emit(idx, img):
        u8 = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
        enc.stdin.write(u8.tobytes())
        for name, fi in still_frames.items():
            if fi == idx:
                cv2.imwrite(os.path.join(review, name), u8)

    # ---- live section
    last = None
    for n in range(n_live):
        u = n / FPS
        t = to_src(u)
        s = float(np.interp(u, us, sps))
        img = sampler.get(t, s)                                    # 1. speed ramp
        img = apply_blur(img, b_alpha)                             # 2. blur
        w = smooth(float(np.clip((u - w_lo) / max(w_hi - w_lo, 1e-3), 0, 1)))
        focus = f_one * (1 - w) + f_three * w
        vign = v_one * (1 - w) + v_three * w
        img = focus_grade(img, focus, vign)                        # 3. focus / grade
        op = ramp(u, SINGLE_NAME_IN, NAME_FADE) * (1 - ramp(u, single_out_start, SINGLE_NAME_OUT_FADE))
        img = overlay(img, single_sprite, single["x"], NAME_Y, op)  # 4. names
        for spr, c, tin in zip(name_sprites, cups, name_in):
            img = overlay(img, spr, c["x"], NAME_Y, ramp(u, tin, NAME_FADE))
        if HOOK_START <= u < HOOK_END:                             # 5. hook
            p = smooth(ramp(u, HOOK_START, HOOK_POP))
            sc = HOOK_SCALE_FROM + (1 - HOOK_SCALE_FROM) * p
            op = p * (1 - ramp(u, HOOK_END - HOOK_FADE_OUT, HOOK_FADE_OUT))
            img = overlay(img, hook, OUT_W / 2, HOOK_Y, op, sc)
        emit(n, img)
        last = img
        if n % 30 == 0:
            log(f"  frame {n}/{n_live + n_end}  out {u:5.2f}s  src {t:5.2f}s  {s:.2f}x")

    # ---- end card (6.)
    zx, zy = END_ZOOM_CENTER
    for k in range(n_end):
        e = k / FPS
        p = k / max(n_end - 1, 1)
        z = END_ZOOM[0] + (END_ZOOM[1] - END_ZOOM[0]) * (1 - math.cos(math.pi * p)) / 2
        M = np.float32([[z, 0, zx - z * zx], [0, z, zy - z * zy]])
        img = cv2.warpAffine(last, M, (OUT_W, OUT_H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        dk = smooth(ramp(e, 0, END_DARKEN_IN))
        img = img * (1 - END_DARKEN * dk)
        img = img * (1 - END_SCRIM * dk * scrim)
        img = overlay(img, logo, OUT_W / 2, LOGO_Y, smooth(ramp(e, *LOGO_FADE_IN)))
        op = smooth(ramp(e, *END_TEXT_FADE_IN))
        img = overlay(img, line1, OUT_W / 2, line1_y, op)
        img = overlay(img, line2, OUT_W / 2, line1_y + END_LINE_SPACING, op)
        img = img * (1 - ramp(e + 1 / FPS, END_DURATION - FADE_TO_BLACK, FADE_TO_BLACK))
        emit(n_live + k, img)

    enc.stdin.close()
    if enc.wait() != 0:
        raise SystemExit("encode failed")
    log(f"wrote {out_path} ({total:.2f}s) and review stills in {review}")


if __name__ == "__main__":
    main()
