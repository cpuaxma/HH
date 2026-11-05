// Every animated value in the reel, as a pure function of a (possibly fractional) frame.
// The 3D renderer evaluates these at sub-frame times for motion blur, so nothing here
// may depend on state or on the order frames are rendered in.
import {LEFT, MARKET, NEWS, RIGHT, SIGNAL, TIMING, UPDATE} from '../data';
import {clamp01, easeInOut, easeOut, hash, keyframes, ramp, smootherstep} from './ease';

export type V3 = [number, number, number];

// ─── Phones ──────────────────────────────────────────────────────────────────

/** iPhone-style proportions (71.5 × 149.6 × 8.25 mm), in world units. */
export const PHONE = {
  width: 0.76,
  height: 1.59,
  depth: 0.086,
  cornerRadius: 0.122,
  /** From the outer edge of the frame to the lit screen (frame + thin black border). */
  border: 0.026,
};
/** Screen size (inside the border). */
export const SCREEN = {
  width: PHONE.width - 2 * PHONE.border,
  height: PHONE.height - 2 * PHONE.border,
};

export type Side = 'left' | 'right';

export const BASE = {
  left: {pos: [-0.46, 1.06, 0] as V3, yaw: 0.1},
  right: {pos: [0.46, 1.06, 0] as V3, yaw: -0.1},
  tilt: -0.04,
};

export type PhonePose = {pos: V3; rot: V3; scale: number};

/** Bob (gentle float), per phone. */
export const bob = (side: Side, t: number) =>
  side === 'left' ? 0.009 * Math.sin((2 * Math.PI * t) / 180 + 0.4) : 0.008 * Math.sin((2 * Math.PI * t) / 210 + 1.1);

// Left phone: a buzz when the trade opens, a hard jolt when the news candle hits, and the margin call.
const BUZZ_AT: {at: number; k: number}[] = [
  {at: NEWS.at, k: 1.8},
  {at: LEFT.marginCallAt, k: 1.3},
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

/** Intro reveal (0 → 1 over the first second): the phones rise and turn into place. */
export const intro = (t: number) => {
  const x = clamp01((t + 6) / 62);
  return 1 - Math.pow(1 - x, 4);
};

/** A smooth bump: rises over `up` frames, holds, eases back over `down` frames (C2 everywhere). */
const bump = (t: number, at: number, up: number, hold: number, down: number) =>
  smootherstep((t - at) / up) * (1 - smootherstep((t - at - up - hold) / down));

/** Left after the margin call: it sinks and tips forward, until it winds up for the flip. */
const defeat = (t: number) => smootherstep((t - LEFT.marginCallAt) / 24) * (1 - smootherstep((t - (TIMING.flipStart - 40)) / 36));

/** Right on its good moments: a small lift towards the camera (profit taken, protected). */
const lift = (t: number) => Math.max(bump(t, UPDATE.closedAt, 14, 10, 40), bump(t, NEWS.at + 8, 16, 120, 60));

/**
 * Where the viewer should look: 1 = in focus, lower = dimmed. During the warning the left
 * dims so the Miran update on the right is the only thing to read.
 */
export const focus = (side: Side, t: number) => {
  if (side === 'left') return 1 - 0.5 * smootherstep((t - (UPDATE.at - 14)) / 20) * (1 - smootherstep((t - (UPDATE.closedAt + 30)) / 24));
  return 1;
};

export const leftPose = (t: number): PhonePose => {
  const [x, y, z] = BASE.left.pos;
  const b = buzz(t);
  const wind = -0.16 * Math.sin(Math.PI * ramp(t, TIMING.flipStart - 16, TIMING.flipStart + 4, easeInOut));
  const p = flipProgress(t);
  const spin = 2 * Math.PI * p;
  const hop = 0.3 * Math.sin(Math.PI * clamp01((t - TIMING.flipStart + 4) / (TIMING.flipEnd - TIMING.flipStart + 4)));
  const since = t - TIMING.flipEnd;
  const settle = since > 0 ? Math.exp(-since / 9) * Math.sin(since / 2.4) : 0;
  const pulse = syncPulse(t);
  const i = intro(t);
  const d = defeat(t);
  return {
    pos: [x + 0.006 * b.x - 0.12 * (1 - i), y + bob('left', t) + hop + 0.012 * settle - 0.34 * (1 - i) - 0.035 * d, z - 0.3 * (1 - i)],
    rot: [BASE.tilt + 0.05 * settle + 0.07 * d, BASE.left.yaw + spin + wind + 0.004 * b.r + 0.7 * (1 - i), 0.012 * b.r - 0.015 * settle + 0.02 * d],
    scale: 1 + 0.018 * pulse,
  };
};

export const rightPose = (t: number): PhonePose => {
  const [x, y, z] = BASE.right.pos;
  const pulse = syncPulse(t);
  const i = intro(Math.max(-6, t - 5));
  const l = lift(t);
  return {
    pos: [x + 0.12 * (1 - i), y + bob('right', t) - 0.34 * (1 - i) + 0.03 * l, z - 0.3 * (1 - i) + 0.06 * l],
    rot: [BASE.tilt - 0.03 * l, BASE.right.yaw - 0.7 * (1 - i), 0],
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
  // Quiet the noise inside the news candle (the drop is all signal).
  const quiet = 1 - 0.8 * ramp(t, NEWS.at - 2, NEWS.at + 2) * (1 - ramp(t, NEWS.at + 14, NEWS.at + 20));
  const n = vnoise(3, t / 3.2) * 0.55 + vnoise(7, t / 9) * 0.45;
  return priceCurve(t) + MARKET.tickNoise * quiet * n;
};

const rawRange = (t: number): [number, number] => {
  let lo = Infinity;
  let hi = -Infinity;
  for (let f = t - MARKET.chartSpan; f <= t; f += 6) {
    const p = price(f);
    lo = Math.min(lo, p);
    hi = Math.max(hi, p);
  }
  return [lo, hi];
};

/** The chart's price range at frame t, smoothed (box filter over the last frames) so it never jumps. */
export const chartRange = (t: number): [number, number] => {
  let lo = 0;
  let hi = 0;
  const N = 10;
  for (let i = 0; i < N; i++) {
    const [a, b] = rawRange(Math.floor(t) - i * 2);
    lo += a;
    hi += b;
  }
  lo /= N;
  hi /= N;
  const pad = Math.max(2.0, (hi - lo) * 0.18);
  return [lo - pad, hi + pad];
};

// ─── Accounts ────────────────────────────────────────────────────────────────

/** A value that counts from a to b over `dur` frames from `at` (eased). */
const count = (t: number, at: number, a: number, b: number, dur = 18) => a + (b - a) * ramp(t, at, at + dur, easeOut);

/** Left balance (realised): $10,000 until the margin call closes the trade. */
export const leftBalance = (t: number) => count(t, LEFT.marginCallAt, LEFT.startBalance, LEFT.finalBalance, 22);

/** Left open P&L ($) while the trade is open (it crashes in a fast count after the news). */
export const leftOpenPnl = (t: number) => {
  if (t < LEFT.openedAt || t >= LEFT.marginCallAt) return null;
  const pnl = (p: number) => (p - LEFT.entry) * LEFT.lots * 100;
  return pnl(price(t));
};

export const leftTradeOpen = (t: number) => t >= LEFT.openedAt && t < LEFT.marginCallAt;

/**
 * What each account is worth right now: the ONE number the viewer follows (on the screen and
 * on the scoreboard). It follows the smooth price curve (no tick noise, so the digits don't
 * flicker): the left climbs to about $12,100 while gold rises, then the news candle crashes it
 * to $5,200; the right gains $140 and keeps it.
 */
export const leftValue = (t: number) => {
  const live = (f: number) => LEFT.startBalance + (priceCurve(f) - LEFT.entry) * LEFT.lots * 100;
  if (t < LEFT.openedAt) return LEFT.startBalance;
  if (t < LEFT.marginCallAt) return live(t);
  return count(t, LEFT.marginCallAt, live(LEFT.marginCallAt), LEFT.finalBalance, 22);
};

export const rightValue = (t: number) => {
  const live = (f: number) => RIGHT.startBalance + (priceCurve(f) - SIGNAL.entry) * SIGNAL.lots * 100;
  if (t < SIGNAL.filledAt) return RIGHT.startBalance;
  if (t < UPDATE.closedAt) return live(t);
  return count(t, UPDATE.closedAt, live(UPDATE.closedAt), RIGHT.finalBalance, 18);
};

/** Right balance: $10,000, then +$140 when the profit is taken before the news. */
export const rightBalance = (t: number) => count(t, UPDATE.closedAt, RIGHT.startBalance, RIGHT.finalBalance, 18);

export const rightTradeOpen = (t: number) => t >= SIGNAL.filledAt && t < UPDATE.closedAt;

/** Right open P&L ($) while the signal trade is open. */
export const rightOpenPnl = (t: number) => (rightTradeOpen(t) ? (price(t) - SIGNAL.entry) * SIGNAL.lots * 100 : null);

// ─── Light and glow ──────────────────────────────────────────────────────────

/** How red the left phone has gone (0 = calm, 1 = margin call). */
export const leftDanger = (t: number) => ramp(t, NEWS.at, NEWS.at + 14, easeOut) * (1 - ramp(t, TIMING.flipEnd - 6, TIMING.flipEnd + 24, easeOut));

/** Flash on the news and the margin call (0–1). */
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

/** Glow strength of the left pool: soft and neutral, then a strong red after the news. */
export const leftGlow = (t: number) => {
  const w = leftWarmth(t);
  const red = 0.35 + 0.9 * leftDanger(t) + 0.7 * leftLossFlash(t);
  return (1 - w) * red + w * (0.9 + 0.5 * syncPulse(t));
};

/** Flash on each good event on the right phone. */
const rightFlash = (t: number) => {
  let f = 0;
  for (const at of [SIGNAL.at, UPDATE.at, UPDATE.closedAt, NEWS.at + 12]) {
    const d = t - at;
    if (d >= 0 && d < 40) f = Math.max(f, Math.exp(-d / 10));
  }
  return f;
};

export const rightGlow = (t: number) => 0.9 + 0.3 * rightFlash(t) + 0.5 * syncPulse(t);

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
