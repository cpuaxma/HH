import React from 'react';
import {ease} from '../motion';

const FRONT = '10,160 270,160 240,70 40,70';
const TOP = '40,70 240,70 262,48 66,48';
const SIDE = '240,70 262,48 292,136 270,160';
const OUTLINE = '10,160 270,160 292,136 262,48 66,48 40,70';

/** Flat silver ingot (trapezoid prism) with a cool specular sweep every `sweepEvery` frames. viewBox 300×170. */
export const SilverBar2D: React.FC<{id: string; width: number; frame: number; sweepEvery?: number; sweepStart?: number; tint?: string}> = ({
  id,
  width,
  frame,
  sweepEvery = 150,
  sweepStart = 30,
  tint,
}) => {
  const local = frame - sweepStart;
  const phase = local < 0 ? -1 : local % sweepEvery;
  const s = phase < 0 ? 0 : ease(phase, 0, 34);
  const x = -120 + s * 460;
  return (
    <svg width={width} height={(width * 170) / 300} viewBox="0 0 300 170" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F7FB" />
          <stop offset="0.4" stopColor="#C3CBD7" />
          <stop offset="0.55" stopColor="#8D97A8" />
          <stop offset="1" stopColor="#B4BDCA" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#E3E8EF" />
          <stop offset="1" stopColor="#B9C2CF" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7D8798" />
          <stop offset="1" stopColor="#4A5262" />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={OUTLINE} />
        </clipPath>
      </defs>
      <polygon points={FRONT} fill={`url(#${id}-front)`} />
      <polygon points={TOP} fill={`url(#${id}-top)`} />
      <polygon points={SIDE} fill={`url(#${id}-side)`} />
      {tint ? <polygon points={OUTLINE} fill={tint} /> : null}
      <polygon points="62,140 218,140 200,86 80,86" fill="none" stroke="#7D8798" strokeOpacity="0.5" strokeWidth="2" />
      <g clipPath={`url(#${id}-clip)`}>
        <polygon points={`${x},175 ${x + 46},175 ${x + 106},35 ${x + 60},35`} fill={`url(#${id}-spec)`} opacity={phase < 0 || s >= 1 ? 0 : 1} />
      </g>
      <polyline points="40,70 240,70 270,160" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.5" />
    </svg>
  );
};
