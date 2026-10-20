import {interpolate, spring} from 'remotion';
import {ease, FPS, springs} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0→1 entrance on the expo-out curve
export const enterProgress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease.enter});

// 0→1 exit on the cubic-in curve
export const exitProgress = (frame: number, start: number | undefined, duration: number) =>
  start === undefined ? 0 : interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: ease.exit});

// Critically damped spring (no overshoot) starting at `start`
export const smoothSpring = (frame: number, start: number, durationInFrames?: number) =>
  spring({frame: frame - start, fps: FPS, config: springs.smooth, durationInFrames});

// Spring with a soft overshoot, for hero objects
export const heroSpring = (frame: number, start: number) =>
  spring({frame: frame - start, fps: FPS, config: springs.hero});

// Standard hero entrance: scale 0.7→1, rotateY 25°→0, slide from `fromX`, with overshoot.
// Returns a CSS transform plus opacity and blur.
export const heroEntrance = (
  frame: number,
  start: number,
  opts: {fromX?: number; fromY?: number; rotateFrom?: number} = {},
) => {
  const {fromX = 0, fromY = 0, rotateFrom = 25} = opts;
  const s = heroSpring(frame, start);
  const fade = enterProgress(frame, start, 22);
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const rot = interpolate(s, [0, 1], [rotateFrom, 0]);
  const x = interpolate(s, [0, 1], [fromX, 0]);
  const y = interpolate(s, [0, 1], [fromY, 0]);
  return {
    progress: s,
    opacity: fade,
    blur: (1 - fade) * 10,
    transform: `translate(${x}px, ${y}px) perspective(1400px) rotateY(${rot}deg) scale(${scale})`,
  };
};

// Exit for visuals: blur + fade + slight shrink, cubic-in
export const visualExit = (frame: number, start: number, duration = 24) => {
  const q = exitProgress(frame, start, duration);
  return {q, opacity: 1 - q, blur: q * 10, scale: 1 - q * 0.05};
};

// Seeded pseudo-random in [0,1)
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
