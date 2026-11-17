import React from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, GOLD, NUM, SPRING} from '../brand';
import type {Bar} from '../edition';
import {ArText, Bdi, goldText} from './ArabicWordReveal';
import {fmt, lin} from './motion';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Smooth path (Catmull-Rom → cubic Bézier) through points. */
export const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const t = 0.18;
    d += ` C ${p1[0] + (p2[0] - p0[0]) * t} ${p1[1] + (p2[1] - p0[1]) * t}, ${p2[0] - (p3[0] - p1[0]) * t} ${p2[1] - (p3[1] - p1[1]) * t}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/**
 * Line chart that draws itself with a glowing head dot; the area fill fades in after.
 * `progress` 0→1 is the draw; `area` 0→1 the fill.
 */
export const LineChartDraw: React.FC<{
  values: number[];
  min: number;
  max: number;
  width: number;
  height: number;
  color: string;
  progress: number;
  area: number;
  refLine?: {value: number; label: string; anchor?: 'start' | 'end'};
  id: string;
  strokeWidth?: number;
}> = ({values, min, max, width, height, color, progress, area, refLine, id, strokeWidth = 6}) => {
  const f = useCurrentFrame();
  const pts: [number, number][] = values.map((v, i) => [(i / (values.length - 1)) * width, height - ((v - min) / (max - min)) * height]);
  const d = smoothPath(pts);
  const len = getLength(d);
  const p = Math.max(0.0001, Math.min(1, progress));
  const head = getPointAtLength(d, len * p) ?? {x: 0, y: 0};
  const areaD = `${d} L ${width} ${height} L 0 ${height} Z`;
  const refY = refLine ? height - ((refLine.value - min) / (max - min)) * height : 0;
  const pulse = 0.6 + 0.4 * Math.sin(f / 6);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.38} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect x={0} y={-50} width={head.x} height={height + 100} />
        </clipPath>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {refLine ? (
        <g opacity={lin(f, 0, 1) * 0.9}>
          <line x1={0} x2={width} y1={refY} y2={refY} stroke={C.gold1} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="10 10" strokeDashoffset={-f * 0.6} />
          <text x={refLine.anchor === 'start' ? 0 : width} y={refY + 34} textAnchor={refLine.anchor ?? 'end'} fill={C.gold0} fontFamily={FONT.ar} fontWeight={700} fontSize={26} style={NUM}>
            {refLine.label}
          </text>
        </g>
      ) : null}
      <path d={areaD} fill={`url(#area-${id})`} opacity={area} clipPath={`url(#clip-${id})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
        filter={`url(#glow-${id})`}
      />
      {progress > 0.001 ? (
        <>
          <circle cx={head.x} cy={head.y} r={22 * pulse} fill={color} opacity={0.22} />
          <circle cx={head.x} cy={head.y} r={10} fill="#fff" stroke={color} strokeWidth={5} />
        </>
      ) : null}
    </svg>
  );
};

/** Number that counts from `from` to `to`; the final digit lands with a 2-frame scale pop. */
export const CountUp: React.FC<{
  from: number;
  to: number;
  start: number;
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
  gold?: boolean;
  sheenAt?: number;
}> = ({from, to, start, end, decimals = 0, prefix = '', suffix = '', style, gold, sheenAt}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [start, end], [0, 1], {...CLAMP, easing: EASE.move});
  const v = from + (to - from) * t;
  const pop = interpolate(f, [end, end + 2, end + 6], [1, 1.1, 1], CLAMP);
  const sheen = sheenAt === undefined ? -1 : interpolate(f, [sheenAt, sheenAt + 36], [0, 1], CLAMP);
  return (
    <Bdi style={{display: 'inline-block', transform: `scale(${pop})`, ...(gold ? goldText(sheen >= 1 ? -1 : sheen) : {}), ...style}}>
      {prefix}
      {fmt(v, decimals)}
      {suffix}
    </Bdi>
  );
};

/**
 * Bars that rise with stagger and slight overshoot. A `null` value is the "?" bar:
 * dashed gold outline, glowing, with a pulsing "?".
 * Bars are laid out right to left (first bar on the right).
 */
export const BarChartQ: React.FC<{
  bars: Bar[];
  max: number;
  start: number;
  qAt: number;
  width: number;
  height: number;
  unit?: string;
  decimals?: number;
  barWidth?: number;
  colors?: string[];
}> = ({bars, max, start, qAt, width, height, unit = '', decimals = 1, barWidth = 92, colors}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const known = bars.filter((b) => b.value !== null).map((b) => b.value as number);
  const qH = Math.max(...known, max * 0.5) / max; // the "?" bar is as tall as the tallest known
  return (
    <div dir="rtl" style={{width, height, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end'}}>
      {bars.map((b, i) => {
        const isQ = b.value === null;
        const s = spring({frame: f - (isQ ? qAt : start + i * 10), fps, config: SPRING.bar});
        const h = (isQ ? qH : (b.value as number) / max) * (height - 92) * s;
        const glow = isQ ? 0.55 + 0.45 * Math.sin((f - qAt) / 7) : 0;
        const col = colors?.[i] ?? C.gold1;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: barWidth + 56}}>
            <div style={{height: 46, display: 'flex', alignItems: 'flex-end', whiteSpace: 'nowrap', fontFamily: FONT.ar, fontWeight: 700, fontSize: b.display ? 32 : 36, color: C.text, opacity: lin(f, (isQ ? qAt : start + i * 10) + 6, (isQ ? qAt : start + i * 10) + 16)}}>
              {isQ ? (
                <span style={{...goldText(), fontSize: 44, transform: `scale(${0.9 + glow * 0.15})`, display: 'inline-block'}}>?</span>
              ) : b.display ? (
                <ArText text={b.display} />
              ) : (
                <CountUp from={0} to={b.value as number} start={start + i * 10} end={start + i * 10 + 40} decimals={decimals} suffix={unit} />
              )}
            </div>
            <div
              style={{
                width: barWidth,
                height: Math.max(0, h),
                borderRadius: '14px 14px 4px 4px',
                background: isQ ? 'rgba(212,175,55,0.08)' : `linear-gradient(180deg, ${col} 0%, ${C.gold2} 100%)`,
                border: isQ ? `2px dashed rgba(247,222,140,${0.5 + glow * 0.5})` : 'none',
                boxShadow: isQ ? `0 0 ${20 + glow * 30}px rgba(212,175,55,${0.25 + glow * 0.3})` : '0 10px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)',
              }}
            />
            <div style={{fontFamily: FONT.ar, fontWeight: 500, fontSize: 23, color: isQ ? C.gold0 : C.label, whiteSpace: 'nowrap'}}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Semicircle gauge 0→max with a needle that swings in and settles; target marker. */
export const Gauge: React.FC<{value: number; max: number; target: number; start: number; size: number; targetLabel: string}> = ({
  value,
  max,
  target,
  start,
  size,
  targetLabel,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - start, fps, config: {damping: 9, stiffness: 90, mass: 1}});
  const settle = Math.sin(f / 22) * 0.6; // idle wobble, never static
  const v = value * s + (s > 0.95 ? settle * 0.02 : 0);
  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const ang = (x: number) => Math.PI + (x / max) * Math.PI; // left → right
  const pt = (x: number, rr: number) => [cx + Math.cos(ang(x)) * rr, cy + Math.sin(ang(x)) * rr];
  const arc = (a: number, b: number, rr: number) => {
    const [x1, y1] = pt(a, rr);
    const [x2, y2] = pt(b, rr);
    return `M ${x1} ${y1} A ${rr} ${rr} 0 0 1 ${x2} ${y2}`;
  };
  const [nx, ny] = pt(v, r - 26);
  const [tx, ty] = pt(target, r + 14);
  const [tx2, ty2] = pt(target, r - 22);
  const arcIn = lin(f, start - 20, start + 10);
  return (
    <svg width={size} height={size / 2 + 60} viewBox={`0 0 ${size} ${size / 2 + 60}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="gaugeG" x1="0" x2="1">
          <stop offset="0%" stopColor={C.green} />
          <stop offset="45%" stopColor={C.gold1} />
          <stop offset="100%" stopColor={C.red} />
        </linearGradient>
      </defs>
      <path d={arc(0, max, r)} stroke="rgba(138,147,173,0.18)" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={arc(0, max * Math.max(0.001, arcIn), r)} stroke="url(#gaugeG)" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.9} />
      <line x1={tx} y1={ty} x2={tx2} y2={ty2} stroke={C.text} strokeWidth={4} opacity={arcIn} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.gold0} strokeWidth={7} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(247,222,140,0.7))'}} />
      <circle cx={cx} cy={cy} r={14} fill={C.bg0} stroke={C.gold0} strokeWidth={5} />
    </svg>
  );
};

export {GOLD};
