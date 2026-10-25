import React from 'react';
import {COLORS} from '../theme';
import {ease} from '../motion';

/**
 * Isometric gold cube, three shaded faces, specular highlight sweeping every
 * `sweepEvery` frames. `s` is the edge length on screen; the cube is 2s tall and
 * centred on (0, 0) in its own coordinates.
 */
export const cubePoints = (s: number) => {
  const h = 0.866 * s;
  return {
    top: `0,${-s} ${h},${-s / 2} 0,0 ${-h},${-s / 2}`,
    left: `${-h},${-s / 2} 0,0 0,${s} ${-h},${s / 2}`,
    right: `${h},${-s / 2} 0,0 0,${s} ${h},${s / 2}`,
    outline: `0,${-s} ${h},${-s / 2} ${h},${s / 2} 0,${s} ${-h},${s / 2} ${-h},${-s / 2}`,
    h,
  };
};

export const GoldCube: React.FC<{id: string; s: number; frame: number; sweepEvery?: number; sweepStart?: number}> = ({
  id,
  s,
  frame,
  sweepEvery = 90,
  sweepStart = 40,
}) => {
  const p = cubePoints(s);
  const local = frame - sweepStart;
  const phase = local < 0 ? -1 : local % sweepEvery;
  const k = phase < 0 ? 0 : ease(phase, 0, 40);
  const x = -2.2 * s + k * 4.4 * s;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FCEAB2" />
          <stop offset="1" stopColor={COLORS.goldB} />
        </linearGradient>
        <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.goldA} />
          <stop offset="1" stopColor={COLORS.goldDeep} />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.goldDeep} />
          <stop offset="1" stopColor={COLORS.goldShadow} />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={p.outline} />
        </clipPath>
      </defs>
      <polygon points={p.left} fill={`url(#${id}-left)`} />
      <polygon points={p.right} fill={`url(#${id}-right)`} />
      <polygon points={p.top} fill={`url(#${id}-top)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <polygon
          points={`${x},${1.2 * s} ${x + 0.45 * s},${1.2 * s} ${x + 1.25 * s},${-1.2 * s} ${x + 0.8 * s},${-1.2 * s}`}
          fill={`url(#${id}-spec)`}
          opacity={phase < 0 || k >= 1 ? 0 : 1}
        />
      </g>
      <polyline points={`${-p.h},${-s / 2} 0,0 ${p.h},${-s / 2}`} fill="none" stroke="#FFF3C8" strokeOpacity="0.55" strokeWidth="1.5" />
      <line x1="0" y1="0" x2="0" y2={s} stroke="#FFF3C8" strokeOpacity="0.25" strokeWidth="1.5" />
    </g>
  );
};
