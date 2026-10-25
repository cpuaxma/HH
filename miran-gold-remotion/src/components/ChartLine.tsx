import {getLength, getPointAtLength} from '@remotion/paths';
import React, {useMemo} from 'react';
import {LightStreak} from './LightStreak';

export type Pt = [number, number];

// Catmull-Rom → cubic Bézier, so chart lines bend smoothly through their points
export const smoothPath = (pts: Pt[], tension = 0.5) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

type Props = {
  points: Pt[];
  progress: number;
  color: string;
  width?: number;
  // Gold lines get the light-streak bloom treatment
  streak?: boolean;
  // Soft area fill under the drawn part
  fillTo?: number;
  id: string;
  opacity?: number;
};

export const ChartLine: React.FC<Props> = ({points, progress, color, width = 4, streak, fillTo, id, opacity = 1}) => {
  const d = useMemo(() => smoothPath(points), [points]);
  const length = useMemo(() => getLength(d), [d]);
  const p = Math.max(0, Math.min(1, progress));
  const end = (p > 0 ? getPointAtLength(d, length * p) : null) ?? {x: points[0][0], y: points[0][1]};

  const area =
    fillTo !== undefined && p > 0 ? (
      <>
        <defs>
          <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.22} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <rect x={points[0][0] - 2} y={-5000} width={end.x - points[0][0] + 2} height={10000} />
          </clipPath>
        </defs>
        <path
          d={`${d} L ${points[points.length - 1][0]} ${fillTo} L ${points[0][0]} ${fillTo} Z`}
          fill={`url(#${id}-area)`}
          clipPath={`url(#${id}-clip)`}
        />
      </>
    ) : null;

  if (streak) {
    return (
      <g opacity={opacity}>
        {area}
        <LightStreak d={d} progress={p} width={width} id={id} />
      </g>
    );
  }

  return (
    <g opacity={opacity}>
      <defs>
        <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
          <feGaussianBlur stdDeviation={width * 1.5} />
        </filter>
      </defs>
      {area}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width * 2}
        strokeLinecap="round"
        opacity={0.35}
        filter={`url(#${id}-glow)`}
        style={{strokeDasharray: length, strokeDashoffset: length * (1 - p)}}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{strokeDasharray: length, strokeDashoffset: length * (1 - p)}}
      />
      {p > 0 && p < 1 ? <circle cx={end.x} cy={end.y} r={width * 1.4} fill={color} /> : null}
    </g>
  );
};
