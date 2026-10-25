import React from 'react';
import {COLORS} from '../theme';
import {dash} from '../motion';

export type StreakVariant = 'gold' | 'blue' | 'goldToBlue';

const PALETTE: Record<StreakVariant, {glow: [string, string]; bloom: [string, string]; core: [string, string]}> = {
  gold: {glow: [COLORS.goldA, COLORS.goldB], bloom: [COLORS.goldA, COLORS.goldA], core: [COLORS.goldB, '#FFFFFF']},
  blue: {glow: [COLORS.blueA, COLORS.blueB], bloom: [COLORS.blueA, COLORS.blueA], core: [COLORS.blueB, '#FFFFFF']},
  goldToBlue: {glow: [COLORS.goldA, COLORS.blueA], bloom: [COLORS.goldA, COLORS.blueA], core: ['#FFF3C8', '#DCE7FF']},
};

/**
 * Signature accent: a white-core stroke over a coloured glow, plus a blurred copy underneath
 * for bloom. `variant` picks gold, the stocks blue, or a gold→blue blend. Reveal it with
 * head/tail (0–1 along the path). Use inside an <svg>. `from`/`to` set the gradient direction.
 */
export const LightStreak: React.FC<{
  id: string;
  d: string;
  head: number;
  tail?: number;
  variant?: StreakVariant;
  width?: number;
  bloom?: number;
  from: [number, number];
  to: [number, number];
  opacity?: number;
}> = ({id, d, head, tail = 0, variant = 'gold', width = 4, bloom = 10, from, to, opacity = 1}) => {
  const c = PALETTE[variant];
  const common = {d, pathLength: 1, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const grad = (name: string, [a, b]: [string, string]) => (
    <linearGradient id={`${id}-${name}`} gradientUnits="userSpaceOnUse" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
  return (
    <g>
      <defs>
        {grad('glow', c.glow)}
        {grad('bloomc', c.bloom)}
        {grad('core', c.core)}
        <filter id={`${id}-bloom`} filterUnits="userSpaceOnUse" x={-4000} y={-4000} width={9000} height={9000}>
          <feGaussianBlur stdDeviation={bloom} />
        </filter>
      </defs>
      <path {...common} stroke={`url(#${id}-bloomc)`} strokeWidth={width * 5} filter={`url(#${id}-bloom)`} style={dash(head, tail, 0.8 * opacity)} />
      <path {...common} stroke={`url(#${id}-glow)`} strokeWidth={width * 1.8} style={dash(head, tail, 0.9 * opacity)} />
      <path {...common} stroke={`url(#${id}-core)`} strokeWidth={width * 0.6} style={dash(head, tail, opacity)} />
    </g>
  );
};
