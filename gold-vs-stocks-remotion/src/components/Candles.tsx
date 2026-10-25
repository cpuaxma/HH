import React from 'react';
import {interpolate} from 'remotion';
import {COLORS} from '../theme';
import {enter} from '../motion';

// Illustrative rising cluster (viewBox 320×360): [open, close, high, low] in px from the bottom.
const DATA: [number, number, number, number][] = [
  [70, 110, 130, 50],
  [110, 95, 125, 80],
  [95, 165, 185, 85],
  [165, 150, 180, 135],
  [150, 235, 260, 140],
  [235, 300, 330, 220],
];

/** Minimal blue candlestick cluster. Each candle grows from its open price, staggered left to right. */
export const Candles: React.FC<{id: string; width: number; frame: number; start: number; stagger?: number}> = ({
  id,
  width,
  frame,
  start,
  stagger = 6,
}) => {
  const H = 360;
  const slot = 320 / DATA.length;
  const body = slot * 0.5;
  return (
    <svg width={width} height={(width * H) / 320} viewBox={`0 0 320 ${H}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.blueB} />
          <stop offset="1" stopColor={COLORS.blueA} />
        </linearGradient>
      </defs>
      <line x1={0} y1={H} x2={320} y2={H} stroke={COLORS.text} strokeOpacity={0.12} strokeWidth={1.5} />
      {DATA.map(([o, c, hi, lo], i) => {
        const p = enter(frame, start + i * stagger, 26);
        const up = c >= o;
        const x = slot * i + slot / 2;
        const close = interpolate(p, [0, 1], [o, c]);
        const top = H - Math.max(o, close);
        const h = Math.max(2, Math.abs(close - o));
        const wickTop = H - interpolate(p, [0, 1], [Math.max(o, c), hi]);
        const wickBottom = H - interpolate(p, [0, 1], [Math.min(o, c), lo]);
        return (
          <g key={i} opacity={Math.min(1, p * 3)}>
            <line x1={x} y1={wickTop} x2={x} y2={wickBottom} stroke={COLORS.blueB} strokeWidth={2.5} strokeLinecap="round" />
            <rect
              x={x - body / 2}
              y={top}
              width={body}
              height={h}
              rx={3}
              fill={up ? `url(#${id}-fill)` : COLORS.bgTop}
              stroke={COLORS.blueB}
              strokeWidth={up ? 0 : 2.5}
              style={{filter: up ? `drop-shadow(0 0 10px ${COLORS.blueA}88)` : undefined}}
            />
          </g>
        );
      })}
    </svg>
  );
};
