#!/usr/bin/env python3
"""Synthesises the reel's sound effects into public/sfx/ (48 kHz, 16-bit mono WAV).

Every sound is generated here from sine waves and filtered noise: original and
license-free, with no samples from a library. Deterministic: the noise generator
is seeded, so re-running produces identical files.

Mixed to sit under music added in Instagram: short, soft and mid-range so they
still read on phone speakers.

Usage: python3 scripts/make-sfx.py   (needs numpy)
"""
import math
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(20261103)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(t, attack, decay):
    """Fast attack, exponential decay."""
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def bandpass_sweep(noise, f_from, f_to, q=1.2, curve=1.0):
    """Time-varying state-variable band-pass over noise, cutoff gliding f_from -> f_to."""
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


def sweep_sine(f_of_t):
    return np.sin(2 * np.pi * np.cumsum(f_of_t) / SR)


def whoosh(seconds, f_from, f_to, curve=1.0, q=1.6, shape_pow=1.6, peak_at=0.5):
    t = t_axis(seconds)
    sig = bandpass_sweep(rng.standard_normal(len(t)), f_from, f_to, q=q, curve=curve)
    x = np.clip(t / seconds, 0, 1)
    warped = np.where(x < peak_at, x / peak_at * 0.5, 0.5 + (x - peak_at) / (1 - peak_at) * 0.5)
    return sig * np.sin(np.pi * warped) ** shape_pow


def bell(f0, seconds, decay):
    t = t_axis(seconds)
    return (
        np.sin(2 * np.pi * f0 * t) * env(t, 0.002, decay)
        + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, 0.001, decay * 0.4)
        + 0.12 * np.sin(2 * np.pi * f0 * 5.40 * t) * env(t, 0.001, decay * 0.18)
    )


def room(sig, seconds=0.6, mix=0.25, decay=0.18):
    """A tiny synthetic room: a few early reflections and a soft noise tail."""
    tail = np.zeros(int(SR * seconds))
    for d, g in [(0.011, 0.5), (0.019, 0.35), (0.031, 0.25), (0.047, 0.18)]:
        tail[int(SR * d)] += g
    tt = t_axis(seconds)
    tail += 0.05 * rng.standard_normal(len(tt)) * np.exp(-tt / decay)
    wet = np.convolve(sig, tail)[: len(sig) + len(tail)]
    out = np.zeros(len(wet))
    out[: len(sig)] += sig
    return out + mix * wet / (np.max(np.abs(wet)) + 1e-9) * np.max(np.abs(sig))


def main():
    os.makedirs(OUT, exist_ok=True)

    # Competitor notification pings: a bright, short two-note "ding" (four pitches, rotated).
    for k, (f1, f2) in enumerate([(1318.5, 1760.0), (1396.9, 1864.7), (1480.0, 1975.5), (1568.0, 2093.0)]):
        t = t_axis(0.42)
        a = bell(f1, 0.42, 0.07)
        b = np.zeros(len(t))
        off = int(SR * 0.055)
        bb = bell(f2, 0.42 - 0.055, 0.11)
        b[off:off + len(bb)] = bb
        write(f'ping-{k}', a * 0.8 + b, peak=0.62)

    # Your lonely ping: one lower, softer note with a long empty tail.
    t = t_axis(1.6)
    lonely = bell(880.0, 1.6, 0.32) * 0.9 + 0.25 * bell(1318.5, 1.6, 0.2)
    write('lonely', room(lonely, 1.2, 0.5, 0.45), peak=0.55)

    # Clock time-lapse: a mechanical tick texture, accelerating, with a soft whirr.
    d = 1.6
    t = t_axis(d)
    ticks = np.zeros(len(t))
    pos = 0.0
    gap = 0.11
    i = 0
    while pos < d - 0.05:
        ct = t_axis(0.03)
        f0 = 3100 if i % 2 == 0 else 2500
        c = np.sin(2 * np.pi * f0 * ct) * env(ct, 0.0003, 0.004) + 0.6 * rng.standard_normal(len(ct)) * env(ct, 0.0002, 0.0018)
        s = int(SR * pos)
        ticks[s:s + len(c)] += c * (0.7 + 0.3 * (i % 2))
        pos += gap
        gap = max(0.045, gap * 0.93)
        i += 1
    whirr = bandpass_sweep(rng.standard_normal(len(t)), 600, 1400, q=4.0) * 0.08 * np.sin(np.pi * np.clip(t / d, 0, 1))
    write('ticks', ticks + whirr, peak=0.5)

    # The red streak: a fast air whoosh that rises then falls (a fly-by).
    d = 0.9
    write('whoosh', whoosh(d, 400, 4200, curve=0.8, q=1.4, shape_pow=1.3, peak_at=0.45) + 0.6 * whoosh(d, 3000, 700, curve=1.2, q=2.0, peak_at=0.55), peak=0.7, ms_in=20)

    # The flip: a quick whip swish as the phone spins.
    write('swish', whoosh(0.5, 900, 5200, curve=1.4, q=2.2, shape_pow=1.1, peak_at=0.7), peak=0.6)

    # Impact on the landing: a low thump, a dry crack, and a short burst of air.
    t = t_axis(0.9)
    f = 110 * np.exp(-t / 0.06) + 42
    ph = 2 * np.pi * np.cumsum(f) / SR
    thump = np.sin(ph) * env(t, 0.001, 0.22) + 0.5 * np.sin(2 * ph) * env(t, 0.001, 0.12) + 0.25 * np.sin(3 * ph) * env(t, 0.001, 0.07)
    crack = rng.standard_normal(len(t)) * env(t, 0.0002, 0.012)
    crack = bandpass_sweep(crack, 3000, 1500, q=0.8)
    air = bandpass_sweep(rng.standard_normal(len(t)), 2500, 300, q=0.9) * env(t, 0.002, 0.18)
    write('impact', room(thump + 0.9 * crack / (np.max(np.abs(crack)) + 1e-9) * 0.6 + 0.35 * air / (np.max(np.abs(air)) + 1e-9), 0.5, 0.2, 0.15), peak=0.85)

    # Your numbers start to climb: pings on a rising scale (one file per step).
    scale = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3, 2637.0]
    for k, f0 in enumerate(scale):
        t = t_axis(0.36)
        p = bell(f0, 0.36, 0.08) + 0.4 * bell(f0 * 1.5, 0.36, 0.05)
        write(f'rise-{k}', p, peak=0.6)

    # Count ticks for the climbing likes: tiny wood-block clicks.
    for k in range(6):
        t = t_axis(0.06)
        f0 = 1500 * 2 ** (k / 12)
        tk = np.sin(2 * np.pi * f0 * t) * env(t, 0.0005, 0.01) + 0.3 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, 0.0005, 0.004)
        write(f'tick-{k}', tk, peak=0.5)

    # The "Managed by" tag pops: a round bloop.
    t = t_axis(0.3)
    f = 380 + 700 * (1 - np.exp(-t / 0.03))
    bloop = sweep_sine(f) * env(t, 0.002, 0.08) + 0.25 * sweep_sine(2 * f) * env(t, 0.002, 0.045)
    write('bloop', bloop, peak=0.7)

    # Trending pill / follower toast: a light pop.
    t = t_axis(0.22)
    f = 700 * (0.6 + 0.4 * (1 - np.exp(-t / 0.01)))
    pop = sweep_sine(f) * env(t, 0.001, 0.05) + 0.3 * sweep_sine(2 * f) * env(t, 0.001, 0.025)
    write('pop', pop, peak=0.6)

    # Logo hit: a warm low whomp with a soft air swell and a high shimmer.
    d = 1.4
    t = t_axis(d)
    f = 95 * np.exp(-t / 0.18) + 52
    ph = 2 * np.pi * np.cumsum(f) / SR
    whomp = np.sin(ph) * env(t, 0.004, 0.36) + 0.5 * np.sin(2 * ph) * env(t, 0.004, 0.24) + 0.3 * np.sin(3 * ph) * env(t, 0.004, 0.15)
    whomp += 0.25 * bandpass_sweep(rng.standard_normal(len(t)), 300, 1600, q=0.9) * env(t, 0.01, 0.12)
    for i in range(6):
        s = int(SR * (0.04 + 0.045 * i))
        b = bell(2093.0 * 2 ** (i * 2 / 12), d - 0.3, 0.09)
        whomp[s:s + len(b)] += b * 0.12
    write('logo', room(whomp, 0.8, 0.25, 0.25), peak=0.85)

    # "DM US" tap: a soft, friendly tap.
    t = t_axis(0.35)
    tap = bell(1046.5, 0.35, 0.09) * 0.8 + np.sin(2 * np.pi * 523.3 * t) * env(t, 0.002, 0.06)
    tap += 0.3 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)
    write('tap', tap, peak=0.75)

    # Headline lines landing: a soft low "thock".
    t = t_axis(0.18)
    f = 220 * np.exp(-t / 0.03) + 120
    thock = sweep_sine(f) * env(t, 0.001, 0.05) + 0.2 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.004)
    write('thock', thock, peak=0.6)


if __name__ == '__main__':
    main()
