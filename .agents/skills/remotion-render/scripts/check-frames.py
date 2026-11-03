#!/usr/bin/env python3
"""Scans a rendered video for flicker and black/glitched frames.

For every frame (decoded small, greyscale) it measures the mean brightness, the share of
near-black pixels, and the difference to the previous frame. It flags:
  - dark frames (mean brightness below 0.25; pass --dark-ok for dark-looking videos) or frames with a
    patch of pure black (NaN pixels from WebGL show up as black),
  - single-frame glitches: a frame that differs from both neighbours while the neighbours
    match each other (flicker),
  - big jumps that sit neither on a planned hard cut nor inside a planned fast move
   .
Usage: python3 check-frames.py VIDEO [--cuts 152,254] [--motion 152-254,360-380]
  --cuts    frames that start a planned hard cut (a big jump there is fine)
  --motion  frame ranges of planned fast moves (whips, slams); big jumps there are fine
"""
import subprocess
import sys

import numpy as np

if len(sys.argv) < 2 or sys.argv[1].startswith('-'):
    sys.exit(__doc__)
path = sys.argv[1]
cuts = set()
if '--cuts' in sys.argv:
    cuts = {int(x) for x in sys.argv[sys.argv.index('--cuts') + 1].split(',')}
motion = ''
if '--motion' in sys.argv:
    motion = sys.argv[sys.argv.index('--motion') + 1]
windows = [tuple(int(v) for v in r.split('-')) for r in motion.split(',') if r]
in_motion = lambda i: any(a <= i <= b for a, b in windows)
W, H = 135, 240
raw = subprocess.run(
    ['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}:flags=area,format=gray', '-f', 'rawvideo', '-'],
    check=True,
    capture_output=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32) / 255
n = len(frames)
mean = frames.mean(axis=(1, 2))
black = (frames < 0.03).mean(axis=(1, 2))
diff = np.r_[0, np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))]
skip = np.r_[0, 0, np.abs(frames[2:] - frames[:-2]).mean(axis=(1, 2))]  # i-2 → i

print(f'{n} frames  brightness min {mean.min():.3f} (f{mean.argmin()})  median {np.median(mean):.3f}  max {mean.max():.3f}')
print(f'frame-to-frame difference: median {np.median(diff):.4f}  p99 {np.percentile(diff, 99):.4f}  max {diff.max():.4f} (f{diff.argmax()})')

problems = []
dark_ok = '--dark-ok' in sys.argv
for i in range(n):
    if not dark_ok and mean[i] < 0.25:
        problems.append((i, f'dark frame (mean {mean[i]:.3f})'))
    if not dark_ok and black[i] > 0.02:
        problems.append((i, f'{black[i] * 100:.1f}% near-black pixels'))
for i in range(1, n - 1):
    a, b = diff[i], diff[i + 1]
    around = skip[i + 1]  # i-1 → i+1
    if min(a, b) > 0.02 and around < 0.35 * min(a, b):
        problems.append((i, f'single-frame glitch (in {a:.3f}, out {b:.3f}, across {around:.3f})'))
med = np.median(diff[1:])
for i in range(1, n):
    if diff[i] > max(0.06, 12 * med) and i not in cuts and not in_motion(i):
        problems.append((i, f'big jump {diff[i]:.3f} (not a planned cut)'))

if problems:
    print(f'{len(problems)} flagged:')
    for i, msg in sorted(problems):
        print(f'  f{i}: {msg}')
else:
    print('No flicker, black or glitched frames found.')
