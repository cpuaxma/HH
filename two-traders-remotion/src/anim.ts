import {interpolate, spring} from 'remotion';
import {ease, FPS, springs} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 entrance on the expo-out curve
export const enterProgress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease.enter});

// 0→1 exit on the cubic-in curve
export const exitProgress = (frame: number, start: number | undefined, duration: number) =>
  start === undefined ? 0 : interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease.exit});

// Critically damped spring (no overshoot)
export const smoothSpring = (frame: number, start: number, durationInFrames?: number) =>
  spring({frame: frame - start, fps: FPS, config: springs.smooth, durationInFrames});

// Spring with a soft overshoot, for hero objects
export const heroSpring = (frame: number, start: number) => spring({frame: frame - start, fps: FPS, config: springs.hero});

// Punchy overshoot for badges
export const popSpring = (frame: number, start: number) => spring({frame: frame - start, fps: FPS, config: springs.pop});

// Standard UI entrance: rise + fade + blur in, cubic-in exit ~40% faster
export const uiInOut = (frame: number, start: number, exit?: number, rise = 24, dur = 24) => {
  const p = smoothSpring(frame, start, dur);
  const q = exitProgress(frame, exit, Math.round(dur * 0.6));
  return {
    opacity: Math.min(1, p * 1.4) * (1 - q),
    transform: `translateY(${(1 - p) * rise + q * 10}px)`,
    filter: `blur(${((1 - p) * 8 + q * 8).toFixed(2)}px)`,
    p,
    q,
  };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export {clamp as clampOpts};
