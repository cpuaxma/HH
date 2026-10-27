#!/usr/bin/env python3
"""Synthesises the reel's sound effects into public/sfx/ (48 kHz, 16-bit mono WAV).

Every sound is generated here from sine waves and filtered noise: original and
license-free, with no samples from a library. Deterministic: the noise
generator is seeded, so re-running produces identical files.

Mixed to sit under music: short, soft and mid-range so they read on phone speakers.

Usage: python3 scripts/make-sfx.py   (needs numpy)
"""
import math
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(20251027)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(t, attack, decay):
    """Fast attack, exponential decay."""
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def bandpass_sweep(noise, f_from, f_to, q=1.2, curve=1.0):
    """Time-varying state-variable band-pass over noise, cutoff gliding f_from → f_to."""
    n = len(noise)
    out = np.zeros(n)
    low = band = 0.0
    for i in range(n):
        p = (i / n) ** curve
        fc = f_from * (f_to / f_from) ** p
        f = 2 * math.sin(math.pi * min(fc, SR / 6) / SR)
        high = noise[i] - low - band / q
        band += f * high
        low += f * band
        out[i] = band
    return out


def fade(sig, ms_in=2, ms_out=12):
    a = int(SR * ms_in / 1000)
    b = int(SR * ms_out / 1000)
    sig = sig.copy()
    if a:
        sig[:a] *= np.linspace(0, 1, a)
    if b:
        sig[-b:] *= np.linspace(1, 0, b)
    return sig


def write(name, sig, peak=0.89, ms_in=2):
    sig = fade(sig, ms_in=ms_in)
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * peak
    data = (sig * 32767).astype('<i2').tobytes()
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)
    print(f'{name}.wav  {len(sig) / SR:.2f}s')


def sweep_sine(t, f_of_t):
    return np.sin(2 * np.pi * np.cumsum(f_of_t) / SR)


def whoosh(seconds, f_from, f_to, curve=1.0, q=1.6, shape_pow=1.6, peak_at=0.5):
    t = t_axis(seconds)
    sig = bandpass_sweep(rng.standard_normal(len(t)), f_from, f_to, q=q, curve=curve)
    x = np.clip(t / seconds, 0, 1)
    # Asymmetric hump peaking at `peak_at`.
    warped = np.where(x < peak_at, x / peak_at * 0.5, 0.5 + (x - peak_at) / (1 - peak_at) * 0.5)
    return sig * np.sin(np.pi * warped) ** shape_pow


def bell(f0, seconds, decay):
    t = t_axis(seconds)
    return (
        np.sin(2 * np.pi * f0 * t) * env(t, 0.002, decay)
        + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, 0.001, decay * 0.4)
        + 0.12 * np.sin(2 * np.pi * f0 * 5.40 * t) * env(t, 0.001, decay * 0.18)
    )


def main():
    os.makedirs(OUT, exist_ok=True)

    # Pin drop: a soft rubbery thunk with a pitch drop (harmonics so it reads on phones).
    t = t_axis(0.32)
    f = 120 * np.exp(-t / 0.05) + 70
    ph = 2 * np.pi * np.cumsum(f) / SR
    thunk = np.sin(ph) * env(t, 0.002, 0.08) + 0.55 * np.sin(2 * ph) * env(t, 0.002, 0.05) + 0.3 * np.sin(3 * ph) * env(t, 0.002, 0.035)
    thunk += 0.2 * bandpass_sweep(rng.standard_normal(len(t)), 900, 400, q=1.0) * env(t, 0.0005, 0.01)
    write('thunk', thunk)

    # Headline words: a tiny, soft tick.
    t = t_axis(0.08)
    tick = np.sin(2 * np.pi * 2400 * t) * env(t, 0.0005, 0.008) + 0.4 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.002)
    write('word', tick, peak=0.6)

    # Dive: air rushing past, building as we fall and settling as the camera levels out.
    d = 2.7
    t = t_axis(d)
    air = whoosh(d, 2600, 380, curve=0.9, q=1.1, shape_pow=1.4, peak_at=0.6)
    low = np.sin(2 * np.pi * 70 * t) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 0.25
    write('dive', air + low, peak=0.75, ms_in=40)

    # Route drawing: a faint pen-on-paper hum, seamlessly looped (volume follows the head's speed).
    t = t_axis(2.08)
    scratch = bandpass_sweep(rng.standard_normal(len(t)), 1100, 1100, q=3.0)
    scratch /= np.max(np.abs(scratch)) + 1e-9
    hum = 0.55 * scratch * (0.75 + 0.25 * np.sin(2 * np.pi * 6 * t)) + 0.35 * np.sin(2 * np.pi * 165 * t) + 0.15 * np.sin(2 * np.pi * 330 * t)
    seam = int(SR * 0.08)
    hum[:seam] = hum[:seam] * np.linspace(0, 1, seam) + hum[-seam:] * np.linspace(1, 0, seam)
    hum = hum[:-seam]
    write('hum', hum, peak=0.6, ms_in=0)

    # Nav banner sliding in: a short soft swipe.
    write('swipe', whoosh(0.32, 900, 3800, curve=0.9, q=2.0, peak_at=0.4), peak=0.55)

    # Pin pops on each business, rising in pitch from stop 1 to 5 so the run builds.
    for i, f0 in enumerate([587.3, 659.3, 740.0, 830.6, 932.3]):
        t = t_axis(0.3)
        f = f0 * (0.55 + 0.45 * (1 - np.exp(-t / 0.012)))
        pop = sweep_sine(t, f) * env(t, 0.001, 0.07) + 0.3 * sweep_sine(t, 2 * f) * env(t, 0.001, 0.035)
        pop += 0.25 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)
        write(f'pop-{i + 1}', pop, peak=0.8)

    # Count-up ticks: tiny wood-block clicks on a rising scale (one file per step).
    for k in range(13):
        t = t_axis(0.07)
        f0 = 1300 * 2 ** (k / 18)
        tk = np.sin(2 * np.pi * f0 * t) * env(t, 0.0005, 0.012) + 0.3 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, 0.0005, 0.005)
        write(f'tick-{k}', tk, peak=0.6)

    # The count lands: a bright, clean two-bell ding (G6 over C6).
    t = t_axis(1.1)
    ding = bell(1568.0, 1.1, 0.42) + 0.6 * bell(1046.5, 1.1, 0.5)
    write('ding', ding, peak=0.7)

    # Stat chip: a round "bloop" (fast upward sine sweep).
    t = t_axis(0.25)
    f = 380 + 620 * (1 - np.exp(-t / 0.03))
    bloop = sweep_sine(t, f) * env(t, 0.002, 0.07) + 0.25 * sweep_sine(t, 2 * f) * env(t, 0.002, 0.04)
    write('bloop', bloop, peak=0.75)

    # Pepper outline closes: a rising swoosh into a crisp click at 0.30s.
    d = 0.7
    t = t_axis(d)
    sw = whoosh(d, 500, 5200, curve=1.3, q=1.8, peak_at=0.42)
    click_at = int(SR * 0.30)
    click = np.zeros(len(t))
    ct = t_axis(0.06)
    c = np.sin(2 * np.pi * 3200 * ct) * env(ct, 0.0003, 0.006) + 0.8 * rng.standard_normal(len(ct)) * env(ct, 0.0002, 0.0025)
    click[click_at:click_at + len(c)] += c * 2.2
    write('close', 0.7 * sw / (np.max(np.abs(sw)) + 1e-9) + click, peak=0.8)

    # Glow running along the pepper: a quick upward shimmer of tiny bells over soft air.
    d = 0.9
    t = t_axis(d)
    shimmer = 0.15 * whoosh(d, 3000, 7000, curve=1.0, q=2.5, peak_at=0.5)
    for i in range(11):
        start = int(SR * 0.05 * i)
        b = bell(1760.0 * 2 ** (i * 2 / 12), d - 0.05 * i, 0.08)
        shimmer[start:start + len(b)] += b * (0.35 + 0.03 * i)
    write('shimmer', shimmer, peak=0.55)

    # Finale pin cascade: four tiny pips, picked at random per pin.
    for k, f0 in enumerate([1175, 1319, 1480, 1661]):
        t = t_axis(0.09)
        f = f0 * (0.7 + 0.3 * (1 - np.exp(-t / 0.006)))
        pip = sweep_sine(t, f) * env(t, 0.0005, 0.022)
        write(f'pip-{k}', pip, peak=0.55)

    # Logo: a warm low whomp with a soft air swell into it.
    d = 1.0
    t = t_axis(d)
    f = 95 * np.exp(-t / 0.18) + 52
    ph = 2 * np.pi * np.cumsum(f) / SR
    whomp = np.sin(ph) * env(t, 0.004, 0.32) + 0.5 * np.sin(2 * ph) * env(t, 0.004, 0.22) + 0.3 * np.sin(3 * ph) * env(t, 0.004, 0.14)
    whomp += 0.25 * bandpass_sweep(rng.standard_normal(len(t)), 300, 1600, q=0.9) * env(t, 0.01, 0.12)
    write('whomp', whomp, peak=0.85)

    # "DM US" button: a soft, friendly tap.
    t = t_axis(0.35)
    tap = bell(1046.5, 0.35, 0.09) * 0.8 + np.sin(2 * np.pi * 523.3 * t) * env(t, 0.002, 0.06)
    tap += 0.3 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)
    write('tap', tap, peak=0.75)


if __name__ == '__main__':
    main()
