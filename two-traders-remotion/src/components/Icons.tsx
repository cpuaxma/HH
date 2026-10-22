import React from 'react';
import {colors} from '../theme';

// Small SVG badges used instead of emoji

export const XBadge: React.FC<{size?: number}> = ({size = 40}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', flexShrink: 0}}>
    <circle cx={20} cy={20} r={19} fill={colors.red} />
    <circle cx={20} cy={20} r={19} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={1.5} />
    <path d="M 13.5 13.5 L 26.5 26.5 M 26.5 13.5 L 13.5 26.5" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
  </svg>
);

export const CheckBadge: React.FC<{size?: number}> = ({size = 40}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', flexShrink: 0}}>
    <circle cx={20} cy={20} r={19} fill={colors.green} />
    <circle cx={20} cy={20} r={19} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={1.5} />
    <path d="M 12 20.5 L 17.5 26 L 28.5 14.5" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CoinDot: React.FC<{size?: number}> = ({size = 18}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{display: 'block', flexShrink: 0}}>
    <defs>
      <linearGradient id="coinDot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={colors.goldTo} />
        <stop offset="1" stopColor={colors.goldDeep} />
      </linearGradient>
    </defs>
    <circle cx={10} cy={10} r={9} fill="url(#coinDot)" />
    <circle cx={10} cy={10} r={6} fill="none" stroke="#FFF3CF" strokeOpacity={0.55} strokeWidth={1.2} />
  </svg>
);

export const Arrow: React.FC<{up: boolean; color: string; size?: number}> = ({up, color, size = 22}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', flexShrink: 0, transform: up ? undefined : 'rotate(180deg)'}}>
    <path d="M 12 3 L 21 13 L 15 13 L 15 21 L 9 21 L 9 13 L 3 13 Z" fill={color} />
  </svg>
);

// Right-pointing arrow drawn as SVG (the font may not carry →)
export const ArrowRight: React.FC<{color: string; size?: number}> = ({color, size = 26}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 30 18" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <path d="M 2 9 L 24 9 M 17 2 L 26 9 L 17 16" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
