import {interpolate, spring} from 'remotion';
import {EASE_IN, EASE_OUT, FPS, KICK, TIMING} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 progress over [start, start + duration], with an easing curve.
export const progress = (frame: number, start: number, duration: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing});

export const enterProgress = (frame: number, start: number, duration: number) =>
  progress(frame, start, duration, EASE_OUT);

export const exitProgress = (frame: number, start: number | undefined, duration: number = TIMING.exit) =>
  start === undefined ? 0 : progress(frame, start, duration, EASE_IN);

// Spring with a slight overshoot, for hero elements.
export const kick = (frame: number, start: number) =>
  spring({frame: frame - start, fps: FPS, config: KICK});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
