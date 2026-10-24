import {interpolate, spring} from 'remotion';
import {EASE_IN, EASE_OUT, FPS, KICK} from '../theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 progress over [start, start + duration], with an easing curve.
export const progress = (frame: number, start: number, duration: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing});

export const enter = (frame: number, start: number, duration: number) => progress(frame, start, duration, EASE_OUT);

// Exits are cubic-in and ~40% faster than the matching entrance.
export const exit = (frame: number, start: number, duration = 14) => progress(frame, start, duration, EASE_IN);

// Spring with a slight overshoot, for hero elements. `duration` stretches the same curve.
export const kick = (frame: number, start: number, duration?: number) =>
  spring({frame: frame - start, fps: FPS, config: KICK, durationInFrames: duration});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
