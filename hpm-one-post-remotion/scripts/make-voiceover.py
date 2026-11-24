#!/usr/bin/env python3
"""Voices the reel as ONE continuous narration: assets/vo/narration.wav (+ src/voLengths.ts).

Everything comes from VOICEOVER in src/config.ts (lines, target timing, engine, voice).

How it works
  1. The whole script is read in one continuous take (so intonation and rhythm flow from
     sentence to sentence) by Chatterbox Turbo (default) or standard Chatterbox (Resemble AI,
     MIT licence), cloning the voice in VOICEOVER.voiceRef. Several takes are rendered.
  2. Each take is split into its sentences at its natural pauses (the split that best matches
     the sentences' relative lengths, preferring longer pauses), and Whisper checks every
     sentence word for word. Takes with a wrong, missing or extra word are rejected.
  3. Sentences are laid on the timeline: each starts at its target (scene cut + `at`, allowed
     to lead the cut by VOICEOVER.lead seconds) but never closer than a short breath to the
     previous one, so the read keeps its flow. Takes that would run past the end are rejected.
  4. The liveliest surviving take (widest natural pitch movement) is polished with ffmpeg,
     levelled, and written as one track. src/voLengths.ts gets the speech windows for ducking.

Output carries Resemble's inaudible "Perth" watermark (built into Chatterbox).

Usage:
  pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
  pip install chatterbox-tts sherpa-onnx soundfile librosa numpy
  python3 scripts/make-voiceover.py MODELS_DIR [--takes N]
MODELS_DIR holds asr-models/sherpa-onnx-whisper-small.en from github.com/k2-fsa/sherpa-onnx/releases.
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
TOTAL_S = acc / FPS

vo = CONFIG[CONFIG.index('export const VOICEOVER'):]
vo = vo[:vo.index('} as const;')]
setting = lambda key, cast=float: cast(re.search(rf'\b{key}:\s*\'?([\w./-]+)', vo).group(1))
ENGINE = setting('engine', str)
VOICE_REF = os.path.join(ROOT, 'assets', setting('voiceRef', str))
TEMPERATURE = setting('temperature')
EXAGGERATION = setting('exaggeration')
CFG_WEIGHT = setting('cfgWeight')
TAKES = int(sys.argv[sys.argv.index('--takes') + 1]) if '--takes' in sys.argv else setting('takes', int)
LEAD = setting('lead')
LINES = [
    {'id': m.group(1), 'target': (cut[m.group(2)] + int(m.group(3))) / FPS, 'text': m.group(5)}
    for m in re.finditer(r"\{id: '(\w+)', scene: '(\w+)', at: (-?\d+), text: (['\"])(.*?)\4\}", vo)
]
SCRIPT = ' '.join(line['text'] for line in LINES)
END_LIMIT = TOTAL_S - 0.25  # last word must end this long before the loop point
BREATH = 0.16  # minimum gap between sentences

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
SAME = {'than': 'then', 'dms': 'dm', 'write': 'right', 'its': 'its'}  # homophones / ASR quirks


def words(t):
    t = re.sub(r'\b(\d)\b', lambda m: NUM[m.group(1)], t.lower()).replace("'", '')
    return [SAME.get(w, w) for w in re.sub(r'[^a-z ]', ' ', t.replace('-', ' ')).split()]


def heard(x, sr):
    s = asr.create_stream()
    s.accept_waveform(16000, librosa.resample(x, orig_sr=sr, target_sr=16000))
    asr.decode_stream(s)
    return s.result.text.strip()


def pitch_range(x, sr):
    """Natural pitch movement (10th–90th percentile, semitones) over voiced frames."""
    y = librosa.resample(x, orig_sr=sr, target_sr=16000)
    f0, voiced, _ = librosa.pyin(y, fmin=80, fmax=500, sr=16000, frame_length=1024)
    f = f0[voiced & ~np.isnan(f0)]
    if len(f) < 5:
        return 0.0
    st = 12 * np.log2(f / np.median(f))
    return float(np.percentile(st, 90) - np.percentile(st, 10))


# ── Speech / pause analysis ──────────────────────────────────────────────────
HOP = 0.01


def speech_mask(x, sr, floor_db=-36):
    hop = int(HOP * sr)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (np.percentile(rms, 98) + 1e-12))
    return db > floor_db


def pauses(mask, min_len=0.09):
    """(start_s, end_s) of silent runs between speech."""
    out, i, n = [], 0, len(mask)
    first = np.argmax(mask)
    last = n - np.argmax(mask[::-1])
    i = first
    while i < last:
        if not mask[i]:
            j = i
            while j < last and not mask[j]:
                j += 1
            if (j - i) * HOP >= min_len:
                out.append((i * HOP, j * HOP))
            i = j
        else:
            i += 1
    return first * HOP, last * HOP, out


def best_split(start, end, cands, shares):
    """Choose len(shares)-1 pauses (in order) so segment lengths best match the text shares."""
    k = len(shares) - 1
    if len(cands) < k:
        return None
    speech = end - start
    cum = np.cumsum(shares)[:-1]
    # DP over (boundary index, candidate index)
    INF = 1e9
    n = len(cands)
    cost = np.full((k, n), INF)
    back = np.zeros((k, n), dtype=int)
    mid = [(a + b) / 2 for a, b in cands]
    plen = [b - a for a, b in cands]
    for j in range(n):
        cost[0, j] = 100 * ((mid[j] - start) / speech - cum[0]) ** 2 - 0.6 * np.log(plen[j])
    for b in range(1, k):
        for j in range(b, n):
            prev = cost[b - 1, :j]
            p = int(np.argmin(prev))
            cost[b, j] = prev[p] + 100 * ((mid[j] - start) / speech - cum[b]) ** 2 - 0.6 * np.log(plen[j])
            back[b, j] = p
    j = int(np.argmin(cost[k - 1]))
    if cost[k - 1, j] >= INF:
        return None
    chosen = [j]
    for b in range(k - 1, 0, -1):
        j = back[b, j]
        chosen.append(j)
    return [cands[c] for c in reversed(chosen)]


# ── Engine ───────────────────────────────────────────────────────────────────
import torch  # noqa: E402

with tempfile.TemporaryDirectory() as tmp:
    ref = os.path.join(tmp, 'ref.wav')
    # Level-match the reference (and keep it float32: Turbo's own loudness step breaks on float64).
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', VOICE_REF, '-af', 'loudnorm=I=-23:TP=-2',
                    '-ar', '24000', '-ac', '1', '-c:a', 'pcm_f32le', ref], check=True)
    if ENGINE == 'chatterbox-turbo':
        from chatterbox.tts_turbo import ChatterboxTurboTTS
        model = ChatterboxTurboTTS.from_pretrained(device='cpu')
        model.prepare_conditionals(ref, norm_loudness=False)
        gen = lambda text: model.generate(text, temperature=TEMPERATURE)
    else:
        from chatterbox.tts import ChatterboxTTS
        model = ChatterboxTTS.from_pretrained(device='cpu')
        model.prepare_conditionals(ref, exaggeration=EXAGGERATION)
        gen = lambda text: model.generate(text, exaggeration=EXAGGERATION, cfg_weight=CFG_WEIGHT, temperature=TEMPERATURE)
SR = model.sr

print(f'engine {ENGINE}, voice {os.path.relpath(VOICE_REF, ROOT)}, {TAKES} takes')
print(f'script: {SCRIPT}')
shares = np.array([len(re.sub(r'[^A-Za-z]', '', l['text'])) for l in LINES], dtype=float)
shares /= shares.sum()

results = []
for k in range(TAKES):
    torch.manual_seed(2000 + k)
    x = gen(SCRIPT).squeeze().numpy().astype(np.float32)
    mask = speech_mask(x, SR)
    start, end, cands = pauses(mask)
    split = best_split(start, end, cands, shares)
    if split is None:
        print(f'take {k}: could not find {len(LINES) - 1} pauses  REJECTED')
        continue
    edges = [start] + [p for pair in split for p in pair] + [end]
    segs = [(edges[2 * i], edges[2 * i + 1]) for i in range(len(LINES))]
    ok = True
    for line, (a, b) in zip(LINES, segs):
        piece = x[max(0, int((a - 0.03) * SR)):int((b + 0.03) * SR)]
        said = heard(piece, SR)
        if words(said) != words(line['text']):
            print(f'take {k}: {line["id"]} heard {said!r}  REJECTED')
            ok = False
            break
    if not ok:
        continue
    # Lay the sentences on the timeline.
    placed, prev_end = [], -1.0
    for i, (line, (a, b)) in enumerate(zip(LINES, segs)):
        s = line['target'] if i == 0 else max(line['target'] - LEAD, prev_end + BREATH)
        placed.append((s, s + (b - a)))
        prev_end = s + (b - a)
    drift = max(abs(p[0] - l['target']) for p, l in zip(placed, LINES))
    if prev_end > END_LIMIT:
        print(f'take {k}: ends at {prev_end:.2f}s (limit {END_LIMIT:.2f}s)  REJECTED')
        continue
    life = pitch_range(x[int(start * SR):int(end * SR)], SR)
    print(f'take {k}: clean, {end - start:.1f}s of speech, ends {prev_end:.2f}s, max drift {drift:.2f}s, pitch movement {life:.1f} st', flush=True)
    results.append({'k': k, 'x': x, 'segs': segs, 'placed': placed, 'life': life, 'drift': drift})

if not results:
    sys.exit('No clean take that fits. Try more takes (--takes 10), shorten a line, or move `at`.')

# Liveliest, with a small penalty for sentences that land far from their scene.
best = max(results, key=lambda r: r['life'] - 4 * max(0, r['drift'] - 0.4))
print(f'keeping take {best["k"]}')

track = np.zeros(int((TOTAL_S + 0.5) * SR), dtype=np.float32)
fade = int(0.012 * SR)
for (a, b), (s, _) in zip(best['segs'], best['placed']):
    piece = best['x'][max(0, int((a - 0.03) * SR)):int((b + 0.05) * SR)].copy()
    piece[:fade] *= np.linspace(0, 1, fade)
    piece[-fade:] *= np.linspace(1, 0, fade)
    at = int(max(0, s - 0.03) * SR)
    track[at:at + len(piece)] += piece[:len(track) - at]
track = track[:int(TOTAL_S * SR)]

POLISH = ','.join([
    'highpass=f=75',
    'equalizer=f=180:t=q:w=1.0:g=1.0',    # a little body
    'equalizer=f=3200:t=q:w=1.2:g=1.8',   # presence, reads on phone speakers
    'equalizer=f=7500:t=q:w=2.0:g=-2.0',  # tame sibilance
    'acompressor=threshold=0.1:ratio=2.2:attack=10:release=160:makeup=1.4',
    'aecho=0.9:0.6:11|23:0.06|0.035',     # very short room, so it isn't sterile
    'aresample=48000',
])
os.makedirs(OUT, exist_ok=True)
out = os.path.join(OUT, 'narration.wav')
with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
    sf.write(raw.name, track, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw.name, '-af', POLISH, '-ac', '1', out], check=True)
# Loudness: -15 LUFS integrated (speech-gated), true peak capped at -1.5 dBTP.
norm = out + '.norm.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000',
                '-ac', '1', '-c:a', 'pcm_s16le', norm], check=True)
os.replace(norm, out)

windows = [[int(np.floor(s * FPS)), int(np.ceil(e * FPS))] for s, e in best['placed']]
for line, (s, e) in zip(LINES, best['placed']):
    print(f'  {line["id"]:9s} {s:5.2f}s → {e:5.2f}s  (target {line["target"]:5.2f}s)  {line["text"]}')
with open(os.path.join(ROOT, 'src', 'voLengths.ts'), 'w') as f:
    f.write(f'// Generated by scripts/make-voiceover.py: when the narration is speaking, [from, to] in frames ({FPS} fps).\n')
    f.write(f'export const VO_WINDOWS: [number, number][] = {windows};\n')
print(f'wrote {os.path.relpath(out, ROOT)} and src/voLengths.ts')
