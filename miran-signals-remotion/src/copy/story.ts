// Every animated value of the copy trading reel, as a pure function of a (possibly
// fractional) frame. The renderer evaluates these at sub-frame times for motion blur, so
// nothing here may depend on state or on the order frames are rendered in.
import {clamp01, easeInOut, easeOut, hash, keyframes, ramp, smootherstep, springAt} from '../lib/ease';
import {PhonePose, V3} from '../lib/story';
import {FINAL_BALANCE, MARKET, PLACEHOLDERS, T} from './data';

// ─── Pages on the phone ──────────────────────────────────────────────────────

export type PageId = 'hook' | 'connect' | 'settings' | 'auto' | 'dash' | 'control';
export const PAGES: {id: PageId; at: number}[] = [
  {id: 'hook', at: -1000},
  {id: 'connect', at: T.connectPage},
  {id: 'settings', at: T.settingsPage},
  {id: 'auto', at: T.autoPage},
  {id: 'dash', at: T.dashPage},
  {id: 'control', at: T.controlAt},
];

/**
 * The pages visible at frame t, each with its transition progress: k = 0 entering, 1 settled,
 * and `out` 0 → 1 as it leaves. During a transition two pages are drawn.
 */
export const pagesAt = (t: number) => {
  const out: {id: PageId; enter: number; leave: number}[] = [];
  const h = T.pageTr / 2;
  PAGES.forEach((p, i) => {
    const next = PAGES[i + 1];
    const enter = i === 0 ? 1 : ramp(t, p.at - h, p.at + h, easeInOut);
    const leave = next ? ramp(t, next.at - h, next.at + h, easeInOut) : 0;
    if (enter > 0 && leave < 1) out.push({id: p.id, enter, leave});
  });
  return out;
};

// ─── Copy-trading state ──────────────────────────────────────────────────────

/** 0 → 1: the automatic copy switch (on at autoOnAt, off at the pause, on again at the resume). */
export const autoOn = (t: number) => {
  const on1 = ramp(t, T.autoOnAt, T.autoOnAt + 10, easeOut);
  const off = ramp(t, T.pauseTapAt, T.pauseTapAt + 10, easeOut);
  const on2 = ramp(t, T.resumeTapAt, T.resumeTapAt + 10, easeOut);
  return on1 * (1 - off) + off * on2;
};

export type CopyStatus = 'notLinked' | 'linked' | 'on' | 'paused';
export const statusAt = (t: number): CopyStatus => {
  if (t < T.linkedAt) return 'notLinked';
  if (t < T.autoOnAt) return 'linked';
  if (t >= T.pauseTapAt && t < T.resumeTapAt) return 'paused';
  return 'on';
};
/** The frame the current status began (for its transition). */
export const statusSince = (t: number) => {
  const marks = [T.linkedAt, T.autoOnAt, T.pauseTapAt, T.resumeTapAt].filter((m) => m <= t);
  return marks.length ? marks[marks.length - 1] : -1000;
};

// ─── Sliders and switches in the settings ────────────────────────────────────

const snap = (v: number, step: number) => Math.round(v / step) * step;

/** The copy ratio while it is dragged from `from` to `to` (snapped to its step). */
export const ratioValue = (t: number) => {
  const r = PLACEHOLDERS.ratio;
  const k = ramp(t, T.ratioGrab + 6, T.ratioRelease - 6, easeInOut);
  return {raw: r.from + (r.to - r.from) * k, shown: snap(r.from + (r.to - r.from) * k, r.step)};
};
/** The total loss limit ($) while it is dragged from `from` to `to` (snapped to its step). */
export const lossValue = (t: number) => {
  const r = PLACEHOLDERS.totalLoss;
  const k = ramp(t, T.lossGrab + 6, T.lossRelease - 6, easeInOut);
  return {raw: r.from + (r.to - r.from) * k, shown: snap(r.from + (r.to - r.from) * k, r.step)};
};

/** Formatting of the setting values (Western digits, like the rest of the app). */
export const fmtRatio = (v: number) => `×${(Math.round(v * 100) / 100).toFixed(2).replace(/0$/, '')}`;
export const fmtPct = (v: number) => `${(Math.round(v * 10) / 10).toString()}%`;
export const fmtUsd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

// ─── The market ──────────────────────────────────────────────────────────────

const priceCurve = keyframes(MARKET.price);

const vnoise = (seed: number, x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i * 1.37 + seed * 91.7);
  const b = hash((i + 1) * 1.37 + seed * 91.7);
  return (a + (b - a) * u) * 2 - 1;
};

export const price = (t: number) => {
  const quiet = 1 - 0.8 * ramp(t, T.newsAt - 2, T.newsAt + 2) * (1 - ramp(t, T.newsAt + 20, T.newsAt + 28));
  const n = vnoise(5, t / 3.2) * 0.55 + vnoise(11, t / 9) * 0.45;
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

/** The chart's price range, smoothed over the last frames so it never jumps. */
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

// ─── The account ─────────────────────────────────────────────────────────────

export const tradeOpen = (t: number) => t >= T.copiedAt && t < T.closedAt;

/** What the account is worth (follows the smooth curve while the trade is open; no flicker). */
export const accountValue = (t: number) => {
  const P = PLACEHOLDERS;
  const live = (f: number) => P.balance + (priceCurve(f) - P.signal.entry) * P.dollarsPerPoint;
  if (t < T.copiedAt) return P.balance;
  if (t < T.closedAt) return live(t);
  const from = live(T.closedAt);
  return from + (FINAL_BALANCE - from) * ramp(t, T.closedAt, T.closedAt + 18, easeOut);
};

export const openPnl = (t: number) => (tradeOpen(t) ? (price(t) - PLACEHOLDERS.signal.entry) * PLACEHOLDERS.dollarsPerPoint : null);

// ─── The phone ───────────────────────────────────────────────────────────────

/** iPhone-style proportions; the phone stands alone in the middle of the studio. */
export const BASE = {pos: [0, 1.06, 0] as V3, yaw: -0.05, tilt: -0.04};

const bump = (t: number, at: number, up: number, hold: number, down: number) =>
  smootherstep((t - at) / up) * (1 - smootherstep((t - at - up - hold) / down));

/** Every tap on the screen: the phone gives a tiny nod back. */
export const TAPS = [T.connectTapAt, T.ratioGrab, T.lossGrab, T.saveTapAt, T.autoOnAt, T.pauseTapAt, T.resumeTapAt];

const nod = (t: number) => {
  let n = 0;
  for (const at of TAPS) {
    const d = t - at;
    if (d < -2 || d > 40) continue;
    n += springAt(d + 2, {freq: 2.4, damping: 0.45}) * Math.exp(-Math.max(0, d) / 9);
  }
  return n;
};

/** Intro: the phone rises and turns into place over the first second. */
export const intro = (t: number) => {
  const x = clamp01((t + 6) / 66);
  return 1 - Math.pow(1 - x, 4);
};

/** A gentle turn as each new page arrives (alternating sides), so the 3D reads. */
const pageSway = (t: number) => {
  let s = 0;
  PAGES.slice(1).forEach((p, i) => {
    s += (i % 2 ? 1 : -1) * 0.12 * Math.sin(Math.PI * clamp01((t - (p.at - 24)) / 60)) * smootherstep((t - (p.at - 24)) / 20);
  });
  return s;
};

/** The good moments: a small lift towards the camera (auto copy on, copied, closed by plan). */
const lift = (t: number) => Math.max(bump(t, T.autoOnAt, 14, 20, 40), bump(t, T.copiedAt, 12, 10, 36), bump(t, T.closedAt, 12, 10, 36));

/** The release: a short buzz in the hand. */
const buzz = (t: number) => {
  const d = t - T.newsAt;
  if (d < 0 || d > 30) return 0;
  return Math.exp(-d / 7) * smootherstep(d / 1.5) * Math.sin((2 * Math.PI * d) / 3.8);
};

/** End: the phone backs away as the end card covers it. */
const exit = (t: number) => ramp(t, T.endCardStart - 30, T.endCardStart + 40, easeInOut);

export const phonePose = (t: number): PhonePose => {
  const [x, y, z] = BASE.pos;
  const i = intro(t);
  const l = lift(t);
  const e = exit(t);
  const b = buzz(t);
  const bob = 0.008 * Math.sin((2 * Math.PI * t) / 200 + 0.6);
  return {
    pos: [x + 0.004 * b, y + bob - 0.36 * (1 - i) + 0.025 * l + 0.04 * e, z - 0.35 * (1 - i) + 0.07 * l - 0.6 * e],
    rot: [BASE.tilt - 0.018 * nod(t) - 0.025 * l + 0.04 * e, BASE.yaw + 0.85 * (1 - i) + pageSway(t) + 0.25 * e, 0.006 * b],
    scale: 1,
  };
};

// ─── Light ───────────────────────────────────────────────────────────────────

/** A gold flash on each good event. */
const flash = (t: number) => {
  let f = 0;
  for (const at of [T.linkedAt, T.saveTapAt, T.autoOnAt, T.copiedAt, T.closedAt, T.resumeTapAt]) {
    const d = t - at;
    if (d >= 0 && d < 50) f = Math.max(f, Math.exp(-d / 12));
  }
  return f;
};

/** Strength of the gold pool under the phone: warmer once automatic copy is on. */
export const glow = (t: number) => 0.75 + 0.3 * autoOn(t) + 0.45 * flash(t) + 0.25 * ramp(t, T.alertAt - 4, T.alertAt + 8) * (1 - ramp(t, T.closedAt, T.closedAt + 20));

/** 0 → 1: how warm the studio is (cool navy until auto copy is on, then gold; dims while paused). */
export const warmth = (t: number) => 0.35 + 0.65 * autoOn(t);
