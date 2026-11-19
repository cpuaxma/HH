import type React from 'react';
import {interpolate, spring} from 'remotion';
import {EASE, SPRING, VIDEO} from './constants';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [start, start + dur] frames with an ease-out curve. */
export const ease = (frame: number, start: number, dur: number, easing = EASE.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing});

/** Spring that starts at `start` (frames). */
export const springAt = (
  frame: number,
  start: number,
  config: Partial<{damping: number; stiffness: number; mass: number}> = SPRING.smooth,
  durationInFrames?: number,
) => spring({frame: frame - start, fps: VIDEO.fps, config, durationInFrames});

const DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Western → Eastern Arabic digits. */
export const arDigits = (v: number | string) => String(v).replace(/\d/g, (d) => DIGITS[Number(d)]);

/** Signed percentage in Eastern Arabic digits, e.g. +٢٠٪ or -٢٠٪. */
export const arPercent = (n: number) => {
  const r = Math.round(Math.abs(n));
  const sign = n > 0.5 ? '+' : n < -0.5 ? '-' : '';
  return `${sign}${arDigits(r)}٪`;
};

export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth 1D value noise in [-1, 1]. */
export const noise = (seed: number, t: number) => {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 101.3);
  const b = hash(i + 1 + seed * 101.3);
  return (a + (b - a) * u) * 2 - 1;
};

/** Deterministic pseudo-random in [0, 1). */
export const rand = (seed: number) => hash(seed * 17.17 + 3.3);

/** Screen shake offset that decays over `dur` frames after `start`. */
export const shake = (frame: number, start: number, dur: number, amp: number) => {
  const t = frame - start;
  if (t < 0 || t > dur) return {x: 0, y: 0, r: 0};
  const k = Math.pow(1 - t / dur, 2) * amp;
  return {x: noise(3, t * 0.9) * k, y: noise(9, t * 0.9) * k, r: noise(17, t * 0.9) * k * 0.04};
};

/** Stroke props that draw a path with pathLength={1} from 0 to `p`. */
export const draw = (p: number): React.CSSProperties => ({
  strokeDasharray: '1 1',
  strokeDashoffset: 1 - Math.max(0, Math.min(1, p)),
  opacity: p > 0.001 ? 1 : 0,
});

/** Gold glow used on headlines. */
export const goldGlow = (strength = 1) =>
  `0 0 ${18 * strength}px rgba(212, 175, 55, ${0.45 * strength}), 0 0 ${48 * strength}px rgba(212, 175, 55, ${0.22 * strength})`;
