#!/usr/bin/env python3
"""Voices the reel's voiceover lines into public/vo/ (48 kHz mono WAV).

Engine: Supertonic 3 (Supertone; the sherpa-onnx package ships it under the MIT licence),
run locally through sherpa-onnx, in Arabic (lang "ar"). For each line it renders takes
across a few voices and speeds, has multilingual Whisper transcribe each one in Arabic
(to reject any take with a wrong, missing or slurred word), keeps the take with the
liveliest pitch, then gives it a light "real room" polish with ffmpeg:
low cut, a touch of warmth and presence, gentle compression and a very short
room so it doesn't sound sterile.

The lines (text and timing) live in src/data.ts (VOICEOVER); this script reads them
from there, so edit the copy in one place and re-run.

Usage:
  pip install sherpa-onnx soundfile librosa numpy
  python3 scripts/make-voiceover.py MODELS_DIR [voice_id,voice_id,...]
MODELS_DIR holds these sherpa-onnx release folders (github.com/k2-fsa/sherpa-onnx/releases):
  tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
  asr-models/sherpa-onnx-whisper-small   (multilingual, for the Arabic check)
If no take of a line passes the check, the script stops and the reel keeps its effects-only mix.
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

# Read the lines from VOICEOVER in src/data.ts.
_data = open(os.path.join(os.path.dirname(__file__), '..', 'src', 'data.ts'), encoding='utf-8').read()
_vo = _data[_data.index('export const VOICEOVER'):]
LINES = dict(re.findall(r"\{file: '([^']+)', text: '([^']+)'", _vo))
TEMPO = {k: float(v) for k, v in re.findall(r"\{file: '([^']+)', text: '[^']+', at: \d+, tempo: ([\d.]+)\}", _vo)}
SPEEDS = [1.0, 0.92, 1.06]

models = sys.argv[1]
voices = [int(v) for v in sys.argv[2].split(',')] if len(sys.argv) > 2 else [3]
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'vo')


def find(name):
    root = os.path.join(models, name)
    inner = os.path.join(root, name)
    return inner if os.path.isdir(inner) else root


ST = find('sherpa-onnx-supertonic-3-tts-int8-2026-05-11')
W = find('sherpa-onnx-whisper-small')
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(
        duration_predictor=f'{ST}/duration_predictor.int8.onnx', text_encoder=f'{ST}/text_encoder.int8.onnx',
        vector_estimator=f'{ST}/vector_estimator.int8.onnx', vocoder=f'{ST}/vocoder.int8.onnx',
        tts_json=f'{ST}/tts.json', unicode_indexer=f'{ST}/unicode_indexer.bin', voice_style=f'{ST}/voice.bin'),
    num_threads=4, provider='cpu')))
asr = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{W}/small-encoder.int8.onnx', decoder=f'{W}/small-decoder.int8.onnx',
    tokens=f'{W}/small-tokens.txt', language='ar', task='transcribe', num_threads=4)


def words(t):
    """Arabic words, normalised: no diacritics or tatweel, one form of alef / ya / ta marbuta."""
    t = re.sub(r'[\u064B-\u0652\u0670\u0640]', '', t)
    t = re.sub(r'[أإآٱ]', 'ا', t).replace('ة', 'ه').replace('ى', 'ي')
    t = re.sub(r'[^\u0621-\u064A ]', ' ', t)
    return t.split()


def heard(x, sr):
    s = asr.create_stream()
    y = librosa.resample(x, orig_sr=sr, target_sr=16000)
    # Pad with silence: Whisper tends to drop a final word that ends right at the edge.
    pad = np.zeros(int(0.6 * 16000), dtype=np.float32)
    s.accept_waveform(16000, np.concatenate([pad, y, pad]))
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


def best_take(key, text, voice):
    best = None
    for speed in SPEEDS:
        g = sherpa_onnx.GenerationConfig()
        g.sid = voice
        g.num_steps = 12
        g.speed = speed
        g.extra['lang'] = 'ar'
        a = tts.generate(text, g)
        x, sr = trim(np.array(a.samples, dtype=np.float32), a.sample_rate), a.sample_rate
        said = heard(x, sr)
        if words(said) != words(text):
            print(f'  {key} v{voice} @ {speed}: rejected, heard {said!r}')
            continue
        score = liveliness(x, sr)
        print(f'  {key} v{voice} @ {speed}: heard {said!r}, pitch range {score:.1f} st, {len(x) / sr:.2f}s')
        if best is None or score > best[0]:
            best = (score, x, sr)
    return best


# One voice for the whole reel: it qualifies only if every line has a clean take.
chosen = None
for voice in voices:
    takes = {}
    for key, text in LINES.items():
        b = best_take(key, text, voice)
        if b is None:
            break
        takes[key] = b
    if len(takes) < len(LINES):
        print(f'voice {voice}: not every line is clean')
        continue
    score = float(np.mean([b[0] for b in takes.values()]))
    print(f'voice {voice}: all lines clean, mean pitch range {score:.1f} st')
    if chosen is None or score > chosen[0]:
        chosen = (score, voice, takes)
if chosen is None:
    sys.exit('No voice gave a clean take of every line: keep the effects-only mix (VOICEOVER.enabled = false).')
print(f'using voice {chosen[1]}')

lengths = {}
for key, (_, x, sr) in chosen[2].items():
    with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
        sf.write(raw.name, x, sr)
        out = os.path.join(OUT, f'{key}.wav')
        chain = (f'atempo={TEMPO[key]},' if key in TEMPO else '') + POLISH
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw.name, '-af', chain, '-ac', '1', out], check=True)
    # Level: speech at about -16 dBFS RMS so it leads the mix, peaks capped at -3 dB.
    y, ysr = sf.read(out, dtype='float32')
    speech = y[np.abs(y) > 0.01]
    rms = np.sqrt(np.mean(speech ** 2)) if len(speech) else 1e-3
    gain = min(10 ** (-16 / 20) / rms, 0.7 / (np.max(np.abs(y)) + 1e-9))
    sf.write(out, y * gain, ysr, subtype='PCM_16')
    lengths[key] = int(np.ceil(len(y) / ysr * 60))
    print(f'{key}.wav  {len(y) / ysr:.2f}s  gain {20 * np.log10(gain):+.1f} dB')

# Line lengths in frames at 60fps, for ducking the effects under the voice.
with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'voLengths.ts'), 'w') as f:
    f.write('// Generated by scripts/make-voiceover.py: length of each voiceover line in frames (60fps).\n')
    f.write('export const VO_FRAMES: Record<string, number> = ' + str(lengths).replace("'", '') + ';\n')
