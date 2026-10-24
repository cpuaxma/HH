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
    # Upper harmonics + a woody knock so the hit still reads on phone speakers (no sub bass there).
    thump += 0.5 * np.sin(2 * phase) * env(t, 0.002, 0.06) + 0.35 * np.sin(3 * phase) * env(t, 0.002, 0.04)
    thump += 0.4 * np.sin(2 * np.pi * 320 * t) * env(t, 0.001, 0.03)
    write('thump', thump)

    # Overheat rumble: low filtered noise with a slow wobble (looped under the overheat).
    t = t_axis(2.0)
    noise = rng.standard_normal(len(t))
    rum = bandpass_sweep(noise, 90, 140, q=0.9) + 0.6 * np.sin(2 * np.pi * 55 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
    # Crossfade the loop seam.
    seam = int(SR * 0.08)
    rum[:seam] = rum[:seam] * np.linspace(0, 1, seam) + rum[-seam:] * np.linspace(1, 0, seam)
    rum = rum[:-seam]
    # A mid-band hiss on top, so the heat is audible on small speakers too.
    hiss = bandpass_sweep(rng.standard_normal(len(rum)), 380, 520, q=2.0)
    rum = rum / (np.max(np.abs(rum)) + 1e-9) + 0.55 * hiss / (np.max(np.abs(hiss)) + 1e-9)
    write('rumble', rum, peak=0.8)

    # "Clear all": a crisp snap into an upward swoosh.
    t = t_axis(0.6)
    snap = rng.standard_normal(len(t)) * env(t, 0.0005, 0.012)
    up = whoosh(0.6, 700, 6000, curve=1.4)
    write('clear', 0.9 * snap + up, peak=0.8)

    # CTA flood: a deep boom under a wide whoosh.
    t = t_axis(1.2)
    f = 70 * np.exp(-t / 0.25) + 38
    bphase = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(bphase) * env(t, 0.004, 0.35)
    # Harmonics carry the boom on phone speakers.
    boom += 0.55 * np.sin(2 * bphase) * env(t, 0.004, 0.25) + 0.4 * np.sin(3 * bphase) * env(t, 0.004, 0.18)
    boom += 0.3 * np.sin(4 * bphase) * env(t, 0.004, 0.12)
    write('flood', boom + 0.5 * whoosh(1.2, 300, 2400, curve=0.6) * env(t, 0.05, 0.5), peak=0.85)

    outro()


def note(name):
    """'C4' → Hz (A4 = 440)."""
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    return 440.0 * 2 ** ((names[name[0]] + 12 * (int(name[1]) - 4)) / 12)


def mallet(f0, seconds=0.5, decay=0.18):
    """Marimba-like mallet: a fundamental with the bar's 4th partial, quick decay."""
    t = t_axis(seconds)
    return np.sin(2 * np.pi * f0 * t) * env(t, 0.002, decay) + 0.35 * np.sin(2 * np.pi * f0 * 3.93 * t) * env(t, 0.001, decay / 4)


def outro():
    """The CTA has its own palette: warm, musical, on a pulse (nothing from the story)."""
    # Warm pad: Cmaj9, soft detuned saw voices, slow swell, long tail.
    t = t_axis(6.6)
    pad = np.zeros(len(t))
    for name in ['C3', 'G3', 'B3', 'D4', 'E4']:
        for detune in (-0.004, 0.004):
            f = note(name) * (1 + detune)
            for h in range(1, 9):  # band-limited saw, soft top end
                pad += np.sin(2 * np.pi * f * h * t + h) / h * (0.85 ** h)
    swell = np.clip(t / 0.8, 0, 1) ** 2 * (0.88 + 0.12 * np.sin(2 * np.pi * 0.5 * t))
    write('outro-pad', pad * swell, peak=0.7)

    # Kick: a tight synth kick with harmonics so it lands on phone speakers too.
    t = t_axis(0.45)
    f = 150 * np.exp(-t / 0.035) + 50
    ph = 2 * np.pi * np.cumsum(f) / SR
    kick = np.sin(ph) * env(t, 0.001, 0.16) + 0.45 * np.sin(2 * ph) * env(t, 0.001, 0.08) + 0.3 * np.sin(3 * ph) * env(t, 0.001, 0.05)
    kick += 0.35 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.004)
    write('outro-kick', kick)

    # Logo sting: a rising C major arpeggio on mallets.
    t = t_axis(1.1)
    sting = np.zeros(len(t))
    for i, name in enumerate(['C5', 'E5', 'G5', 'C6']):
        start = int(SR * 0.07 * i)
        m = mallet(note(name), 1.1 - 0.07 * i, decay=0.22 + 0.08 * i)
        sting[start:start + len(m)] += m * (0.8 + 0.1 * i)
    write('outro-sting', sting, peak=0.8)

    # Shine sparkle: a quick high glissando of tiny bells.
    t = t_axis(0.7)
    sparkle = np.zeros(len(t))
    for i in range(9):
        start = int(SR * 0.045 * i)
        m = mallet(note('G6') * 2 ** (i / 12 * 2), 0.7 - 0.045 * i, decay=0.07)
        sparkle[start:start + len(m)] += m * (0.5 + 0.05 * i)
    write('outro-sparkle', sparkle, peak=0.55)

    # Final message tone: a soft two-note (G5 → C6) "you've got a message".
    t = t_axis(0.8)
    msg = np.zeros(len(t))
    for i, name in enumerate(['G5', 'C6']):
        start = int(SR * 0.12 * i)
        m = mallet(note(name), 0.8 - 0.12 * i, decay=0.25)
        msg[start:start + len(m)] += m
    write('outro-msg', msg, peak=0.8)


if __name__ == '__main__':
    main()
