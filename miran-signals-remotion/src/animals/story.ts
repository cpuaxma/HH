// Every animated value in the animals reel, as a pure function of a (possibly fractional)
// frame. The renderer evaluates these at sub-frame times for motion blur, so nothing here
// depends on state or on the order frames are rendered in.
import {clamp01, easeInOut, easeOut, hash, lerp, ramp, smootherstep, springAt} from '../lib/ease';
import type {PhonePose, V3} from '../lib/story';
import {CHART, COLORS, T} from './data';

const ss = smootherstep;
/** 0 → 1 → 0: up over `up` frames from `at`, held, down over `down`. */
const bump = (t: number, at: number, up: number, hold: number, down: number) => ss((t - at) / up) * (1 - ss((t - at - up - hold) / down));
/** A quick strike: rises fast, settles slowly (0 → 1 → 0). */
const strike = (t: number, at: number, rise = 8, fall = 40) => {
  const d = t - at;
  if (d <= 0) return 0;
  return ss(d / rise) * Math.exp(-Math.max(0, d - rise) / (fall / 3));
};

// ─── Beats ───────────────────────────────────────────────────────────────────

export type Beat = 'hook' | 'bull' | 'bear' | 'whale' | 'hawk' | 'dove' | 'phone' | 'end';
export const BEATS: {id: Beat; at: number}[] = [
  {id: 'hook', at: -Infinity},
  {id: 'bull', at: T.bullAt},
  {id: 'bear', at: T.bearAt},
  {id: 'whale', at: T.whaleAt},
  {id: 'hawk', at: T.hawkAt},
  {id: 'dove', at: T.doveAt},
  {id: 'phone', at: T.phoneAt + 16},
  {id: 'end', at: T.endCardStart},
];
export const beatAt = (t: number): Beat => {
  let b: Beat = 'hook';
  for (const x of BEATS) if (t >= x.at) b = x.id;
  return b;
};

/** Floor rings: where something comes up through the floor, how bright, and their colour. */
export type Ring = {x: number; z: number; r: number; strength: number; color: string};

// ─── The phone (the Miran Gold news alert) ───────────────────────────────────

export const PHONE_BASE = {pos: [0, 1.1, 0.1] as V3, yaw: -0.06, tilt: -0.04};

export const phonePose = (t: number): PhonePose => {
  const up = ramp(t, T.phoneAt, T.phoneAt + 64, easeOut);
  const e = ramp(t, T.endCardStart - 30, T.endCardStart + 40, easeInOut);
  const bobv = 0.008 * Math.sin((2 * Math.PI * t) / 200 + 0.6);
  const lift = bump(t, T.alertAt, 12, 20, 40);
  const [x, y, z] = PHONE_BASE.pos;
  return {
    pos: [x, y - 2.0 * (1 - up) + bobv + 0.025 * lift + 0.04 * e, z + 0.06 * lift - 0.6 * e],
    rot: [PHONE_BASE.tilt - 0.02 * lift + 0.04 * e, PHONE_BASE.yaw + 0.5 * (1 - up) + 0.25 * e, 0],
    scale: 1,
  };
};
export const phoneVisible = (t: number) => t > T.phoneAt - 2;

// ─── Floor rings and light ───────────────────────────────────────────────────

export const rings = (t: number): Ring[] => {
  const out: Ring[] = [];
  const ring = (at: number, x: number, z: number, r: number, color: string, len = 70) => {
    const d = t - at;
    if (d < -12 || d > len + 30) return;
    out.push({x, z, r, color, strength: ss((d + 12) / 16) * (1 - ss((d - len) / 30))});
  };
  // The phone comes up through the floor.
  ring(T.phoneAt - 6, 0, 0.1, 0.5, COLORS.tint.phone, 66);
  return out;
};

/** The pool of light under the stage and its colour per beat. */
export const stageGlow = (t: number) => {
  const b = beatAt(t);
  const flash =
    T.bullThrust.reduce((a, at) => a + strike(t, at, 6, 40), 0) +
    strike(t, T.bearSwipe + 9, 4, 40) +
    strike(t, T.whaleCandle + 20, 10, 60) +
    strike(t, T.hawkStrike, 5, 40) +
    strike(t, T.doveLift + 20, 10, 60) +
    strike(t, T.alertAt, 6, 50);
  return {beat: b, strength: 0.7 + 0.5 * Math.min(1.2, flash)};
};

// ─── The chart ───────────────────────────────────────────────────────────────

/**
 * The chart's own clock (in chart frames): the reel's clock, except that it falls behind by
 * CHART.whale.slow frames while the whale's candle forms, and catches up once the whale is
 * back under the floor.
 */
const SLOW = {a: T.whaleCandle - 22, b: T.whaleCandle + 62, c: T.whaleDive - 20, d: T.hawkAt + 10};
export const chartClock = (t: number) =>
  t - CHART.whale.slow * (ss((t - SLOW.a) / (SLOW.b - SLOW.a)) - ss((t - SLOW.c) / (SLOW.d - SLOW.c)));

/** The whale's candle (in chart frames): the first full candle after its cue. */
export const WHALE_CANDLE = (() => {
  const k = Math.ceil(chartClock(T.whaleCandle) / CHART.candle);
  return {start: k * CHART.candle, end: (k + 1) * CHART.candle};
})();

const PRICE_KEYS: [number, number][] = (() => {
  const w = WHALE_CANDLE;
  const pts = CHART.price.filter(([f]) => f < w.start - 30 || f > w.end + 60);
  pts.push([w.start - 30, CHART.whale.from - 0.005], [w.start + 1, CHART.whale.from], [w.end - 1, CHART.whale.to], [w.end + 60, CHART.whale.to - 0.012]);
  return pts.sort((a, b) => a[0] - b[0]);
})();

/** Monotone-ish smooth curve through the keyframes (Catmull-Rom in value, clamped at the ends). */
const curve = (x: number) => {
  const k = PRICE_KEYS;
  if (x <= k[0][0]) return k[0][1];
  if (x >= k[k.length - 1][0]) return k[k.length - 1][1];
  let i = 0;
  while (x > k[i + 1][0]) i++;
  const [x1, y1] = k[i];
  const [x2, y2] = k[i + 1];
  const u = (x - x1) / (x2 - x1);
  // Smooth within each segment (no overshoot), so a step between keys reads as one clean move.
  return lerp(y1, y2, u * u * (3 - 2 * u));
};

/** Value noise over chart frames: continuous, deterministic. */
const noise = (x: number) => {
  const a = Math.floor(x / 5);
  const f = x / 5 - a;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(a * 1.37) - 0.5, hash((a + 1) * 1.37) - 0.5, u) * 2;
};

/** The price (0 = bottom of the chart, 1 = top) at chart frame x. */
export const priceAt = (x: number) => {
  const w = WHALE_CANDLE;
  // No noise inside the whale's candle: one clean, decisive move.
  const quiet = 1 - clamp01(1 - Math.abs(x - (w.start + w.end) / 2) / 24);
  return curve(x) + CHART.noise * noise(x) * quiet;
};

export type Candle = {i: number; open: number; close: number; high: number; low: number; forming: boolean; whale: boolean};

/** The candles on the chart at reel frame t: the last one is still forming. */
export const candlesAt = (t: number): {candles: Candle[]; now: number} => {
  const now = chartClock(t);
  const C = CHART.candle;
  const last = Math.floor(now / C);
  const out: Candle[] = [];
  for (let i = last - CHART.candles - 1; i <= last; i++) {
    const a = i * C;
    const b = Math.min((i + 1) * C, now);
    const open = priceAt(a);
    const close = priceAt(b);
    let high = Math.max(open, close);
    let low = Math.min(open, close);
    for (let s = 1; s < 8; s++) {
      const v = priceAt(lerp(a, b, s / 8));
      high = Math.max(high, v);
      low = Math.min(low, v);
    }
    // Wicks: a little beyond the body.
    high += 0.008 + 0.01 * hash(i * 2.1);
    low -= 0.008 + 0.01 * hash(i * 3.7);
    out.push({i, open, close, high, low, forming: i === last, whale: a === WHALE_CANDLE.start});
  }
  return {candles: out, now};
};

/** Reel frames where the chart's clock reaches chart frame x (for sound cues). */
export const reelFrameOfChart = (x: number) => {
  let lo = -1000;
  let hi = T.durationInFrames + 200;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (chartClock(m) < x) lo = m;
    else hi = m;
  }
  return hi;
};

/** Which beat's tint the chart's glow follows, blended over 30 frames at each change. */
export const tintMix = (t: number): {a: string; b: string; k: number} => {
  let prev = 'hook';
  let cur = 'hook';
  let at = -Infinity;
  for (const x of BEATS) {
    if (x.id === 'end') continue;
    if (t >= x.at) {
      prev = cur;
      cur = x.id;
      at = x.at;
    }
  }
  const tint = COLORS.tint as Record<string, string>;
  return {a: tint[prev], b: tint[cur], k: at === -Infinity ? 1 : ss((t - at) / 30)};
};

/** A pulse of light on the newest candle at each animal's moment. */
export const chartPulse = (t: number) =>
  Math.min(
    1,
    T.bullThrust.reduce((a, at) => a + strike(t, at + 4, 6, 50), 0) +
      strike(t, T.bearSwipe + 9, 4, 50) +
      strike(t, reelFrameOfChart(WHALE_CANDLE.end - 2), 6, 70) +
      strike(t, T.hawkStrike + 2, 5, 50) +
      strike(t, T.doveLift + 10, 8, 60),
  );

/** How strongly the whale's candle is highlighted (from when it starts forming). */
export const whaleHighlight = (t: number) => {
  const s = reelFrameOfChart(WHALE_CANDLE.start);
  return ramp(t, s - 4, s + 20, easeOut) * (1 - ramp(t, T.hawkAt + 40, T.hawkAt + 120, easeInOut));
};

/** Spring helper re-exported for overlays. */
export {springAt};
