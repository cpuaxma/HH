"""Scans a rendered video for flicker, black or glitched frames.

For every frame it measures mean brightness, the share of near-black pixels and
the mean absolute difference from the previous frame (on a 270x480 greyscale
copy). It flags:
  - dark frames (mean brightness far below the video's, or many black pixels)
  - spikes: a frame that differs from BOTH neighbours much more than they
    differ from each other (a one-frame flash or glitch)
Usage: python3 scripts/scan-video.py out/avantis-dipifr-reel.mp4
"""
import subprocess
import sys

import numpy as np

path = sys.argv[1]
W, H = 270, 480
cmd = ['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
raw = subprocess.run(cmd, capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(frames)
mean = frames.mean(axis=(1, 2))
black = (frames < 16).mean(axis=(1, 2))
diff = np.zeros(n)
diff[1:] = np.abs(frames[1:] - frames[:-1]).mean(axis=(1, 2))
print(f'{n} frames, brightness {mean.min():.1f}–{mean.max():.1f} (median {np.median(mean):.1f})')
print(f'frame-to-frame difference: median {np.median(diff[1:]):.2f}, max {diff.max():.2f} at frame {int(diff.argmax())}')

problems = []
for i in range(n):
    if mean[i] < np.median(mean) * 0.6 or black[i] > 0.02:
        problems.append((i, f'dark: brightness {mean[i]:.1f}, black pixels {black[i] * 100:.1f}%'))
for i in range(1, n - 1):
    skip = np.abs(frames[i + 1] - frames[i - 1]).mean()
    if diff[i] > 2.0 and diff[i + 1] > 2.0 and min(diff[i], diff[i + 1]) > 3 * max(skip, 0.3):
        problems.append((i, f'spike: differs {diff[i]:.2f}/{diff[i + 1]:.2f} from its neighbours, which differ {skip:.2f}'))
top = np.argsort(diff)[::-1][:8]
print('largest changes:', ', '.join(f'f{int(i)}:{diff[i]:.2f}' for i in sorted(top)))
if problems:
    print(f'{len(problems)} PROBLEM FRAME(S):')
    for i, msg in problems[:50]:
        print(f'  frame {i}: {msg}')
    sys.exit(1)
print('OK: no black, flickering or glitched frames found')
