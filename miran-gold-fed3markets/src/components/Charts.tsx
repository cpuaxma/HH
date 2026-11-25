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
  /** Frame at which a specular sheen starts sweeping the gold glyphs (repeats every 90 frames). */
  sheenFrom?: number;
}> = ({frame, from = 0, to, start, dur, decimals = 0, prefix = '', suffix = '', size, gold, color = C.text, style, sheenFrom}) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const v = from + (to - from) * p;
  const land = frame - (start + dur);
  const pop = land >= 0 && land < 2 ? 1.12 : land >= 2 && land < 4 ? 1.05 : 1;
  const s = fmt(v, decimals);
  const head = s.slice(0, -1);
  const last = s.slice(-1);
  const sp = sheenFrom !== undefined && frame >= sheenFrom ? ((frame - sheenFrom) % 90) / 90 : -1;
  const sx = sp < 0 ? -100 : -40 + sp * 300; // % across the number, sweeping in the first third of each cycle
  const sheen = `linear-gradient(105deg, rgba(255,250,230,0) ${sx - 18}%, rgba(255,250,230,0.95) ${sx}%, rgba(255,250,230,0) ${sx + 18}%)`;
  const fillStyle: React.CSSProperties = gold
    ? {backgroundImage: sp < 0 ? GOLD_GRADIENT : `${sheen}, ${GOLD_GRADIENT}`, backgroundSize: '100% 100%', backgroundAttachment: 'local', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
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

export type ChartPoint = {label: string; value: number; t: number}; // t = 0..1 along the x axis

/**
 * Line chart that draws itself: glowing head dot, area fill fades in after, point labels appear as
 * the head passes them. LTR time axis (standard for price charts, also in Arabic media).
 */
export const LineChartDraw: React.FC<{
  points: ChartPoint[];
  w: number;
  h: number;
  min: number;
  max: number;
  draw: number;
  area: number;
  color: string;
  refLine?: {value: number; label: string; opacity: number};
}> = ({points, w, h, min, max, draw, area, color, refLine}) => {
  const X = (t: number) => t * w;
  const Y = (v: number) => h - ((v - min) / (max - min)) * h;
  const pts = points.map((p) => [X(p.t), Y(p.value)] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  // head position along the polyline by x (draw is fraction of width)
  const hx = draw * w;
  let hy = pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (hx >= x0 && hx <= x1) hy = y0 + ((y1 - y0) * (hx - x0)) / Math.max(1e-6, x1 - x0);
  }
  if (hx >= pts[pts.length - 1][0]) hy = pts[pts.length - 1][1];
  const clip = `inset(-40px ${(1 - draw) * 100}% -40px -10px)`;
  return (
    <svg width={w} height={h + 50} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={hexA(C.slate, 0.15)} strokeWidth={1} />
      ))}
      {refLine && (
        <g opacity={refLine.opacity}>
          <line x1={0} x2={w} y1={Y(refLine.value)} y2={Y(refLine.value)} stroke={hexA(C.red, 0.8)} strokeWidth={2} strokeDasharray="8 8" />
          <text x={4} y={Y(refLine.value) - 10} fontFamily={FONT.en} fontWeight={600} fontSize={20} fill={C.red}>
            {refLine.label}
          </text>
        </g>
      )}
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#chartArea)" opacity={area} style={{clipPath: clip}} />
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" style={{clipPath: clip, filter: `drop-shadow(0 0 8px ${hexA(color, 0.6)})`}} />
      {pts.map(([x, y], i) => {
        const shown = interpolate(hx - x, [0, 30], [0, 1], clamp);
        return (
          <g key={i} opacity={shown}>
            <circle cx={x} cy={y} r={6} fill={C.bg0} stroke={color} strokeWidth={3} />
            <text x={x} y={h + 34} textAnchor="middle" fontFamily={FONT.en} fontWeight={600} fontSize={19} fill={C.slate}>
              {points[i].label}
            </text>
            <text x={x} y={y - 18} textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'} fontFamily={FONT.en} fontWeight={600} fontSize={19} fill={C.text} opacity={0.85}>
              ${fmt(points[i].value)}
            </text>
          </g>
        );
      })}
      {draw > 0.01 && draw < 0.999 && (
        <g>
          <circle cx={hx} cy={hy} r={16} fill={hexA(color, 0.25)} />
          <circle cx={hx} cy={hy} r={8} fill={C.text} style={{filter: `drop-shadow(0 0 10px ${color})`}} />
        </g>
      )}
    </svg>
  );
};

/** Split-flap cell: cycles through `sequence`, landing on the last item at `land`. Whole words flip (Arabic stays joined). */
export const SplitFlap: React.FC<{frame: number; sequence: string[]; start: number; land: number; w: number; h: number; font: string; size: number; color?: string}> = ({
  frame,
  sequence,
  start,
  land,
  w,
  h,
  font,
  size,
  color = C.text,
}) => {
  const n = sequence.length;
  const stepLen = (land - start) / (n - 1);
  const idx = frame >= land ? n - 1 : Math.max(0, Math.min(n - 1, Math.floor((frame - start) / stepLen + 1e-6)));
  const changeAt = start + idx * stepLen;
  const k = idx === 0 ? 1 : interpolate(frame - changeAt, [0, 5], [0, 1], clamp); // flap progress
  const prev = sequence[Math.max(0, idx - 1)];
  const cur = sequence[idx];
  const half = (text: string, top: boolean, extra: React.CSSProperties = {}) => (
    <div style={{position: 'absolute', left: 0, right: 0, height: h / 2, top: top ? 0 : h / 2, overflow: 'hidden', background: top ? '#101C3F' : '#0C1734', borderRadius: top ? '14px 14px 0 0' : '0 0 14px 14px', ...extra}}>
      <div style={{position: 'absolute', left: 0, right: 0, height: h, top: top ? 0 : -h / 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap'}}>
        {text}
      </div>
    </div>
  );
  const landed = frame >= land;
  const pop = landed && frame < land + 4 ? 1.06 : 1;
  return (
    <div style={{position: 'relative', width: w, height: h, perspective: 600, transform: `scale(${pop})`, boxShadow: `0 20px 40px rgba(0,0,0,0.5)${landed ? `, 0 0 30px ${hexA(C.gold2, 0.35)}` : ''}`, borderRadius: 14, border: `1px solid ${hexA(C.gold2, landed ? 0.5 : 0.2)}`}}>
      {half(cur, true)}
      {half(k < 0.5 ? prev : cur, false)}
      {k < 0.5 && half(prev, true, {transformOrigin: '50% 100%', transform: `rotateX(${-180 * k}deg)`, backfaceVisibility: 'hidden'})}
      {k >= 0.5 && k < 1 && half(cur, false, {transformOrigin: '50% 0%', transform: `rotateX(${180 * (1 - k)}deg)`})}
      <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 1, height: 2, background: 'rgba(0,0,0,0.6)'}} />
    </div>
  );
};
