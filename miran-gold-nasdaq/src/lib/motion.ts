import {Easing, interpolate, spring} from 'remotion';
import {MOTION, VIDEO} from '../config';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  in: Easing.in(Easing.cubic),
};

/** 0 → 1 spring starting at `start` (frames). */
export const springAt = (
  frame: number,
  start: number,
  config: {damping: number; stiffness?: number; mass?: number} = MOTION.word,
  durationInFrames?: number,
) =>
  spring({
    frame: frame - start,
    fps: VIDEO.fps,
    config,
    durationInFrames,
  });

/** Eased 0 → 1 over [start, start + dur]. */
export const progress = (frame: number, start: number, dur: number, easing = EASE.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Soft 0..1 sine pulse. */
export const pulse = (frame: number, period = MOTION.glowPulseFrames, phase = 0) =>
  0.5 - 0.5 * Math.cos(((frame + phase) / period) * Math.PI * 2);

/** Any #RRGGBB or rgb()/rgba() color (e.g. interpolateColors output) with a new alpha. */
export const rgba = (color: string, a: number) => {
  if (color.startsWith('#')) {
    const n = parseInt(color.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const [r, g, b] = m[1].split(',').map((v) => parseFloat(v));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
