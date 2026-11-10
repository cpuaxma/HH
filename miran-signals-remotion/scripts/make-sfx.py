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
rng = np.random.default_rng(20261104)


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


def soft_square(f_of_t, harmonics=7):
    """A band-limited square-ish tone (odd harmonics, rolled off): harsher than a sine."""
    ph = 2 * np.pi * np.cumsum(f_of_t) / SR
    out = np.zeros(len(f_of_t))
    for k in range(1, harmonics * 2, 2):
        out += np.sin(k * ph) / (k ** 1.3)
    return np.tanh(1.4 * out)


def lowpass(sig, fc):
    """One-pole low-pass."""
    a = math.exp(-2 * math.pi * fc / SR)
    out = np.zeros(len(sig))
    y = 0.0
    for i, x in enumerate(sig):
        y = (1 - a) * x + a * y
        out[i] = y
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith('.wav'):
            os.remove(os.path.join(OUT, f))

    # ── LEFT: trading blind ───────────────────────────────────────────────────
    # Notification on the left: a short, slightly sour two-note blip (a falling minor third).
    t = t_axis(0.3)
    a = bell(988.0, 0.3, 0.05)
    b = np.zeros(len(t))
    bb = bell(830.6, 0.3 - 0.06, 0.07)
    b[int(SR * 0.06):int(SR * 0.06) + len(bb)] = bb
    write('notif-left', a * 0.8 + b, peak=0.55)

    # Error blips for each loss: harsh, descending, three quick steps (three pitches).
    for k, base in enumerate([740.0, 660.0, 587.0]):
        d = 0.42
        t = t_axis(d)
        sig = np.zeros(len(t))
        for j, (dt, mul) in enumerate([(0.0, 1.0), (0.11, 0.84), (0.22, 0.7)]):
            n = int(SR * 0.12)
            tt = t_axis(0.12)
            f = np.full(n, base * mul) * (1 - 0.06 * tt / 0.12)
            tone = soft_square(f, 5) * env(tt, 0.003, 0.045)
            s0 = int(SR * dt)
            sig[s0:s0 + n] += tone * (1 - 0.15 * j)
        write(f'err-{k}', lowpass(sig, 4200), peak=0.5)

    # Heartbeat under the margin warning: a low "lub-dub", three beats.
    d = 2.4
    t = t_axis(d)
    hb = np.zeros(len(t))
    for beat in range(3):
        for off, f0, g in [(0.0, 62.0, 1.0), (0.2, 54.0, 0.7)]:
            s0 = int(SR * (beat * 0.78 + off))
            tt = t_axis(0.35)
            f = f0 * (1 + 0.6 * np.exp(-tt / 0.02))
            th = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(tt, 0.004, 0.08) * g
            hb[s0:s0 + len(th)] += th[: len(hb) - s0]
    write('heartbeat', hb + 0.05 * lowpass(rng.standard_normal(len(t)), 200) * np.sin(np.pi * t / d), peak=0.8, ms_in=4)

    # Margin call: a soft two-tone alarm (alternating, rounded, low-passed).
    d = 1.6
    t = t_axis(d)
    alt = np.where((t * 4.0) % 1.0 < 0.5, 880.0, 698.5)
    alarm = soft_square(alt, 3) * (0.6 + 0.4 * np.sin(np.pi * np.clip(t / d, 0, 1)))
    alarm = lowpass(alarm, 2600) * np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.3, 0, 1)
    write('alarm', alarm, peak=0.45)

    # A hard hit when the news candle lands on the left: a thump and a dry crack.
    t = t_axis(0.8)
    f = 120 * np.exp(-t / 0.05) + 40
    ph = 2 * np.pi * np.cumsum(f) / SR
    thump = np.sin(ph) * env(t, 0.001, 0.2) + 0.5 * np.sin(2 * ph) * env(t, 0.001, 0.1)
    crack = bandpass_sweep(rng.standard_normal(len(t)) * env(t, 0.0002, 0.015), 2800, 1200, q=0.8)
    write('hit', thump + 0.5 * crack / (np.max(np.abs(crack)) + 1e-9), peak=0.85)

    # ── SHARED: the news candle ───────────────────────────────────────────────
    # A sudden sub-drop with a rumble (both phones, the same frame).
    d = 1.8
    t = t_axis(d)
    f = 34 + 110 * np.exp(-t / 0.18)
    drop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.004, 0.7)
    rumble = lowpass(rng.standard_normal(len(t)), 140) * env(t, 0.01, 0.6)
    rumble /= np.max(np.abs(rumble)) + 1e-9
    air = bandpass_sweep(rng.standard_normal(len(t)), 1800, 200, q=0.9) * env(t, 0.002, 0.25)
    air /= np.max(np.abs(air)) + 1e-9
    write('subdrop', drop + 0.55 * rumble + 0.18 * air, peak=0.9, ms_in=3)

    # ── RIGHT: trading with Miran Gold ────────────────────────────────────────
    # Soft, rising gold chimes as the signal card builds (one per line, a rising pentatonic).
    scale = [880.0, 987.8, 1108.7, 1318.5, 1480.0, 1661.2, 1760.0, 1975.5]
    for k, f0 in enumerate(scale):
        p = bell(f0, 0.5, 0.11) + 0.3 * bell(f0 * 2.0, 0.5, 0.06)
        write(f'chime-{k}', room(p, 0.4, 0.2, 0.15), peak=0.42)

    # TP hit: a bright rising three-note arpeggio with a shimmer.
    d = 1.0
    sig = np.zeros(int(SR * d))
    for j, f0 in enumerate([1318.5, 1661.2, 1975.5]):
        b = bell(f0, d - 0.08 * j, 0.18) + 0.25 * bell(f0 * 2, d - 0.08 * j, 0.08)
        s0 = int(SR * 0.075 * j)
        sig[s0:s0 + len(b)] += b * (0.8 + 0.1 * j)
    write('tp', room(sig, 0.6, 0.25, 0.2), peak=0.55)

    # Miran market update: a calm two-note "update" chime, warm and low, long tail.
    d = 1.4
    sig = np.zeros(int(SR * d))
    for j, f0 in enumerate([659.3, 987.8]):
        b = bell(f0, d - 0.14 * j, 0.32) * 0.9 + 0.2 * bell(f0 * 1.5, d - 0.14 * j, 0.16)
        s0 = int(SR * 0.14 * j)
        sig[s0:s0 + len(b)] += b
    write('update', room(sig, 0.9, 0.35, 0.35), peak=0.5)

    # The right phone's notification: a soft, round single ping.
    write('signal', room(bell(1174.7, 0.6, 0.12) + 0.3 * bell(1760.0, 0.6, 0.07), 0.4, 0.2, 0.15), peak=0.42)

    # Shield: a soft protective swell after the drop (a warm open fifth, slow attack, shimmer).
    d = 1.8
    t = t_axis(d)
    swell = np.clip(t / 0.35, 0, 1) ** 2 * np.exp(-np.maximum(t - 0.35, 0) / 0.6)
    pad = sum(np.sin(2 * np.pi * f0 * t + ph0) * g for f0, ph0, g in [(392.0, 0, 1.0), (587.3, 1.0, 0.7), (784.0, 2.0, 0.35), (1174.7, 0.5, 0.15)])
    shimmer = sum(bell(2349.3 * 2 ** (i / 12), d - 0.3, 0.12) for i in (0, 4, 7))
    sh = pad * swell
    sh[int(SR * 0.25):int(SR * 0.25) + len(shimmer)] += 0.12 * shimmer
    write('shield', room(sh, 0.8, 0.3, 0.3), peak=0.5, ms_in=20)

    # The twist checklist: three gold ticks (a crisp metallic tick plus a rising bell).
    for k, f0 in enumerate([1318.5, 1568.0, 1975.5]):
        t = t_axis(0.6)
        click = rng.standard_normal(len(t)) * env(t, 0.0002, 0.003)
        click = bandpass_sweep(click, 6000, 4000, q=1.5)
        b = bell(f0, 0.6, 0.14) + 0.4 * bell(f0 * 2.76 / 2, 0.6, 0.05)
        write(f'gtick-{k}', room(b + 0.6 * click / (np.max(np.abs(click)) + 1e-9), 0.4, 0.2, 0.15), peak=0.55)

    # The "signal source" tag glint: a tiny high sparkle.
    sig = np.zeros(int(SR * 0.7))
    for i, f0 in enumerate([2637.0, 3136.0, 3520.0, 4186.0]):
        b = bell(f0, 0.5, 0.06)
        s0 = int(SR * 0.03 * i)
        sig[s0:s0 + len(b)] += b * (1 - 0.15 * i)
    write('glint', room(sig, 0.5, 0.3, 0.2), peak=0.35)

    # ── The flip ──────────────────────────────────────────────────────────────
    # The gold streak: a metallic whoosh (air fly-by plus inharmonic ringing partials).
    d = 0.95
    t = t_axis(d)
    air = whoosh(d, 400, 4200, curve=0.8, q=1.4, shape_pow=1.3, peak_at=0.45) + 0.6 * whoosh(d, 3000, 700, curve=1.2, q=2.0, peak_at=0.55)
    air /= np.max(np.abs(air)) + 1e-9
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    ring = sum(np.sin(2 * np.pi * f0 * (1 + 0.04 * np.sin(2 * np.pi * 3 * t)) * t) * g for f0, g in [(1840.0, 0.5), (2710.0, 0.35), (3990.0, 0.2), (5230.0, 0.1)])
    write('whoosh-metal', air + 0.22 * ring * shape, peak=0.7, ms_in=20)

    # The phone spinning: a quick whip swish.
    write('swish', whoosh(0.5, 900, 5200, curve=1.4, q=2.2, shape_pow=1.1, peak_at=0.7), peak=0.6)

    # Impact on the landing: a low thump, a dry crack, a short burst of air.
    t = t_axis(0.9)
    f = 110 * np.exp(-t / 0.06) + 42
    ph = 2 * np.pi * np.cumsum(f) / SR
    thump = np.sin(ph) * env(t, 0.001, 0.22) + 0.5 * np.sin(2 * ph) * env(t, 0.001, 0.12) + 0.25 * np.sin(3 * ph) * env(t, 0.001, 0.07)
    crack = bandpass_sweep(rng.standard_normal(len(t)) * env(t, 0.0002, 0.012), 3000, 1500, q=0.8)
    air = bandpass_sweep(rng.standard_normal(len(t)), 2500, 300, q=0.9) * env(t, 0.002, 0.18)
    write('impact', room(thump + 0.9 * crack / (np.max(np.abs(crack)) + 1e-9) * 0.6 + 0.35 * air / (np.max(np.abs(air)) + 1e-9), 0.5, 0.2, 0.15), peak=0.85)

    # ── Type and end card ─────────────────────────────────────────────────────
    # Headline lines landing: a soft low "thock".
    t = t_axis(0.18)
    f = 220 * np.exp(-t / 0.03) + 120
    thock = sweep_sine(f) * env(t, 0.001, 0.05) + 0.2 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.004)
    write('thock', thock, peak=0.6)

    # Logo hit: a warm low whomp with a soft air swell and a high gold shimmer.
    d = 1.4
    t = t_axis(d)
    f = 95 * np.exp(-t / 0.18) + 52
    ph = 2 * np.pi * np.cumsum(f) / SR
    whomp = np.sin(ph) * env(t, 0.004, 0.36) + 0.5 * np.sin(2 * ph) * env(t, 0.004, 0.24) + 0.3 * np.sin(3 * ph) * env(t, 0.004, 0.15)
    whomp += 0.25 * bandpass_sweep(rng.standard_normal(len(t)), 300, 1600, q=0.9) * env(t, 0.01, 0.12)
    for i in range(6):
        s0 = int(SR * (0.04 + 0.045 * i))
        b = bell(1760.0 * 2 ** (i * 2 / 12), d - 0.3, 0.09)
        whomp[s0:s0 + len(b)] += b * 0.12
    write('logo', room(whomp, 0.8, 0.25, 0.25), peak=0.85)

    # CTA tap: a soft, friendly tap.
    t = t_axis(0.35)
    tap = bell(1046.5, 0.35, 0.09) * 0.8 + np.sin(2 * np.pi * 523.3 * t) * env(t, 0.002, 0.06)
    tap += 0.3 * rng.standard_normal(len(t)) * env(t, 0.0003, 0.003)
    write('tap', tap, peak=0.75)


if __name__ == '__main__':
    main()
