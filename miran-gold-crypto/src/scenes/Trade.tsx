import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, EASE} from '../config';
import {Headline} from '../components/Headline';
import {useSceneFrame} from '../components/SceneShell';
import {ramp, settle} from '../motion';

// Chart box (time runs left → right, as on every trading screen).
const BOX = {left: 130, right: 950, top: 820, bottom: 1450};
// open/close/high/low in price units (0 bottom … 100 top): a calm uptrend with a few pullbacks.
const CANDLES = [
  [18, 26, 30, 14], [26, 22, 29, 18], [22, 31, 34, 20], [31, 36, 40, 28], [36, 32, 38, 29],
  [32, 41, 44, 30], [41, 47, 50, 38], [47, 44, 50, 40], [44, 54, 57, 42], [54, 60, 64, 51],
  [60, 57, 63, 53], [57, 67, 70, 55], [67, 74, 78, 64], [74, 82, 86, 71],
];
const N = CANDLES.length;
const step = (BOX.right - BOX.left) / N;
const X = (i: number) => BOX.left + step * (i + 0.5);
const Y = (v: number) => BOX.bottom - ((BOX.bottom - BOX.top) * v) / 100;
const CANDLE_AT = (i: number) => 6 + i * 4;
const ARROW = [26, 96];

// Arrow: rises along the candles' closes, slightly above them.
const ARROW_PTS = CANDLES.map((c, i) => [X(i), Y(Math.max(c[0], c[1]) + 15)]).filter((_, i) => i % 2 === 1 || i === 0);
ARROW_PTS.push([X(N - 1) + step * 0.75, Y(100)]);

/** 23–27s: gold candlesticks draw in and a rising arrow sweeps over them. */
export const Trade: React.FC = () => {
  const f = useSceneFrame();
  const arrow = ramp(f, ARROW[0], ARROW[1], EASE.inOut);
  // arrow geometry
  const segs = ARROW_PTS.slice(1).map((p, i) => Math.hypot(p[0] - ARROW_PTS[i][0], p[1] - ARROW_PTS[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = arrow * total;
  let tip = ARROW_PTS[0];
  let dir = 0;
  for (let i = 0; i < segs.length; i++) {
    const [ax, ay] = ARROW_PTS[i];
    const [bx, by] = ARROW_PTS[i + 1];
    dir = Math.atan2(by - ay, bx - ax);
    if (left <= segs[i]) {
      const u = segs[i] === 0 ? 0 : left / segs[i];
      tip = [ax + (bx - ax) * u, ay + (by - ay) * u];
      break;
    }
    left -= segs[i];
    tip = [bx, by];
  }
  const d = `M${ARROW_PTS.map((p) => p.join(',')).join(' L')}`;
  const gridIn = ramp(f, 0, 24);
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <linearGradient id="bull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.goldPale} />
            <stop offset="45%" stopColor={COLORS.gold} />
            <stop offset="100%" stopColor="#8C6B1C" />
          </linearGradient>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((k) => {
          const y = BOX.top + ((BOX.bottom - BOX.top) * k) / 4;
          return (
            <line key={k} x1={BOX.left} x2={BOX.left + (BOX.right - BOX.left) * gridIn} y1={y} y2={y}
              stroke={COLORS.text} strokeOpacity={k === 4 ? 0.22 : 0.07} strokeWidth={k === 4 ? 2 : 1.5} />
          );
        })}
        {CANDLES.map(([o, c, h, l], i) => {
          const p = settle(f, CANDLE_AT(i), 22);
          const bull = c >= o;
          const mid = (Y(o) + Y(c)) / 2;
          const half = (Math.abs(Y(o) - Y(c)) / 2) * p;
          const bodyW = step * 0.56;
          return (
            <g key={i} opacity={Math.min(1, p * 1.4)}>
              <line x1={X(i)} x2={X(i)} y1={mid - (mid - Y(h)) * p} y2={mid + (Y(l) - mid) * p}
                stroke={bull ? COLORS.goldLight : 'rgba(245,241,230,0.45)'} strokeWidth={3} />
              <rect x={X(i) - bodyW / 2} width={bodyW} y={mid - Math.max(half, 2)} height={Math.max(half * 2, 4)} rx={4}
                fill={bull ? 'url(#bull)' : 'rgba(20,20,20,0.9)'}
                stroke={bull ? COLORS.goldPale : 'rgba(245,241,230,0.5)'} strokeWidth={2}
                style={bull ? {filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.45))'} : undefined} />
            </g>
          );
        })}
        <g style={{filter: 'drop-shadow(0 0 16px rgba(243,220,133,0.85))'}} opacity={ramp(f, ARROW[0], ARROW[0] + 6)}>
          <path d={d} fill="none" stroke={COLORS.goldPale} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} />
          <path d="M-30 -24 L8 0 L-30 24 Z" fill={COLORS.goldPale} stroke={COLORS.goldPale} strokeWidth={6} strokeLinejoin="round"
            transform={`translate(${tip[0]} ${tip[1]}) rotate(${(dir * 180) / Math.PI})`} />
        </g>
      </svg>
      <Headline />
    </AbsoluteFill>
  );
};
