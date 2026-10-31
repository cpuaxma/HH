import {Easing, interpolate} from 'remotion';
import {HUBS, MODULES, TIMING, arrivalFrame, legStart, moduleHub} from '../data';
import {dot, getRoute, hubPos, norm} from './geo';

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeOutQuint = Easing.out(Easing.poly(5));
export const easeIn = Easing.in(Easing.cubic);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Eased 0→1 between two frames. */
export const ramp = (f: number, a: number, b: number, easing = easeInOut) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame the route head reaches hub i while the routes draw. */
export const hubReachedFrame = (i: number) => (i === 0 ? TIMING.routeStart - 10 : legStart(i - 1) + TIMING.legLength);

/** Arc length of the drawing head (the routes, 3–9s): hub to hub, each leg eased. */
export const drawS = (f: number) => {
  const {hubS} = getRoute();
  let s = 0;
  for (let i = 0; i < HUBS.length - 1; i++) {
    const a = legStart(i);
    if (f >= a) s = hubS[i] + (hubS[i + 1] - hubS[i]) * ramp(f, a, a + TIMING.legLength, easeInOut);
  }
  return s;
};

/** Frames the journey takes to reach module i's stop from the previous one. */
export const travelFrames = (i: number) => {
  if (i === 0) return TIMING.firstArrival - TIMING.journeyStart;
  const a = norm(hubPos(moduleHub(i)));
  const b = norm(hubPos(moduleHub(i) + 1));
  const deg = (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI;
  const {base, perDegree, minDwell} = TIMING.travel;
  return Math.round(Math.min(TIMING.stopSpacing - minDwell, base + perDegree * deg));
};
/** The journey leaves module i's stop for the next one. */
export const departFrame = (i: number) => (i + 1 < MODULES.length ? arrivalFrame(i + 1) - travelFrames(i + 1) : Infinity);

/** Arc length of the journey head (9–21s): runs back from the last hub, stopping at each module's hub. */
export const journeyS = (f: number) => {
  const {hubS} = getRoute();
  let s = hubS[HUBS.length - 1];
  MODULES.forEach((_, i) => {
    const to = hubS[moduleHub(i)];
    const from = hubS[moduleHub(i) + 1];
    const b = arrivalFrame(i);
    const a = b - travelFrames(i);
    if (f >= a) s = from + (to - from) * ramp(f, a, b, easeInOut);
  });
  return s;
};

/** 0 at both ends of a hop between stops, peaking mid-hop, with zero slope at the ends. */
export const hopAt = (f: number) => {
  let h = 0;
  MODULES.forEach((_, i) => {
    const b = arrivalFrame(i) + 8;
    const a = arrivalFrame(i) - travelFrames(i) - 8;
    if (f > a && f < b) h = Math.sin((Math.PI * (f - a)) / (b - a)) ** 2;
  });
  return h;
};

/** How far the route has faded to make way for the journey (0 → 1). */
export const journeyFade = (f: number) => ramp(f, TIMING.journeyStart - 30, TIMING.journeyStart + 20);
