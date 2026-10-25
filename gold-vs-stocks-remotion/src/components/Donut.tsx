import React from 'react';
import {COLORS} from '../theme';
import {hexA} from '../motion';

/**
 * Allocation donut. `ring` (0–1) draws the full blue ring; `gold` (0–1 of the circle)
 * is the gold segment growing clockwise from 12 o'clock over it. No numbers shown.
 */
export const Donut: React.FC<{id: string; size: number; ring: number; gold: number; thickness?: number}> = ({
  id,
  size,
  ring,
  gold,
  thickness = 34,
}) => {
  const r = 150 - thickness / 2;
  const c = 2 * Math.PI * r;
  const arc = (len: number, extra: React.SVGProps<SVGCircleElement>) => (
    <circle
      cx={0}
      cy={0}
      r={r}
      fill="none"
      strokeWidth={thickness}
      strokeDasharray={`${Math.max(0, len) * c} ${c}`}
      opacity={len > 0.001 ? 1 : 0}
      {...extra}
    />
  );
  return (
    <svg width={size} height={size} viewBox="-160 -160 320 320" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.blueB} />
          <stop offset="1" stopColor={COLORS.blueA} />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.goldB} />
          <stop offset="1" stopColor={COLORS.goldA} />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <circle cx={0} cy={0} r={r} fill="none" stroke={COLORS.text} strokeOpacity={0.06} strokeWidth={thickness} />
      <g transform="rotate(-90)">
        {arc(ring, {stroke: hexA(COLORS.blueA, 0.5), filter: `url(#${id}-glow)`})}
        {arc(ring, {stroke: `url(#${id}-blue)`})}
        {arc(gold, {stroke: hexA(COLORS.goldA, 0.55), filter: `url(#${id}-glow)`})}
        {arc(gold, {stroke: `url(#${id}-gold)`})}
        {/* thin seams where the two segments meet */}
        {gold > 0.01 ? (
          <>
            <line x1={r - thickness / 2 - 1} y1={0} x2={r + thickness / 2 + 1} y2={0} stroke={COLORS.bgTop} strokeWidth={3} />
            <line
              x1={r - thickness / 2 - 1}
              y1={0}
              x2={r + thickness / 2 + 1}
              y2={0}
              stroke={COLORS.bgTop}
              strokeWidth={3}
              transform={`rotate(${gold * 360})`}
            />
          </>
        ) : null}
      </g>
    </svg>
  );
};
