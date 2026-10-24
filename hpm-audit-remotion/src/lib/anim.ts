import {Easing, interpolate, random, spring} from 'remotion';
import {EASE_IN, EASE_OUT, FPS, PUNCH, SPRING} from '../theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// 0→1 over [start, start + duration] with an easing curve.
export const progress = (frame: number, start: number, duration: number, easing: (t: number) => number = EASE_OUT) =>
  duration <= 0 ? (frame >= start ? 1 : 0) : interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing});

export const exitP = (frame: number, start: number, duration = 6) => progress(frame, start, duration, EASE_IN);

// Overlay entrance: spring({damping: 12, stiffness: 200}), slight overshoot. 0 before `start`.
export const pop = (frame: number, start: number) =>
  frame < start ? 0 : spring({frame: frame - start, fps: FPS, config: SPRING});

// Decaying oscillation that starts at `start`: a landing "kick".
export const kick = (frame: number, start: number, decay = 7, freq = 0.55) => {
  const t = frame - start;
  if (t < 0) return 0;
  return Math.sin(t * freq) * Math.exp(-t / decay);
};

// Punch-zoom envelope: 0→1 in `attack` frames, back to 0 over `release`.
export const punchEnv = (frame: number, at: number) => {
  const t = frame - at;
  if (t < 0 || t > PUNCH.attack + PUNCH.release) return 0;
  if (t <= PUNCH.attack) return Easing.out(Easing.cubic)(t / PUNCH.attack);
  return 1 - Easing.inOut(Easing.cubic)((t - PUNCH.attack) / PUNCH.release);
};

// Impact shake: deterministic jitter, decays over ~8 frames.
export const shake = (frame: number, at: number, px: number) => {
  const t = frame - at;
  if (t < 0 || t > 9) return {x: 0, y: 0};
  const k = px * Math.pow(1 - t / 10, 1.5);
  const n = Math.floor(t);
  return {x: (random(`sx${at}-${n}`) * 2 - 1) * k, y: (random(`sy${at}-${n}`) * 2 - 1) * k};
};

// Smooth handheld drift (sum of sines), amplitude in px.
export const drift = (frame: number, seed: number, amp: number) =>
  amp * (0.6 * Math.sin(frame / 47 + seed) + 0.4 * Math.sin(frame / 23 + seed * 2.1));

export const deg = (d: number) => (d * Math.PI) / 180;
