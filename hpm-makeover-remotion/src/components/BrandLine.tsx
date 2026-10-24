import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import {Point, polylinePath} from '../lib/path';
import {HEIGHT, HPM, LINE_WIDTH, WIDTH} from '../theme';

// A frame-space area where the line is hidden. `feather` px at one edge fade it back in,
// so the line tapers away instead of being cut.
export type LineHide = {x0: number; x1: number; y0: number; y1: number; feather: number; edge: 'top' | 'bottom'};

type Props = {
  pts: readonly Point[];
  trimStart?: number;
  trimEnd?: number;
  width?: number;
  color?: string;
  hide?: LineHide[];
  opacity?: number;
};

// The Hot Pepper red line: the makeover brush. Points are frame coordinates.
export const BrandLine: React.FC<Props> = ({
  pts,
  trimStart = 0,
  trimEnd = 1,
  width = LINE_WIDTH,
  color = HPM.red,
  hide = [],
  opacity = 1,
}) => {
  const id = useId().replace(/:/g, '');
  const len = trimEnd - trimStart;
  if (pts.length < 2 || len <= 0.0005) return null;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{overflow: 'visible'}}>
        {hide.length ? (
          <defs>
            {hide.map((h, i) => (
              <linearGradient key={i} id={`${id}g${i}`} gradientUnits="userSpaceOnUse" x1="0" x2="0"
                y1={h.edge === 'bottom' ? h.y1 - h.feather : h.y0} y2={h.edge === 'bottom' ? h.y1 : h.y0 + h.feather}>
                <stop offset="0" stopColor={h.edge === 'bottom' ? '#000' : '#fff'} />
                <stop offset="1" stopColor={h.edge === 'bottom' ? '#fff' : '#000'} />
              </linearGradient>
            ))}
            <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={WIDTH + 400} height={HEIGHT + 400}>
              <rect x={-200} y={-200} width={WIDTH + 400} height={HEIGHT + 400} fill="#fff" />
              {hide.map((h, i) => {
                const solid0 = h.edge === 'top' ? h.y0 + h.feather : h.y0;
                const solid1 = h.edge === 'bottom' ? h.y1 - h.feather : h.y1;
                const f0 = h.edge === 'top' ? h.y0 : h.y1 - h.feather;
                return (
                  <React.Fragment key={i}>
                    <rect x={h.x0} y={solid0} width={h.x1 - h.x0} height={Math.max(0, solid1 - solid0)} fill="#000" />
                    <rect x={h.x0} y={f0} width={h.x1 - h.x0} height={h.feather} fill={`url(#${id}g${i})`} />
                  </React.Fragment>
                );
              })}
            </mask>
          </defs>
        ) : null}
        <path
          d={polylinePath(pts)}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={`${len} 2`}
          strokeDashoffset={-trimStart}
          mask={hide.length ? `url(#${id}m)` : undefined}
        />
      </svg>
    </AbsoluteFill>
  );
};
