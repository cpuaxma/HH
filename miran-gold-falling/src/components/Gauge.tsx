import React from 'react';
import {COLORS} from '../theme';

/**
 * Thermometer-style gauge: thin white tube with ticks, filled in red (`level` 0–1)
 * with a soft glow. viewBox 120×420 (bulb centre at y=360).
 */
export const Gauge: React.FC<{id: string; height: number; level: number; pulse?: number}> = ({id, height, level, pulse = 0}) => {
  const tubeTop = 30;
  const tubeBottom = 330;
  const fillTop = tubeBottom - (tubeBottom - tubeTop - 10) * level;
  const ticks = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg width={(height * 120) / 420} height={height} viewBox="0 0 120 420" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#A8322F" />
          <stop offset="1" stopColor="#F07470" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-150%" y="-30%" width="400%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {/* glow */}
      <rect x="44" y={fillTop} width="32" height={tubeBottom - fillTop + 30} rx="16" fill={COLORS.red} opacity={0.5 + pulse * 0.3} filter={`url(#${id}-glow)`} />
      <circle cx="60" cy="360" r="40" fill={COLORS.red} opacity={0.35 + pulse * 0.25} filter={`url(#${id}-glow)`} />
      {/* fill */}
      <rect x="49" y={fillTop} width="22" height={tubeBottom - fillTop + 20} rx="11" fill={`url(#${id}-fill)`} />
      <circle cx="60" cy="360" r="30" fill={`url(#${id}-fill)`} />
      {/* outline */}
      <path
        d="M42,30 A18,18 0 0 1 78,30 L78,327 A42,42 0 1 1 42,327 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {ticks.map((t) => {
        const y = tubeTop + 14 + t * 46;
        return <line key={t} x1="86" x2={t % 2 === 0 ? 104 : 96} y1={y} y2={y} stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2" />;
      })}
      <circle cx="52" cy="352" r="7" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
};
