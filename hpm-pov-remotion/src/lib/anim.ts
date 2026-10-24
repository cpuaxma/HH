import {interpolate, spring} from 'remotion';
import {CARD_SPRING, EASE_IN, EASE_OUT, FPS, KICK} from '../theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 progress over [start, start + duration], with an easing curve.
export const progress = (frame: number, start: number, duration: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing});

export const enter = (frame: number, start: number, duration: number) => progress(frame, start, duration, EASE_OUT);

// Exits are cubic-in and ~40% faster than the matching entrance.
export const exit = (frame: number, start: number, duration = 14) => progress(frame, start, duration, EASE_IN);

// Hero spring with a slight overshoot. `duration` stretches the same curve.
export const kick = (frame: number, start: number, duration?: number) =>
  spring({frame: frame - start, fps: FPS, config: KICK, durationInFrames: duration});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// The card spring, tabulated once and linearly interpolated, so the stack can be
// evaluated thousands of times per frame and at the fractional frames motion blur uses.
const TABLE_LEN = 240;
const CARD_TABLE = Array.from({length: TABLE_LEN + 1}, (_, i) => spring({frame: i, fps: FPS, config: CARD_SPRING}));
export const cardSpring = (t: number) => {
  if (t <= 0) return 0;
  if (t >= TABLE_LEN) return 1;
  const i = Math.floor(t);
  return mix(CARD_TABLE[i], CARD_TABLE[i + 1], t - i);
};
