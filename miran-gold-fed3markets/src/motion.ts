import {interpolate, spring} from 'remotion';
import {EASE, SPRING, VIDEO} from './brand';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [start, start+dur] with the entry curve. */
export const ease = (frame: number, start: number, dur: number, easing = EASE.entry) =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing});

/** 0→1 with the move curve (in-out). */
export const move = (frame: number, start: number, dur: number) => ease(frame, start, dur, EASE.move);

export const springAt = (frame: number, start: number, config: {damping: number; stiffness?: number; mass?: number} = SPRING.card) =>
  spring({frame: frame - start, fps: VIDEO.fps, config});

/** Piecewise keyframes: [[frame, value], ...]; each segment uses the move curve (or a custom one). */
export const kf = (frame: number, keys: [number, number][], easing = EASE.move) => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (frame <= f1) return f1 === f0 ? v1 : interpolate(frame, [f0, f1], [v0, v1], {...clamp, easing});
  }
  return keys[keys.length - 1][1];
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t));
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const rand = (seed: number) => hash(seed * 17.17 + 3.3);

/** Smooth 1D value noise in [-1, 1]. */
export const noise = (seed: number, t: number) => {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 101.3);
  const b = hash(i + 1 + seed * 101.3);
  return (a + (b - a) * u) * 2 - 1;
};

/** Decaying impulse 0→1→0 starting at `at` (peak after `rise` frames, gone after `dur`). */
export const impulse = (frame: number, at: number, dur = 30, rise = 3) => {
  const t = frame - at;
  if (t < 0 || t > dur) return 0;
  if (t < rise) return t / rise;
  return Math.exp(-((t - rise) / dur) * 4.5);
};

/** Slow camera push: scale 1.00 → `to` across a scene, so nothing ever sits still. */
export const push = (frame: number, from: number, to: number, amount = 0.04) =>
  1 + amount * interpolate(frame, [from, to], [0, 1], clamp);

/** Stroke props that reveal a path drawn with pathLength=1. */
export const dash = (p: number): React.CSSProperties => ({strokeDasharray: `${Math.max(0, p)} 2`, opacity: p > 0.0005 ? 1 : 0});

export const fmt = (v: number, decimals = 0) =>
  v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
