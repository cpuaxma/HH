import React, {useMemo} from 'react';
import {random} from 'remotion';
import {COLORS, CUES, SCENES} from '../config';
import {EASE, ease, heartbeat, springIn} from '../lib/motion';
import {useTextOnly} from './Debug';

/** 20 x 25 = 500 dots, one per company. */
export const GRID = {cols: 20, rows: 25, dx: 44, dy: 35, x0: 540 - 9.5 * 44, y0: 425};
export const dotPos = (i: number) => ({
  x: GRID.x0 + (i % GRID.cols) * GRID.dx,
  y: GRID.y0 + Math.floor(i / GRID.cols) * GRID.dy,
});
const DOT_R = 4.6;

/** The four dots that grow into company chips (col, row). Order matches TEXT.sp500.companies. */
export const CHIP_DOTS = [15 + 6 * 20, 4 + 8 * 20, 16 + 17 * 20, 5 + 19 * 20];
export const CHIP_CENTERS = [
  {x: 770, y: 770},
  {x: 310, y: 770},
  {x: 770, y: 1030},
  {x: 310, y: 1030},
];
export const chipWindow = (k: number) => {
  const s = SCENES.sp500.from;
  return {start: s + CUES.sp500.chipsStart + k * 6, end: s + CUES.sp500.chipsReturn + k * 4 + 18};
};

/** Rising chart line used by the heartbeat scene; dots under the drawn part light up. */
export const CHART_POINTS: {x: number; y: number}[] = (() => {
  const n = 42;
  const pts = [];
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    const trend = Math.pow(t, 1.25);
    const wobble = Math.sin(t * 19) * 0.045 + Math.sin(t * 7.3 + 1) * 0.035 + (random(`c${k}`) - 0.5) * 0.06;
    // right to left (RTL time direction), bottom to top
    pts.push({x: 960 - t * 840, y: 1260 - (trend + wobble * (0.4 + t)) * 735});
  }
  return pts;
})();
export const chartProgress = (globalFrame: number) => {
  const s = SCENES.heartbeat.from;
  return ease(globalFrame, [s + CUES.heartbeat.chartStart, s + CUES.heartbeat.chartEnd], [0, 1], EASE.inOut);
};
/** chart y at a given x (x decreases along the line) */
const chartYAt = (x: number) => {
  for (let k = 1; k < CHART_POINTS.length; k++) {
    const a = CHART_POINTS[k - 1];
    const b = CHART_POINTS[k];
    if (x <= a.x && x >= b.x) return a.y + ((a.x - x) / (a.x - b.x)) * (b.y - a.y);
  }
  return Infinity;
};

type Props = {globalFrame: number};

export const DotGrid: React.FC<Props> = ({globalFrame: f}) => {
  const textOnly = useTextOnly();
  const seeds = useMemo(() => new Array(500).fill(0).map((_, i) => ({a: random(`d${i}`), b: random(`e${i}`)})), []);
  if (textOnly) return null;

  const s2 = SCENES.sp500.from;
  const s3 = SCENES.heartbeat.from;
  const waveStart = s2 + CUES.sp500.gridStart;
  const waveSpan = CUES.sp500.gridEnd - CUES.sp500.gridStart - 14;

  // others dim while the chips are up
  const dim =
    ease(f, [s2 + CUES.sp500.chipsStart, s2 + CUES.sp500.chipsStart + 14], [0, 1]) *
    (1 - ease(f, [s2 + CUES.sp500.chipsReturn, s2 + CUES.sp500.chipsReturn + 22], [0, 1]));

  const chart = chartProgress(f);
  const headX = 960 - chart * 840;
  const beats = new Array(CUES.heartbeat.beatCount).fill(0).map((_, k) => s3 + CUES.heartbeat.beatStart + k * CUES.heartbeat.beatEvery);
  const exitStart = s3 + CUES.heartbeat.gridExit;
  const chartPhase = ease(f, [s3 + CUES.heartbeat.chartStart - 10, s3 + CUES.heartbeat.chartStart + 10], [0, 1]);

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 500; i++) {
    const {x, y} = dotPos(i);
    const col = i % GRID.cols;
    const row = Math.floor(i / GRID.cols);
    // staggered wave from the top-right corner (RTL reading start)
    const order = (GRID.cols - 1 - col + row) / (GRID.cols - 1 + GRID.rows - 1);
    const appear = springIn(f, waveStart + order * waveSpan, {damping: 12, stiffness: 160, mass: 0.6});
    if (appear <= 0.001) continue;

    const chipK = CHIP_DOTS.indexOf(i);
    if (chipK >= 0) {
      const w = chipWindow(chipK);
      if (f >= w.start && f < w.end) continue; // the chip is drawn by the scene
    }

    // heartbeat ripple from the center
    const dist = Math.hypot(x - 540, y - 900);
    let hb = 0;
    for (const b of beats) hb += heartbeat(f - b - dist / 70);

    // area under the drawn chart lights up
    const under = x >= headX && y >= chartYAt(x) ? 1 : 0;
    const lit = under * chartPhase;

    // exit: dots float up and dissolve
    const seed = seeds[i];
    const ex = ease(f, [exitStart + seed.a * 14, exitStart + seed.a * 14 + 22], [0, 1], EASE.in);

    const base = 0.55 + 0.45 * Math.sin(f / 18 + seed.b * 6.28) * 0.25;
    const brightness = Math.min(1.4, (base - dim * 0.35 - chartPhase * 0.25 + lit * 0.55 + hb * 0.5) * (1 - ex));
    const r = DOT_R * appear * (1 + hb * 0.55 + lit * 0.15) * (1 - ex * 0.5);
    const yy = y - ex * (40 + seed.b * 60);
    const xx = x + ex * (seed.a - 0.5) * 30;
    const fill = lit > 0.5 || hb > 0.4 ? COLORS.goldLight : COLORS.gold;
    dots.push(
      <g key={i} opacity={Math.max(0, brightness)}>
        <circle cx={xx} cy={yy} r={r * 2.6} fill={COLORS.gold} opacity={0.12 + hb * 0.12} />
        <circle cx={xx} cy={yy} r={r} fill={fill} />
      </g>,
    );
  }

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {dots}
    </svg>
  );
};
