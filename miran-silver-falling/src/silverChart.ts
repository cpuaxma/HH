import {getLength, getPointAtLength} from '@remotion/paths';
import {interpolate} from 'remotion';
import {EASE, SCENES} from './theme';
import {PRICE} from './strings';
import {Pt, smoothPath} from './components/ChartLine';

// Approximate XAG/USD path for 2026 (t = months since 1 Jan; price in US$). Labelled «تقريبي» on screen.
const DATA: [number, number][] = [
  [0, 74],
  [0.35, 88],
  [0.6, 98],
  [0.8, 112],
  [0.93, PRICE.peak],
  [0.98, 86],
  [1.17, 64],
  [1.6, 72],
  [2.2, 67],
  [3, 70],
  [4, 66],
  [5, 63],
  [6, 64],
  [7, 60],
  [8.2, 58.5],
  [9.2, 54],
  [9.97, PRICE.now],
];
const PEAK = 4;
const CRASH_END = 6;
const T_MAX = 9.97;

export const CHART = {x: 170, y: 890, w: 740, h: 440, pMin: 40, pMax: 132};
export const priceY = (p: number) => CHART.y + ((CHART.pMax - p) / (CHART.pMax - CHART.pMin)) * CHART.h;
export const yPrice = (y: number) => CHART.pMax - ((y - CHART.y) / CHART.h) * (CHART.pMax - CHART.pMin);
export const monthX = (t: number) => CHART.x + (t / T_MAX) * CHART.w;

export const PTS: Pt[] = DATA.map(([t, p]) => [monthX(t), priceY(p)]);
export const CLIMB_D = smoothPath(PTS.slice(0, PEAK + 1), 0.3);
export const CRASH_D = smoothPath(PTS.slice(PEAK, CRASH_END + 1), 0.15);
export const GRIND_D = smoothPath(PTS.slice(CRASH_END), 0.35);
export const FULL_D = smoothPath(PTS, 0.3);
export const PEAK_PT = PTS[PEAK];
export const CRASH_PT = PTS[CRASH_END];
export const NOW_PT = PTS[PTS.length - 1];
const LEN = {climb: getLength(CLIMB_D), crash: getLength(CRASH_D), grind: getLength(GRIND_D)};

// Beats, relative to the drop scene's start. The peak lands as the voice says «مئة وواحد وعشرين».
export const DROP_T = {climb: 34, peak: 150, crashEnd: 172, now: 246, bracket: 252, pct: 270};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Drawing progress of each segment at a frame local to the drop scene. */
export const segments = (local: number) => ({
  climb: interpolate(local, [DROP_T.climb, DROP_T.peak], [0, 1], {...clamp, easing: EASE.inOut}),
  crash: interpolate(local, [DROP_T.peak + 2, DROP_T.crashEnd], [0, 1], {...clamp, easing: EASE.exit}),
  grind: interpolate(local, [DROP_T.crashEnd, DROP_T.now], [0, 1], {...clamp, easing: EASE.enter}),
});

/** Where the drawing head is (screen coords) and the price it shows, at a frame local to the drop scene. */
export const chartHead = (local: number) => {
  const s = segments(local);
  const at = (d: string, len: number, t: number) => getPointAtLength(d, len * Math.min(0.9999, Math.max(0.0001, t))) ?? {x: 0, y: 0};
  const p = s.grind > 0 ? at(GRIND_D, LEN.grind, s.grind) : s.crash > 0 ? at(CRASH_D, LEN.crash, s.crash) : at(CLIMB_D, LEN.climb, s.climb);
  return {x: p.x, y: p.y, price: yPrice(p.y), ...s};
};

/** The price the HUD shows at an absolute frame: the record until the chart passes its peak, then the head. */
export const hudPrice = (frame: number) => {
  const local = frame - SCENES.drop[0];
  if (local < DROP_T.peak + 2) return PRICE.peak;
  if (local >= DROP_T.now) return PRICE.now;
  return chartHead(local).price;
};
