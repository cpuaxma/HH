#!/usr/bin/env python3
"""Voices the reel's voiceover into assets/vo/<id>.wav (48 kHz mono) and writes src/voLengths.ts.

Lines, timing and the speaker come from VOICEOVER in src/config.ts (single source of truth).

Engine: Supertonic 3 (Supertone, OpenRAIL-M: commercial use allowed), run locally through
sherpa-onnx, same as hpm-maps-remotion. For each line it renders a few takes at different
speeds, has Whisper transcribe every take (a take with a wrong or slurred word is rejected),
keeps the liveliest take that fits before the next line, then gives it a light polish with
ffmpeg (low cut, warmth, presence, gentle compression, a very short room) and levels it.

Usage:
  pip install sherpa-onnx soundfile librosa numpy
  python3 scripts/make-voiceover.py MODELS_DIR [voice_id]
MODELS_DIR holds these sherpa-onnx release folders (github.com/k2-fsa/sherpa-onnx/releases):
  tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
  asr-models/sherpa-onnx-whisper-small.en
"""
import os
import re
import subprocess
import sys
import tempfile

import librosa
import numpy as np
import sherpa_onnx
import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CONFIG = open(os.path.join(ROOT, 'src', 'config.ts')).read()
FPS = int(re.search(r'fps:\s*(\d+)', CONFIG).group(1))

# Scene cuts (durations are beat multiples, so the cuts are the cumulative sums).
order = re.findall(r"'(\w+)'", re.search(r'SCENE_ORDER = \[(.*?)\]', CONFIG).group(1))
dur = {m.group(1): int(m.group(2)) for m in re.finditer(r'^  (\w+): \{\n    duration: (\d+)', CONFIG, re.M)}
cut, acc = {}, 0
for name in order:
    cut[name] = acc
    acc += dur[name]
TOTAL = acc

vo_block = CONFIG[CONFIG.index('export const VOICEOVER'):]
vo_block = vo_block[:vo_block.index('} as const;')]
LINES = [
    {'id': m.group(1), 'start': cut[m.group(2)] + int(m.group(3)), 'text': m.group(4)}
    for m in re.finditer(r"\{id: '(\w+)', scene: '(\w+)', at: (-?\d+), text: '([^']*)'\}", vo_block)
]
for i, line in enumerate(LINES):
    nxt = LINES[i + 1]['start'] if i + 1 < len(LINES) else TOTAL
    line['room'] = (nxt - line['start']) / FPS - 0.15  # seconds available, with a breath
voice = int(sys.argv[2]) if len(sys.argv) > 2 else int(re.search(r'voice:\s*(\d+)', vo_block).group(1))
SPEEDS = [1.0, 1.05, 0.95, 1.1, 1.15, 1.0, 1.05, 0.95]  # repeats = extra takes (generation varies)

models = sys.argv[1]
OUT = os.path.join(ROOT, 'assets', 'vo')


def find(name):
    root = os.path.join(models, name)
    inner = os.path.join(root, name)
    return inner if os.path.isdir(inner) else root


ST = find('sherpa-onnx-supertonic-3-tts-int8-2026-05-11')
W = find('sherpa-onnx-whisper-small.en')
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(
        duration_predictor=f'{ST}/duration_predictor.int8.onnx', text_encoder=f'{ST}/text_encoder.int8.onnx',
        vector_estimator=f'{ST}/vector_estimator.int8.onnx', vocoder=f'{ST}/vocoder.int8.onnx',
        tts_json=f'{ST}/tts.json', unicode_indexer=f'{ST}/unicode_indexer.bin', voice_style=f'{ST}/voice.bin'),
    num_threads=4, provider='cpu')))
asr = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{W}/small.en-encoder.int8.onnx', decoder=f'{W}/small.en-decoder.int8.onnx',
    tokens=f'{W}/small.en-tokens.txt', num_threads=4)

NUM = {'1': 'one', '2': 'two', '3': 'three', '4': 'four'}


# Words Whisper confuses in fast casual speech; treated as the same word.
SAME = {'than': 'then', 'dms': 'dm'}


def words(t):
    t = re.sub(r'\b(\d)\b', lambda m: NUM[m.group(1)], t.lower())
    return [SAME.get(w, w) for w in re.sub(r'[^a-z ]', '', t.replace('-', ' ')).split()]


def heard(x, sr):
    s = asr.create_stream()
    s.accept_waveform(16000, librosa.resample(x, orig_sr=sr, target_sr=16000))
    asr.decode_stream(s)
    return s.result.text.strip()


def liveliness(x, sr):
    """Pitch range (10th–90th percentile, semitones) over voiced frames."""
    y = librosa.resample(x, orig_sr=sr, target_sr=16000)
    f0, voiced, _ = librosa.pyin(y, fmin=65, fmax=450, sr=16000, frame_length=1024)
    f = f0[voiced & ~np.isnan(f0)]
    if len(f) < 5:
        return 0.0
    st = 12 * np.log2(f / np.median(f))
    return float(np.percentile(st, 90) - np.percentile(st, 10))


def trim(x, sr, floor=0.008):
    loud = np.flatnonzero(np.abs(x) > floor)
    pad = int(0.04 * sr)
    return x[max(0, loud[0] - pad):loud[-1] + pad] if len(loud) else x


POLISH = ','.join([
    'highpass=f=85',
    'equalizer=f=220:t=q:w=1.0:g=1.5',    # a little warmth
    'equalizer=f=3200:t=q:w=1.2:g=2.0',   # presence, reads on phone speakers
    'equalizer=f=7000:t=q:w=2.0:g=-2.5',  # tame sibilance
    'acompressor=threshold=0.12:ratio=3:attack=8:release=120:makeup=1.6',
    'aecho=0.9:0.55:14|29:0.10|0.06',     # very short room, so it isn't sterile
    'afade=t=in:d=0.01',
    'aresample=48000',
])

os.makedirs(OUT, exist_ok=True)
lengths = {}
for line in LINES:
    key, text, room = line['id'], line['text'], line['room']
    takes = []
    for speed in SPEEDS:
        g = sherpa_onnx.GenerationConfig()
        g.sid = voice
        g.num_steps = 10
        g.speed = speed
        g.extra['lang'] = 'en'
        a = tts.generate(text, g)
        x, sr = trim(np.array(a.samples, dtype=np.float32), a.sample_rate), a.sample_rate
        said = heard(x, sr)
        length = len(x) / sr
        ok = words(said) == words(text)
        score = liveliness(x, sr) if ok else 0.0
        print(f'  {key} @ {speed:.2f}: {length:.2f}s (room {room:.2f}s) heard {said!r}{"" if ok else "  REJECTED"}')
        if ok:
            takes.append((length <= room, score, -length, x, sr))
    if not takes:
        sys.exit(f'No clean take for {key!r}: reword the line in src/config.ts and rerun.')
    # Prefer takes that fit, then the liveliest; if none fit, the shortest clean one.
    fits = [tk for tk in takes if tk[0]]
    best = max(fits, key=lambda tk: tk[1]) if fits else max(takes, key=lambda tk: tk[2])
    _, _, neg_len, x, sr = best
    with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
        sf.write(raw.name, x, sr)
        out = os.path.join(OUT, f'{key}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw.name, '-af', POLISH, '-ac', '1', out], check=True)
    # Level: speech at about -13.5 dBFS RMS so it leads the mix on phones, peaks capped at -1 dB.
    y, ysr = sf.read(out, dtype='float32')
    speech = y[np.abs(y) > 0.01]
    rms = np.sqrt(np.mean(speech ** 2)) if len(speech) else 1e-3
    gain = min(10 ** (-13.5 / 20) / rms, 0.89 / (np.max(np.abs(y)) + 1e-9))
    sf.write(out, y * gain, ysr, subtype='PCM_16')
    lengths[key] = int(np.ceil(len(y) / ysr * FPS))
    flag = '' if -neg_len <= room else '  <-- runs into the next line: shorten the text or move `at`'
    print(f'{key}.wav  {len(y) / ysr:.2f}s of {room:.2f}s  gain {20 * np.log10(gain):+.1f} dB{flag}')

with open(os.path.join(ROOT, 'src', 'voLengths.ts'), 'w') as f:
    f.write(f'// Generated by scripts/make-voiceover.py: length of each voiceover line in frames ({FPS} fps).\n')
    f.write('export const VO_FRAMES: Record<string, number> = ' + str(lengths).replace("'", '') + ';\n')
print('wrote', OUT, 'and src/voLengths.ts')
