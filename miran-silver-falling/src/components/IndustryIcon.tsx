import React from 'react';

/** Thin-line industry icons (viewBox 100×100): solar panel, microchip, car, factory. */
export const IndustryIcon: React.FC<{kind: 'solar' | 'chip' | 'car' | 'factory'; size: number; color: string; stroke?: number}> = ({
  kind,
  size,
  color,
  stroke = 3,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">
      {kind === 'solar' ? (
        <>
          <path d="M14,70 L30,30 H86 L70,70 Z" />
          <path d="M36,30 L22,70 M52,30 L40,70 M68,30 L56,70 M22,50 H78" />
          <path d="M50,70 V86 M36,86 H64" />
          <circle cx={22} cy={14} r={6} />
          <path d="M22,2 V5 M22,23 V26 M10,14 H13 M31,14 H34" />
        </>
      ) : kind === 'chip' ? (
        <>
          <rect x={26} y={26} width={48} height={48} rx={6} />
          <rect x={38} y={38} width={24} height={24} rx={3} />
          {[34, 46, 58, 66].map((v) => (
            <path key={v} d={`M${v},26 V14 M${v},74 V86 M26,${v} H14 M74,${v} H86`} />
          ))}
        </>
      ) : kind === 'car' ? (
        <>
          <path d="M10,64 V54 L22,50 L34,32 H64 L78,50 L90,54 V64 Z" />
          <path d="M38,36 L30,50 H72 L62,36 Z" />
          <circle cx={28} cy={66} r={9} />
          <circle cx={72} cy={66} r={9} />
          <path d="M44,22 L52,14 L48,22 L56,22 L48,30" />
        </>
      ) : (
        <>
          <path d="M10,86 V48 L30,60 V48 L50,60 V48 L70,60 V20 H84 V86 Z" />
          <path d="M22,74 H32 M42,74 H52 M62,74 H72" />
          <path d="M77,20 V10" />
        </>
      )}
    </g>
  </svg>
);
