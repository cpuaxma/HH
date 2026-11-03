#!/usr/bin/env python3
"""Synthesises the reel's sound effects into public/sfx/ (48 kHz, 16-bit mono WAV).

Every sound is generated here from sine waves and filtered noise: original and
license-free, no library samples. Deterministic: the noise generator is seeded,
so re-running produces identical files. Short, soft and mid-range so they sit
under the music added in Instagram and still read on phone speakers.

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
    warped = np.where(x < peak_at, x / peak_at * 0.5, 0.5 + (x - peak_at) / (1 - peak_at) * 0.5)
    return sig * np.sin(np.pi * warped) ** shape_pow


def bell(f0, seconds, decay):
    t = t_axis(seconds)
    return (
        np.sin(2 * np.pi * f0 * t) * env(t, 0.002, decay)
        + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, 0.001, decay * 0.4)
        + 0.12 * np.sin(2 * np.pi * f0 * 5.40 * t) * env(t, 0.001, decay * 0.18)
    )


def thud(seconds, f_hi, f_lo, tau, decay):
    """A low body hit with a falling pitch and a few harmonics (reads on phone speakers)."""
    t = t_axis(seconds)
    f = (f_hi - f_lo) * np.exp(-t / tau) + f_lo
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (
        np.sin(ph) * env(t, 0.002, decay)
        + 0.6 * np.sin(2 * ph) * env(t, 0.002, decay * 0.6)
        + 0.3 * np.sin(3 * ph) * env(t, 0.002, decay * 0.4)
    )


def main():
    os.makedirs(OUT, exist_ok=True)

    # Thumb flick: a short, papery swish up the screen. Eight pitches; the cues climb
    # through them as the scroll speeds up.
    for k in range(8):
        d = 0.16 - 0.008 * k
        f0 = 1300 * 2 ** (k / 10)
        write(f'flick-{k}', whoosh(d, f0, f0 * 2.6, curve=0.8, q=2.2, shape_pow=1.3, peak_at=0.35), peak=0.6)

    # The feed rushing by: an airy, seamless loop (volume follows the scroll speed).
    t = t_axis(2.06)
    air = bandpass_sweep(rng.standard_normal(len(t)), 2200, 2200, q=0.9)
    air /= np.max(np.abs(air)) + 1e-9
    ticks = np.zeros(len(t))
    # Faint ticks of posts passing (the texture of a feed, not a hiss).
    for i in range(0, len(t), int(SR * 0.055)):
        ct = t_axis(0.012)
        c = np.sin(2 * np.pi * 3400 * ct) * env(ct, 0.0003, 0.002)
        ticks[i:i + len(c)] += c[: len(ticks) - i] * (0.6 + 0.4 * rng.random())
    rush = 0.7 * air + 0.25 * ticks
    seam = int(SR * 0.06)
    rush[:seam] = rush[:seam] * np.linspace(0, 1, seam) + rush[-seam:] * np.linspace(1, 0, seam)
    rush = rush[:-seam]
    write('rush', rush, peak=0.55, ms_in=0)

    # "Scroll." landing: a soft, punchy thump with a little click on top.
    s = thud(0.28, 160, 70, 0.03, 0.07)
    t = t_axis(0.28)
    s += 0.25 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.004)
    write('slam', s, peak=0.8)

    # THE STOP: the brake (a fast falling friction) straight into a heavy thud.
    d = 0.5
    t = t_axis(d)
    brake = whoosh(0.2, 3800, 420, curve=0.7, q=3.0, shape_pow=0.8, peak_at=0.15)
    sig = np.zeros(len(t))
    sig[: len(brake)] += 0.55 * brake / (np.max(np.abs(brake)) + 1e-9)
    hit_at = int(SR * 0.075)
    h = thud(d - 0.075, 110, 42, 0.06, 0.16)
    hn = bandpass_sweep(rng.standard_normal(len(h)), 900, 200, q=0.8) * env(t_axis(d - 0.075), 0.001, 0.03)
    sig[hit_at:] += h + 0.35 * hn / (np.max(np.abs(hn)) + 1e-9)
    write('brake', sig, peak=0.9)

    # Neon flicking on: a dry electrical tick with a short 120 Hz buzz.
    t = t_axis(0.1)
    buzz = (np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3 + np.sin(2 * np.pi * 240 * t) * 0.4) * env(t, 0.001, 0.03)
    buzz += 0.6 * rng.standard_normal(len(t)) * env(t, 0.0002, 0.003)
    write('neon', buzz, peak=0.45)

    # "…wait.": a soft, low tick.
    t = t_axis(0.12)
    write('wait', np.sin(2 * np.pi * 880 * t) * env(t, 0.001, 0.03) + 0.5 * np.sin(2 * np.pi * 440 * t) * env(t, 0.001, 0.05), peak=0.5)

    # Callout pops, a step higher each time, and a tiny tick as each leader line lands.
    for i, f0 in enumerate([587.3, 698.5, 830.6]):
        t = t_axis(0.3)
        f = f0 * (0.55 + 0.45 * (1 - np.exp(-t / 0.012)))
        pop = sweep_sine(t, f) * env(t, 0.001, 0.07) + 0.3 * sweep_sine(t, 2 * f) * env(t, 0.001, 0.035)
        pop += 0.25 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)
        write(f'pop-{i + 1}', pop, peak=0.8)
    t = t_axis(0.07)
    write('dot', np.sin(2 * np.pi * 2100 * t) * env(t, 0.0005, 0.01), peak=0.5)

    # Whip pans between the callout angles.
    write('whip', whoosh(0.32, 700, 4200, curve=1.1, q=1.8, peak_at=0.55), peak=0.7)

    # The pull-back: a longer, wider whoosh.
    write('whoosh', whoosh(0.8, 2600, 380, curve=0.9, q=1.2, shape_pow=1.3, peak_at=0.35), peak=0.65, ms_in=20)

    # The hero lifting off the feed: a soft, warm swell with a shimmer.
    d = 0.6
    t = t_axis(d)
    lift = 0.2 * whoosh(d, 1500, 5000, curve=1.0, q=2.4, peak_at=0.6)
    for i in range(5):
        st = int(SR * 0.06 * i)
        b = bell(1046.5 * 2 ** (i * 4 / 12), d - 0.06 * i, 0.12)
        lift[st:st + len(b)] += b * 0.25
    write('lift', lift, peak=0.45)

    # Contrast lines landing: a dull "meh" thump (bland) and a bright one (bold).
    write('bland', thud(0.22, 120, 80, 0.05, 0.05), peak=0.5)
    t = t_axis(0.3)
    bold = thud(0.3, 190, 85, 0.03, 0.08) + 0.4 * bell(1318.5, 0.3, 0.08)
    write('bold', bold, peak=0.75)

    # The phone gliding off.
    write('swoosh', whoosh(0.55, 500, 3600, curve=1.2, q=1.6, peak_at=0.6), peak=0.6)

    # Logo: a warm low whomp with a soft air swell into it.
    d = 1.0
    t = t_axis(d)
    w = thud(d, 147, 52, 0.18, 0.32)
    w += 0.25 * bandpass_sweep(rng.standard_normal(len(t)), 300, 1600, q=0.9) * env(t, 0.01, 0.12)
    write('whomp', w, peak=0.85)

    # "DM US": a soft, friendly tap.
    t = t_axis(0.35)
    tap = bell(1046.5, 0.35, 0.09) * 0.8 + np.sin(2 * np.pi * 523.3 * t) * env(t, 0.002, 0.06)
    tap += 0.3 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)
    write('tap', tap, peak=0.75)


if __name__ == '__main__':
    main()
