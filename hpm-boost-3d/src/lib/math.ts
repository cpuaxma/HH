export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0..1 progress of x between a and b, clamped. */
export const prog = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeInQuad = (t: number) => t * t;
export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * Step response of an under-damped spring: 0 at t<=0 with zero velocity, rises,
 * overshoots slightly and settles at 1. `freq` in Hz, `zeta` damping ratio.
 */
export const spring = (t: number, freq = 2.2, zeta = 0.62) => {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
};

/** First time the spring step response reaches 1 (the "lock" moment). */
export const springCross = (freq = 2.2, zeta = 0.62) => {
  const wd = 2 * Math.PI * freq * Math.sqrt(1 - zeta * zeta);
  return Math.PI / wd;
};

/** Damped bounce used for landings: a small overshoot dip that settles. 0 at t<=0 and t→∞. */
export const landingDip = (t: number, amp: number, freq = 3.2, zeta = 0.45) => {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return -amp * Math.exp(-zeta * w * t) * Math.sin(wd * t);
};

/** Mulberry32 PRNG. */
export const makeRandom = (seed: number) => {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (a0: number, b0: number) => a0 + (b0 - a0) * next(),
    sign: () => (next() < 0.5 ? -1 : 1),
  };
};

/** Smooth deterministic 1D "noise": a sum of incommensurate sines, range about -1..1. */
export const wobble = (t: number, seed: number) =>
  0.5 * Math.sin(t * 1.13 + seed * 1.7) + 0.3 * Math.sin(t * 2.31 + seed * 4.1) + 0.2 * Math.sin(t * 3.97 + seed * 2.9);

export type V3 = [number, number, number];
export const v3 = {
  add: (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s],
  lerp: (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
  len: (a: V3) => Math.hypot(a[0], a[1], a[2]),
  dot: (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  norm: (a: V3): V3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
};
