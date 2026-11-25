import {Easing, interpolate, random} from 'remotion';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 progress of `f` through [a, b], clamped. */
export const prog = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  back: Easing.bezier(0.34, 1.45, 0.64, 1),
  exit: Easing.bezier(0.5, 0, 0.75, 0),
};

/** Eased interpolation with clamping on both sides (the default for everything here). */
export const ease = (f: number, input: number[], output: number[], easing: (t: number) => number = EASE.inOut) =>
  interpolate(f, input, output, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Deterministic random in [a, b) for a string/number key (remotion random). */
export const rnd = (key: string, a = 0, b = 1) => a + (b - a) * random(key);

/**
 * Damped spring 0→1 started at `start` (frames). Closed form so it is a pure function of the frame:
 * critically under-damped, like remotion spring({damping≈14}) but cheap to call thousands of times.
 */
export const springAt = (f: number, start: number, stiffness = 0.35, damping = 0.55) => {
  const t = f - start;
  if (t <= 0) return 0;
  const w = stiffness;
  const z = damping;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

/** Decaying shake impulse after `at`: amplitude 1 at the hit, gone after ~`len` frames. */
export const impulse = (f: number, at: number, len = 14) => {
  const t = f - at;
  if (t < 0 || t > len) return 0;
  return Math.exp((-t / len) * 4.2) * (1 - t / len);
};
