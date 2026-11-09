#!/usr/bin/env python3
"""Scans a rendered video for flicker and broken frames.

  python3 scripts/scan-frames.py out/miran-signals.mp4 [more.mp4 ...]

Every frame is decoded small (grey, 1/4 size) and checked for:
- black or blank frames (the reel is a dark navy, so only near-true black counts);
- black blocks (a sudden jump in the share of pure-black pixels: NaN / glitched tiles);
- one-frame glitches: frame i differs from both neighbours while the neighbours match each
  other (a flash or a dropout), measured as min(d(i-1,i), d(i,i+1)) - d(i-1,i+1);
- sharp jumps in frame-to-frame difference (a cut or pop where the timeline has none).
The impact frames and the news-candle jolt are intended and listed separately.
Exits 1 if anything else is found.
Needs ffmpeg/ffprobe and numpy.
"""
import json
import re
import subprocess
import sys

import numpy as np

FPS = 60
# Intended: the impact frame(s) on the flip (TIMING.impactAt, impactFrames in src/data.ts) and the frame after.
data = open(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'src', 'data.ts')).read()
IMPACT = int(re.search(r'impactAt:\s*(\d+)', data).group(1))
IMPACT_N = int(re.search(r'impactFrames:\s*(\d+)', data).group(1))
NEWS = int(re.search(r'export const NEWS = \{\s*/\*\*[^*]*\*/\s*at:\s*(\d+)', data).group(1))
INTENDED = set(range(IMPACT - 1, IMPACT + IMPACT_N + 2)) | set(range(NEWS - 1, NEWS + 3))


def frames(path):
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', path]))
    w, h = probe['streams'][0]['width'] // 4, probe['streams'][0]['height'] // 4
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    out = []
    while True:
        buf = p.stdout.read(w * h)
        if len(buf) < w * h:
            break
        out.append(np.frombuffer(buf, np.uint8).reshape(h, w).astype(np.float32) / 255)
    p.wait()
    return np.stack(out)


def scan(path):
    f = frames(path)
    n = len(f)
    mean = f.mean(axis=(1, 2))
    dark = (f < 0.008).mean(axis=(1, 2))
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))  # d[i] = |f[i+1] - f[i]|
    issues = []
    for i in range(n):
        if i in INTENDED:
            continue
        if mean[i] < 0.015:
            issues.append((i, f'black frame (mean {mean[i]:.3f})'))
        if i > 0 and dark[i] - dark[i - 1] > 0.01 and dark[i] > 0.012:
            issues.append((i, f'black pixels jump {dark[i - 1]:.4f} -> {dark[i]:.4f}'))
    for i in range(1, n - 1):
        if i in INTENDED:
            continue
        skip = float(np.abs(f[i + 1] - f[i - 1]).mean())
        glitch = min(d[i - 1], d[i]) - skip
        if glitch > 0.004:
            issues.append((i, f'one-frame glitch {glitch:.4f} (d prev {d[i - 1]:.4f}, next {d[i]:.4f}, skip {skip:.4f})'))
    for i in range(2, n - 2):
        if i in INTENDED or i + 1 in INTENDED:
            continue
        local = np.median(np.r_[d[max(0, i - 8):i - 1], d[i + 2:i + 9]])
        if d[i] > 0.03 and d[i] > 6 * max(local, 0.002):
            issues.append((i, f'jump between {i} and {i + 1}: {d[i]:.4f} vs local {local:.4f}'))
    print(f'\n{path}: {n} frames ({n / FPS:.2f}s)')
    print(f'  brightness min {mean.min():.3f} (f{mean.argmin()}), max {mean.max():.3f}; '
          f'largest frame-to-frame change {d.max():.4f} (f{d.argmax()}->{d.argmax() + 1})')
    if INTENDED:
        print(f'  intended impact frames {min(INTENDED)}-{max(INTENDED)}: brightness ' + ', '.join(f'{mean[i]:.2f}' for i in sorted(INTENDED) if i < n))
    if issues:
        print(f'  {len(issues)} issue(s):')
        for i, msg in issues[:40]:
            print(f'    f{i} ({i / FPS:.2f}s): {msg}')
    else:
        print('  no black, glitched or flickering frames.')
    return not issues


def parse_intended(spec):
    """'none', or frames and ranges like '911-914,1456'."""
    out = set()
    if spec == 'none':
        return out
    for part in spec.split(','):
        a, _, b = part.partition('-')
        out |= set(range(int(a), int(b or a) + 1))
    return out


if __name__ == '__main__':
    args = sys.argv[1:]
    # --intended SPEC replaces the default intended frames (for other reels in this project).
    if '--intended' in args:
        i = args.index('--intended')
        INTENDED = parse_intended(args[i + 1])
        del args[i:i + 2]
    ok = all([scan(p) for p in args])
    sys.exit(0 if ok else 1)
