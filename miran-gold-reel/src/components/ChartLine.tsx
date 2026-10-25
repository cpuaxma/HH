import React from 'react';
import {dash} from '../motion';

/** A plain chart stroke revealed with strokeDashoffset (progress 0–1). Use inside an <svg>. */
export const ChartLine: React.FC<{d: string; progress: number; color: string; width?: number; glow?: number; opacity?: number}> = ({
  d,
  progress,
  color,
  width = 4,
  glow = 0,
  opacity = 1,
}) => (
  <path
    d={d}
    pathLength={1}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{...dash(progress, 0, opacity), filter: glow ? `drop-shadow(0 0 ${glow}px ${color})` : undefined}}
  />
);
