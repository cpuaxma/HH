import {Easing, interpolate, spring} from 'remotion';
import {VIDEO} from '../config';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  sine: Easing.bezier(0.37, 0, 0.63, 1),
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** interpolate() with clamping and an easing curve (defaults to a soft ease-out). */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number] = [0, 1],
  easing: (t: number) => number = EASE.out,
) => interpolate(frame, input, output, {...clamp, easing});

/** 0 -> 1 -> 0 window: rises over [a, b], holds, falls over [c, d]. */
export const windowed = (frame: number, a: number, b: number, c: number, d: number, easing = EASE.inOut) =>
  Math.min(ease(frame, [a, b], [0, 1], easing), 1 - ease(frame, [c, d], [0, 1], easing));

/** 0 -> 1 spring that starts at `start`. */
export const springIn = (
  frame: number,
  start: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
  durationInFrames?: number,
) =>
  spring({
    frame: frame - start,
    fps: VIDEO.fps,
    config: {damping: 16, stiffness: 140, mass: 0.8, ...config},
    durationInFrames,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Monotone cubic (Fritsch-Carlson) through keyframes: smooth velocity, never overshoots, and
 * holds still on flat segments. Used for the orb's position along the track.
 */
export const monotoneCubic = (keys: {x: number; y: number}[]) => {
  const n = keys.length;
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1].y - keys[i].y) / (keys[i + 1].x - keys[i].x));
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  m[0] = 0;
  m[n - 1] = 0;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= keys[0].x) return keys[0].y;
    if (x >= keys[n - 1].x) return keys[n - 1].y;
    let i = 0;
    while (x > keys[i + 1].x) i++;
    const h = keys[i + 1].x - keys[i].x;
    const t = (x - keys[i].x) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * keys[i].y +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * keys[i + 1].y +
      (t3 - t2) * h * m[i + 1]
    );
  };
};

/** Smooth heartbeat "lub-dub" envelope (0..1) for a beat phase in [0, 1). */
export const heartbeatShape = (phase: number) => {
  const p = phase - Math.floor(phase);
  const lub = Math.exp(-(((p - 0.06) / 0.035) ** 2));
  const dub = 0.6 * Math.exp(-(((p - 0.24) / 0.045) ** 2));
  return lub + dub;
};

/** Deterministic smooth noise in [-1, 1] (sum of incommensurate sines). */
export const wobble = (t: number, seed: number) =>
  (Math.sin(t * 1.0 + seed * 1.7) * 0.5 + Math.sin(t * 2.31 + seed * 4.1) * 0.3 + Math.sin(t * 4.77 + seed * 2.3) * 0.2);
