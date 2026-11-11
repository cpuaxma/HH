"""Synthesises the soundtrack: a deep, clean percussive track at 96 BPM (the chili impact and
the final settle land on downbeats) with whooshes on the camera moves, a low hit on the
impact, glass clicks on the funnel tiers and soft coin clinks. Every cue time comes from
src/timeline.json. Original synthesis only, no samples. Writes public/soundtrack.wav.

    python3 scripts/make-audio.py      (needs numpy)
"""
import json
import math
import os
import wave

import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
DUR = T["duration"]
N = int(SR * (DUR + 0.0))
BEAT = 60 / 96
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def place(sig, at, gain=1.0, pan=0.0):
    """Add a mono or stereo signal at time `at` (seconds) with equal-power pan."""
    i = int(round(at * SR))
    if sig.ndim == 1:
        a = math.cos((pan + 1) * math.pi / 4)
        b = math.sin((pan + 1) * math.pi / 4)
        sl, sr = sig * a, sig * b
    else:
        sl, sr = sig[0], sig[1]
    if i < 0:
        sl, sr = sl[-i:], sr[-i:]
        i = 0
    n = min(len(sl), N - i)
    if n <= 0:
        return
    L[i : i + n] += sl[:n] * gain
    R[i : i + n] += sr[:n] * gain


def tvec(d):
    return np.arange(int(d * SR)) / SR


def env_exp(t, decay, attack=0.002):
    return np.minimum(1, t / attack) * np.exp(-t / decay)


def lowpass(x, cutoff):
    """One-pole low-pass, vectorised via an IIR on chunks (cutoff in Hz, constant)."""
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y


def spectral(x, gain_fn, n_fft=2048, hop=512):
    """Time-varying spectral filter: gain_fn(times[s], freqs[Hz]) -> gain matrix."""
    win = np.hanning(n_fft)
    pad = np.concatenate([np.zeros(n_fft), x, np.zeros(n_fft)])
    frames = 1 + (len(pad) - n_fft) // hop
    out = np.zeros(len(pad))
    norm = np.zeros(len(pad))
    freqs = np.fft.rfftfreq(n_fft, 1 / SR)
    times = (np.arange(frames) * hop - n_fft + n_fft / 2) / SR
    G = gain_fn(times[:, None], freqs[None, :])
    for f in range(frames):
        s = f * hop
        spec = np.fft.rfft(pad[s : s + n_fft] * win) * G[f]
        out[s : s + n_fft] += np.fft.irfft(spec) * win
        norm[s : s + n_fft] += win * win
    out = out / np.maximum(norm, 1e-6)
    return out[n_fft : n_fft + len(x)]


def reverb(x, seconds=1.8, mix=0.25, seed=1):
    r = np.random.default_rng(seed)
    t = tvec(seconds)
    ir = r.standard_normal((2, len(t))) * np.exp(-t / (seconds / 6.9))
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    ir = np.array([lowpass(ir[0], 6500), lowpass(ir[1], 6500)])
    ir /= np.sqrt((ir**2).sum(axis=1, keepdims=True))
    n = len(x) + len(t)
    nf = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, nf)
    wet = np.array([np.fft.irfft(X * np.fft.rfft(ir[c], nf), nf)[:n] for c in range(2)])
    dry = np.zeros((2, n))
    dry[:, : len(x)] = x
    return dry * (1 - mix) + wet * mix * 3.0


# ---- instruments -------------------------------------------------------------


def kick(level=1.0, f0=118, f1=42, decay=0.38):
    t = tvec(0.9)
    f = f1 + (f0 - f1) * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(t, decay, 0.001)
    click = rng.standard_normal(len(t)) * env_exp(t, 0.004, 0.0005) * 0.25
    return np.tanh((body + click) * 1.6) * 0.8 * level


def hat(level=1.0, decay=0.028):
    t = tvec(0.15)
    n = rng.standard_normal(len(t))
    n = n - lowpass(n, 7000)
    return n * env_exp(t, decay, 0.0008) * 0.22 * level


def rim(level=1.0):
    t = tvec(0.25)
    n = rng.standard_normal(len(t))
    band = lowpass(n, 2600) - lowpass(n, 900)
    tone = np.sin(2 * np.pi * 410 * t) * env_exp(t, 0.03)
    return (band * env_exp(t, 0.05, 0.001) * 1.2 + tone * 0.4) * 0.5 * level


def tom(level=1.0, f0=150, f1=82):
    t = tvec(0.6)
    f = f1 + (f0 - f1) * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(t, 0.22, 0.002) * 0.55 * level


def boom(level=1.0):
    """The chili impact: deep sub drop, a body thump and a dark noise burst."""
    t = tvec(3.2)
    f = 30 + 52 * np.exp(-t / 0.18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(t, 1.1, 0.002)
    thump = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-t / 0.03)) / SR) * env_exp(t, 0.12, 0.001)
    n = rng.standard_normal(len(t))
    burst = lowpass(n, 900) * env_exp(t, 0.25, 0.002) * 1.4
    return np.tanh((sub * 1.1 + thump * 0.7 + burst * 0.5) * 1.3) * level


def glass_click(level=1.0, pitch=1.0):
    t = tvec(0.6)
    tick = np.sin(2 * np.pi * 3100 * pitch * t) * env_exp(t, 0.006, 0.0003)
    ring = (np.sin(2 * np.pi * 1870 * pitch * t) + 0.5 * np.sin(2 * np.pi * 4710 * pitch * t)) * env_exp(t, 0.16, 0.001)
    thock = np.sin(2 * np.pi * 220 * t) * env_exp(t, 0.025, 0.001)
    return (tick * 0.5 + ring * 0.16 + thock * 0.35) * level


def clink(level=1.0, pitch=1.0):
    t = tvec(0.5)
    parts = [(2930, 0.12), (4170, 0.09), (6310, 0.06), (8020, 0.04)]
    s = sum(np.sin(2 * np.pi * f * pitch * t + rng.uniform(0, 6)) * env_exp(t, d, 0.0005) for f, d in parts)
    return s * 0.22 * level


def tap(level=1.0):
    t = tvec(0.2)
    return (np.sin(2 * np.pi * 300 * t) * env_exp(t, 0.03, 0.001) * 0.6 + rng.standard_normal(len(t)) * env_exp(t, 0.003, 0.0003) * 0.15) * level


def whoosh(dur, peak, lo=250, hi=2400, level=1.0, seed=0):
    """Filtered noise sweep: the band rises toward `peak` (fraction of dur) and falls back."""
    r = np.random.default_rng(seed)
    n = r.standard_normal(int(dur * SR))
    def g(ts, fs):
        u = np.clip(ts / dur, 0, 1)
        shape = np.where(u < peak, (u / peak) ** 2, ((1 - u) / (1 - peak)) ** 1.5)
        fc = lo + (hi - lo) * shape
        return np.exp(-((np.log(fs + 1) - np.log(fc)) ** 2) / 0.5) * (0.15 + shape)
    s = spectral(n, g)
    u = np.arange(len(s)) / len(s)
    amp = np.where(u < peak, (u / peak) ** 1.6, ((1 - u) / (1 - peak)) ** 1.2)
    s = s * amp
    # Slight stereo movement.
    pan = np.sin(np.linspace(-1.2, 1.2, len(s)))
    return np.array([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)]) * level


def pad(dur, freqs, level=1.0, attack=0.6, release=1.2):
    t = tvec(dur)
    s = sum(np.sin(2 * np.pi * f * t + i) * (0.6 if i else 1.0) for i, f in enumerate(freqs))
    s += 0.25 * sum(np.sin(2 * np.pi * f * 2.003 * t) for f in freqs)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    s = lowpass(s * e, 1400)
    return s * level / len(freqs)


def riser(dur, level=1.0, seed=3):
    r = np.random.default_rng(seed)
    n = r.standard_normal(int(dur * SR))
    def g(ts, fs):
        u = np.clip(ts / dur, 0, 1)
        fc = 300 + 5000 * u**2
        return np.exp(-((np.log(fs + 1) - np.log(fc)) ** 2) / 0.35)
    s = spectral(n, g)
    return s * (np.arange(len(s)) / len(s)) ** 2.2 * level


# ---- arrangement ---------------------------------------------------------------

drums = np.zeros(N)
drumsR = np.zeros(N)


def dplace(sig, at, gain=1.0, pan=0.0):
    global L, R
    sL, sR = L, R
    L, R = drums, drumsR
    place(sig, at, gain, pan)
    L, R = sL, sR


beats = int(DUR / BEAT) + 1
for b in range(beats):
    tb = b * BEAT
    # Intro groove: beats 0-4 (until the slow motion), main groove: beats 8-14.
    if b < 5 or 8 <= b < 15:
        dplace(kick(0.95 if b % 2 == 0 else 0.75), tb)
        for k in (1, 3):
            dplace(hat(0.7 if k == 1 else 1.0), tb + k * BEAT / 4, pan=0.25)
        if b % 2 == 1:
            dplace(rim(0.75), tb, pan=-0.15)
    if 8 <= b < 15 and b % 4 == 3:
        dplace(tom(0.7), tb + BEAT * 0.75, pan=0.3)
        dplace(tom(0.6, 120, 70), tb + BEAT * 0.875, pan=-0.3)

# Slow motion: the groove's tail is low-passed and stretched by the reverb below.
mixD = reverb(drums + drumsR * 0.0, seconds=1.2, mix=0.12, seed=2)
mixD2 = reverb(drumsR, seconds=1.2, mix=0.12, seed=3)
dl = mixD[0, :N] + mixD2[0, :N] * 0.5
dr = mixD[1, :N] + mixD2[1, :N] * 0.5


def slowmo_gain(ts, fs):
    # Dark and quiet from the slow motion to the impact, open again after.
    u = np.clip((ts - T["slowStart"]) / 0.45, 0, 1) * (ts < T["impact"])
    cutoff = 18000 * (1 - u) + 180 * u
    return 1 / np.sqrt(1 + (fs / cutoff) ** 4)


L += spectral(dl, slowmo_gain) * 0.9
R += spectral(dr, slowmo_gain) * 0.9

# Low drone under the whole spot (D), swelling on the brand shot.
drone_t = tvec(DUR)
drone = (np.sin(2 * np.pi * 36.7 * drone_t) * 0.5 + np.sin(2 * np.pi * 73.4 * drone_t) * 0.2) * (0.25 + 0.2 * np.minimum(1, drone_t / 3))
place(drone * 0.35, 0)

# Button presses, paper flutter, burning.
for p in T["presses"]:
    place(tap(0.5), p, pan=0.05)
crackle = np.zeros(int(3.0 * SR))
for _ in range(260):
    i = rng.integers(0, len(crackle) - 400)
    crackle[i : i + 200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 25) * rng.uniform(0.2, 1)
crackle = crackle - lowpass(crackle, 1500)
place(crackle * np.minimum(1, np.arange(len(crackle)) / SR / 0.6) * 0.18, 0.6, pan=0.1)

# The chili: a falling swish into the impact hit, then the ring's shimmer.
place(whoosh(0.95, 0.92, 200, 1800, 0.35, seed=11), T["chiliDropStart"] - 0.1)
place(riser(0.85, 0.12), T["impact"] - 0.85)
hit = reverb(boom(1.0), seconds=2.6, mix=0.3, seed=5)
place(hit, T["impact"], gain=0.95)
t_sh = tvec(1.6)
shimmer = sum(np.sin(2 * np.pi * f * t_sh) for f in (1174.7, 1760, 2349.3)) * np.exp(-t_sh / 0.5) * np.minimum(1, t_sh / 0.05)
place(reverb(shimmer * 0.03, 2.0, 0.6, 9), T["impact"] + 0.02)

# Camera moves.
place(whoosh(1.4, 0.62, 160, 2600, 0.6, seed=21), T["pushStart"] - 0.05)
place(whoosh(1.1, 0.5, 200, 1500, 0.25, seed=22), T["funnelArrive"] - 0.1)
place(whoosh(1.6, 0.5, 150, 1100, 0.2, seed=23), 6.8)
place(whoosh(1.15, 0.55, 180, 1700, 0.32, seed=24), T["panStart"])

# Funnel tiers: a glass click on each lock.
for k, lt in enumerate(T["tierLocks"]):
    place(reverb(glass_click(0.55, 1 + 0.06 * k), 0.9, 0.25, 30 + k), lt, pan=(-0.3 if k % 2 == 0 else 0.3))

# Coins: a soft clink as each lands (same physics as src/three/Coins.tsx).
G, OUT_Y, FLOOR_Y, CH = 72, -13 - 0.55, -22, 0.3
for i in range(T["coinCount"]):
    emerge = T["coinStart"] + i * T["coinInterval"]
    land = emerge + math.sqrt(2 * (OUT_Y - (FLOOR_Y + CH * (i + 0.5))) / G)
    place(clink(0.32, 1 + 0.015 * i + rng.uniform(-0.02, 0.02)), land, pan=rng.uniform(-0.2, 0.2))

# Brand: riser into a final low hit as the chili settles, then a warm pad to the end.
place(riser(0.9, 0.1, seed=8), T["chiliSettle"] - 0.9)
place(reverb(kick(1.0, 90, 36, 0.9), 2.4, 0.3, 12), T["chiliSettle"], gain=0.9)
place(reverb(tom(0.5, 110, 60), 2.0, 0.35, 13), T["chiliSettle"], gain=0.6)
p = pad(DUR - T["chiliSettle"] + 0.4, [73.4, 110, 146.8, 220], 0.5, attack=0.5, release=1.0)
place(np.array([p, np.roll(p, 240)]), T["chiliSettle"] - 0.2)

# ---- master --------------------------------------------------------------------
fade = np.minimum(1, np.arange(N) / (0.01 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.25 * SR))
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.2) / math.tanh(1.2) * 0.89
R = np.tanh(R / peak * 1.2) / math.tanh(1.2) * 0.89
out = np.stack([L, R], axis=1)
pcm = (np.clip(out, -1, 1) * 32767).astype("<i2")
os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
path = os.path.join(ROOT, "public", "soundtrack.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {path} ({DUR:.1f}s, peak normalised)")
