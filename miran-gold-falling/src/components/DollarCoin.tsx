import React from 'react';
import {COLORS, FONT} from '../theme';

/** Green "$" coin with a soft glow. viewBox 200×200. */
export const DollarCoin: React.FC<{id: string; size: number; glow?: number}> = ({id, size, glow = 1}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
    <defs>
      <radialGradient id={`${id}-face`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#8FE0B8" />
        <stop offset="0.55" stopColor={COLORS.green} />
        <stop offset="1" stopColor="#1F5C42" />
      </radialGradient>
      <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
    </defs>
    <circle cx="100" cy="100" r="92" fill={COLORS.green} opacity={0.45 * glow} filter={`url(#${id}-glow)`} />
    <circle cx="100" cy="100" r="88" fill={`url(#${id}-face)`} />
    <circle cx="100" cy="100" r="72" fill="none" stroke="#CFF5E1" strokeOpacity="0.55" strokeWidth="3" />
    <text
      x="100"
      y="103"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily={FONT.family}
      fontWeight={FONT.key}
      fontSize="104"
      fill="#F2FFF8"
    >
      $
    </text>
    <path d="M40,62 A70,70 0 0 1 100,28" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
  </svg>
);
