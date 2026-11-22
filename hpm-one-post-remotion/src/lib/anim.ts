import {Easing, interpolate, spring, SpringConfig} from 'remotion';
import {VIDEO} from '../config';

export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Spring from `start` (frames); 0 before it. */
export const spr = (frame: number, start: number, config: Partial<SpringConfig>, durationInFrames?: number) =>
  frame < start ? 0 : spring({frame: frame - start, fps: VIDEO.fps, config, durationInFrames});

/** Smooth S-curve progress between two frames (used for whip pans & camera push). */
export const ease = (frame: number, from: number, to: number, curve = Easing.bezier(0.65, 0, 0.35, 1)) =>
  interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curve});

/** Cheap deterministic smooth noise in [-1, 1]. */
export const wobble = (t: number, seed = 0) =>
  (Math.sin(t * 0.9 + seed * 1.7) * 0.5 + Math.sin(t * 2.3 + seed * 3.1) * 0.3 + Math.sin(t * 4.7 + seed * 5.3) * 0.2);

/** Deterministic pseudo-random in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
