import {getLength, getPointAtLength} from '@remotion/paths';
import {interpolate} from 'remotion';
import {EASE} from './theme';
import {S9_DATA} from './strings';
import {Pt, smoothPath} from './components/ChartLine';

// Gold, 1971 → 2026 (approximate; labelled «تقريبي»). Linear price axis so the modern run-up reads.
export const CHART = {x: 190, y: 900, w: 710, h: 476, pMax: 6000, y0: 1971, y1: 2026.83};
export const yearX = (yr: number) => CHART.x + ((yr - CHART.y0) / (CHART.y1 - CHART.y0)) * CHART.w;
export const priceY = (p: number) => CHART.y + CHART.h * (1 - p / CHART.pMax);
export const xYear = (x: number) => CHART.y0 + ((x - CHART.x) / CHART.w) * (CHART.y1 - CHART.y0);

export const PTS: Pt[] = S9_DATA.map(([yr, p]) => [yearX(yr), priceY(p)]);
export const LINE_D = smoothPath(PTS, 0.25);
const LEN = getLength(LINE_D);
export const ptAt = (yr: number): Pt => {
  const i = S9_DATA.findIndex(([y]) => y >= yr);
  return PTS[Math.max(0, i)];
};

/** Beats local to the modern scene. */
export const MODERN_T = {draw: 24, drawEnd: 236, p1980: 70, p2011: 150, p2026: 214, now: 236};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const drawProgress = (local: number) => interpolate(local, [MODERN_T.draw, MODERN_T.drawEnd], [0, 1], {...clamp, easing: EASE.inOut});
export const headAt = (local: number) => {
  const t = drawProgress(local);
  const p = getPointAtLength(LINE_D, LEN * Math.min(0.9999, Math.max(0.0001, t))) ?? {x: CHART.x, y: CHART.y + CHART.h};
  return {x: p.x, y: p.y, t, year: xYear(p.x)};
};
