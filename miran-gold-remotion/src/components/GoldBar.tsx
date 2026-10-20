import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease} from '../theme';

type Props = {
  width: number;
  // Specular highlight sweep: first sweep at `sweepStart`, then every `sweepEvery` frames
  sweepStart?: number;
  sweepEvery?: number;
  glow?: number;
  id: string;
};

const SWEEP_DURATION = 40;

// A 3/4-view gold bar: top face, front face and short end faces, with an
// embossed stamp and a periodic specular sweep.
export const GoldBar: React.FC<Props> = ({width, sweepStart = 0, sweepEvery = 90, glow = 1, id}) => {
  const frame = useCurrentFrame();
  const height = (width * 230) / 400;

  const since = frame - sweepStart;
  const cycle = since < 0 ? -1 : since % sweepEvery;
  const sweepX =
    cycle >= 0 && cycle <= SWEEP_DURATION
      ? interpolate(cycle, [0, SWEEP_DURATION], [-200, 480], {easing: ease.inOut})
      : -400;

  const top = '92,44 308,44 344,96 56,96';
  const front = '56,96 344,96 384,196 16,196';
  const left = '56,96 16,196 10,186 50,92';
  const right = '344,96 384,196 390,186 350,92';

  return (
    <svg width={width} height={height} viewBox="0 0 400 230" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6D982" />
          <stop offset="0.45" stopColor="#D4A24C" />
          <stop offset="1" stopColor="#8E6220" />
        </linearGradient>
        <linearGradient id={`${id}-front-h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.25} />
          <stop offset="0.35" stopColor="#000" stopOpacity={0} />
          <stop offset="0.7" stopColor="#FFF" stopOpacity={0.08} />
          <stop offset="1" stopColor="#000" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBE7A6" />
          <stop offset="0.5" stopColor="#F0C868" />
          <stop offset="1" stopColor="#C8963E" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9852F" />
          <stop offset="1" stopColor="#6E4A16" />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF" stopOpacity={0} />
          <stop offset="0.5" stopColor="#FFF" stopOpacity={0.75} />
          <stop offset="1" stopColor="#FFF" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={top} />
          <polygon points={front} />
        </clipPath>
        <filter id={`${id}-shadow`} filterUnits="userSpaceOnUse" x={-100} y={100} width={600} height={250}>
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <filter id={`${id}-halo`} filterUnits="userSpaceOnUse" x={-200} y={-200} width={800} height={630}>
          <feGaussianBlur stdDeviation={40} />
        </filter>
      </defs>

      {/* Warm halo behind the bar */}
      <ellipse cx={200} cy={130} rx={200} ry={90} fill="#C8963E" opacity={0.28 * glow} filter={`url(#${id}-halo)`} />
      {/* Contact shadow */}
      <ellipse cx={200} cy={206} rx={190} ry={16} fill="#000" opacity={0.55} filter={`url(#${id}-shadow)`} />

      <polygon points={left} fill={`url(#${id}-side)`} />
      <polygon points={right} fill={`url(#${id}-side)`} />
      <polygon points={front} fill={`url(#${id}-front)`} />
      <polygon points={front} fill={`url(#${id}-front-h)`} />
      <polygon points={top} fill={`url(#${id}-top)`} />

      {/* Bevel highlights */}
      <polyline points="56,96 344,96" stroke="#FFF4C8" strokeWidth={2} opacity={0.9} />
      <polyline points="92,44 308,44" stroke="#FFF8DC" strokeWidth={1.5} opacity={0.8} />
      <polyline points="16,196 384,196" stroke="#5A3C10" strokeWidth={2} opacity={0.7} />

      {/* Embossed stamp on the top face */}
      <g fontFamily="'Sora', sans-serif" fontWeight={600} textAnchor="middle">
        <text x={200} y={70} fontSize={15} letterSpacing={3} fill="#FFF3C4" opacity={0.7} transform="translate(0.8 0.8)">
          FINE GOLD
        </text>
        <text x={200} y={70} fontSize={15} letterSpacing={3} fill="#9A6E25">
          FINE GOLD
        </text>
        <text x={200} y={88} fontSize={11} letterSpacing={2} fill="#FFF3C4" opacity={0.7} transform="translate(0.8 0.8)">
          999.9
        </text>
        <text x={200} y={88} fontSize={11} letterSpacing={2} fill="#9A6E25">
          999.9
        </text>
      </g>

      {/* Specular sweep */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={sweepX} y={0} width={90} height={230} fill={`url(#${id}-spec)`} transform={`skewX(-24) translate(60 0)`} />
      </g>
    </svg>
  );
};
