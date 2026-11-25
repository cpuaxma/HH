import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT, LANES, LaneKey} from '../brand';
import {clamp, hexA, mixHex, noise} from '../motion';

const VOL: Record<LaneKey, number> = {nasdaq: 1, spx: 0.55, gold: 0.7};

/** Deterministic sparkline points (0..1 in y, 0 = top) for a lane. */
export const sparkPoints = (lane: LaneKey, n = 26) =>
  Array.from({length: n}, (_, i) => {
    const seed = lane === 'nasdaq' ? 3 : lane === 'spx' ? 11 : 23;
    const trend = lane === 'gold' ? 0.2 : -0.15;
    return 0.5 + trend * (i / n - 0.5) + noise(seed, i * 0.55) * 0.28 * VOL[lane];
  });

export const Sparkline: React.FC<{lane: LaneKey; w: number; h: number; draw: number; color: string; drop?: number; t: number}> = ({lane, w, h, draw, color, drop = 0, t}) => {
  const pts = sparkPoints(lane).map((v, i, a) => {
    const x = (i / (a.length - 1)) * w;
    const tail = Math.max(0, (i - a.length * 0.6) / (a.length * 0.4));
    const live = noise(i + 40, t / 25) * 0.04 * VOL[lane];
    return [x, (v + live + drop * tail * tail * 0.5) * h] as const;
  });
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const idx = Math.min(pts.length - 1, Math.floor(draw * (pts.length - 1)));
  const [hx, hy] = pts[idx];
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={hexA(color, 0.12 * draw)} style={{clipPath: `inset(-20px ${(1 - draw) * 100}% -20px 0)`}} />
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{strokeDasharray: `${draw} 2`}} />
      {draw > 0.02 && <circle cx={hx} cy={hy} r={5} fill={color} style={{filter: `drop-shadow(0 0 6px ${color})`}} />}
    </svg>
  );
};

/** Reaction arrow badge. dir -1 = down (red), +1 = up (green); `flip` rotates down→up. */
export const ArrowBadge: React.FC<{size: number; flip: number; double?: boolean; opacity?: number; neutral?: boolean}> = ({size, flip, double, opacity = 1, neutral}) => {
  const color = neutral ? C.slate : mixHex(C.red, C.green, flip);
  const rot = 180 * (1 - flip); // glyph drawn pointing up; 180° = down
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${hexA(color, 0.7)}`,
        background: hexA(color, 0.12),
        boxShadow: `0 0 18px ${hexA(color, 0.35)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 40" style={{transform: `rotate(${rot}deg)`}}>
        {double ? (
          <g fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 20 L20 10 L30 20" />
            <path d="M10 31 L20 21 L30 31" />
          </g>
        ) : (
          <g fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 33 L20 8" />
            <path d="M10 18 L20 8 L30 18" />
          </g>
        )}
      </svg>
    </div>
  );
};

export type RailProps = {
  lane: LaneKey;
  w: number;
  h: number;
  t: number; // frame, for live micro-motion
  draw?: number; // sparkline draw 0..1
  arrow?: {flip: number; double?: boolean; opacity: number; neutral?: boolean};
  value?: string;
  valueOpacity?: number;
  hit?: number; // 0..1 impact glow (border flash)
  dim?: number; // 0..1 darkening
  drop?: number; // sparkline tail drop
  label?: boolean;
};

/** One horizontal glass rail: ticker (right, RTL) · sparkline · reaction arrow (left). */
export const LaneRail: React.FC<RailProps> = ({lane, w, h, t, draw = 1, arrow, value, valueOpacity = 1, hit = 0, dim = 0, drop = 0, label = true}) => {
  const L = LANES[lane];
  const accent = L.color;
  return (
    <div
      dir="rtl"
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 24,
        background: `linear-gradient(90deg, ${hexA('#0B1838', 0.78)}, ${hexA('#0E1D44', 0.7)})`,
        border: `1px solid ${hexA(lane === 'gold' ? C.gold2 : accent, 0.28 + hit * 0.6)}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), 0 24px 60px rgba(0,0,0,0.45), 0 0 ${40 * hit}px ${hexA(accent, 0.6 * hit)}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        gap: 26,
        filter: dim > 0.01 ? `brightness(${1 - dim * 0.55}) saturate(${1 - dim * 0.5})` : undefined,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* lane colour edge on the leading (right) side */}
      <div style={{position: 'absolute', right: 0, top: 18, bottom: 18, width: 4, borderRadius: 2, background: L.gradient ?? accent}} />
      <div style={{width: 230, flexShrink: 0, textAlign: 'right'}}>
        <bdi
          dir="ltr"
          style={{
            display: 'block',
            fontFamily: FONT.en,
            fontWeight: FONT.enBold,
            fontSize: 32,
            letterSpacing: 0.5,
            lineHeight: 1.1,
            ...(L.gradient ? {backgroundImage: L.gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {color: accent}),
          }}
        >
          {L.ticker}
        </bdi>
        {label && (
          <div style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 20, color: C.slate, marginTop: 4, whiteSpace: 'nowrap'}}>
            {L.ar.split(/(\d+)/).map((s, i) => (/\d/.test(s) ? <bdi key={i}>{s}</bdi> : s))}
          </div>
        )}
      </div>
      <div style={{flex: 1, height: h * 0.5, direction: 'ltr', display: 'flex', alignItems: 'center'}}>
        <Sparkline lane={lane} w={w - 230 - 60 - 26 * 2 - (value ? 222 : 72)} h={h * 0.5} draw={draw} color={accent} drop={drop} t={t} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0}}>
        {value && (
          <bdi
            dir="ltr"
            style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 26, color: C.text, fontVariantNumeric: 'tabular-nums', opacity: valueOpacity, whiteSpace: 'nowrap'}}
          >
            {value}
          </bdi>
        )}
        {arrow && <ArrowBadge size={58} flip={arrow.flip} double={arrow.double} opacity={arrow.opacity} neutral={arrow.neutral} />}
      </div>
    </div>
  );
};

export const reactionShake = (frame: number, at: number, amp = 16) => {
  const k = interpolate(frame - at, [0, 2, 34], [0, 1, 0], clamp);
  return {x: noise(5, frame * 0.9) * amp * k, r: noise(9, frame * 0.8) * 0.8 * k, k};
};
