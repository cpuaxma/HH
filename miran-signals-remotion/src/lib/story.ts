// Every animated value in the reel, as a pure function of a (possibly fractional) frame.
// The 3D renderer evaluates these at sub-frame times for motion blur, so nothing here
// may depend on state or on the order frames are rendered in.
import {FRESH_SIGNAL, LEFT, LEFT_NOTIFS, LEFT_TRADES, MARKET, NEWS, RIGHT, RIGHT_NOTIFS, SIGNAL, TIMING} from '../data';
import {clamp01, easeInOut, easeOut, hash, keyframes, ramp, smootherstep} from './ease';

export type V3 = [number, number, number];

// ─── Phones ──────────────────────────────────────────────────────────────────

export const PHONE = {
  /** Outer size in world units (≈ metres × 10). */
  width: 0.76,
  height: 1.62,
  depth: 0.078,
  cornerRadius: 0.118,
  /** Screen inset from the outer edge (the black glass border). */
  bezel: 0.017,
};
/** Screen size (inside the bezel). */
export const SCREEN = {
  width: PHONE.width - 2 * PHONE.bezel - 0.024,
  height: PHONE.height - 2 * PHONE.bezel - 0.024,
};

export type Side = 'left' | 'right';

export const BASE = {
  left: {pos: [-0.5, 1.08, 0] as V3, yaw: 0.12},
  right: {pos: [0.5, 1.08, 0] as V3, yaw: -0.12},
  tilt: -0.05,
};

export type PhonePose = {pos: V3; rot: V3; scale: number};

/** How far the phones lean back (0–1) for the overhead shot. */
export const lean = (t: number) => ramp(t, TIMING.leanFrom, TIMING.leanIn, easeInOut) * (1 - ramp(t, TIMING.leanOut, TIMING.leanBack, easeInOut));
/** Lean angle in radians at full lean. */
export const LEAN_MAX = 0.78;

/** Bob (gentle float), per phone. */
export const bob = (side: Side, t: number) =>
  side === 'left' ? 0.011 * Math.sin((2 * Math.PI * t) / 170 + 0.4) : 0.009 * Math.sin((2 * Math.PI * t) / 200 + 1.1);

// Left phone: a buzz on every bad notification, and a hard jolt when the news candle hits.
const BUZZ_AT: {at: number; k: number}[] = [
  ...LEFT_NOTIFS.filter((n) => n.kind !== 'copy').map((n) => ({at: n.at, k: n.kind === 'call' ? 1.4 : 1})),
  {at: NEWS.at, k: 1.8},
];

const buzz = (t: number) => {
  let x = 0;
  let r = 0;
  for (const {at, k} of BUZZ_AT) {
    const d = t - at;
    if (d < 0 || d > 30) continue;
    const env = k * Math.exp(-d / 7.5) * smootherstep(d / 1.5);
    x += env * Math.sin((2 * Math.PI * d) / 3.6);
    r += env * Math.sin((2 * Math.PI * d) / 4.4 + 1.3);
  }
  return {x: Math.max(-2, Math.min(2, x)), r: Math.max(-2, Math.min(2, r))};
};

/** The buzz is damped while the camera is close on the left screen (keeps the text crisp). */
const buzzScale = (t: number) => 1 - 0.94 * ramp(t, 168, 192, easeInOut) * (1 - ramp(t, 236, 258, easeInOut));

/** Heartbeat shape (0→1→0) every `period` frames after `from`. */
export const syncPulse = (t: number) => {
  if (t < TIMING.syncPulseFrom) return 0;
  const k = ((t - TIMING.syncPulseFrom) % TIMING.syncPulsePeriod) / TIMING.syncPulsePeriod;
  return Math.exp(-k * 7) * smootherstep(k * 14);
};

/** 0→1 progress through the left phone's 360° flip, with a speed ramp (slow, whip, hard stop). */
export const flipProgress = (t: number) => {
  const p = clamp01((t - TIMING.flipStart) / (TIMING.flipEnd - TIMING.flipStart));
  return p < 0.5 ? 0.5 * Math.pow(2 * p, 2.6) : 1 - 0.5 * Math.pow(2 * (1 - p), 1.7);
};

/** True once the left phone shows Miran Gold (switches while its back faces the camera). */
export const leftIsMiran = (t: number) => t >= (TIMING.flipStart + TIMING.flipEnd) / 2;

export const leftPose = (t: number): PhonePose => {
  const [x, y, z] = BASE.left.pos;
  const k = buzzScale(t);
  const raw = buzz(t);
  const b = {x: raw.x * k, r: raw.r * k};
  const wind = -0.16 * Math.sin(Math.PI * ramp(t, TIMING.flipStart - 16, TIMING.flipStart + 4, easeInOut));
  const p = flipProgress(t);
  const spin = 2 * Math.PI * p;
  const hop = 0.3 * Math.sin(Math.PI * clamp01((t - TIMING.flipStart + 4) / (TIMING.flipEnd - TIMING.flipStart + 4)));
  const since = t - TIMING.flipEnd;
  const settle = since > 0 ? Math.exp(-since / 9) * Math.sin(since / 2.4) : 0;
  const pulse = syncPulse(t);
  return {
    pos: [x + 0.006 * b.x, y + bob('left', t) + hop + 0.012 * settle, z],
    rot: [BASE.tilt - LEAN_MAX * lean(t) + 0.05 * settle, BASE.left.yaw + spin + wind + 0.004 * b.r, 0.012 * b.r - 0.015 * settle],
    scale: 1 + 0.018 * pulse,
  };
};

export const rightPose = (t: number): PhonePose => {
  const [x, y, z] = BASE.right.pos;
  const pulse = syncPulse(t);
  return {
    pos: [x, y + bob('right', t), z],
    rot: [BASE.tilt - LEAN_MAX * lean(t), BASE.right.yaw, 0],
    scale: 1 + 0.018 * pulse,
  };
};

export const poseOf = (side: Side) => (side === 'left' ? leftPose : rightPose);

// ─── The market ──────────────────────────────────────────────────────────────

const priceCurve = keyframes(MARKET.price);

/** Smooth value noise in [-1, 1]. */
const vnoise = (seed: number, x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i * 1.37 + seed * 91.7);
  const b = hash((i + 1) * 1.37 + seed * 91.7);
  return (a + (b - a) * u) * 2 - 1;
};

/** The live gold price at frame t (the same on both phones). */
export const price = (t: number) => {
  // Bigger swings in the history before the reel, so the older candles have bodies and wicks.
  const amp = MARKET.tickNoise + 1.1 * (1 - smootherstep((t + 80) / 80));
  // Quiet the noise inside the news candle (the drop is all signal).
  const quiet = 1 - 0.8 * ramp(t, NEWS.at - 2, NEWS.at + 2) * (1 - ramp(t, NEWS.at + 14, NEWS.at + 20));
  const n = vnoise(3, t / 2.6) * 0.6 + vnoise(7, t / 7.5) * 0.4;
  return priceCurve(t) + amp * quiet * n;
};

export type Candle = {k: number; o: number; h: number; l: number; c: number; live: boolean};

/** Candle k as seen at frame t (the live candle is still forming). */
export const candleAt = (k: number, t: number): Candle => {
  const cf = MARKET.candleFrames;
  const s = k * cf;
  const e = Math.min(s + cf, t);
  const o = price(s);
  let h = o;
  let l = o;
  for (let f = s + 1; f < e; f += 1) {
    const p = price(f);
    if (p > h) h = p;
    if (p < l) l = p;
  }
  const c = price(e);
  h = Math.max(h, c);
  l = Math.min(l, c);
  return {k, o, h, l, c, live: t < s + cf};
};

/** Index of the candle forming at frame t. */
export const liveCandle = (t: number) => Math.floor(t / MARKET.candleFrames);

const rawRange = (t: number) => {
  const now = liveCandle(t);
  let lo = Infinity;
  let hi = -Infinity;
  for (let k = now - MARKET.visibleCandles; k <= now; k++) {
    const c = candleAt(k, t);
    lo = Math.min(lo, c.l);
    hi = Math.max(hi, c.h);
  }
  return [lo, hi];
};

/** The chart's price range at frame t, smoothed (box filter over the last frames) so it never jumps. */
export const chartRange = (t: number): [number, number] => {
  let lo = 0;
  let hi = 0;
  const N = 12;
  for (let i = 0; i < N; i++) {
    const [a, b] = rawRange(Math.floor(t) - i * 2);
    lo += a;
    hi += b;
  }
  lo /= N;
  hi /= N;
  const pad = Math.max(2.5, (hi - lo) * 0.14);
  return [lo - pad, hi + pad];
};

// ─── Accounts ────────────────────────────────────────────────────────────────

/** Balance changes land as quick counts (14 frames) rather than smooth drifts. */
const stepped = (pts: [number, number][], dur = 14) => (t: number) => {
  let v = pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [f, val] = pts[i];
    const prev = pts[i - 1][1];
    v = prev + (val - prev) * ramp(t, f, f + dur, easeOut);
    if (t < f + dur) break;
  }
  return v;
};
const leftBalanceStep = stepped(LEFT.balance);
const rightBalanceStep = stepped(RIGHT.balance);

/** Left account balance (realised). */
export const leftBalance = (t: number) => leftBalanceStep(t);

/** The big copied trade (8 lots, no SL) while it is open. */
const T4 = LEFT_TRADES[3];

/** Left floating P&L ($). */
export const leftFloating = (t: number) => {
  if (leftIsMiran(t)) {
    const a = LEFT.afterFlip;
    if (t < a.openedAt) return 0;
    return (price(t) - a.entry) * a.lots * 100 * ramp(t, a.openedAt, a.openedAt + 6);
  }
  // T1 before it is closed (2 lots copied before the reel).
  if (t < 70) return (price(t) - 4006.1) * 200;
  if (t >= 150 && t < 224) return (price(t) - 4004.2) * 100;
  if (t >= 262 && t < 292) return (4004.5 - price(t)) * 30;
  if (t >= T4.openedAt && t < NEWS.at) return (price(t) - T4.entry) * T4.lots * 100;
  // The news candle: equity collapses (shown as a fast count), then the margin call closes it.
  if (t >= NEWS.at && t < T4.closedAt) {
    const pre = (price(NEWS.at) - T4.entry) * T4.lots * 100;
    return pre + (T4.pnl - pre) * ramp(t, NEWS.at, NEWS.at + 12, easeOut);
  }
  return 0;
};

/** Left equity: balance + floating. */
export const leftEquity = (t: number) => {
  if (t >= NEWS.at && t < T4.closedAt) return leftBalance(NEWS.at) + leftFloating(t);
  return leftBalance(t) + leftFloating(t);
};

/** Left margin level (%) while the big trade is open. */
export const leftMarginLevel = (t: number) => {
  if (t < T4.openedAt || t >= T4.closedAt) return null;
  const margin = (T4.lots * 100 * T4.entry) / 500;
  const lvl = (leftEquity(t) / margin) * 100;
  // Displayed value bottoms out at the "Margin level 112%" warning before the call.
  return Math.max(LEFT.marginAtNews, lvl);
};

export const rightBalance = (t: number) => rightBalanceStep(t);

/** Right floating P&L: the Miran signal (half after TP1), then the fresh signal. */
export const rightFloating = (t: number) => {
  if (t >= SIGNAL.filledAt && t < SIGNAL.tp1At) return (price(t) - SIGNAL.entry) * SIGNAL.lots * 100;
  if (t >= SIGNAL.tp1At && t < SIGNAL.beClosedAt) return Math.max(0, (price(t) - SIGNAL.entry) * (SIGNAL.lots / 2) * 100);
  if (t >= FRESH_SIGNAL.at + 10 && t < FRESH_SIGNAL.tp1At) return (price(t) - FRESH_SIGNAL.entry) * FRESH_SIGNAL.lots * 100;
  if (t >= FRESH_SIGNAL.tp1At && t < FRESH_SIGNAL.tp2At) return Math.max(0, (price(t) - FRESH_SIGNAL.entry) * (FRESH_SIGNAL.lots / 2) * 100);
  return 0;
};

/** Account equity history for the sparkline: sampled balance+floating from frame a to t. */
export const equitySeries = (side: Side, t: number, n = 48): number[] => {
  const out: number[] = [];
  const a = -120;
  for (let i = 0; i < n; i++) {
    const f = a + ((t - a) * i) / (n - 1);
    out.push(side === 'left' ? (f < 0 ? 10000 + 60 * Math.sin(f / 40) : leftEquity(f)) : f < 0 ? 10000 - 40 * Math.sin(f / 50) : rightBalance(f) + rightFloating(f));
  }
  return out;
};

// ─── Light and glow ──────────────────────────────────────────────────────────

/** Flash on each loss / warning on the left (0–1), bigger at the news. */
export const leftLossFlash = (t: number) => {
  let f = 0;
  for (const {at, k} of BUZZ_AT) {
    const d = t - at;
    if (d >= 0 && d < 50) f = Math.max(f, Math.min(1, k * 0.7) * Math.exp(-d / 11));
  }
  return f;
};

/** 0 = red (trading blind), 1 = gold (switched to Miran Gold, after the flip lands). */
export const leftWarmth = (t: number) => ramp(t, TIMING.flipEnd - 6, TIMING.flipEnd + 30, easeOut);

/** Glow strength of the left pool. */
export const leftGlow = (t: number) => {
  const w = leftWarmth(t);
  const red = 0.62 + 0.75 * leftLossFlash(t) + 0.25 * ramp(t, NEWS.at, NEWS.at + 10) * (1 - ramp(t, 600, 760));
  return (1 - w) * red + w * (0.9 + 0.5 * syncPulse(t));
};

/** Flash on each good right-phone notification. */
const rightFlash = (t: number) => {
  let f = 0;
  for (const n of RIGHT_NOTIFS) {
    const d = t - n.at;
    if (d >= 0 && d < 40) f = Math.max(f, Math.exp(-d / 10));
  }
  return f;
};

export const rightGlow = (t: number) => 0.9 + 0.25 * rightFlash(t) + 0.5 * syncPulse(t);

/** The impact frame(s) when the left phone lands. */
export const impact = (t: number) => {
  const d = t - TIMING.impactAt;
  if (d < 0 || d >= TIMING.impactFrames) return 0;
  return 1 - d / TIMING.impactFrames;
};

/** The news hit (0–1, fast decay): drives the camera jolt and the floor flash. */
export const newsHit = (t: number) => {
  const d = t - NEWS.at;
  if (d < 0 || d > 60) return 0;
  return Math.exp(-d / 10) * smootherstep(d / 1.5);
};
