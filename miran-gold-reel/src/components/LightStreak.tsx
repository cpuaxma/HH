import React from 'react';
import {COLORS} from '../theme';
import {dash} from '../motion';

/**
 * Signature accent: a stroke with a white core over a gold glow, plus a blurred
 * gold copy underneath for bloom. Reveal it with head/tail (0–1 along the path).
 * Use inside an <svg>. `from`/`to` set the gradient direction in user space.
 */
export const LightStreak: React.FC<{
  id: string;
  d: string;
  head: number;
  tail?: number;
  width?: number;
  bloom?: number;
  from: [number, number];
  to: [number, number];
  opacity?: number;
}> = ({id, d, head, tail = 0, width = 4, bloom = 10, from, to, opacity = 1}) => {
  const common = {d, pathLength: 1, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-glow`} gradientUnits="userSpaceOnUse" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
          <stop offset="0" stopColor={COLORS.goldA} />
          <stop offset="1" stopColor={COLORS.goldB} />
        </linearGradient>
        <linearGradient id={`${id}-core`} gradientUnits="userSpaceOnUse" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
          <stop offset="0" stopColor={COLORS.goldB} />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <filter id={`${id}-bloom`} filterUnits="userSpaceOnUse" x={-4000} y={-4000} width={9000} height={9000}>
          <feGaussianBlur stdDeviation={bloom} />
        </filter>
      </defs>
      <path {...common} stroke={COLORS.goldA} strokeWidth={width * 5} filter={`url(#${id}-bloom)`} style={dash(head, tail, 0.8 * opacity)} />
      <path {...common} stroke={`url(#${id}-glow)`} strokeWidth={width * 1.8} style={dash(head, tail, 0.9 * opacity)} />
      <path {...common} stroke={`url(#${id}-core)`} strokeWidth={width * 0.6} style={dash(head, tail, opacity)} />
    </g>
  );
};
