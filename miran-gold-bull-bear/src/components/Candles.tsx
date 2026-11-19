import React from 'react';
import {COLORS} from '../constants';
import {hexA} from '../lib';

/** Price levels are normalised: 0 = bottom of the chart box, 1 = top. */
export type Candle = {o: number; h: number; l: number; c: number};

export type ChartBox = {x: number; y: number; w: number; h: number};

/** Rising market: ten green candles climbing from the low. */
export const BULL_CANDLES: Candle[] = [
  [0.06, 0.16],
  [0.13, 0.24],
  [0.21, 0.31],
  [0.28, 0.41],
  [0.37, 0.48],
  [0.45, 0.59],
  [0.56, 0.66],
  [0.63, 0.77],
  [0.74, 0.85],
  [0.82, 0.96],
].map(([o, c]) => ({o, c, h: c + 0.03, l: o - 0.03}));

/** Falling market: the mirror image, ten red candles. */
export const BEAR_CANDLES: Candle[] = BULL_CANDLES.map((k) => ({o: 1 - k.o, c: 1 - k.c, h: 1 - k.l, l: 1 - k.h}));

export const levelY = (box: ChartBox, level: number) => box.y + box.h * (1 - level);

/**
 * Candlestick chart. `progress[i]` (0..1) is how far candle i has grown:
 * the body grows from its open toward its close, the wick follows.
 * `drop` (px) makes a candle fall into place as it appears (bear market).
 */
export const Candles: React.FC<{
  data: Candle[];
  box: ChartBox;
  progress: number[];
  color: string;
  drop?: number;
}> = ({data, box, progress, color, drop = 0}) => {
  const slot = box.w / data.length;
  const bodyW = slot * 0.56;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id={`candle-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={hexA(color, 0.7)} />
        </linearGradient>
      </defs>
      {data.map((k, i) => {
        const p = progress[i] ?? 0;
        if (p <= 0.001) return null;
        const cx = box.x + slot * (i + 0.5);
        const yO = levelY(box, k.o);
        const yC = yO + (levelY(box, k.c) - yO) * p;
        const top = Math.min(yO, yC);
        const bottom = Math.max(yO, yC);
        const yH = levelY(box, k.h);
        const yL = levelY(box, k.l);
        const wickTop = top - (top - yH) * p;
        const wickBottom = bottom + (yL - bottom) * p;
        const dy = (1 - p) * -drop;
        return (
          <g key={i} transform={`translate(0 ${dy})`} opacity={Math.min(1, p * 2.5)}>
            <line x1={cx} x2={cx} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={4} strokeLinecap="round" />
            <rect
              x={cx - bodyW / 2}
              y={top}
              width={bodyW}
              height={Math.max(3, bottom - top)}
              rx={6}
              fill={`url(#candle-${color})`}
              style={{filter: `drop-shadow(0 0 14px ${hexA(color, 0.45)})`}}
            />
          </g>
        );
      })}
    </svg>
  );
};

/** Faint horizontal grid behind the candles. */
export const ChartGrid: React.FC<{box: ChartBox; opacity: number}> = ({box, opacity}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity}}>
    {Array.from({length: 6}, (_, i) => {
      const y = box.y + (box.h * i) / 5;
      return <line key={i} x1={box.x} x2={box.x + box.w} y1={y} y2={y} stroke={COLORS.grid} strokeWidth={2} />;
    })}
  </svg>
);
