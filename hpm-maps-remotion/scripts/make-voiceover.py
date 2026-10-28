#!/usr/bin/env python3
"""Voices the reel's three voiceover lines into public/vo/ (48 kHz mono WAV).

Engine: Supertonic 3 (Supertone, OpenRAIL-M: commercial use allowed), run locally
through sherpa-onnx. For each line it renders a few takes, has Whisper transcribe
each one (to reject any take with a wrong or slurred word), keeps the take with
the liveliest pitch, then gives it a light "real room" polish with ffmpeg:
low cut, a touch of warmth and presence, gentle compression and a very short
room so it doesn't sound sterile.

The timing of each line lives in src/data.ts (VOICEOVER); keep the text in
LINES below in sync with it.

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

# Keep in sync with VOICEOVER in src/data.ts.
LINES = {
    'start': 'Okay... watch this.',
    'middle': 'And another one!',
    'end': 'Your turn.',
}
SPEEDS = [1.0, 0.95, 1.05, 0.9]

models = sys.argv[1]
voice = int(sys.argv[2]) if len(sys.argv) > 2 else 3
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'vo')


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


def words(t):
    return re.sub(r'[^a-z ]', '', t.lower()).split()


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
for key, text in LINES.items():
    best = None
    for speed in SPEEDS:
        g = sherpa_onnx.GenerationConfig()
        g.sid = voice
        g.num_steps = 10
        g.speed = speed
        g.extra['lang'] = 'en'
        a = tts.generate(text, g)
        x, sr = trim(np.array(a.samples, dtype=np.float32), a.sample_rate), a.sample_rate
        said = heard(x, sr)
        if words(said) != words(text):
            print(f'  {key} @ {speed}: rejected, heard {said!r}')
            continue
        score = liveliness(x, sr)
        print(f'  {key} @ {speed}: heard {said!r}, pitch range {score:.1f} st')
        if best is None or score > best[0]:
            best = (score, x, sr)
    if best is None:
        sys.exit(f'No clean take for {key!r}')
    _, x, sr = best
    with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
        sf.write(raw.name, x, sr)
        out = os.path.join(OUT, f'{key}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw.name, '-af', POLISH, '-ac', '1', out], check=True)
    # Level: speech at about -16 dBFS RMS so it leads the mix, peaks capped at -1 dB.
    y, ysr = sf.read(out, dtype='float32')
    speech = y[np.abs(y) > 0.01]
    rms = np.sqrt(np.mean(speech ** 2)) if len(speech) else 1e-3
    gain = min(10 ** (-16 / 20) / rms, 0.89 / (np.max(np.abs(y)) + 1e-9))
    sf.write(out, y * gain, ysr, subtype='PCM_16')
    lengths[key] = int(np.ceil(len(y) / ysr * 60))
    print(f'{key}.wav  {len(y) / ysr:.2f}s  gain {20 * np.log10(gain):+.1f} dB')

# Line lengths in frames at 60fps, for ducking the effects under the voice.
with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'voLengths.ts'), 'w') as f:
    f.write('// Generated by scripts/make-voiceover.py: length of each voiceover line in frames (60fps).\n')
    f.write('export const VO_FRAMES: Record<string, number> = ' + str(lengths).replace("'", '') + ';\n')
