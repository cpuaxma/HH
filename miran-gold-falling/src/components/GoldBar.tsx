import React from 'react';
import {COLORS} from '../theme';
import {ease} from '../motion';

const FRONT = '10,160 270,160 240,70 40,70';
const TOP = '40,70 240,70 262,48 66,48';
const SIDE = '240,70 262,48 292,136 270,160';
const OUTLINE = '10,160 270,160 292,136 262,48 66,48 40,70';

/** Gold bar (trapezoid prism) with a specular sweep every `sweepEvery` frames. viewBox 300×170. */
export const GoldBar: React.FC<{id: string; width: number; frame: number; sweepEvery?: number; sweepStart?: number}> = ({
  id,
  width,
  frame,
  sweepEvery = 90,
  sweepStart = 30,
}) => {
  const local = frame - sweepStart;
  const phase = local < 0 ? -1 : local % sweepEvery;
  const s = phase < 0 ? 0 : ease(phase, 0, 34);
  const x = -120 + s * 460;
  return (
    <svg width={width} height={(width * 170) / 300} viewBox="0 0 300 170" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.goldB} />
          <stop offset="0.45" stopColor={COLORS.goldA} />
          <stop offset="1" stopColor={COLORS.goldDeep} />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FBE7A9" />
          <stop offset="0.6" stopColor={COLORS.goldB} />
          <stop offset="1" stopColor={COLORS.goldA} />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.goldDeep} />
          <stop offset="1" stopColor={COLORS.goldShadow} />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={OUTLINE} />
        </clipPath>
      </defs>
      <polygon points={FRONT} fill={`url(#${id}-front)`} />
      <polygon points={TOP} fill={`url(#${id}-top)`} />
      <polygon points={SIDE} fill={`url(#${id}-side)`} />
      <polygon points="62,140 218,140 200,86 80,86" fill="none" stroke={COLORS.goldDeep} strokeOpacity="0.45" strokeWidth="2" />
      <g clipPath={`url(#${id}-clip)`}>
        <polygon points={`${x},175 ${x + 46},175 ${x + 106},35 ${x + 60},35`} fill={`url(#${id}-spec)`} opacity={phase < 0 || s >= 1 ? 0 : 1} />
      </g>
      <polyline points="40,70 240,70 270,160" fill="none" stroke="#FFF3C8" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
};
