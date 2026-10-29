import React from 'react';

/** Bank building with columns, thin white lines. viewBox 200×180. */
export const BankIcon: React.FC<{width: number; color?: string; stroke?: number}> = ({width, color = '#F5F1E8', stroke = 4}) => (
  <svg width={width} height={(width * 180) / 200} viewBox="0 0 200 180" style={{overflow: 'visible'}}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">
      <path d="M18,56 L100,14 L182,56 Z" />
      <line x1="26" y1="68" x2="174" y2="68" />
      {[44, 82, 118, 156].map((x) => (
        <line key={x} x1={x} y1="80" x2={x} y2="140" />
      ))}
      <line x1="26" y1="152" x2="174" y2="152" />
      <line x1="14" y1="166" x2="186" y2="166" />
    </g>
    <circle cx="100" cy="42" r="6" fill={color} opacity="0.8" />
  </svg>
);
