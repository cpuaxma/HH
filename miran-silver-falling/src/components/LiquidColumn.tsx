import React from 'react';
import {COLORS} from '../theme';

const METAL = {
  silver: ['#6F7989', '#B9C2CF', '#F2F5F9', '#C3CBD6', '#7D8798'],
  gold: [COLORS.goldShadow, COLORS.goldA, COLORS.goldB, COLORS.goldA, COLORS.goldDeep],
};

/**
 * A glass tube of liquid metal. `level` 0–1 is the fill; `wave` (px) is the surface slosh.
 * Drawn in its own SVG box of width w × height h (+ margins for the rim and glow).
 */
export const LiquidColumn: React.FC<{
  id: string;
  metal: 'silver' | 'gold';
  w: number;
  h: number;
  level: number;
  wave: number;
  frame: number;
}> = ({id, metal, w, h, level, wave, frame}) => {
  const m = 16; // margin
  const r = w / 2;
  const tube = `M${m},${m + 10} L${m},${m + h - r} A${r},${r} 0 0 0 ${m + w},${m + h - r} L${m + w},${m + 10}`;
  const inner = `M${m + 6},${m + 10} L${m + 6},${m + h - r} A${r - 6},${r - 6} 0 0 0 ${m + w - 6},${m + h - r} L${m + w - 6},${m + 10} Z`;
  const top = m + 12 + (h - 24) * (1 - level);
  const pts: string[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const x = m + (w * i) / steps;
    const y = top + Math.sin(i * 0.55 + frame * 0.16) * wave + Math.sin(i * 0.23 - frame * 0.09) * wave * 0.6;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const surface = pts.join(' ');
  const liquid = `${surface} L${m + w},${m + h + 4} L${m},${m + h + 4} Z`;
  const c = METAL[metal];
  return (
    <svg width={w + m * 2} height={h + m * 2} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.25" stopColor={c[1]} />
          <stop offset="0.42" stopColor={c[2]} />
          <stop offset="0.7" stopColor={c[3]} />
          <stop offset="1" stopColor={c[4]} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={inner} />
        </clipPath>
        <filter id={`${id}-glow`} x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {/* glow of the metal */}
      <rect
        x={m}
        y={top}
        width={w}
        height={Math.max(0, m + h - top)}
        fill={metal === 'gold' ? COLORS.goldA : '#C9D3E2'}
        opacity={0.22}
        filter={`url(#${id}-glow)`}
      />
      <path d={inner} fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {level > 0.001 ? (
          <>
            <path d={liquid} fill={`url(#${id}-metal)`} />
            <path d={surface} fill="none" stroke="#FFFFFF" strokeOpacity={0.75} strokeWidth={2.5} />
          </>
        ) : null}
      </g>
      {/* graduation ticks */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={m + w - 22} x2={m + w - 6} y1={m + 12 + (h - 24) * (1 - g)} y2={m + 12 + (h - 24) * (1 - g)} stroke="#FFFFFF" strokeOpacity={0.35} />
      ))}
      <path d={tube} fill="none" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={2} />
      <line x1={m + 14} x2={m + 14} y1={m + 30} y2={m + h - r} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={m + r} cy={m + 10} rx={r} ry={7} fill="none" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={2} />
    </svg>
  );
};

/** Screen y of a column's liquid surface (matches LiquidColumn's geometry). */
export const surfaceY = (top: number, h: number, level: number) => top + 16 + 12 + (h - 24) * (1 - level);
