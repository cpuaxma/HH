#!/usr/bin/env python3
"""Synthesises the reel's sound design into public/sfx/ (48 kHz, 16-bit stereo WAV).

Every sound is generated here from sine waves and filtered noise: original and
license-free, with no samples from a library. Deterministic: the noise generator
is seeded, so re-running produces identical files.

The brief is "very smooth": soft attacks (no clicks), warm low-passed tones, a shared
reverb so everything sits in one space, and movement panned right → left to follow
the RTL layout. Red/tension sounds are slightly detuned and restless; gold sounds are
consonant and calm (D major add9), mirroring the visuals.

Usage: python3 scripts/make-sfx.py   (needs numpy)
"""
import math
import os
import wave

import numpy as np

SR = 48000
FPS = 60
DURATION = 2160 / FPS  # full reel, for the ambient bed
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(20261029)

# D major add9, the "gold" harmony; D minor colours the tension at the start.
D3, F3, FS3, A3, D4, E4, F4, FS4, A4, D5, E5, FS5, A5, D6, E6, FS6, A6 = (
    146.83, 174.61, 185.00, 220.00, 293.66, 329.63, 349.23, 369.99, 440.00,
    587.33, 659.25, 739.99, 880.00, 1174.66, 1318.51, 1479.98, 1760.00,
)


# ── building blocks ──────────────────────────────────────────────────────────

def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(t, attack, decay):
    """Smooth (sin²) attack, exponential decay: no clicks."""
    a = np.sin(np.clip(t / attack, 0, 1) * np.pi / 2) ** 2
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def hump(n, peak_at=0.5, power=2.0):
    """0 → 1 → 0 bell-shaped envelope peaking at `peak_at` (fraction of n)."""
    x = np.linspace(0, 1, n)
    warped = np.where(x < peak_at, x / peak_at * 0.5, 0.5 + (x - peak_at) / (1 - peak_at) * 0.5)
    return np.sin(np.pi * warped) ** power


def _spectral(sig, gain_of_f):
    n = len(sig)
    spec = np.fft.rfft(sig)
    f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(spec * gain_of_f(f), n)


def lowpass(sig, fc, order=2):
    return _spectral(sig, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def lowpass_st(st, fc, order=2):
    return np.stack([lowpass(st[:, 0], fc, order), lowpass(st[:, 1], fc, order)], axis=1)


def highpass(sig, fc, order=1):
    return _spectral(sig, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order)))


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


def norm(sig):
    return sig / (np.max(np.abs(sig)) + 1e-9)


def glide(t, f_of_t, harmonics=((1, 1.0),)):
    """Sine (plus harmonics) following an instantaneous-frequency curve."""
    ph = 2 * np.pi * np.cumsum(f_of_t) / SR
    return sum(a * np.sin(h * ph) for h, a in harmonics)


def bell(f0, t, decay, attack=0.003):
    """Soft bell: fundamental plus quieter, faster-decaying inharmonic partials."""
    return (
        np.sin(2 * np.pi * f0 * t) * env(t, attack, decay)
        + 0.28 * np.sin(2 * np.pi * f0 * 2.76 * t) * env(t, attack, decay * 0.45)
        + 0.08 * np.sin(2 * np.pi * f0 * 5.40 * t) * env(t, attack, decay * 0.2)
    )


def pad_voice(freq, t, detune_cents=5.0, voices=3):
    """Chorus of slightly detuned soft voices (fundamental + gentle 2nd/3rd harmonics)."""
    out = np.zeros(len(t))
    for v in range(voices):
        cents = (v - (voices - 1) / 2) * detune_cents + rng.uniform(-1.5, 1.5)
        f = freq * 2 ** (cents / 1200)
        ph = rng.uniform(0, 2 * np.pi)
        out += np.sin(2 * np.pi * f * t + ph) + 0.16 * np.sin(4 * np.pi * f * t + ph) + 0.04 * np.sin(6 * np.pi * f * t + ph)
    return out / voices


def pan(mono, p):
    """Equal-power pan, p in [-1 (left), 1 (right)]; p may be an array (moving pan)."""
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def sweep_pan(mono, p_from, p_to):
    x = np.linspace(0, 1, len(mono))
    s = x * x * (3 - 2 * x)
    return pan(mono, p_from + (p_to - p_from) * s)


def _fftconvolve(a, b):
    n = len(a) + len(b) - 1
    size = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, size) * np.fft.rfft(b, size), size)[:n]


def _make_ir(seconds=2.6, decay=0.48, predelay=0.018):
    """Stereo, decorrelated, darkening noise tail: a soft hall."""
    t = t_axis(seconds)
    irs = []
    for _ in range(2):
        tail = rng.standard_normal(len(t)) * np.exp(-t / decay)
        # Later reflections get darker: blend a heavily low-passed copy in over time.
        dark = lowpass(tail, 1800)
        mix = np.clip(t / seconds * 1.6, 0, 1)
        tail = lowpass(tail * (1 - mix) + dark * mix, 7000)
        tail = np.concatenate([np.zeros(int(SR * predelay)), tail])
        irs.append(tail / np.sqrt(np.sum(tail ** 2)))
    return irs


IR = _make_ir()


def reverb(st, wet, tail=1.6):
    """Add the shared hall to a stereo signal; output is extended by `tail` seconds."""
    pad = np.zeros((int(SR * tail), 2))
    dry = np.concatenate([st, pad])
    out = dry.copy()
    for ch in range(2):
        w = _fftconvolve(st[:, ch], IR[ch])[: len(dry)]
        out[:, ch] = dry[:, ch] * (1 - wet * 0.5) + w * wet * 6.0
    return out


def fade(st, ms_in=3, ms_out=60):
    st = st.copy()
    a = int(SR * ms_in / 1000)
    b = int(SR * ms_out / 1000)
    if a:
        st[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        st[-b:] *= (np.linspace(1, 0, b) ** 2)[:, None]
    return st


def trim_tail(st, floor_db=-66):
    level = np.max(np.abs(st), axis=1)
    thresh = np.max(level) * 10 ** (floor_db / 20)
    idx = np.nonzero(level > thresh)[0]
    return st[: idx[-1] + int(SR * 0.05)] if len(idx) else st


def write(name, st, peak=0.7, ms_in=3, trim=True):
    if st.ndim == 1:
        st = pan(st, 0)
    st = st / (np.max(np.abs(st)) + 1e-9) * peak
    if trim:
        st = trim_tail(st)
    st = fade(st, ms_in=ms_in)
    data = (np.clip(st, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)
    print(f'{name}.wav  {len(st) / SR:.2f}s')


def whoosh(seconds, f_from, f_to, q=1.4, peak_at=0.5, power=2.0, curve=1.0, lp=6000):
    """Airy, rounded whoosh: swept band-passed noise under a smooth hump."""
    n = int(SR * seconds)
    sig = bandpass_sweep(rng.standard_normal(n), f_from, f_to, q=q, curve=curve)
    sig = lowpass(sig, lp)
    return norm(sig * hump(n, peak_at, power))


# ── the sounds ───────────────────────────────────────────────────────────────

def main():
    os.makedirs(OUT, exist_ok=True)

    # Scene transitions: soft airy whooshes drifting right → left (the RTL direction).
    for i, (f0, f1) in enumerate([(320, 1900), (260, 1500)]):
        w = whoosh(0.85, f0, f1, q=1.3, peak_at=0.55)
        write(f'whoosh-{i}', reverb(sweep_pan(w, 0.45, -0.45), 0.25), peak=0.6, ms_in=20)

    # CTA wipe: brighter, wider, with a faint glassy tone riding it.
    d = 0.95
    t = t_axis(d)
    w = whoosh(d, 600, 5200, q=1.6, peak_at=0.4, lp=8000)
    tone = glide(t, 1760 + 900 * (t / d), ((1, 1.0), (2, 0.15))) * hump(len(t), 0.45, 3) * 0.12
    write('wipe', reverb(sweep_pan(w + tone, 0.75, -0.75), 0.3), peak=0.65, ms_in=20)

    # Gold line drawing upward: a smooth glide G3 → D5 with soft air, swelling then easing out.
    for name, d in [('rise', 1.3), ('rise-long', 1.6)]:
        t = t_axis(d)
        x = t / d
        f = 196 * 2 ** (1.58 * (1 - (1 - x) ** 2))  # decelerating, like the eased line
        tone = glide(t, f, ((1, 1.0), (2, 0.22), (3, 0.06))) * hump(len(t), 0.6, 1.2)
        air = whoosh(d, 700, 4200, q=1.8, peak_at=0.65, power=1.6) * 0.35
        write(name, reverb(sweep_pan(lowpass(tone, 3500) * 0.5 + air, -0.35, 0.35), 0.35), peak=0.55, ms_in=40)

    # Tension bed: two low tones a few hertz apart (a slow, uneasy beat) plus a restless,
    # flickering band of air. Seamlessly loopable.
    d = 4.0
    t = t_axis(d + 0.1)
    wob = 0.5 + 0.5 * np.interp(t, np.arange(0, d + 0.2, 0.09), rng.uniform(0, 1, len(np.arange(0, d + 0.2, 0.09))))
    low = np.sin(2 * np.pi * 110 * t) + np.sin(2 * np.pi * 116.5 * t) + 0.35 * np.sin(2 * np.pi * 220.6 * t)
    chans = []
    for _ in range(2):
        flutter = lowpass(bandpass_sweep(rng.standard_normal(len(t)), 760, 760, q=2.2), 2400)
        chans.append(0.55 * norm(low) + 0.45 * norm(flutter) * wob)
    st = np.stack(chans, axis=1)
    seam = int(SR * 0.1)
    st[:seam] = st[:seam] * np.linspace(0, 1, seam)[:, None] + st[-seam:] * np.linspace(1, 0, seam)[:, None]
    st = st[:-seam]
    write('tension', lowpass_st(st, 2600), peak=0.5, ms_in=0, trim=False)  # FFT filtering is circular, so the loop stays seamless

    # Red map spots: soft muted "sonar" blips, slightly sour pitches, scattered in the stereo field.
    for i, (f0, p) in enumerate([(392, 0.5), (415.3, -0.4), (440, 0.2), (466.2, -0.6)]):
        t = t_axis(0.5)
        f = f0 * (1 - 0.04 * (1 - np.exp(-t / 0.08)))
        s = glide(t, f, ((1, 1.0), (2, 0.12))) * env(t, 0.008, 0.11)
        write(f'blip-{i}', reverb(pan(lowpass(s, 1800), p), 0.45), peak=0.5, ms_in=8)

    # Gold sparkle: a quick ascending run of tiny bells (pentatonic on D).
    d = 1.0
    t = t_axis(d)
    sp = np.zeros(len(t))
    for i, f0 in enumerate([D6, E6, FS6, A6, D6 * 2, E6 * 2]):
        s0 = int(SR * 0.045 * i)
        tt = t[: len(t) - s0]
        sp[s0:] += bell(f0, tt, 0.16, attack=0.004) * (0.55 + 0.08 * i)
    write('sparkle', reverb(sweep_pan(lowpass(sp, 9000), -0.2, 0.3), 0.5), peak=0.42, ms_in=6)

    # Particles flowing into the shield: a slow swirl that circles the stereo field and rises.
    d = 2.6
    t = t_axis(d)
    a = whoosh(d, 280, 1500, q=1.1, peak_at=0.62, power=1.5, curve=0.9)
    b = whoosh(d, 520, 2600, q=1.6, peak_at=0.7, power=1.8, curve=1.1)
    circle = 0.65 * np.sin(2 * np.pi * 0.55 * t)
    st = pan(a, circle) + 0.6 * pan(b, -circle)
    write('swirl', reverb(st, 0.35), peak=0.55, ms_in=60)

    # Gold bloom: a warm D add9 chord swelling in, with two soft bells on top.
    d = 3.4
    t = t_axis(d)
    swell = np.sin(np.clip(t / 0.45, 0, 1) * np.pi / 2) ** 2 * np.exp(-np.maximum(t - 0.45, 0) / 1.3)
    chans = []
    for _ in range(2):
        chord = sum(g * pad_voice(f, t) for f, g in [(D3, 0.6), (A3, 0.7), (FS4, 0.6), (E5, 0.35), (A5, 0.18)])
        chans.append(lowpass(chord * swell, 3800))
    st = np.stack(chans, axis=1)
    st += pan(0.22 * (bell(A5, t, 0.9, 0.01) + 0.7 * bell(D6, np.maximum(t - 0.09, 0), 0.8, 0.01)), 0.15)
    write('bloom', reverb(st, 0.45, tail=2.2), peak=0.6, ms_in=30)

    # Hero landing (gold bar): a soft, warm "thum" with a little golden sheen.
    d = 1.3
    t = t_axis(d)
    f = 62 + 70 * np.exp(-t / 0.06)
    body = glide(t, f, ((1, 1.0), (2, 0.5), (3, 0.2))) * env(t, 0.006, 0.24)
    felt = lowpass(rng.standard_normal(len(t)), 500) * env(t, 0.004, 0.035) * 3.0
    sheen = 0.16 * bell(D5, t, 0.45, 0.006)
    write('land', reverb(pan(lowpass(norm(body + felt) + sheen, 4000), 0), 0.3), peak=0.75, ms_in=6)

    # Logo landing: an air swell (0.35s) into a deeper, longer thum and a gold shimmer.
    d = 2.6
    t = t_axis(d)
    hit = 0.35
    th = np.maximum(t - hit, 0)
    on = (t >= hit).astype(float)
    swell = whoosh(d, 300, 2200, q=1.2, peak_at=hit / d, power=2.5) * 0.45
    f = 52 + 80 * np.exp(-th / 0.08)
    body = glide(t, f, ((1, 1.0), (2, 0.45), (3, 0.18))) * env(th, 0.008, 0.5) * on
    chime = (0.2 * bell(A5, th, 1.1, 0.01) + 0.15 * bell(D6, th, 1.0, 0.01) + 0.1 * bell(FS6, th, 0.9, 0.01)) * on
    st = pan(swell, 0) + pan(norm(body), 0) + sweep_pan(chime, -0.25, 0.25)
    write('logo', reverb(lowpass_st(st, 5000), 0.4, tail=2.0), peak=0.8, ms_in=40)

    # Icons appearing: soft glass plinks, panned to each icon (government right, bank left).
    for i, (f0, p) in enumerate([(D6, 0.5), (E6, 0.0), (FS6, -0.5)]):
        t = t_axis(0.5)
        s = np.sin(2 * np.pi * f0 * t) * env(t, 0.004, 0.11) + 0.15 * np.sin(2 * np.pi * f0 * 2.32 * t) * env(t, 0.004, 0.05)
        write(f'plink-{i}', reverb(pan(s, p), 0.5), peak=0.4, ms_in=4)

    # A connection breaking into dots: a sprinkle of tiny grains drifting down in pitch.
    for i, p in enumerate([0.5, 0.0, -0.5]):
        d = 1.0
        t = t_axis(d)
        st = np.zeros((len(t), 2))
        for g in range(46):
            at = d * 0.75 * rng.uniform(0, 1) ** 1.6
            s0 = int(SR * at)
            gt = t_axis(0.03)
            f0 = 4000 * 2 ** (-2.0 * at / d) * rng.uniform(0.85, 1.15)
            grain = np.sin(2 * np.pi * f0 * gt) * np.sin(np.pi * gt / 0.03) ** 2 * (1 - at / d) ** 1.5
            gp = np.clip(p + rng.uniform(-0.3, 0.3), -1, 1)
            seg = pan(grain, gp)
            end = min(len(t), s0 + len(seg))
            st[s0:end] += seg[: end - s0]
        air = whoosh(d, 3200, 900, q=1.4, peak_at=0.25, power=1.6) * 0.25
        st += pan(air, p)
        write(f'dissolve-{i}', reverb(lowpass_st(st, 5500), 0.45), peak=0.38, ms_in=4)

    # Odometer: soft muted ticks on a rising scale.
    for k in range(10):
        t = t_axis(0.12)
        f0 = 980 * 2 ** (k / 14)
        s = np.sin(2 * np.pi * f0 * t) * env(t, 0.0015, 0.018) + 0.2 * lowpass(rng.standard_normal(len(t)), 2500) * env(t, 0.001, 0.006)
        write(f'tick-{k}', reverb(pan(lowpass(s, 4000), 0), 0.2, tail=0.5), peak=0.35, ms_in=2)

    # A settling chime: two calm bells (A5 over E5).
    t = t_axis(1.6)
    s = bell(A5, t, 0.5, 0.006) + 0.6 * bell(E5, np.maximum(t - 0.06, 0), 0.55, 0.006)
    write('settle', reverb(pan(s, 0), 0.45), peak=0.45, ms_in=6)

    # Arrows: a short "fwip" in from the left that lands in a soft tink, rising per arrow.
    for i, f0 in enumerate([D6, E6, FS6, A6, D6 * 2, E6 * 2]):
        d = 0.9
        t = t_axis(d)
        land = 0.37
        w = whoosh(land + 0.05, 700, 3000, q=1.8, peak_at=0.8, power=1.8)
        st = np.zeros((len(t), 2))
        st[: len(w)] += sweep_pan(w * 0.55, -0.95, -0.5)
        tl = np.maximum(t - land, 0)
        st += pan(0.6 * bell(f0, tl, 0.14, 0.004) * (t >= land), -0.5)
        write(f'arrow-{i}', reverb(st, 0.35), peak=0.42, ms_in=6)

    # Glass panel/card sliding in: a soft glassy swish.
    d = 0.7
    t = t_axis(d)
    w = whoosh(d, 1100, 3600, q=2.4, peak_at=0.35)
    tone = 0.12 * np.sin(2 * np.pi * 2093 * t) * env(t, 0.03, 0.18)
    write('glass', reverb(sweep_pan(w + tone, 0.3, -0.1), 0.35), peak=0.4, ms_in=20)

    # Timeline light streak drawn right → left: an airy band panned across the field.
    d = 1.3
    t = t_axis(d)
    band = lowpass(bandpass_sweep(rng.standard_normal(len(t)), 1700, 2800, q=2.2), 6000)
    tone = np.sin(2 * np.pi * A5 * t) * 0.5 + np.sin(2 * np.pi * E6 * t) * 0.18
    st = sweep_pan(norm(band) * 0.7 + tone * 0.3, 0.85, -0.85) * hump(len(t), 0.35, 1.4)[:, None]
    write('streak', reverb(st, 0.35), peak=0.45, ms_in=20)

    # Coins along the timeline: an ancient, dull strike → a bright minted ring → the bar.
    t = t_axis(1.0)
    s = (np.sin(2 * np.pi * 523 * t) * env(t, 0.003, 0.12) + 0.5 * np.sin(2 * np.pi * 523 * 1.93 * t) * env(t, 0.003, 0.06)
         + 0.3 * np.sin(2 * np.pi * 523 * 2.87 * t) * env(t, 0.003, 0.04)
         + 0.6 * glide(t, 90 + 60 * np.exp(-t / 0.03)) * env(t, 0.004, 0.06))
    write('coin-ancient', reverb(pan(lowpass(s, 2800), 0.5), 0.35), peak=0.5, ms_in=4)

    t = t_axis(1.8)
    s = bell(1046.5, t, 0.6, 0.003) + 0.4 * bell(1567.98, t, 0.45, 0.003) + 0.35 * glide(t, 120 + 50 * np.exp(-t / 0.03)) * env(t, 0.004, 0.05)
    write('coin-minted', reverb(pan(lowpass(s, 7000), 0), 0.4), peak=0.5, ms_in=4)

    t = t_axis(2.4)
    f = 62 + 70 * np.exp(-t / 0.06)
    body = glide(t, f, ((1, 1.0), (2, 0.5), (3, 0.2))) * env(t, 0.006, 0.28)
    chord = 0.35 * bell(D5, t, 0.9, 0.006) + 0.28 * bell(A5, t, 0.8, 0.006) + 0.2 * bell(D6, t, 0.7, 0.006)
    write('bar-land', reverb(pan(lowpass(norm(body) * 0.8 + chord, 6000), -0.5), 0.45, tail=2.0), peak=0.62, ms_in=6)

    # Pills (tip label, CTA button): a soft rounded pop.
    t = t_axis(0.4)
    f = 480 + 320 * (1 - np.exp(-t / 0.02))
    s = glide(t, f, ((1, 1.0), (2, 0.2))) * env(t, 0.004, 0.055)
    write('pill', reverb(pan(lowpass(s, 3000), 0), 0.3), peak=0.5, ms_in=4)

    # News spike: a quick smooth rise to the peak, then a gentle slide back down (the retrace).
    d = 1.0
    t = t_axis(d)
    up = 0.18
    f = np.where(t < up, 330 * 3 ** (t / up), 990 * (520 / 990) ** np.clip((t - up) / 0.45, 0, 1))
    amp = np.where(t < up, np.sin(np.pi / 2 * t / up) ** 2, np.exp(-(t - up) / 0.3))
    s = glide(t, f, ((1, 1.0), (2, 0.18))) * amp
    air = whoosh(d, 900, 3000, q=1.6, peak_at=0.2, power=1.6) * 0.3
    write('spike', reverb(pan(lowpass(s, 3500) * 0.6 + air, 0.1), 0.35), peak=0.42, ms_in=8)

    # The red "news" tag: a soft, slightly sour two-note alert (minor second), muted.
    t = t_axis(0.6)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 7 * t)
    a = glide(t, 622.25 * vib, ((1, 1.0), (2, 0.1))) * env(t, 0.005, 0.07)
    b = np.zeros(len(t))
    s0 = int(SR * 0.075)
    b[s0:] = glide(t[: len(t) - s0], 587.33 * vib[: len(t) - s0], ((1, 1.0), (2, 0.1))) * env(t[: len(t) - s0], 0.005, 0.09)
    write('news', reverb(pan(lowpass(a + b, 2200), 0.2), 0.35), peak=0.4, ms_in=5)

    # Light streak tracing the spike: a fine high shimmer.
    d = 0.8
    t = t_axis(d)
    sh = whoosh(d, 3000, 6500, q=2.6, peak_at=0.45, power=1.8) * 0.5
    for i, f0 in enumerate([A5 * 2, D6 * 2]):
        s0 = int(SR * (0.15 + 0.12 * i))
        sh[s0:] += 0.3 * bell(f0, t[: len(t) - s0], 0.12, 0.004)
    write('trace', reverb(sweep_pan(sh, -0.2, 0.3), 0.45), peak=0.32, ms_in=10)

    # Ambient bed for the whole reel: a dark D minor colour while tension builds, resolving to
    # warm D add9 as the shield glows (~6s), lifting for the CTA and fading out at the end.
    t = t_axis(DURATION)
    resolve = (6.0, 7.2)
    cta = 1730 / FPS
    end_fade = (DURATION - 2.2, DURATION)

    def curve(keys):
        ks, vs = zip(*keys)
        return np.interp(t, ks, vs)

    dark = curve([(0, 0), (1.2, 1), (resolve[0], 1), (resolve[1], 0), (DURATION, 0)])
    warm = curve([(0, 0), (resolve[0], 0), (resolve[1], 1), (cta, 1), (cta + 1.2, 1.35), (end_fade[0], 1.35), (end_fade[1], 0)])
    breath = 1 + 0.12 * np.sin(2 * np.pi * t / 7.3) + 0.06 * np.sin(2 * np.pi * t / 3.1 + 1)
    chans = []
    for _ in range(2):
        minor = sum(g * pad_voice(f, t, 6) for f, g in [(D3, 0.8), (A3, 0.6), (F4, 0.45)])
        major = sum(g * pad_voice(f, t, 6) for f, g in [(D3, 0.75), (A3, 0.6), (FS4, 0.42), (E5, 0.2)])
        lift = sum(g * pad_voice(f, t, 7) for f, g in [(A4, 0.25), (D5, 0.18)]) * curve([(0, 0), (cta, 0), (cta + 1.2, 1), (DURATION, 1)])
        mix = lowpass(minor, 900) * dark + lowpass(major + lift, 2400) * warm
        air = highpass(lowpass(rng.standard_normal(len(t)), 3500), 700) * 0.05
        chans.append(mix * breath + air * (0.4 + 0.6 * warm))
    st = np.stack(chans, axis=1)
    st *= np.minimum(1, t / 0.05)[:, None] * curve([(0, 1), (end_fade[0], 1), (end_fade[1], 0)])[:, None]
    write('bed', reverb(st, 0.35, tail=0.0)[: len(t)], peak=0.5, ms_in=40, trim=False)


if __name__ == '__main__':
    main()
