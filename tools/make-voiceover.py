"""Voices a reel's script with Kokoro (local, open-source TTS) and lays each line at its start time.

Usage: python tools/make-voiceover.py SCRIPT.md MODEL_DIR OUT.wav [voice=af_heart] [duration=43.6]

SCRIPT.md holds a table with rows like `| 3 | 0:07.5 | 0:09.4 | A single bad trade |`
(number, start, must-end-by, line). MODEL_DIR holds kokoro-v1.0.onnx and voices-v1.0.bin from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0.
Needs: pip install kokoro-onnx soundfile
"""
import re
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

script, model_dir, out = sys.argv[1:4]
voice = sys.argv[4] if len(sys.argv) > 4 else 'af_heart'
total = float(sys.argv[5]) if len(sys.argv) > 5 else 43.6

def secs(stamp):
    m, s = stamp.split(':')
    return int(m) * 60 + float(s)

ROW = re.compile(r'^\|\s*\d+\s*\|\s*(\d+:\d+(?:\.\d+)?)\s*\|\s*(\d+:\d+(?:\.\d+)?)\s*\|\s*(.+?)\s*\|\s*$')
lines = [(secs(a), secs(b), text) for a, b, text in (m.groups() for m in map(ROW.match, open(script)) if m)]

kokoro = Kokoro(f'{model_dir}/kokoro-v1.0.onnx', f'{model_dir}/voices-v1.0.bin')

def trimmed(samples, rate, floor=0.01):
    loud = np.flatnonzero(np.abs(samples) > floor)
    if not len(loud):
        return samples
    pad = int(0.03 * rate)
    return samples[max(0, loud[0] - pad):loud[-1] + pad]

track, rate = None, None
for start, end, text in lines:
    room = end - start - 0.05
    speed = 1.0
    for _ in range(4):   # speed up only as much as the slot needs, at most 1.25x
        samples, rate = kokoro.create(text, voice=voice, speed=speed, lang='en-us')
        samples = trimmed(samples, rate)
        length = len(samples) / rate
        if length <= room or speed >= 1.25:
            break
        speed = min(1.25, speed * length / room * 1.02)
    if track is None:
        track = np.zeros(int(total * rate), dtype=np.float32)
    at = int(start * rate)
    track[at:at + len(samples)] += samples[:len(track) - at]
    flag = '' if length <= room + 0.05 else '  <-- runs long'
    print(f'{start:6.2f}s  {length:4.2f}s of {end - start:4.2f}s  speed {speed:.2f}  {text}{flag}')

sf.write(out, track, rate)
print('wrote', out)
