import React from 'react';
import {interpolate} from 'remotion';
import {ease} from '../theme';

type Props = {
  cx: number;
  cy: number;
  // Local frames at which a ring is emitted
  at: number[];
  frame: number;
  radius?: number;
  color?: string;
  duration?: number;
  width?: number;
};

// Expanding, fading glow rings (render inside an <svg>)
export const PulseRing: React.FC<Props> = ({cx, cy, at, frame, radius = 60, color = '#F3D27A', duration = 50, width = 2}) => (
  <g>
    {at.map((t, i) => {
      const p = (frame - t) / duration;
      if (p < 0 || p > 1) return null;
      const e = ease.enter(p);
      return (
        <g key={i}>
          <circle
            cx={cx}
            cy={cy}
            r={interpolate(e, [0, 1], [radius * 0.15, radius])}
            fill="none"
            stroke={color}
            strokeWidth={width * (1.6 - e)}
            opacity={(1 - p) * 0.9}
          />
          <circle cx={cx} cy={cy} r={radius * 0.18} fill={color} opacity={(1 - p) * 0.35} />
        </g>
      );
    })}
  </g>
);
