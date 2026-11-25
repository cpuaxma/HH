#!/usr/bin/env python3
"""
Synthesises ORIGINAL placeholder audio for every slot (no samples, no libraries beyond numpy):
  public/music.mp3        tense 120-bpm pulse → warm swell for the survivors → resolve
  public/sfx/*.mp3        ripple, hit, crack, lever, chain, rush, whisper, rise, flare, shine, whoosh
Replace any file with your own; the video picks up whatever exists in /public.
  python3 scripts/make-audio.py
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(os.path.join(ROOT, "sfx"), exist_ok=True)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env_ad(n, a, d, curve=4.0):
    """Attack (s) then exponential decay over d (s)."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))
    return att * dec


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (time-varying)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def bandpass_fft(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3 + 1e-9), 0, 1)
    return np.fft.irfft(X * m, len(x))


def saw(freq, t, harmonics=24):
    out = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        out += np.sin(2 * np.pi * freq * k * t) / k
    return out * (2 / np.pi)


def sweep_sine(f0, f1, n, curve=1.0):
    u = np.linspace(0, 1, n) ** curve
    f = f0 + (f1 - f0) * u
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def stereo(mono, width=0.0, delay_ms=0.0):
    d = int(delay_ms * SR / 1000)
    left = mono
    right = np.concatenate([np.zeros(d), mono[: len(mono) - d]]) if d else mono
    return np.stack([left * (1 - width * 0.5) + right * width * 0.5, right * (1 - width * 0.5) + left * width * 0.5], axis=1)


def reverb(x, sec=1.6, mix=0.25):
    """Cheap diffuse tail: convolve with decaying noise (FFT)."""
    n = int(sec * SR)
    ir = rng.standard_normal(n) * np.exp(-5 * np.arange(n) / n)
    ir = lowpass(ir, 6000)
    ir /= np.sqrt(np.sum(ir**2))
    outs = []
    for ch in range(x.shape[1]):
        ir_c = np.roll(ir, ch * 97)
        L = len(x) + n
        y = np.fft.irfft(np.fft.rfft(x[:, ch], L) * np.fft.rfft(ir_c, L), L)[: len(x)]
        outs.append(x[:, ch] * (1 - mix) + y * mix * 0.6)
    return np.stack(outs, axis=1)


def write(name, x, peak=0.89):
    if x.ndim == 1:
        x = stereo(x)
    fade = min(len(x), int(0.01 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    wav = os.path.join(ROOT, name.replace(".mp3", ".wav"))
    with wave.open(wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-q:a", "2", os.path.join(ROOT, name)], check=True)
    os.remove(wav)
    print("wrote", name, f"{len(x) / SR:.2f}s")


# ── SFX ──────────────────────────────────────────────────────────────────────

def sfx_hit():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    boom = sweep_sine(110, 38, n, 0.35) * env_ad(n, 0.004, 1.3, 4.5)
    sub = np.sin(2 * np.pi * 41 * t) * env_ad(n, 0.01, 1.5, 3.5) * 0.6
    click = lowpass(rng.standard_normal(n), 3500) * env_ad(n, 0.001, 0.06, 6) * 0.9
    body = bandpass_fft(rng.standard_normal(n), 120, 600) * env_ad(n, 0.002, 0.25, 5) * 0.5
    x = stereo(np.tanh(1.6 * (boom + sub + click + body)), 0.3, 7)
    write("sfx/hit.mp3", reverb(x, 1.4, 0.22))


def sfx_crack():
    n = int(1.0 * SR)
    x = np.zeros(n)
    for k in range(7):
        at = int((0.0 + k * 0.035 + rng.random() * 0.02) * SR)
        m = int(0.12 * SR)
        burst = bandpass_fft(rng.standard_normal(m), 1500 + 900 * rng.random(), 7000) * env_ad(m, 0.0005, 0.08, 7)
        x[at : at + m] += burst * (1 - k * 0.1)
    low = sweep_sine(180, 60, n, 0.5) * env_ad(n, 0.002, 0.4, 5) * 0.5
    x = stereo(x + low, 0.5, 11)
    write("sfx/crack.mp3", reverb(x, 1.0, 0.3))


def sfx_lever():
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    wob = 1 + 0.25 * np.sin(2 * np.pi * (1.2 + 1.8 * t / t[-1]) * t)
    groan = saw(46, t, 30) * wob
    groan = lowpass(groan, 500 + 400 * np.sin(2 * np.pi * 0.9 * t) ** 2)
    fric = bandpass_fft(rng.standard_normal(n), 600, 2400) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 3.1 * t)) ** 6)
    amp = np.clip(t / 0.4, 0, 1) * np.clip((t[-1] - t) / 0.5, 0, 1) * (0.5 + 0.5 * t / t[-1])
    x = stereo((groan * 0.8 + fric * 0.35) * amp, 0.4, 13)
    write("sfx/lever.mp3", reverb(x, 1.6, 0.3))


def sfx_chain():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    at = 0.0
    gap = 0.24
    k = 0
    while at < 1.7:
        m = int(0.16 * SR)
        s = int(at * SR)
        if s + m > n:
            break
        tt = np.arange(m) / SR
        buzz = np.sign(np.sin(2 * np.pi * (70 + 15 * k) * tt)) * 0.4 + bandpass_fft(rng.standard_normal(m), 2000, 9000) * 0.9
        x[s : s + m] += buzz * env_ad(m, 0.001, 0.1, 5) * (0.7 + 0.3 * rng.random())
        at += gap
        gap = max(0.07, gap * 0.84)
        k += 1
    hum = saw(55, t, 12) * 0.15 * np.clip(t / 0.3, 0, 1) * np.clip((t[-1] - t) / 0.6, 0, 1)
    x = stereo(np.tanh(2 * (x + hum)), 0.6, 9)
    write("sfx/chain.mp3", reverb(x, 1.2, 0.25))


def noise_sweep(sec, f0, f1, curve=1.5, rise=0.7):
    n = int(sec * SR)
    t = np.arange(n) / SR
    u = t / t[-1]
    cutoff = f0 + (f1 - f0) * u**curve
    x = lowpass(rng.standard_normal(n), cutoff) - lowpass(rng.standard_normal(n), cutoff * 0.35) * 0.6
    amp = np.clip(u / rise, 0, 1) ** 2 * np.clip((1 - u) / 0.12, 0, 1)
    return x * amp


def sfx_rush():
    x = noise_sweep(1.8, 300, 6000, 1.8, 0.85)
    n = len(x)
    t = np.arange(n) / SR
    rumble = lowpass(rng.standard_normal(n), 120) * np.clip(t / 1.2, 0, 1) * 2.5
    pitch = sweep_sine(220, 880, n, 2.0) * np.clip(t / 1.6, 0, 1) ** 3 * 0.25
    write("sfx/rush.mp3", reverb(stereo(x + rumble + pitch, 0.7, 15), 1.2, 0.2))


def sfx_whoosh():
    x = noise_sweep(0.8, 400, 3200, 1.2, 0.6)
    write("sfx/whoosh.mp3", reverb(stereo(x, 0.8, 12), 0.8, 0.2), peak=0.7)


def sfx_whisper():
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    src = rng.standard_normal(n)
    out = np.zeros(n)
    # Breathy "sss" + shifting formants: unintelligible, just the texture of a whisper.
    for f, bw in [(700, 300), (1200, 400), (2500, 700), (6000, 2500)]:
        out += bandpass_fft(src, f - bw, f + bw) * (0.6 + 0.4 * np.sin(2 * np.pi * (2.3 + f / 3000) * t + f))
    gate = np.clip(np.sin(2 * np.pi * 1.7 * t) * 1.5 + 0.6, 0, 1) * np.clip(t / 0.3, 0, 1) * np.clip((t[-1] - t) / 0.6, 0, 1)
    x = stereo(out * gate, 1.0, 23)
    write("sfx/whisper.mp3", reverb(x, 2.0, 0.45), peak=0.75)


def chord(freqs, sec, harmonics=10, detune=0.004):
    t = t_axis(sec)
    x = np.zeros_like(t)
    for f in freqs:
        for d in (-detune, 0, detune):
            x += saw(f * (1 + d), t, harmonics)
    return x / (len(freqs) * 3)


def sfx_ripple():
    n = int(2.0 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    notes = [880, 1108.7, 1318.5, 1760, 2217.5, 2637]
    for k, f in enumerate(notes):
        s = int(k * 0.045 * SR)
        m = n - s
        tt = np.arange(m) / SR
        x[s:] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt)) * env_ad(m, 0.002, 1.2, 5) * 0.5
    swell = noise_sweep(2.0, 2000, 9000, 1.0, 0.15) * 0.25
    low = sweep_sine(55, 70, n) * env_ad(n, 0.05, 1.5, 3) * 0.5
    write("sfx/ripple.mp3", reverb(stereo(x + swell + low, 0.8, 17), 2.2, 0.4))


def sfx_rise():
    sec = 3.0
    t = t_axis(sec)
    pad = lowpass(chord([110, 164.8, 220, 277.2, 329.6], sec, 14), 400 + 2400 * (t / sec) ** 1.5)
    amp = np.clip(t / 1.8, 0, 1) ** 2 * np.clip((sec - t) / 0.8, 0, 1)
    shimmer = sum(np.sin(2 * np.pi * f * t) for f in (1318.5, 1760, 2217.5)) * 0.05 * np.clip((t - 1.0) / 1.5, 0, 1)
    write("sfx/rise.mp3", reverb(stereo(pad * amp + shimmer * amp, 0.7, 19), 2.5, 0.4))


def sfx_flare():
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    burst = lowpass(rng.standard_normal(n), 9000) * env_ad(n, 0.003, 0.5, 5) * 0.6
    boom = sweep_sine(90, 40, n, 0.4) * env_ad(n, 0.005, 1.2, 4) * 0.8
    bell = sum(np.sin(2 * np.pi * f * t) * w for f, w in ((880, 0.5), (1320, 0.35), (1760, 0.3), (2640, 0.2))) * env_ad(n, 0.003, 2.0, 4)
    write("sfx/flare.mp3", reverb(stereo(np.tanh(burst + boom + bell * 0.6), 0.6, 9), 2.4, 0.4))


def sfx_shine():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    x = sweep_sine(2600, 5200, n, 0.6) * env_ad(n, 0.01, 0.6, 5) * 0.4
    x += sum(np.sin(2 * np.pi * f * t) for f in (3520, 4186)) * env_ad(n, 0.005, 0.9, 5) * 0.25
    write("sfx/shine.mp3", reverb(stereo(x, 0.9, 21), 1.6, 0.45), peak=0.6)


# ── Music: 40 s, 120 bpm (one beat = 15 frames) ─────────────────────────────

def music():
    sec = 40.0
    t = t_axis(sec)
    n = len(t)
    beat = 0.5
    out = np.zeros((n, 2))
    calm = np.clip((t - 28.0) / 1.5, 0, 1) * np.clip((33.5 - t) / 1.5, 0, 1)  # survivors: warm swell
    resolve = np.clip((t - 33.0) / 1.0, 0, 1)  # arrow + CTA
    tense = 1 - np.maximum(calm, resolve)

    # Drone: A1 + E2 (dark fifth), slow filter breathing; more open as the traps escalate.
    drone = saw(55, t, 18) * 0.6 + saw(82.4, t, 14) * 0.35
    cut = 220 + 260 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 8)) + 500 * np.clip((t - 5) / 20, 0, 1) * tense
    drone = lowpass(drone, cut) * (0.55 * tense + 0.15)
    out += stereo(drone, 0.4, 11)

    # Pulse: 8th-note sub throb (side-chain feel), from 0:03; doubles to 16ths in the last traps.
    ph = (t / (beat / 2)) % 1.0
    ph16 = (t / (beat / 4)) % 1.0
    throb = np.sin(2 * np.pi * 55 * t) * np.exp(-ph * 7) + 0.5 * np.sin(2 * np.pi * 110 * t) * np.exp(-ph * 12)
    throb16 = np.sin(2 * np.pi * 55 * t) * np.exp(-ph16 * 9)
    late = np.clip((t - 15) / 4, 0, 1)
    pulse = (throb * (1 - late * 0.5) + throb16 * late * 0.6) * np.clip((t - 3.0) / 0.5, 0, 1) * tense
    out += stereo(pulse * 0.55)

    # Clock ticks on every beat (a ticking market), off-beat a softer tick.
    tick = np.zeros(n)
    for b in np.arange(3.0, 28.0, beat / 2):
        s = int(b * SR)
        m = int(0.03 * SR)
        if s + m < n:
            tick[s : s + m] += bandpass_fft(rng.standard_normal(m), 3000, 9000) * env_ad(m, 0.0005, 0.02, 6) * (1.0 if (b / beat) % 1 < 0.01 else 0.45)
    out += stereo(tick * 0.22, 0.9, 7)

    # Tension riser layers: high detuned strings creeping up a semitone over the traps.
    st = t - 5
    riser_f = 440 * 2 ** (np.clip(st / 20, 0, 1) / 12)
    riser = np.sin(2 * np.pi * np.cumsum(riser_f) / SR) + np.sin(2 * np.pi * np.cumsum(riser_f * 1.006) / SR)
    out += stereo(riser * 0.05 * np.clip(st / 6, 0, 1) * tense, 1.0, 19)

    # Survivors: warm A-major-add9 pad blooming; then the CTA resolve on D/A with a gentle pulse.
    warm = lowpass(chord([110, 164.8, 220, 277.2, 329.6, 493.9], sec, 12), 300 + 2600 * calm + 1200 * resolve)
    out += stereo(warm * (0.75 * calm + 0.5 * resolve), 0.8, 17)
    bell_t = t - 33.0
    bells = np.zeros(n)
    for k, f in enumerate([880, 1108.7, 1318.5, 1760]):
        on = bell_t - k * 0.25
        bells += np.where(on > 0, np.sin(2 * np.pi * f * np.clip(on, 0, None)) * np.exp(-np.clip(on, 0, None) * 2.2), 0)
    out += stereo(bells * 0.1, 1.0, 21)
    soft = (np.sin(2 * np.pi * 55 * t) * np.exp(-((t / beat) % 1.0) * 5)) * resolve * 0.35
    out += stereo(soft)

    out = reverb(out, 2.2, 0.25)
    out *= np.clip(t / 0.05, 0, 1)[:, None]
    out = np.tanh(out * 1.3)
    write("music.mp3", out, peak=0.85)


if __name__ == "__main__":
    for fn in (sfx_hit, sfx_crack, sfx_lever, sfx_chain, sfx_rush, sfx_whoosh, sfx_whisper, sfx_ripple, sfx_rise, sfx_flare, sfx_shine, music):
        fn()
