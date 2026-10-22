import {Easing, interpolate, random} from 'remotion';

// ── Tracks ────────────────────────────────────────────────────────────────
// A prop is either a constant or a list of keys ({at: frame, v: value}).
export type Key<T> = {at: number; v: T};
export type Track<T> = T | Key<T>[];
export type Params = Record<string, number>;

const isKeys = <T>(t: Track<T>): t is Key<T>[] => Array.isArray(t);
export const keysOf = <T>(t: Track<T>): Key<T>[] => (isKeys(t) ? t : [{at: -1e6, v: t}]);

const blendEase = Easing.bezier(0.45, 0, 0.25, 1);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const mix = (a: Params, b: Params, t: number): Params => {
  const out: Params = {...a};
  for (const k of Object.keys(b)) out[k] = lerp(a[k] ?? b[k], b[k], t);
  return out;
};

// Evaluates a keyed track of parameter sets. Each key blends in from whatever the
// track was doing just before it, over `dur` frames. `get` receives the local time
// since the key started, so poses can carry their own internal motion.
export function evalTrack<T>(
  track: Track<T>,
  frame: number,
  get: (v: T, local: number) => Params,
  dur: number | ((v: T) => number),
): Params {
  const keys = keysOf(track);
  const at = (i: number): Params => {
    const k = keys[i];
    const own = get(k.v, frame - k.at);
    if (i === 0) return own;
    const d = typeof dur === 'function' ? dur(k.v) : dur;
    const w = blendEase(clamp01((frame - k.at) / d));
    if (w >= 1) return own;
    return mix(at(i - 1), own, w);
  };
  let i = -1;
  for (let j = 0; j < keys.length; j++) if (keys[j].at <= frame) i = j;
  return at(Math.max(0, i));
}

// Value of a discrete track at a frame (the latest key that has started)
export function current<T>(track: Track<T>, frame: number): {v: T; local: number} {
  const keys = keysOf(track);
  let k = keys[0];
  for (const key of keys) if (key.at <= frame) k = key;
  return {v: k.v, local: frame - k.at};
}

// Numeric track with smooth blending
export const evalNumber = (track: Track<number>, frame: number, dur = 20) =>
  evalTrack(track, frame, (v) => ({n: v}), dur).n;

// ── Idle life ─────────────────────────────────────────────────────────────
// Breathing: torso scaleY 1 → 1.012 on a ~3s sine
export const breathing = (frame: number, seed: string) => {
  const phase = random(`${seed}-breath`) * Math.PI * 2;
  return 1 + 0.006 * (1 - Math.cos((frame / 180) * Math.PI * 2 + phase));
};

export const headSway = (frame: number, seed: string) => {
  const p = random(`${seed}-sway`) * 10;
  return {
    rot: Math.sin(frame / 97 + p) * 1.1 + Math.sin(frame / 41 + p * 2) * 0.35,
    x: Math.sin(frame / 131 + p) * 1.6,
    y: Math.sin(frame / 89 + p * 3) * 1.0,
  };
};

// Blinks at seeded intervals of 2.5–4.5s. `speed` > 1 blinks more often.
// Returns lid closure 0 (open) → 1 (shut).
export const blink = (frame: number, seed: string, speed: (f: number) => number = () => 1) => {
  let t = 20 + random(`${seed}-b0`) * 80;
  let i = 0;
  while (t <= frame + 10) {
    const d = frame - t;
    if (d >= 0 && d < 10) {
      if (d < 3) return d / 3;
      if (d < 4) return 1;
      return 1 - (d - 4) / 6;
    }
    const interval = (150 + random(`${seed}-b${++i}`) * 120) / Math.max(0.5, speed(t));
    t += interval;
  }
  return 0;
};

// ── Visemes ───────────────────────────────────────────────────────────────
export type Viseme = 'closed' | 'small' | 'wide' | 'round';
export const visemeShapes: Record<Viseme, {open: number; width: number}> = {
  closed: {open: 0, width: 1},
  small: {open: 0.28, width: 0.92},
  wide: {open: 0.5, width: 1.12},
  round: {open: 0.46, width: 0.62},
};
const visemeCycle: Viseme[] = ['small', 'wide', 'round', 'small', 'closed', 'wide'];

export type Talking = boolean | Array<[number, number]>;

// While talking, cycles visemes every 4–6 frames (seeded) and blends over 2 frames
export const viseme = (frame: number, talking: Talking, seed: string) => {
  const ranges: Array<[number, number]> =
    talking === true ? [[-1e6, 1e6]] : talking === false ? [] : talking;
  const r = ranges.find(([a, b]) => frame >= a && frame < b);
  if (!r) return {open: 0, width: 1};
  const [start, end] = r;
  // segmentation always starts at the line's first frame so it stays deterministic
  let t = start < -1e5 ? Math.floor(frame / 600) * 600 : start;
  let i = Math.floor(t);
  let prev: Viseme = 'closed';
  let cur: Viseme = 'closed';
  let segStart = t;
  while (t <= frame) {
    prev = cur;
    const pick = Math.floor(random(`${seed}-v${i}`) * visemeCycle.length);
    cur = visemeCycle[pick] === prev ? visemeCycle[(pick + 1) % visemeCycle.length] : visemeCycle[pick];
    segStart = t;
    t += 4 + Math.floor(random(`${seed}-vl${i}`) * 3);
    i++;
  }
  // close the mouth over the last few frames of the line
  if (end - frame < 5) cur = 'closed';
  const w = clamp01((frame - segStart) / 2);
  const a = visemeShapes[prev];
  const b = visemeShapes[cur];
  const fadeIn = clamp01((frame - start) / 3);
  return {open: lerp(a.open, b.open, w) * fadeIn, width: lerp(a.width, b.width, w)};
};

// ── Shake ─────────────────────────────────────────────────────────────────
// Seeded shake in px, stepped every 2 frames and eased between steps
export const shake = (frame: number, amount: number, seed: string) => {
  if (amount <= 0.01) return {x: 0, y: 0, r: 0};
  const step = Math.floor(frame / 2);
  const t = (frame % 2) / 2;
  const n = (k: string, s: number) => random(`${seed}-${k}-${s}`) * 2 - 1;
  return {
    x: lerp(n('x', step), n('x', step + 1), t) * amount,
    y: lerp(n('y', step), n('y', step + 1), t) * amount * 0.7,
    r: lerp(n('r', step), n('r', step + 1), t) * amount * 0.12,
  };
};

// ── IK ────────────────────────────────────────────────────────────────────
// Two-bone IK: shoulder → elbow → hand. `bend` picks the elbow side.
export const ik = (sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, bend: 1 | -1) => {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.hypot(dx, dy);
  const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 0.5, dist));
  const a = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const ea = a + bend * A;
  const ex = sx + l1 * Math.cos(ea);
  const ey = sy + l1 * Math.sin(ea);
  const hx = sx + d * Math.cos(a);
  const hy = sy + d * Math.sin(a);
  return {ex, ey, hx, hy, foreAngle: Math.atan2(hy - ey, hx - ex)};
};

export const deg = (r: number) => (r * 180) / Math.PI;

// Smooth 0→1 pulse helpers for pose-internal motion
export const seg = (t: number, a: number, b: number, easing = blendEase) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

// Resting arms hang from the shoulder with a foreshortened forearm on the desk;
// `hang` 1 uses that elbow, 0 uses the IK elbow (raised poses)
export const hangArm = (
  arm: ReturnType<typeof ik>,
  sx: number,
  sy: number,
  hang: number,
  outX: number,
) => {
  const h = Math.max(0, Math.min(1, hang));
  const ex = lerp(arm.ex, sx + outX, h);
  const ey = lerp(arm.ey, sy + 148, h);
  return {...arm, ex, ey, foreAngle: Math.atan2(arm.hy - ey, arm.hx - ex)};
};
