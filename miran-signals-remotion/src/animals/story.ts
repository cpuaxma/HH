// Every animated value in the animals reel, as a pure function of a (possibly fractional)
// frame. The renderer evaluates these at sub-frame times for motion blur, so nothing here
// depends on state or on the order frames are rendered in.
import {clamp01, easeIn, easeInOut, easeOut, hash, lerp, ramp, smootherstep, springAt} from '../lib/ease';
import type {PhonePose, V3} from '../lib/story';
import {CHART, COLORS, T} from './data';
import type {FigurePose} from './Figure';

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

// ─── Rise from / sink into the floor (through a ring of light) ───────────────

/** 0 = fully under the floor, 1 = standing on it. */
const rise = (t: number, upAt: number, upLen: number, downAt = Infinity, downLen = 50) =>
  ramp(t, upAt, upAt + upLen, easeOut) * (1 - ramp(t, downAt, downAt + downLen, easeIn));

/** Floor rings: where an animal comes up or goes down, how bright, and their colour. */
export type Ring = {x: number; z: number; r: number; strength: number; color: string};

// ─── The bull ────────────────────────────────────────────────────────────────

const BULL_SINK = T.bearAt - 24;
export const bullPose = (t: number): FigurePose => {
  // Hook: on the left facing the bear; then it moves to the centre and turns to the camera.
  const move = ramp(t, T.bullAt - 10, T.bullAt + 60, easeInOut);
  const push = T.faceoffPush.reduce((a, at) => a + bump(t, at, 12, 10, 34), 0);
  const thrust = T.bullThrust.reduce((a, at) => a + strike(t, at, 9, 54), 0);
  const thrustBody = T.bullThrust.reduce((a, at) => a + strike(t, at - 2, 10, 46), 0);
  const sink = ramp(t, BULL_SINK, BULL_SINK + 50, easeIn);
  const breathe = Math.sin((2 * Math.PI * t) / 150);
  const x = lerp(-0.98 + 0.07 * push, -0.12, move);
  const yaw = lerp(0, -0.62, move) + 0.05 * Math.sin(t / 90) * move;
  // The head: lowered in the face-off, tossed up on each thrust.
  const headPitch = lerp(-0.22 - 0.1 * push, -0.1, move) + 0.62 * thrust + 0.012 * breathe;
  return {
    pos: [x, -1.5 * sink + 0.006 * breathe, 0.05 * move],
    rot: [yaw, 0, 0.05 * thrustBody - 0.02 * push],
    scale: lerp(0.9, 1, move),
    joints: {head: [0.03 * thrust, 0.08 * Math.sin(t / 70) * (1 - thrust), headPitch]},
    visible: t < BULL_SINK + 52,
  };
};

// ─── The bear ────────────────────────────────────────────────────────────────

/** In the hook the bear stands on the right; it drops through the floor as the bull takes the stage. */
const BEAR_HOOK_SINK = T.bullAt - 34;
const BEAR_UP = T.bearAt + 22;
const BEAR_SINK = T.whaleAt - 26;
export const bearPose = (t: number): FigurePose => {
  const hook = t < T.bearAt;
  const breathe = Math.sin((2 * Math.PI * t) / 170 + 1);
  if (hook) {
    const push = T.faceoffPush.reduce((a, at) => a + bump(t, at + 6, 12, 10, 34), 0);
    const sink = ramp(t, BEAR_HOOK_SINK, BEAR_HOOK_SINK + 46, easeIn);
    const threat = ss((t - 20) / 60);
    return {
      pos: [0.78 - 0.07 * push, -2.0 * sink + 0.006 * breathe, 0],
      rot: [Math.PI, 0, 0.04 * push],
      scale: 0.9,
      joints: {
        head: [0, 0, 0.1 + 0.05 * push],
        armL: [0.55 * threat, 0, 2.45 * threat + 0.2 * push + 0.03 * breathe],
        armR: [-0.5 * threat, 0, 2.1 * threat + 0.15 * push],
      },
      visible: t < BEAR_HOOK_SINK + 48,
    };
  }
  const up = rise(t, BEAR_UP, 48, BEAR_SINK, 52);
  // The swipe: the near paw goes up (lean back), then comes down hard (lean in).
  const raise = ramp(t, T.bearRaise, T.bearRaise + 30, easeInOut);
  const swipe = ramp(t, T.bearSwipe, T.bearSwipe + 11, easeIn);
  const settle = ramp(t, T.bearSwipe + 30, T.bearSwipe + 90, easeInOut);
  const hit = strike(t, T.bearSwipe + 9, 4, 40);
  const arm = 0.25 + 2.35 * raise - 2.95 * swipe + 0.55 * settle;
  return {
    pos: [0.02, -2.1 * (1 - up) + 0.006 * breathe, 0],
    rot: [-0.72 + 0.04 * Math.sin(t / 80), 0, -0.1 * raise + 0.2 * swipe - 0.1 * settle + 0.03 * hit],
    scale: 1,
    joints: {
      head: [0, 0.06 * Math.sin(t / 60), 0.16 * raise - 0.18 * swipe + 0.05 * settle],
      armL: [0.35 * raise - 0.2 * swipe, 0, arm],
      armR: [-0.15, 0, 0.3 + 0.2 * raise - 0.3 * swipe + 0.03 * breathe],
    },
    visible: t > BEAR_UP - 2 && t < BEAR_SINK + 54,
  };
};

// ─── The whale ───────────────────────────────────────────────────────────────

export const whalePose = (t: number): FigurePose => {
  const up = ramp(t, T.whaleSurface, T.whaleSurface + 70, easeOut);
  const down = ramp(t, T.whaleDive, T.whaleDive + 56, easeIn);
  const bob = Math.sin((2 * Math.PI * (t - T.whaleSurface)) / 160);
  const flick = strike(t, T.whaleCandle + 40, 10, 60);
  return {
    pos: [lerp(-0.55, 0.05, up) + 0.5 * down, lerp(-1.25, 0.24, up) - 1.5 * down + 0.025 * bob * up, -0.15],
    rot: [-0.32 + 0.06 * Math.sin(t / 120), 0.05 * bob, lerp(0.55, 0.07, up) - 0.6 * down + 0.02 * bob],
    scale: 1,
    joints: {tail: [0, 0, 0.12 * bob - 0.55 * flick + 0.25 * down]},
    visible: t > T.whaleSurface - 2 && t < T.whaleDive + 58,
  };
};

// ─── The birds ───────────────────────────────────────────────────────────────

/**
 * Wing joints for a flap (phase in radians) of amplitude `amp`, plus a tuck (0 open → 1 swept
 * back for a dive). The left wing is +z: positive rotation about x lifts it.
 */
const wings = (phase: number, amp: number, tuck: number) => {
  const s = Math.sin(phase);
  const lag = Math.sin(phase - 0.9);
  const up = amp * (0.15 + s);
  const tip = amp * 0.5 * lag;
  // Tucked: the inner wing sweeps back and down, the tip folds in further.
  const sweep = 1.05 * tuck;
  return {
    wingL: [up * (1 - tuck) + 0.25 * tuck, -sweep, -0.05 * tuck] as V3,
    wingR: [-up * (1 - tuck) - 0.25 * tuck, sweep, -0.05 * tuck] as V3,
    tipL: [tip * (1 - tuck) - 0.2 * tuck, -0.9 * tuck, 0] as V3,
    tipR: [-tip * (1 - tuck) + 0.2 * tuck, 0.9 * tuck, 0] as V3,
  };
};

/** Integrated flap phase for a flap rate that changes over time (pure: closed form per segment). */
const flapPhase = (t: number, segs: [number, number][]) => {
  // segs: [from frame, flaps per second]; piecewise constant rate, phase is continuous.
  let ph = 0;
  for (let i = 0; i < segs.length; i++) {
    const [a, r] = segs[i];
    const b = i + 1 < segs.length ? segs[i + 1][0] : Infinity;
    if (t <= a) break;
    ph += ((Math.min(t, b) - a) / 60) * r * 2 * Math.PI;
  }
  return ph;
};

/** A path through [frame, x, y, z] keyframes with smooth (Catmull-Rom) interpolation. */
const path = (pts: [number, number, number, number][]) => (t: number): V3 => {
  if (t <= pts[0][0]) return [pts[0][1], pts[0][2], pts[0][3]];
  const n = pts.length;
  if (t >= pts[n - 1][0]) return [pts[n - 1][1], pts[n - 1][2], pts[n - 1][3]];
  let i = 0;
  while (t > pts[i + 1][0]) i++;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n - 1, i + 2)];
  const u = ss((t - p1[0]) / (p2[0] - p1[0])) * 0.35 + ((t - p1[0]) / (p2[0] - p1[0])) * 0.65;
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2]), cr(p0[3], p1[3], p2[3], p3[3])];
};

const HAWK_OUT = T.doveAt - 22;
/** Phone tie-in: the hawk hovers on the left, the dove on the right, either side of the phone. */
const FLANK = {hawk: [-0.56, 2.08, -0.4] as V3, dove: [0.56, 2.08, -0.4] as V3, at: T.phoneAt + 30};

const hawkPath = path([
  [T.hawkDive - 10, 1.9, 3.6, -0.6],
  [T.hawkDive + 22, 0.9, 1.7, -0.1],
  [T.hawkStrike, 0.12, 0.5, 0.2],
  [T.hawkStrike + 40, -0.05, 1.0, 0.05],
  [T.hawkStrike + 90, 0, 1.08, 0],
  [HAWK_OUT, 0.02, 1.12, 0],
  [HAWK_OUT + 50, -1.6, 2.9, -0.8],
  [FLANK.at - 60, -2.6, 2.6, -0.9],
  [FLANK.at + 10, FLANK.hawk[0], FLANK.hawk[1], FLANK.hawk[2]],
  [T.endCardStart + 80, FLANK.hawk[0] - 0.05, FLANK.hawk[1] + 0.05, FLANK.hawk[2]],
]);

export const hawkPose = (t: number): FigurePose => {
  const p = hawkPath(t);
  const dive = 1 - ramp(t, T.hawkStrike - 12, T.hawkStrike + 6, easeOut);
  const flare = bump(t, T.hawkStrike - 6, 10, 8, 30);
  const out = ramp(t, HAWK_OUT, HAWK_OUT + 24, easeInOut);
  const flank = ramp(t, FLANK.at - 40, FLANK.at + 20, easeInOut);
  const phase = flapPhase(t, [
    [T.hawkStrike - 4, 1.6],
    [T.hawkStrike + 50, 1.1],
    [HAWK_OUT - 10, 2.0],
    [FLANK.at, 1.2],
  ]);
  const flying = t > T.hawkStrike - 6 ? 1 : 0;
  const amp = flying * (0.5 + 0.25 * flare) * (1 - 0.4 * flank);
  const tuck = t < T.hawkStrike ? 0.92 * dive : 0;
  const scale = lerp(1, 0.44, flank);
  // Facing: down the dive (towards -x, nose down), then three-quarters to the camera.
  const yaw = t < T.hawkStrike + 20 ? lerp(-2.6, -1.3, ss((t - T.hawkStrike + 30) / 60)) : lerp(-1.3, -2.4, out) * (1 - flank) + -0.35 * flank;
  const pitch = -0.95 * dive * (t < T.hawkStrike ? 1 : 0) + 0.35 * flare - 0.06 * Math.sin(phase) * flying + 0.25 * out * (1 - flank);
  return {
    pos: [p[0], p[1] + 0.03 * Math.sin(phase) * flying * (1 - flare), p[2]],
    rot: [yaw, 0.12 * Math.sin(t / 50) * flying * (1 - flank), pitch],
    scale,
    joints: wings(phase, amp, tuck),
    visible: t > T.hawkDive - 12 && !(t > HAWK_OUT + 50 && t < FLANK.at - 62),
  };
};

const DOVE_FLANK_MOVE = FLANK.at - 50;
const dovePath = path([
  [T.doveRise - 10, 0.55, -0.15, 1.1],
  [T.doveRise + 30, 0.3, 0.45, 0.6],
  [T.doveLift + 40, 0.05, 0.98, 0.15],
  [T.doveLift + 130, 0, 1.18, 0],
  [DOVE_FLANK_MOVE, 0, 1.3, 0],
  [FLANK.at + 10, FLANK.dove[0], FLANK.dove[1], FLANK.dove[2]],
  [T.endCardStart + 80, FLANK.dove[0] + 0.05, FLANK.dove[1] + 0.05, FLANK.dove[2]],
]);

export const dovePose = (t: number): FigurePose => {
  const p = dovePath(t);
  const climb = 1 - ramp(t, T.doveLift + 40, T.doveLift + 140, easeInOut);
  const flank = ramp(t, DOVE_FLANK_MOVE, FLANK.at + 10, easeInOut);
  const phase = flapPhase(t, [
    [T.doveRise - 12, 3.0],
    [T.doveLift + 70, 2.0],
    [T.doveLift + 150, 1.5],
    [DOVE_FLANK_MOVE, 2.2],
    [FLANK.at + 10, 1.4],
  ]);
  const amp = 0.62 + 0.25 * climb - 0.3 * flank;
  return {
    pos: [p[0], p[1] + 0.03 * Math.sin(phase + 0.5), p[2]],
    rot: [lerp(-1.25, -0.95, 1 - climb) * (1 - flank) + (-2.75) * flank, 0.08 * Math.sin(t / 45), 0.32 * climb - 0.05 * Math.sin(phase)],
    scale: lerp(1.08, 0.48, flank),
    joints: wings(phase, amp, 0),
    visible: t > T.doveRise - 12,
  };
};

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
  // Through the floor: the bear (hook) goes down, the bear comes up, the bull goes down, ...
  ring(BEAR_HOOK_SINK, 0.78, 0, 0.55, COLORS.tint.bear, 50);
  ring(BULL_SINK, -0.12, 0.05, 0.75, COLORS.tint.bull, 54);
  ring(BEAR_UP - 6, 0.02, 0, 0.55, COLORS.tint.bear, 54);
  ring(BEAR_SINK, 0.02, 0, 0.55, COLORS.tint.bear, 54);
  ring(T.phoneAt - 6, 0, 0.1, 0.5, COLORS.tint.phone, 66);
  return out;
};

/** The whale's ripples: expanding gold circles where it breaks the floor. */
export const ripples = (t: number) => {
  const out: {r: number; a: number}[] = [];
  for (const at of [T.whaleSurface, T.whaleSurface + 22, T.whaleSurface + 46, T.whaleCandle + 40, T.whaleDive + 8, T.whaleDive + 30]) {
    const d = t - at;
    if (d < 0 || d > 70) continue;
    out.push({r: 0.6 + d * 0.016, a: Math.exp(-d / 24) * ss(d / 6) * (1 - ss((d - 40) / 30))});
  }
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
