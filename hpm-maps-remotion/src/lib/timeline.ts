import {Easing, interpolate} from 'remotion';
import {BUSINESSES, TIMING, arrivalFrame, departFrame, travelStartFrame} from '../data';
import {getCity} from './city';
import {getRoute} from './route';

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeInOutQuint = Easing.inOut(Easing.poly(5));
export const easeOut = Easing.out(Easing.cubic);
export const easeOutQuint = Easing.out(Easing.poly(5));
export const easeIn = Easing.in(Easing.cubic);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Eased 0→1 between two frames. */
export const ramp = (f: number, a: number, b: number, easing = easeInOut) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});

/** Arc length of the route head at a (possibly fractional) frame. */
export const headS = (f: number) => {
  const {stopS} = getCity();
  let s = 0;
  for (let i = 0; i < BUSINESSES.length; i++) {
    const from = i === 0 ? 0 : stopS[i - 1];
    const a = travelStartFrame(i);
    const b = arrivalFrame(i);
    if (f >= a) s = from + (stopS[i] - from) * ramp(f, a, b, easeInOut);
  }
  // Finale: the head finishes the outline (hump, calyx, stem) as the camera rises.
  const last = stopS[stopS.length - 1];
  if (f >= TIMING.finaleStart) s = last + (getRoute().length - last) * ramp(f, TIMING.finaleStart, TIMING.routeComplete, easeInOut);
  return s;
};

/** 0→1→0 glow pulse along the whole route once the pepper is complete. */
export const completePulse = (f: number) => {
  const t = (f - TIMING.routeComplete) / 40;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) ** 2;
};

/** Index of the stop whose block we are in (travelling into it or dwelling). */
export const stopIndexAt = (f: number) => {
  for (let i = BUSINESSES.length - 1; i >= 0; i--) {
    if (f >= travelStartFrame(i)) return i;
  }
  return 0;
};

/**
 * Close-up weight of each stop: 0 while travelling, 1 during its close-up.
 * The camera blends towards each stop by its own weight, so neighbouring
 * stops can overlap without any jump.
 */
export const closeUpWeights = (f: number) =>
  BUSINESSES.map((_, i) => {
    const a = arrivalFrame(i);
    const rise = ramp(f, a - 34, a + 26);
    const last = i === BUSINESSES.length - 1;
    const fall = last ? 0 : ramp(f, departFrame(i) - 6, departFrame(i) + 36);
    return rise * (1 - fall);
  });

/** 0 at both ends of a hop between stops, peaking mid-hop with zero slope at the ends. */
export const hopAt = (f: number) => {
  let h = 0;
  for (let i = 1; i < BUSINESSES.length; i++) {
    const a = travelStartFrame(i) - 10;
    const b = arrivalFrame(i) + 10;
    if (f > a && f < b) h = Math.sin((Math.PI * (f - a)) / (b - a)) ** 2;
  }
  return h;
};

export const finaleProgress = (f: number) => ramp(f, TIMING.finaleStart, TIMING.finaleSettled, easeInOut);
