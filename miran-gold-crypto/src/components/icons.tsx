import React from 'react';
import {COLORS} from '../config';

type IconProps = {size: number; color?: string; stroke?: number};

const Svg: React.FC<IconProps & {children: React.ReactNode}> = ({size, color = COLORS.gold, stroke = 4.5, children}) => (
  <svg
    viewBox="0 0 120 120"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{overflow: 'visible'}}
  >
    {children}
  </svg>
);

/** Classical bank: pediment, four columns, steps. */
export const BankIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 42 L60 14 L108 42 Z" />
    <circle cx="60" cy="31" r="4" />
    <path d="M18 50 H102" />
    {[30, 50, 70, 90].map((x) => (
      <path key={x} d={`M${x} 56 V90`} />
    ))}
    <path d="M18 96 H102" />
    <path d="M10 106 H110" />
  </Svg>
);

/** Government building: dome on a drum, columns, flag. */
export const GovernmentIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M60 8 V22" />
    <path d="M60 8 H74 L70 12.5 L74 17 H60" />
    <path d="M36 46 A24 24 0 0 1 84 46" />
    <path d="M30 46 H90" />
    <path d="M22 56 H98" />
    {[32, 48, 72, 88].map((x) => (
      <path key={x} d={`M${x} 62 V92`} />
    ))}
    <path d="M60 62 V92" strokeOpacity={0.6} />
    <path d="M16 98 H104" />
    <path d="M8 108 H112" />
  </Svg>
);

/** Wallet with a clasp. */
export const WalletIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 34 L82 16 L88 34" />
    <rect x="12" y="34" width="96" height="70" rx="12" />
    <path d="M108 56 H84 A12 12 0 0 0 84 80 H108" />
    <circle cx="86" cy="68" r="3.5" fill={p.color ?? COLORS.gold} />
  </Svg>
);
