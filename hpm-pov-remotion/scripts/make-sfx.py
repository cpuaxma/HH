#!/usr/bin/env python3
"""Synthesises the reel's sound effects into public/sfx/ (48 kHz, 16-bit mono WAV).

Every sound is generated here from sine waves and filtered noise: original, license-free,
and deliberately generic (no real phone or OS notification sounds). Deterministic: the
noise generator is seeded, so re-running produces identical files.

Usage: python3 scripts/make-sfx.py
"""
import math
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(7)


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


def write(name, sig, peak=0.89):
    sig = fade(sig)
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * peak
    data = (sig * 32767).astype('<i2').tobytes()
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)
    print(f'{name}.wav  {len(sig) / SR:.2f}s')


def ping(f0):
    """Soft glassy notification ping: a fundamental, a fifth and a faint bell partial."""
    t = t_axis(0.45)
    sig = (
        np.sin(2 * np.pi * f0 * t) * env(t, 0.003, 0.16)
        + 0.45 * np.sin(2 * np.pi * f0 * 1.5 * t) * env(t, 0.003, 0.10)
        + 0.12 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, 0.001, 0.04)
    )
    return sig


def whoosh(seconds, f_from, f_to, curve=1.0):
    t = t_axis(seconds)
    noise = rng.standard_normal(len(t))
    sig = bandpass_sweep(noise, f_from, f_to, q=1.6, curve=curve)
    shape = np.sin(np.pi * np.clip(t / seconds, 0, 1)) ** 1.6
    return sig * shape


def main():
    os.makedirs(OUT, exist_ok=True)

    # Pings rise in pitch through the story: lonely → hopeful → busy.
    write('ping-a', ping(1046.5))  # C6
    write('ping-b', ping(1174.7))  # D6
    write('ping-c', ping(1318.5))  # E6

    # Time-jump whoosh.
    write('whoosh', whoosh(0.55, 500, 4200, curve=0.8), peak=0.7)

    # Rewind: a falling whoosh with a stutter, like tape spooling back.
    t = t_axis(0.8)
    w = whoosh(0.8, 5200, 380, curve=0.7)
    stutter = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * (14 + 22 * t) * t))
    write('rewind', w * stutter, peak=0.75)

    # Pepper landing: a soft low thump with a pitch drop.
    t = t_axis(0.35)
    f = 110 * np.exp(-t / 0.08) + 48
    phase = 2 * np.pi * np.cumsum(f) / SR
    thump = np.sin(phase) * env(t, 0.002, 0.09) + 0.25 * rng.standard_normal(len(t)) * env(t, 0.0005, 0.006)
    write('thump', thump)

    # Overheat rumble: low filtered noise with a slow wobble (looped under the overheat).
    t = t_axis(2.0)
    noise = rng.standard_normal(len(t))
    rum = bandpass_sweep(noise, 90, 140, q=0.9) + 0.6 * np.sin(2 * np.pi * 55 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
    # Crossfade the loop seam.
    seam = int(SR * 0.08)
    rum[:seam] = rum[:seam] * np.linspace(0, 1, seam) + rum[-seam:] * np.linspace(1, 0, seam)
    rum = rum[:-seam]
    write('rumble', rum, peak=0.8)

    # "Clear all": a crisp snap into an upward swoosh.
    t = t_axis(0.6)
    snap = rng.standard_normal(len(t)) * env(t, 0.0005, 0.012)
    up = whoosh(0.6, 700, 6000, curve=1.4)
    write('clear', 0.9 * snap + up, peak=0.8)

    # CTA flood: a deep boom under a wide whoosh.
    t = t_axis(1.2)
    f = 70 * np.exp(-t / 0.25) + 38
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.004, 0.35)
    write('flood', boom + 0.5 * whoosh(1.2, 300, 2400, curve=0.6) * env(t, 0.05, 0.5), peak=0.85)


if __name__ == '__main__':
    main()
