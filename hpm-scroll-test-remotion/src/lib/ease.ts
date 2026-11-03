// Pure timing helpers. Every function takes a (possibly fractional) frame, so the
// renderer can evaluate any moment inside a frame for its motion-blur samples.
import {Easing} from 'remotion';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeInOutQuint = Easing.inOut(Easing.poly(5));
export const easeOut = Easing.out(Easing.cubic);
export const easeOutQuint = Easing.out(Easing.poly(5));
export const easeIn = Easing.in(Easing.cubic);
export const easeInQuad = Easing.in(Easing.quad);

export const EASES = {
  inOut: easeInOut,
  inOutQuint: easeInOutQuint,
  out: easeOut,
  outQuint: easeOutQuint,
  in: easeIn,
};

/** Eased 0→1 between frames a and b (clamped). */
export const ramp = (f: number, a: number, b: number, ease: (x: number) => number = easeInOut) =>
  ease(clamp01((f - a) / (b - a)));

/**
 * Analytic damped spring from 0 to 1, starting at rest at frame `start`.
 * omega: angular frequency (rad/frame), zeta: damping ratio (<1 overshoots).
 * Smooth at any fractional frame, unlike a stepped simulation.
 */
export const springAt = (f: number, start: number, omega = 0.32, zeta = 0.5) => {
  const t = f - start;
  if (t <= 0) return 0;
  if (zeta >= 1) {
    return 1 - (1 + omega * t) * Math.exp(-omega * t);
  }
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const e = Math.exp(-zeta * omega * t);
  return 1 - e * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
};

/** A deterministic hash in [0,1). */
export const hash1 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Smooth 1D value noise (deterministic), roughly in [-1, 1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash1(i + seed * 101.3) * 2 - 1;
  const b = hash1(i + 1 + seed * 101.3) * 2 - 1;
  return a + (b - a) * u;
};
