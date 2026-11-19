import {Easing, interpolate, spring} from 'remotion';
import {IMPACTS, VIDEO} from '../config';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** interpolate() with clamping and an easing curve (defaults to a soft ease-out). */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = EASE.out,
) => interpolate(frame, input, output, {...clamp, easing});

/** 0 -> 1 spring that starts at `start`. */
export const springIn = (
  frame: number,
  start: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
  durationInFrames?: number,
) =>
  spring({
    frame: frame - start,
    fps: VIDEO.fps,
    config: {damping: 16, stiffness: 140, mass: 0.8, ...config},
    durationInFrames,
  });

/** Camera shake offset and zoom punch at a global frame, summed over every impact in config. */
export const impactAt = (globalFrame: number) => {
  let x = 0;
  let y = 0;
  let zoom = 0;
  for (const imp of IMPACTS) {
    const t = globalFrame - imp.frame;
    if (t < 0 || t > 24) continue;
    const decay = Math.exp(-t / 5);
    x += Math.sin(t * 2.3 + imp.frame) * imp.shake * decay;
    y += Math.cos(t * 2.9 + imp.frame * 0.7) * imp.shake * 0.8 * decay;
    // zoom punch: quick rise, soft settle
    zoom += imp.zoom * (t < 2 ? t / 2 : Math.exp(-(t - 2) / 6));
  }
  return {x, y, zoom};
};

/** Smooth heartbeat "lub-dub" envelope (0..1) for a beat that starts at frame 0. */
export const heartbeat = (t: number) => {
  if (t < 0) return 0;
  const lub = Math.exp(-((t - 2) ** 2) / 6);
  const dub = 0.6 * Math.exp(-((t - 9) ** 2) / 8);
  return lub + dub;
};
