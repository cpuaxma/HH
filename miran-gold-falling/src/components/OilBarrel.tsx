import React from 'react';
import {COLORS} from '../theme';
import {hexA} from '../motion';

/**
 * Minimal oil barrel: thin amber outline, two ribs, and a subtle liquid fill
 * (`fill` 0–1) with a gently moving surface. viewBox 200×260.
 */
export const OilBarrel: React.FC<{id: string; width: number; fill: number; frame: number; stroke?: number}> = ({
  id,
  width,
  fill,
  frame,
  stroke = 3,
}) => {
  const top = 30;
  const bottom = 236;
  const level = bottom - (bottom - top - 8) * fill;
  const wave = Math.sin(frame * 0.09) * 3;
  const surface = `M14,${level + wave} C60,${level - 5 - wave} 140,${level + 5 + wave} 186,${level - wave} L186,250 L14,250 Z`;
  const body = 'M30,22 Q14,22 14,40 L14,224 Q14,244 30,244 L170,244 Q186,244 186,224 L186,40 Q186,22 170,22 Z';
  return (
    <svg width={width} height={(width * 260) / 200} viewBox="0 0 200 260" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
        </clipPath>
        <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.amber} stopOpacity="0.42" />
          <stop offset="1" stopColor={COLORS.amber} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <path d={body} fill="none" stroke={COLORS.amber} strokeWidth={stroke * 3} opacity={0.35} filter={`url(#${id}-glow)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="200" height="260" fill={hexA(COLORS.amber, 0.04)} />
        {fill > 0.001 ? <path d={surface} fill={`url(#${id}-liquid)`} /> : null}
        {fill > 0.001 ? (
          <path
            d={`M14,${level + wave} C60,${level - 5 - wave} 140,${level + 5 + wave} 186,${level - wave}`}
            fill="none"
            stroke={COLORS.amber}
            strokeOpacity="0.8"
            strokeWidth="2"
          />
        ) : null}
        <rect x="0" y="0" width="200" height="260" fill={`url(#${id}-sheen)`} />
      </g>
      <path d={body} fill="none" stroke={COLORS.amber} strokeWidth={stroke} />
      <path d="M14,92 Q100,102 186,92" fill="none" stroke={COLORS.amber} strokeWidth={stroke * 0.8} opacity="0.85" />
      <path d="M14,176 Q100,186 186,176" fill="none" stroke={COLORS.amber} strokeWidth={stroke * 0.8} opacity="0.85" />
      <ellipse cx="62" cy="22" rx="14" ry="4" fill="none" stroke={COLORS.amber} strokeWidth={stroke * 0.8} />
    </svg>
  );
};
