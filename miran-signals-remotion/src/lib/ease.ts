import {Easing, interpolate} from 'remotion';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeOutQuint = Easing.out(Easing.poly(5));
export const easeInOutQuint = Easing.inOut(Easing.poly(5));
export const easeInOutSine = Easing.inOut(Easing.sin);
/** Slow-fast-slow with a long, fast middle: the whip-pan speed ramp. */
export const whip = Easing.bezier(0.78, 0, 0.18, 1);
/** Fast start, long glide: a push that lands softly. */
export const glide = Easing.bezier(0.16, 1, 0.3, 1);

/** Eased 0→1 between frames a and b (clamped). Works with fractional frames. */
export const ramp = (f: number, a: number, b: number, easing: (x: number) => number = easeInOut) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Smooth 0→1 with zero slope at both ends (C2). */
export const smootherstep = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Damped spring evaluated analytically at (possibly fractional) time `t` frames
 * after it starts. Returns 0 → 1 with overshoot set by `damping` (0.2 bouncy … 1 critical).
 */
export const springAt = (t: number, {freq = 2.2, damping = 0.5}: {freq?: number; damping?: number} = {}) => {
  if (t <= 0) return 0;
  const s = t / 60; // seconds
  const w = 2 * Math.PI * freq;
  const z = Math.min(0.999, damping);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * s) * (Math.cos(wd * s) + ((z * w) / wd) * Math.sin(wd * s));
};

/** Steeper C2-smooth in-out (smootherstep of smootherstep): no jump in acceleration anywhere. */
export const smoothSteep = (x: number) => smootherstep(smootherstep(x));

/** Monotone cubic (Fritsch–Carlson) through [x, y] keyframes, clamped at the ends. */
export const keyframes = (pts: [number, number][]) => {
  const n = pts.length;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m: number[] = new Array(n).fill(0);
  m[0] = d[0] ?? 0;
  m[n - 1] = d[n - 2] ?? 0;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  // Start and end at rest so counters ease in and settle.
  m[0] = 0;
  m[n - 1] = 0;
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
    );
  };
};

/** Deterministic hash noise in [0, 1). */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

/** 1,234 style. */
export const commas = (n: number) => Math.round(n).toLocaleString('en-US');
/** 24.8K style for large follower counts. */
export const compact = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(1)}K` : commas(n));
