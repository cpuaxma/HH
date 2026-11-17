#!/usr/bin/env python3
"""Placeholder sound design for the Week Ahead reel (48 kHz, 16-bit stereo WAV).

Everything is synthesised here from sines and filtered noise (original, license-free).
It writes the 12 filenames the template expects into public/sfx/ and a 42s 120 BPM
bed into public/music/. Drop your own files in with the same names to replace them.

Usage: python3 scripts/make-sfx.py   (needs numpy)
"""
import os
import wave

import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
rng = np.random.default_rng(20261123)


def t_axis(sec):
    return np.arange(int(SR * sec)) / SR


def env(t, a, d):
    """Soft attack (no clicks) + exponential decay."""
    att = np.clip(t / max(a, 1e-4), 0, 1) ** 2
    return att * np.exp(-np.maximum(t - a, 0) / max(d, 1e-4))


def fft_filter(x, lo=None, hi=None):
    """Zero-phase band filter in the frequency domain with soft edges."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))


def sweep_filter(x, f0, f1):
    """One-pole low-pass with a cutoff gliding f0 → f1 (for whooshes)."""
    n = len(x)
    fc = np.geomspace(f0, f1, n)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros(n)
    s = 0.0
    for i in range(n):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def reverb(x, sec=1.2, mix=0.22):
    ir_t = t_axis(sec)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / (sec / 5))
    ir = fft_filter(ir, hi=6000)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    n = len(x) + len(ir)
    wet = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x) + len(ir) - 1]
    out = np.zeros(len(wet))
    out[: len(x)] += x
    return out * (1 - mix) + wet * mix


def stereo(x, pan=0.0, width=0.0):
    """pan −1 (left) … +1 (right). width adds a tiny Haas delay for space."""
    l = x * np.sqrt((1 - pan) / 2)
    r = x * np.sqrt((1 + pan) / 2)
    if width:
        d = int(SR * 0.012 * width)
        r = np.concatenate([np.zeros(d), r])[: len(r)]
    return np.stack([l, r], axis=1)


def write(path, st, peak=0.89):
    if st.ndim == 1:
        st = stereo(st)
    m = np.max(np.abs(st)) or 1
    st = st / m * peak
    fade = min(len(st), int(SR * 0.01))
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    data = (st * 32767).astype('<i2')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print('wrote', os.path.relpath(path, ROOT), f'{len(st) / SR:.2f}s')


def sfx(name, x, **kw):
    write(os.path.join(ROOT, 'sfx', f'{name}.wav'), x, **kw)


# ── sounds ───────────────────────────────────────────────────────────────────

def whoosh():
    t = t_axis(0.7)
    n = rng.standard_normal(len(t))
    shape = np.sin(np.pi * np.clip(t / 0.62, 0, 1)) ** 2
    y = sweep_filter(n, 300, 4500) * shape
    y = fft_filter(y, lo=120)
    # RTL: travels right → left
    pan = np.linspace(0.7, -0.7, len(t))
    return np.stack([y * np.sqrt((1 - pan) / 2), y * np.sqrt((1 + pan) / 2)], axis=1)


def swish_short():
    t = t_axis(0.32)
    n = rng.standard_normal(len(t))
    shape = np.sin(np.pi * np.clip(t / 0.28, 0, 1)) ** 3
    y = fft_filter(sweep_filter(n, 1200, 9000) * shape, lo=800)
    return stereo(reverb(y, 0.6, 0.15), 0.2, 0.6)


def pop():
    t = t_axis(0.25)
    f = 420 * np.exp(-t * 18) + 280
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.003, 0.05)
    y += 0.25 * np.sin(2 * np.pi * 2 * np.cumsum(f) / SR) * env(t, 0.002, 0.03)
    return stereo(reverb(y, 0.5, 0.12))


def click_ui():
    t = t_axis(0.12)
    y = (np.sin(2 * np.pi * 2200 * t) + 0.5 * np.sin(2 * np.pi * 3300 * t)) * env(t, 0.001, 0.012)
    y += 0.4 * np.sin(2 * np.pi * 900 * t) * env(t, 0.001, 0.02)
    return stereo(reverb(y, 0.4, 0.1))


def tick():
    t = t_axis(0.08)
    y = np.sin(2 * np.pi * 1600 * t) * env(t, 0.001, 0.008)
    return stereo(y)


def riser_1s():
    t = t_axis(1.05)
    f = 180 * (7 ** (t / 1.0))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2
    n = sweep_filter(rng.standard_normal(len(t)), 400, 7000) * 0.6
    shape = (t / 1.0) ** 2.2 * (t < 1.0) + (t >= 1.0) * np.exp(-(t - 1.0) * 60)
    return stereo(reverb((tone + n) * shape, 0.8, 0.2), 0, 0.8)


def impact_soft():
    t = t_axis(1.2)
    f = 90 * np.exp(-t * 9) + 44
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.004, 0.32)
    n = fft_filter(rng.standard_normal(len(t)), hi=1800) * env(t, 0.002, 0.06) * 0.5
    return stereo(reverb(body + n, 1.4, 0.25), 0, 0.5)


def bell(freq, t, decay=1.2):
    parts = [(1, 1), (2.0, 0.5), (2.76, 0.35), (5.4, 0.15), (8.9, 0.06)]
    return sum(a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (1 + k) / decay) for k, a in parts) * np.clip(t / 0.004, 0, 1)


def chime_gold():
    t = t_axis(2.6)
    y = np.zeros(len(t))
    for i, fr in enumerate([587.33, 739.99, 880.0, 1174.66]):  # D major
        d = int(SR * 0.07 * i)
        y[d:] += bell(fr, t[: len(t) - d], 1.6) * (0.9 - 0.12 * i)
    return stereo(reverb(y, 2.0, 0.35), 0, 1.0)


def typing():
    t_total = 1.0
    y = np.zeros(int(SR * t_total))
    pos = 0.0
    while pos < t_total - 0.05:
        n = int(SR * pos)
        t = t_axis(0.03)
        c = fft_filter(rng.standard_normal(len(t)), lo=1500, hi=6000) * env(t, 0.0005, 0.006)
        y[n : n + len(c)] += c * (0.6 + 0.4 * rng.random())
        pos += 0.06 + 0.05 * rng.random()
    return stereo(y)


def counter_roll():
    t_total = 1.05
    y = np.zeros(int(SR * t_total))
    times = np.cumsum(np.linspace(0.085, 0.03, 22))
    for k, tt in enumerate(times):
        if tt > t_total - 0.05:
            break
        n = int(SR * tt)
        t = t_axis(0.04)
        c = np.sin(2 * np.pi * (1300 + 18 * k) * t) * env(t, 0.0008, 0.007)
        y[n : n + len(c)] += c * (0.5 + 0.02 * k)
    return stereo(reverb(y, 0.4, 0.1))


def paper():
    t = t_axis(0.5)
    thump = np.sin(2 * np.pi * (70 * np.exp(-t * 20) + 60) * t) * env(t, 0.002, 0.07)
    slap = fft_filter(rng.standard_normal(len(t)), lo=600, hi=5000) * env(t, 0.001, 0.035)
    return stereo(reverb(thump + slap * 0.8, 0.5, 0.15))


def bass_drop():
    t = t_axis(2.0)
    f = 95 * np.exp(-t * 2.2) + 32
    y = np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(t, 0.005, 0.7)
    y += fft_filter(rng.standard_normal(len(t)), hi=900) * env(t, 0.002, 0.05) * 0.3
    return stereo(reverb(y, 1.5, 0.2), 0, 0.4)


# ── music bed: 120 BPM, 40s, warm and minimal ────────────────────────────────

def music():
    sec = 42.0
    beat = 0.5
    t = t_axis(sec)
    out = np.zeros(len(t))
    # chords every 2 bars (4s): Dm  Bb  F  C | Dm  Bb  F  A  | … resolves to D major in the outro
    prog = [
        [146.83, 174.61, 220.0], [116.54, 146.83, 174.61], [174.61, 220.0, 261.63], [130.81, 164.81, 196.0],
        [146.83, 174.61, 220.0], [116.54, 146.83, 174.61], [174.61, 220.0, 261.63], [110.0, 138.59, 164.81],
        [146.83, 185.0, 220.0], [146.83, 185.0, 220.0], [146.83, 185.0, 220.0],
    ]
    for i, ch in enumerate(prog):
        a = int(SR * i * 4.0)
        tt = t_axis(4.3)
        pad = sum(np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 0.25 * tt)) + 0.4 * np.sin(2 * np.pi * f * 2.003 * tt) for f in ch)
        shape = np.clip(tt / 0.6, 0, 1) * np.clip((4.3 - tt) / 0.6, 0, 1)
        seg = pad * shape * 0.11
        end = min(len(out), a + len(seg))
        out[a:end] += seg[: end - a]
        # sub bass on the root
        sub = np.sin(2 * np.pi * ch[0] / 2 * tt) * shape * 0.22
        out[a:end] += sub[: end - a]
    out = fft_filter(out, hi=2400)
    # kick on every beat, soft hat on the off-beats (drums sit out the first beat and the last 2s)
    for k in range(int(sec / beat)):
        tb = k * beat
        if tb < 0.5 or tb > sec - 2.0:
            continue
        n = int(SR * tb)
        tk = t_axis(0.35)
        kick = np.sin(2 * np.pi * (110 * np.exp(-tk * 30) + 48) * tk) * env(tk, 0.002, 0.11) * 0.55
        out[n : n + len(kick)] += kick[: len(out) - n]
        nh = int(SR * (tb + beat / 2))
        th = t_axis(0.06)
        hat = fft_filter(rng.standard_normal(len(th)), lo=7000) * env(th, 0.0005, 0.012) * 0.12
        out[nh : nh + len(hat)] += hat[: max(0, len(out) - nh)]
    out = reverb(out, 1.8, 0.18)[: len(t)]
    out *= np.clip((sec - t) / 1.5, 0, 1)  # 1.5s tail
    write(os.path.join(ROOT, 'music', 'bed_120bpm.wav'), stereo(out, 0, 0.7), peak=0.7)


if __name__ == '__main__':
    sfx('whoosh', whoosh())
    sfx('swish_short', swish_short())
    sfx('pop', pop())
    sfx('click_ui', click_ui())
    sfx('tick', tick())
    sfx('riser_1s', riser_1s())
    sfx('impact_soft', impact_soft())
    sfx('chime_gold', chime_gold())
    sfx('typing', typing())
    sfx('counter_roll', counter_roll())
    sfx('paper', paper())
    sfx('bass_drop', bass_drop())
    music()
