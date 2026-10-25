import React from 'react';
import {priceAt} from '../data/price';
import {colors, fonts} from '../theme';

// Monitor chart, drawn in the monitor's 380×256 screen space from the shared price
// path. Both monitors call this with the same market time, so the line is identical.
export const SCREEN_W = 380;
export const SCREEN_H = 256;
const WINDOW = 34;
const LEAD = 29; // market units shown left of the tip

export const chartX = (t: number, m: number) => ((t - (m - LEAD)) / WINDOW) * SCREEN_W;
export const chartY = (p: number) => 232 - p * 212;

export type Level = {price: number; color: string; label: string; dashed?: boolean; draw: number; dim?: number};
export type Marker = {t: number; price: number; label?: string; color: string; kind: 'buy' | 'closed' | 'x' | 'check'; appear: number};

export const ChartLine: React.FC<{
  uid: string;
  m: number;
  tint: 'ray' | 'sam';
  on: number;
  levels?: Level[];
  markers?: Marker[];
  rtl?: boolean;
}> = ({uid, m, tint, on, levels = [], markers = [], rtl}) => {
  const pts: string[] = [];
  const from = Math.max(0, m - LEAD - 2);
  for (let t = from; t <= m + 0.001; t += 0.2) pts.push(`${chartX(t, m).toFixed(1)},${chartY(priceAt(t)).toFixed(1)}`);
  const tipX = chartX(m, m);
  const tipY = chartY(priceAt(m));
  const line = `M ${pts.join(' L ')}`;
  const area = `${line} L ${tipX.toFixed(1)},${SCREEN_H} L ${chartX(from, m).toFixed(1)},${SCREEN_H} Z`;
  const ray = tint === 'ray';
  const core = ray ? '#F4B2AE' : colors.goldTo;
  const glow = ray ? colors.red : colors.goldFrom;
  const font = rtl ? fonts.ar : fonts.en;
  return (
    <g opacity={on}>
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glow} stopOpacity={0.32} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </linearGradient>
        <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      {ray && <rect width={SCREEN_W} height={SCREEN_H} fill={colors.red} opacity={0.08} />}
      {/* time grid */}
      {Array.from({length: 7}, (_, i) => {
        const gx = chartX(Math.floor(m / 6) * 6 - i * 6, m);
        return <line key={i} x1={gx} x2={gx} y1={0} y2={SCREEN_H} stroke="#fff" strokeOpacity={0.05} />;
      })}
      <path d={area} fill={`url(#${uid}-area)`} />
      <path d={line} fill="none" stroke={glow} strokeWidth={9} opacity={0.6} filter={`url(#${uid}-blur)`} strokeLinejoin="round" />
      <path d={line} fill="none" stroke={core} strokeWidth={3.6} strokeLinejoin="round" strokeLinecap="round" />

      {levels.map((l, i) => {
        const y = chartY(l.price);
        const w = SCREEN_W * l.draw;
        const labelW = Math.max(66, l.label.length * (rtl ? 18 : 19) + 20);
        return (
          <g key={i} opacity={(l.dim ?? 1) * Math.min(1, l.draw * 3)}>
            <line x1={0} x2={w} y1={y} y2={y} stroke={l.color} strokeWidth={3.2} strokeDasharray={l.dashed ? '10 7' : undefined} />
            <rect x={SCREEN_W - labelW - 4} y={y - 19} width={labelW} height={38} rx={8} fill={l.color} opacity={0.92 * Math.min(1, l.draw * 2)} />
            <text
              x={SCREEN_W - labelW / 2 - 4}
              y={y + 9}
              textAnchor="middle"
              fontFamily={font}
              fontWeight={600}
              fontSize={rtl ? 27 : 26}
              fill={colors.ink}
              opacity={Math.min(1, l.draw * 2)}
            >
              {l.label}
            </text>
          </g>
        );
      })}

      {markers.map((mk, i) => {
        const x = chartX(mk.t, m);
        const y = chartY(mk.price);
        const s = mk.appear;
        if (s <= 0) return null;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * s})`} opacity={Math.min(1, s * 1.5)}>
            {mk.kind === 'buy' && (
              <>
                <path d="M 0 10 L 13 30 L -13 30 Z" fill={mk.color} />
                <rect x={-44} y={32} width={88} height={40} rx={9} fill={mk.color} />
                <text x={0} y={61} textAnchor="middle" fontFamily={fonts.en} fontWeight={600} fontSize={27} fill="#fff">
                  {mk.label}
                </text>
              </>
            )}
            {mk.kind === 'closed' && (
              <>
                <circle r={9} fill={mk.color} stroke="#fff" strokeWidth={2.5} />
                <rect x={-mk.label!.length * 9 - 14} y={-58} width={mk.label!.length * 18 + 28} height={40} rx={9} fill={mk.color} />
                <text x={0} y={-29} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={rtl ? 27 : 26} fill="#fff">
                  {mk.label}
                </text>
              </>
            )}
            {mk.kind === 'x' && (
              <>
                <circle r={12} fill={mk.color} />
                <path d="M -5 -5 L 5 5 M 5 -5 L -5 5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
              </>
            )}
            {mk.kind === 'check' && (
              <>
                <circle r={12} fill={mk.color} />
                <path d="M -6 0 L -2 5 L 6 -5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </g>
        );
      })}

      {/* live tip */}
      <circle cx={tipX} cy={tipY} r={12} fill={glow} opacity={0.35} />
      <circle cx={tipX} cy={tipY} r={5.5} fill="#fff" />
    </g>
  );
};
