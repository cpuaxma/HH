import {interpolate, spring, random} from 'remotion';
import {EASE, SPRING, VIDEO} from './config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 → 1 between two frames with a smooth ease-in-out. */
export const ramp = (frame: number, start: number, end: number, easing = EASE.inOut) =>
  interpolate(frame, [start, end], [0, 1], {...clamp, easing});

/** Map frame through input/output ranges, clamped, eased. */
export const lerp = (frame: number, input: number[], output: number[], easing = EASE.inOut) =>
  interpolate(frame, input, output, {...clamp, easing});

/** A critically-damped spring that starts at `start` (frames) and settles in `duration` frames. */
export const settle = (frame: number, start: number, duration = 24) =>
  spring({frame: frame - start, fps: VIDEO.fps, config: SPRING, durationInFrames: duration});

/** Mix two hex colours. */
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};

/** Deterministic random in [min, max). */
export const rand = (seed: string | number, min = 0, max = 1) => min + random(seed) * (max - min);
