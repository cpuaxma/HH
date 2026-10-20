import {getBoundingBox, getLength, getPointAtLength} from '@remotion/paths';
import React, {useMemo} from 'react';
import {colors} from '../theme';

type Props = {
  d: string;
  // 0→1 draw-in
  progress: number;
  width?: number;
  opacity?: number;
  // Bright flare riding the drawing tip
  head?: boolean;
  id: string;
};

// Signature accent: a white-core stroke over a gold glow, with a blurred bloom
// copy underneath. Drawn in with strokeDashoffset. Render inside an <svg>.
export const LightStreak: React.FC<Props> = ({d, progress, width = 4, opacity = 1, head = true, id}) => {
  const length = useMemo(() => getLength(d), [d]);
  // userSpaceOnUse so straight (zero-height) paths still get their gradient
  const box = useMemo(() => getBoundingBox(d), [d]);
  const g = {gradientUnits: 'userSpaceOnUse' as const, x1: box.x1, y1: box.y1, x2: box.x2 + 0.01, y2: box.y1};
  const p = Math.max(0, Math.min(1, progress));
  const dash = {strokeDasharray: length, strokeDashoffset: length * (1 - p)};
  const tip = p > 0 && p < 1 ? getPointAtLength(d, length * p) : null;
  const tipFade = Math.min(1, p * 8) * Math.min(1, (1 - p) * 8);

  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`${id}-glow`} {...g}>
          <stop offset="0" stopColor={colors.goldFrom} />
          <stop offset="1" stopColor={colors.goldTo} />
        </linearGradient>
        <linearGradient id={`${id}-core`} {...g}>
          <stop offset="0" stopColor={colors.goldTo} />
          <stop offset="0.6" stopColor="#FFF8E6" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
        <filter id={`${id}-bloom`} filterUnits="userSpaceOnUse" x={box.x1 - 200} y={box.y1 - 200} width={box.width + 400} height={box.height + 400}>
          <feGaussianBlur stdDeviation={width * 2.4} />
        </filter>
        <filter id={`${id}-soft`} filterUnits="userSpaceOnUse" x={box.x1 - 100} y={box.y1 - 100} width={box.width + 200} height={box.height + 200}>
          <feGaussianBlur stdDeviation={width * 0.6} />
        </filter>
        <radialGradient id={`${id}-tip`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
          <stop offset="0.35" stopColor={colors.goldTo} stopOpacity={0.6} />
          <stop offset="1" stopColor={colors.goldFrom} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Bloom */}
      <path
        d={d}
        fill="none"
        stroke={colors.goldFrom}
        strokeWidth={width * 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
        filter={`url(#${id}-bloom)`}
        style={dash}
      />
      {/* Gold glow */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${id}-glow)`}
        strokeWidth={width * 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-soft)`}
        style={dash}
      />
      {/* White core */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${id}-core)`}
        strokeWidth={width * 0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={dash}
      />
      {tip && head ? <circle cx={tip.x} cy={tip.y} r={width * 6} fill={`url(#${id}-tip)`} opacity={tipFade} /> : null}
    </g>
  );
};
