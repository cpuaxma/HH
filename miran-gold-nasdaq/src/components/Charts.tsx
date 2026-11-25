import React from 'react';
import {interpolate, random} from 'remotion';
import {COLORS, LAYOUT, VIDEO} from '../config';
import {clamp, EASE, pulse, rgba} from '../lib/motion';

type Pt = {x: number; y: number};

/** Polyline revealed up to a fractional index (smooth drawing without path measuring). */
const partial = (pts: Pt[], upTo: number): Pt[] => {
  const n = Math.max(0, Math.min(pts.length - 1, upTo));
  const whole = Math.floor(n);
  const out = pts.slice(0, whole + 1);
  const frac = n - whole;
  if (frac > 0 && whole + 1 < pts.length) {
    const a = pts[whole];
    const b = pts[whole + 1];
    out.push({x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac});
  }
  return out;
};

const toPath = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

/* ------------------------------------------------------------------------------------------ */
/* Scene 1: faint red candlesticks + a close line that dips, behind the hook headline         */
/* ------------------------------------------------------------------------------------------ */

const CANDLES = (() => {
  const n = 24;
  const out: {o: number; c: number; h: number; l: number}[] = [];
  let price = 100;
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    // drifts sideways, then the dip accelerates over the last third
    const trend = t < 0.55 ? -0.4 : t < 0.8 ? -2.6 : -4.4;
    const noise = (random(`hc-${k}`) - 0.5) * 3.2;
    const o = price;
    const c = price + trend + noise + (k === 16 ? 2.4 : 0);
    const h = Math.max(o, c) + random(`hh-${k}`) * 1.6;
    const l = Math.min(o, c) - random(`hl-${k}`) * 1.6;
    out.push({o, c, h, l});
    price = c;
  }
  return out;
})();

export const HookCandles: React.FC<{frame: number}> = ({frame}) => {
  const top = 700;
  const bottom = 1460;
  const left = 70;
  const right = VIDEO.width - 70;
  const vals = CANDLES.flatMap((c) => [c.h, c.l]);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const yOf = (v: number) => top + ((max - v) / (max - min)) * (bottom - top);
  const step = (right - left) / CANDLES.length;
  const shown = interpolate(frame, [0, 66], [0, CANDLES.length], {...clamp, easing: EASE.inOut});
  const closes: Pt[] = CANDLES.map((c, k) => ({x: left + step * (k + 0.5), y: yOf(c.c)}));
  const line = partial(closes, shown - 1);
  const tip = line[line.length - 1];
  const fade = interpolate(frame, [0, 10], [0, 1], clamp);

  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, opacity: 0.3 * fade}}>
      {CANDLES.map((c, k) => {
        const a = interpolate(shown - k, [0, 1], [0, 1], clamp);
        if (a <= 0) return null;
        const x = left + step * (k + 0.5);
        const up = c.c >= c.o;
        const color = up ? COLORS.gray : COLORS.red;
        const y1 = yOf(Math.max(c.o, c.c));
        const y2 = yOf(Math.min(c.o, c.c));
        return (
          <g key={k} opacity={a} transform={`translate(0 ${(1 - a) * 14})`}>
            <line x1={x} x2={x} y1={yOf(c.h)} y2={yOf(c.l)} stroke={color} strokeWidth={3} />
            <rect x={x - step * 0.28} y={y1} width={step * 0.56} height={Math.max(4, y2 - y1)} rx={3} fill={color} />
          </g>
        );
      })}
      {line.length > 1 && (
        <>
          <path d={toPath(line)} fill="none" stroke={COLORS.red} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y} r={10} fill={COLORS.red} />
          <circle cx={tip.x} cy={tip.y} r={26} fill={rgba(COLORS.red, 0.25)} />
        </>
      )}
    </svg>
  );
};

/* ------------------------------------------------------------------------------------------ */
/* Scene 4: index line chart that climbs, then falls                                          */
/* ------------------------------------------------------------------------------------------ */

const SERIES = (() => {
  const n = 46;
  const peak = 30;
  return Array.from({length: n}, (_, k) => {
    const noise = (random(`ix-${k}`) - 0.5) * 0.07;
    if (k <= peak) return 0.3 + (k / peak) * 0.48 + noise; // steady climb
    const t = (k - peak) / (n - 1 - peak);
    return 0.78 - Math.pow(t, 0.8) * 0.68 + noise * 0.8; // the fall
  });
})();
export const CHART_PEAK = 30;

export const IndexChart: React.FC<{
  frame: number;
  appearAt: number;
  dropFrom: number;
  dropDur: number;
}> = ({frame, appearAt, dropFrom, dropDur}) => {
  const L = LAYOUT.domino;
  const w = L.chartRight - L.chartLeft;
  const h = L.chartHeight;
  const pts: Pt[] = SERIES.map((v, k) => ({x: (k / (SERIES.length - 1)) * w, y: h - v * h}));

  const climb = interpolate(frame, [appearAt, appearAt + 34], [0, CHART_PEAK], {...clamp, easing: EASE.inOut});
  const fall = interpolate(frame, [dropFrom, dropFrom + dropDur], [0, SERIES.length - 1 - CHART_PEAK], {
    ...clamp,
    easing: EASE.inOut,
  });
  const upTo = climb + fall;
  const appear = interpolate(frame, [appearAt - 6, appearAt + 10], [0, 1], clamp);

  const rise = partial(pts, Math.min(upTo, CHART_PEAK));
  const all = partial(pts, upTo);
  const drop = upTo > CHART_PEAK ? all.slice(CHART_PEAK) : [];
  const tip = all[all.length - 1];
  const falling = upTo > CHART_PEAK;
  const tipColor = falling ? COLORS.red : COLORS.gold;
  const area = all.length > 1 ? `${toPath(all)} L${tip.x} ${h} L0 ${h} Z` : '';
  const beat = pulse(frame, 24);

  return (
    <svg
      width={w}
      height={h + 40}
      viewBox={`0 -20 ${w} ${h + 40}`}
      style={{position: 'absolute', left: L.chartLeft, top: L.chartTop, opacity: appear, overflow: 'visible'}}
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={falling ? COLORS.red : COLORS.gold} stopOpacity={0.28} />
          <stop offset="100%" stopColor={falling ? COLORS.red : COLORS.gold} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={rgba(COLORS.white, g === 1 ? 0.18 : 0.06)} strokeWidth={2} />
      ))}
      {area && <path d={area} fill="url(#areaFill)" />}
      {rise.length > 1 && (
        <path d={toPath(rise)} fill="none" stroke={COLORS.gold} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      )}
      {drop.length > 1 && (
        <path
          d={toPath(drop)}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={7}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{filter: `drop-shadow(0 0 10px ${rgba(COLORS.red, 0.6)})`}}
        />
      )}
      {all.length > 1 && (
        <>
          <circle cx={tip.x} cy={tip.y} r={18 + beat * 10} fill={rgba(tipColor, 0.22)} />
          <circle cx={tip.x} cy={tip.y} r={10} fill={tipColor} />
        </>
      )}
    </svg>
  );
};
