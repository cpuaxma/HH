#!/usr/bin/env python3
"""Voices the reel's voiceover into assets/vo/<id>.wav (48 kHz mono) and writes src/voLengths.ts.

Lines, timing, engine and delivery settings come from VOICEOVER in src/config.ts
(single source of truth).

Engines (VOICEOVER.engine):
  chatterbox  (default) Chatterbox by Resemble AI, MIT licence: natural, expressive delivery
              with an "exaggeration" (energy) control. Runs locally on CPU; weights download
              from Hugging Face on first run. Output carries Resemble's inaudible Perth watermark.
  supertonic  Supertonic 3 by Supertone (OpenRAIL-M) through sherpa-onnx; faster, flatter.

For each line it renders several takes, has Whisper transcribe every take (a take with a wrong,
missing or extra word is rejected), keeps the liveliest clean take that ends before the next
line (time-stretching up to 12% if none fits), polishes it with ffmpeg and levels it.

Usage:
  pip install chatterbox-tts sherpa-onnx soundfile librosa numpy
      (for CPU-only PyTorch first: pip install torch==2.6.0 torchaudio==2.6.0 \
       --index-url https://download.pytorch.org/whl/cpu)
  python3 scripts/make-voiceover.py MODELS_DIR [--force]   (only changed lines are regenerated)
MODELS_DIR holds these sherpa-onnx release folders (github.com/k2-fsa/sherpa-onnx/releases):
  asr-models/sherpa-onnx-whisper-small.en                       (always: the word check)
  tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11       (only for engine 'supertonic')
"""
import json
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

vo = CONFIG[CONFIG.index('export const VOICEOVER'):]
vo = vo[:vo.index('} as const;')]
setting = lambda key, cast=float: cast(re.search(rf'\b{key}:\s*\'?([\w.]+)', vo).group(1))
ENGINE = setting('engine', str)
EXAGGERATION = setting('exaggeration')
CFG_WEIGHT = setting('cfgWeight')
TAKES = setting('takes', int)
VOICE = setting('voice', int)
LINES = [
    {'id': m.group(1), 'start': cut[m.group(2)] + int(m.group(3)), 'text': m.group(4)}
    for m in re.finditer(r"\{id: '(\w+)', scene: '(\w+)', at: (-?\d+), text: '([^']*)'\}", vo)
]
for i, line in enumerate(LINES):
    nxt = LINES[i + 1]['start'] if i + 1 < len(LINES) else TOTAL
    line['room'] = (nxt - line['start']) / FPS - 0.15  # seconds available, with a breath

models = sys.argv[1]
OUT = os.path.join(ROOT, 'assets', 'vo')


def find(name):
    root = os.path.join(models, name)
    inner = os.path.join(root, name)
    return inner if os.path.isdir(inner) else root


# ── Word check (Whisper) ─────────────────────────────────────────────────────
W = find('sherpa-onnx-whisper-small.en')
asr = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{W}/small.en-encoder.int8.onnx', decoder=f'{W}/small.en-decoder.int8.onnx',
    tokens=f'{W}/small.en-tokens.txt', num_threads=4)
NUM = {'1': 'one', '2': 'two', '3': 'three', '4': 'four'}
SAME = {'than': 'then', 'dms': 'dm', 'write': 'right'}  # homophones / words Whisper confuses


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


def median_f0(x, sr):
    y = librosa.resample(x, orig_sr=sr, target_sr=16000)
    f0, voiced, _ = librosa.pyin(y, fmin=65, fmax=450, sr=16000, frame_length=1024)
    f = f0[voiced & ~np.isnan(f0)]
    return float(np.median(f)) if len(f) else 0.0


def trim(x, sr, floor_db=-38):
    """Cut leading/trailing silence (and any trailing breath/noise tail)."""
    frame = int(0.02 * sr)
    n = len(x) // frame
    if n == 0:
        return x
    rms = np.sqrt(np.mean(x[: n * frame].reshape(n, frame) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-12))
    loud = np.flatnonzero(db > floor_db)
    if not len(loud):
        return x
    pad = int(0.05 * sr)
    return x[max(0, loud[0] * frame - pad):min(len(x), (loud[-1] + 1) * frame + pad)]


# ── Engines ──────────────────────────────────────────────────────────────────
REF = None
if ENGINE == 'chatterbox':
    import torch
    from chatterbox.tts import ChatterboxTTS

    cb = ChatterboxTTS.from_pretrained(device='cpu')
    # Voice lock: if assets/vo/voice-ref.wav exists, every line clones that one voice, so the
    # speaker can't drift between lines. (Replace it with any clean 5–10 s clip to change voice.)
    REF = os.path.join(ROOT, 'assets', 'vo', 'voice-ref.wav')
    REF = REF if os.path.exists(REF) else None

    def take(text, k):
        torch.manual_seed(1000 + k)
        w = cb.generate(text, audio_prompt_path=REF, exaggeration=EXAGGERATION, cfg_weight=CFG_WEIGHT, temperature=0.8)
        return w.squeeze().numpy().astype(np.float32), cb.sr

    TAKE_LABELS = [f'seed {1000 + k}' for k in range(TAKES)]
else:
    ST = find('sherpa-onnx-supertonic-3-tts-int8-2026-05-11')
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(
            duration_predictor=f'{ST}/duration_predictor.int8.onnx', text_encoder=f'{ST}/text_encoder.int8.onnx',
            vector_estimator=f'{ST}/vector_estimator.int8.onnx', vocoder=f'{ST}/vocoder.int8.onnx',
            tts_json=f'{ST}/tts.json', unicode_indexer=f'{ST}/unicode_indexer.bin', voice_style=f'{ST}/voice.bin'),
        num_threads=4, provider='cpu')))
    SPEEDS = [1.0, 1.05, 0.95, 1.1, 1.15, 1.0, 1.05, 0.95][:max(TAKES, 1)]

    def take(text, k):
        g = sherpa_onnx.GenerationConfig()
        g.sid = VOICE
        g.num_steps = 10
        g.speed = SPEEDS[k % len(SPEEDS)]
        g.extra['lang'] = 'en'
        a = tts.generate(text, g)
        return np.array(a.samples, dtype=np.float32), a.sample_rate

    TAKE_LABELS = [f'speed {s}' for s in SPEEDS]

POLISH = ','.join([
    'highpass=f=80',
    'equalizer=f=200:t=q:w=1.0:g=1.0',    # a little warmth
    'equalizer=f=3000:t=q:w=1.2:g=2.0',   # presence, reads on phone speakers
    'equalizer=f=7500:t=q:w=2.0:g=-2.0',  # tame sibilance
    'acompressor=threshold=0.12:ratio=2.5:attack=8:release=140:makeup=1.5',
    'aecho=0.9:0.6:12|26:0.07|0.04',      # very short room, so it isn't sterile
    'afade=t=in:d=0.01',
    'aresample=48000',
])

os.makedirs(OUT, exist_ok=True)
# Cache: a line is only regenerated when its text or the engine settings change (or with --force).
MANIFEST = os.path.join(OUT, 'manifest.json')
manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
FORCE = '--force' in sys.argv
SIG = f'{ENGINE}|{EXAGGERATION}|{CFG_WEIGHT}|{VOICE}|ref' if ENGINE == 'chatterbox' and REF else f'{ENGINE}|{EXAGGERATION}|{CFG_WEIGHT}|{VOICE}'
# Pitch anchor: takes whose median pitch strays > 15% from the reference voice are rejected.
ANCHOR = median_f0(*sf.read(REF, dtype='float32')) if ENGINE == 'chatterbox' and REF else 0.0
if ANCHOR:
    print(f'voice reference: {os.path.relpath(REF, ROOT)} (median pitch {ANCHOR:.0f} Hz)')
lengths = {}
print(f'engine: {ENGINE}' + (f' (exaggeration {EXAGGERATION}, cfg {CFG_WEIGHT})' if ENGINE == 'chatterbox' else f' (voice {VOICE})'))
for line in LINES:
    key, text, room = line['id'], line['text'], line['room']
    cached = manifest.get(key)
    if not FORCE and cached and cached['text'] == text and cached['sig'] == SIG and os.path.exists(os.path.join(OUT, f'{key}.wav')):
        lengths[key] = cached['frames']
        print(f'{key}.wav  cached ({cached["seconds"]:.2f}s of {room:.2f}s)', flush=True)
        continue
    takes = []
    for k in range(TAKES):
        x, sr = take(text, k)
        x = trim(x, sr)
        said = heard(x, sr)
        length = len(x) / sr
        ok = words(said) == words(text)
        f0 = median_f0(x, sr)
        drift = abs(f0 / ANCHOR - 1) if ANCHOR and f0 else 0.0
        same_voice = drift <= 0.15
        score = liveliness(x, sr) if ok and same_voice else 0.0
        why = '' if ok and same_voice else ('  REJECTED (words)' if not ok else f'  REJECTED (pitch {f0:.0f} Hz, drifted {drift:.0%})')
        print(f'  {key} [{TAKE_LABELS[k]}]: {length:.2f}s (room {room:.2f}s) {f0:3.0f} Hz, range {score:4.1f} st  heard {said!r}{why}', flush=True)
        ok = ok and same_voice
        if ok:
            takes.append((length <= room, score, length, x, sr))
    if not takes:
        sys.exit(f'No clean take for {key!r}: reword the line in src/config.ts or raise `takes`, then rerun.')
    fits = [tk for tk in takes if tk[0]]
    best = max(fits, key=lambda tk: tk[1]) if fits else min(takes, key=lambda tk: tk[2])
    _, _, length, x, sr = best
    tempo = 1.0 if length <= room else min(1.12, length / room)
    af = (f'atempo={tempo:.4f},' if tempo > 1.0 else '') + POLISH
    with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
        sf.write(raw.name, x, sr)
        out = os.path.join(OUT, f'{key}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw.name, '-af', af, '-ac', '1', out], check=True)
    # Level: speech at about -13.5 dBFS RMS so it leads the mix on phones, peaks capped at -1 dB.
    y, ysr = sf.read(out, dtype='float32')
    speech = y[np.abs(y) > 0.01]
    rms = np.sqrt(np.mean(speech ** 2)) if len(speech) else 1e-3
    gain = min(10 ** (-13.5 / 20) / rms, 0.89 / (np.max(np.abs(y)) + 1e-9))
    sf.write(out, y * gain, ysr, subtype='PCM_16')
    final = len(y) / ysr
    lengths[key] = int(np.ceil(final * FPS))
    manifest[key] = {'text': text, 'sig': SIG, 'seconds': round(final, 3), 'frames': lengths[key]}
    json.dump(manifest, open(MANIFEST, 'w'), indent=1)
    flag = '' if final <= room + 0.05 else '  <-- runs into the next line: shorten the text or move `at`'
    print(f'{key}.wav  {final:.2f}s of {room:.2f}s' + (f'  (tempo {tempo:.2f})' if tempo > 1 else '')
          + f'  gain {20 * np.log10(gain):+.1f} dB{flag}', flush=True)

with open(os.path.join(ROOT, 'src', 'voLengths.ts'), 'w') as f:
    f.write(f'// Generated by scripts/make-voiceover.py: length of each voiceover line in frames ({FPS} fps).\n')
    f.write('export const VO_FRAMES: Record<string, number> = ' + str(lengths).replace("'", '') + ';\n')
print('wrote', OUT, 'and src/voLengths.ts')
