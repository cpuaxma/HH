import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, EASE, FONT} from '../brand';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Giant outlined chapter numeral ("01 / 02 / 03"): the stroke draws on, then fills gold.
 * Two faint echo outlines drift behind for depth. `impactAt` is the frame (local) where the fill lands.
 */
export const ChapterNumeral: React.FC<{n: string; impactAt: number; label?: string}> = ({n, impactAt, label}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, impactAt], [0, 1], {...CLAMP, easing: EASE.move});
  const fill = interpolate(f, [impactAt - 4, impactAt + 14], [0, 1], {...CLAMP, easing: EASE.enter});
  const punch = interpolate(f, [impactAt - 2, impactAt + 3, impactAt + 16], [1, 1.06, 1], CLAMP);
  const DASH = 2600;
  const sheen = interpolate(f, [impactAt + 6, impactAt + 46], [-30, 130], CLAMP);
  const textProps = {
    x: 400,
    y: 470,
    textAnchor: 'middle' as const,
    fontFamily: FONT.en,
    fontWeight: 700,
    fontSize: 560,
    letterSpacing: -12,
  };
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={800} height={620} viewBox="0 0 800 620" style={{overflow: 'visible', transform: `scale(${punch})`, marginTop: -80}}>
        <defs>
          <linearGradient id={`numFill-${n}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold0} />
            <stop offset="55%" stopColor={C.gold1} />
            <stop offset="100%" stopColor={C.gold2} />
          </linearGradient>
          <linearGradient id={`numSheen-${n}`} x1="0" y1="0" x2="1" y2="0.2" gradientUnits="objectBoundingBox">
            <stop offset={`${(sheen - 12) / 100}`} stopColor="#fff" stopOpacity={0} />
            <stop offset={`${sheen / 100}`} stopColor="#fff" stopOpacity={0.85} />
            <stop offset={`${(sheen + 12) / 100}`} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <filter id={`numGlow-${n}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {/* echoes */}
        {[2, 1].map((k) => (
          <text
            key={k}
            {...textProps}
            x={400 + k * 26 + Math.sin(f / 30 + k) * 6}
            y={470 - k * 18}
            fill="none"
            stroke={C.gold1}
            strokeOpacity={0.12 / k}
            strokeWidth={2}
          >
            {n}
          </text>
        ))}
        <text {...textProps} fill={C.gold1} opacity={fill * 0.45} filter={`url(#numGlow-${n})`}>
          {n}
        </text>
        <text {...textProps} fill={`url(#numFill-${n})`} opacity={fill}>
          {n}
        </text>
        <text {...textProps} fill={`url(#numSheen-${n})`} opacity={fill}>
          {n}
        </text>
        <text
          {...textProps}
          fill="none"
          stroke={C.gold0}
          strokeWidth={4}
          strokeDasharray={DASH}
          strokeDashoffset={DASH * (1 - draw)}
          opacity={1 - fill * 0.5}
        >
          {n}
        </text>
      </svg>
      {label ? (
        <div dir="rtl" style={{marginTop: -10, fontFamily: FONT.ar, fontWeight: 500, fontSize: 30, color: C.label, opacity: fill, letterSpacing: 1}}>
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
