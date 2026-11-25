// Data/mechanism pieces: ChapterNumeral, CountUp, RateGauge, ProbabilityBar.
import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT, GOLD_GRADIENT} from '../brand';
import {clamp, fmt, hexA} from '../motion';

/** Giant outlined "01/02/03": the stroke draws on, then the fill comes up. */
export const ChapterNumeral: React.FC<{text: string; color: string; gradient?: boolean; draw: number; fill: number; size?: number; id: string}> = ({
  text,
  color,
  gradient,
  draw,
  fill,
  size = 520,
  id,
}) => {
  const L = 2600;
  const stroke = gradient ? `url(#numGrad-${id})` : color;
  return (
    <svg width={size * 1.25} height={size * 0.95} viewBox={`0 0 ${size * 1.25} ${size * 0.95}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`numGrad-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.gold1} />
          <stop offset="52%" stopColor={C.gold2} />
          <stop offset="100%" stopColor={C.gold3} />
        </linearGradient>
        <linearGradient id={`numFill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradient ? C.gold1 : color} stopOpacity={0.55} />
          <stop offset="100%" stopColor={gradient ? C.gold3 : color} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y={size * 0.78}
        textAnchor="middle"
        fontFamily={FONT.en}
        fontWeight={700}
        fontSize={size}
        fill={`url(#numFill-${id})`}
        fillOpacity={fill}
        stroke={stroke}
        strokeWidth={4}
        strokeDasharray={L}
        strokeDashoffset={L * (1 - draw)}
        style={{filter: `drop-shadow(0 0 ${18 * draw}px ${hexA(gradient ? C.gold2 : color, 0.45)})`}}
      >
        {text}
      </text>
    </svg>
  );
};

/** Count-up number with tabular figures; the last digit "lands" with a 2-frame scale pop. */
export const CountUp: React.FC<{
  frame: number;
  from?: number;
  to: number;
  start: number;
  dur: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size: number;
  gold?: boolean;
  color?: string;
  style?: React.CSSProperties;
}> = ({frame, from = 0, to, start, dur, decimals = 0, prefix = '', suffix = '', size, gold, color = C.text, style}) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const v = from + (to - from) * p;
  const land = frame - (start + dur);
  const pop = land >= 0 && land < 2 ? 1.12 : land >= 2 && land < 4 ? 1.05 : 1;
  const s = fmt(v, decimals);
  const head = s.slice(0, -1);
  const last = s.slice(-1);
  const fillStyle: React.CSSProperties = gold
    ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
    : {color};
  return (
    <bdi dir="ltr" style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: size, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...style}}>
      <span style={fillStyle}>
        {prefix}
        {head}
      </span>
      <span style={{display: 'inline-block', transform: `scale(${pop})`, transformOrigin: '50% 80%', ...fillStyle}}>{last}</span>
      <span style={fillStyle}>{suffix}</span>
    </bdi>
  );
};

/** Semicircle rate gauge 0–6%, gold band on the target range, spring-driven needle. */
export const RateGauge: React.FC<{needle: number; band: number; r?: number; low: number; high: number}> = ({needle, band, r = 250, low, high}) => {
  const max = 6;
  const cx = r + 40;
  const cy = r + 30;
  const ang = (v: number) => Math.PI * (1 - v / max); // 0% at left, 6% at right
  const pt = (v: number, rr: number) => [cx + Math.cos(ang(v)) * rr, cy - Math.sin(ang(v)) * rr];
  const arc = (a: number, b: number, rr: number) => {
    const [x0, y0] = pt(a, rr);
    const [x1, y1] = pt(b, rr);
    return `M${x0} ${y0} A${rr} ${rr} 0 0 1 ${x1} ${y1}`;
  };
  const ticks = Array.from({length: 13}, (_, i) => i * 0.5);
  const [nx, ny] = pt(needle, r - 46);
  return (
    <svg width={cx * 2} height={cy + 50} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="gaugeGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.gold1} />
          <stop offset="100%" stopColor={C.gold3} />
        </linearGradient>
      </defs>
      <path d={arc(0, max, r)} fill="none" stroke={hexA(C.slate, 0.22)} strokeWidth={26} strokeLinecap="round" />
      <path d={arc(0, Math.max(0.001, needle), r)} fill="none" stroke={hexA(C.gold2, 0.22)} strokeWidth={26} strokeLinecap="round" />
      <path d={arc(low, low + (high - low) * band + 0.0001, r)} fill="none" stroke="url(#gaugeGold)" strokeWidth={34} style={{filter: `drop-shadow(0 0 12px ${hexA(C.gold2, 0.7)})`}} />
      {ticks.map((v) => {
        const [x0, y0] = pt(v, r - 30);
        const [x1, y1] = pt(v, r - (v % 1 === 0 ? 50 : 40));
        return <line key={v} x1={x0} y1={y0} x2={x1} y2={y1} stroke={hexA(C.slate, v % 1 === 0 ? 0.8 : 0.4)} strokeWidth={v % 1 === 0 ? 3 : 2} />;
      })}
      {[0, 2, 4, 6].map((v) => {
        const [x, y] = pt(v, r + 44);
        return (
          <text key={v} x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.en} fontWeight={600} fontSize={22} fill={C.slate}>
            {v}%
          </text>
        );
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.text} strokeWidth={6} strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${hexA(C.gold1, 0.6)})`}} />
      <circle cx={cx} cy={cy} r={16} fill={C.gold2} stroke={C.text} strokeWidth={3} />
    </svg>
  );
};

/** Horizontal probability bar (fills right → left, RTL), with a marker at the threshold. */
export const ProbabilityBar: React.FC<{fill: number; w: number; threshold: number; tickFlash?: number}> = ({fill, w, threshold, tickFlash = 0}) => (
  <div style={{position: 'relative', width: w, height: 44, borderRadius: 22, background: hexA(C.slate, 0.18), overflow: 'visible'}}>
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: `${fill * 100}%`,
        borderRadius: 22,
        backgroundImage: `linear-gradient(270deg, ${C.gold1}, ${C.gold2} 60%, ${C.gold3})`,
        boxShadow: `0 0 ${18 + tickFlash * 20}px ${hexA(C.gold2, 0.55)}`,
      }}
    />
    {Array.from({length: 9}, (_, i) => (
      <div key={i} style={{position: 'absolute', top: 8, bottom: 8, right: `${(i + 1) * 10}%`, width: 2, background: hexA(C.bg0, 0.35)}} />
    ))}
    <div style={{position: 'absolute', right: `${threshold}%`, top: -14, bottom: -14, width: 3, borderRadius: 2, background: C.text, opacity: 0.85}} />
  </div>
);
