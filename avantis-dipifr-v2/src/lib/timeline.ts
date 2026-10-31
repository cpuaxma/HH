import {Easing, interpolate} from 'remotion';

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeOutQuint = Easing.out(Easing.poly(5));
export const easeIn = Easing.in(Easing.cubic);
export const easeInQuad = Easing.in(Easing.quad);
export const linear = (t: number) => t;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Eased 0→1 between two frames. */
export const ramp = (f: number, a: number, b: number, easing: (t: number) => number = easeInOut) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A damped spring from 0 to 1 that starts at `at`, computed in closed form so it
 * is exact on every frame. `bounce` 0..1 sets the overshoot.
 */
export const springAt = (f: number, at: number, duration = 30, bounce = 0.35) => {
  const t = (f - at) / duration;
  if (t <= 0) return 0;
  if (t >= 1.6) return 1;
  const zeta = 1 - bounce * 0.85;
  const w = 7.5;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
};

/**
 * Camera-shake envelope after an impact at `at`: rises quickly from 0 (so the
 * motion stays continuous), then decays over about a third of a second.
 */
export const shakeAt = (f: number, at: number) => {
  const t = f - at;
  if (t <= 0 || t > 40) return 0;
  return (1 - Math.exp(-t / 1.5)) * Math.exp(-t / 9) * Math.sin((2 * Math.PI * t) / 10);
};
