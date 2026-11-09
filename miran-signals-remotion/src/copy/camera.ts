// The copy trading reel's camera as a pure function of the (fractional) frame: one phone,
// a list of shots (each an orbit with its own slow drift, defined beyond its window) and
// eased blends between them, so velocity stays continuous through every move.
// Same model as src/lib/camera.ts (Orbit, blends, hand-held drift), framed for one phone.
import {lerp, smootherstep, smoothSteep} from '../lib/ease';
import type {CameraState, Orbit} from '../lib/camera';
import type {V3} from '../lib/story';
import {CopyFormat, LAYOUT, T} from './data';

const D2R = Math.PI / 180;
const TARGET: V3 = [0, 1.06, 0];

const fy = (fmt: CopyFormat) => LAYOUT[fmt].focusY / LAYOUT[fmt].height;
const ds = (fmt: CopyFormat) => LAYOUT[fmt].distScale;
const drift = (t: number, a: number, b: number, from: number, to: number) => lerp(from, to, smootherstep((t - a) / (b - a)));

type Shot = (t: number, fmt: CopyFormat) => Orbit;

/** Every shot keeps the whole phone in frame and its screen readable (never too far off-axis). */
export const SHOTS: Record<string, Shot> = {
  // 1. Hook: a slow push in from a 3/4 angle as the phone rises.
  hook: (t, fmt) => ({
    target: TARGET,
    az: drift(t, -40, 300, 16, 5),
    el: drift(t, -40, 300, 8, 3),
    dist: drift(t, -40, 300, 5.35, 4.85) * ds(fmt),
    hfov: 20,
    roll: drift(t, -40, 300, 1.2, 0),
    focus: fy(fmt),
  }),
  // 2–3. Connect and settings: near square to the screen, a slow arc right to left.
  setup: (t, fmt) => ({
    target: TARGET,
    az: drift(t, 220, 940, 5, -6),
    el: drift(t, 220, 940, 3, 1.5),
    dist: drift(t, 220, 940, 4.85, 4.68) * ds(fmt),
    hfov: 20,
    roll: drift(t, 220, 940, 0, -0.4),
    focus: fy(fmt),
  }),
  // 4. The switch: a low 3/4 hero angle that swings round to the front as it turns on.
  hero: (t, fmt) => ({
    target: TARGET,
    az: drift(t, 880, 1140, -17, -4) ,
    el: drift(t, 880, 1140, -1.5, 1.5),
    dist: drift(t, 880, 1140, 4.95, 4.66) * ds(fmt),
    hfov: 20,
    roll: drift(t, 880, 1140, -1.4, 0),
    focus: fy(fmt),
  }),
  // 5–6. The signal and the news: square, with a speed-ramped push at the release.
  dash: (t, fmt) => {
    const k = 0.6 * smootherstep((t - 1100) / 360) + 0.4 * smoothSteep((t - (T.newsAt - 6)) / 26);
    return {
      target: TARGET,
      az: lerp(-3, 2.5, smootherstep((t - 1100) / 560)),
      el: lerp(2.5, 1.2, k),
      dist: lerp(4.86, 4.62, k) * ds(fmt),
      hfov: 20,
      roll: lerp(0.3, -0.3, smootherstep((t - 1100) / 560)),
      focus: fy(fmt),
    };
  },
  // 7–8. In control, then a slow pull back as the end card comes in.
  control: (t, fmt) => ({
    target: TARGET,
    az: drift(t, 1600, 2000, 9, 3),
    el: drift(t, 1600, 2000, 3, 4),
    dist: drift(t, 1600, 2000, 4.72, 5.3) * ds(fmt),
    hfov: 20,
    roll: drift(t, 1600, 2000, 0.6, 0),
    focus: fy(fmt),
  }),
};

export const EDIT: {shot: keyof typeof SHOTS; until: number; blend: number}[] = [
  {shot: 'hook', until: 210, blend: 60},
  {shot: 'setup', until: 868, blend: 60},
  {shot: 'hero', until: 1080, blend: 60},
  {shot: 'dash', until: 1610, blend: 60},
  {shot: 'control', until: Infinity, blend: 0},
];

const blendOrbit = (a: Orbit, b: Orbit, k: number): Orbit => ({
  target: [lerp(a.target[0], b.target[0], k), lerp(a.target[1], b.target[1], k), lerp(a.target[2], b.target[2], k)],
  az: lerp(a.az, b.az, k),
  el: lerp(a.el, b.el, k),
  dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), k)),
  hfov: lerp(a.hfov, b.hfov, k),
  roll: lerp(a.roll, b.roll, k),
  focus: lerp(a.focus, b.focus, k),
});

export const orbitAt = (t: number, fmt: CopyFormat): Orbit => {
  for (let i = 0; i < EDIT.length; i++) {
    const e = EDIT[i];
    if (t < e.until) return SHOTS[e.shot](t, fmt);
    if (t < e.until + e.blend && i + 1 < EDIT.length) {
      const k = smootherstep((t - e.until) / e.blend);
      return blendOrbit(SHOTS[e.shot](t, fmt), SHOTS[EDIT[i + 1].shot](t, fmt), k);
    }
  }
  return SHOTS.control(t, fmt);
};

export const shotAt = (t: number) => {
  for (let i = 0; i < EDIT.length; i++) if (t < EDIT[i].until + EDIT[i].blend / 2) return EDIT[i].shot;
  return 'control';
};

/** A small decaying jolt at the news release. */
const jolt = (t: number) => {
  const d = t - T.newsAt;
  if (d <= -1 || d >= 36) return {s: 0, d};
  return {s: Math.exp(-Math.max(0, d) / 7) * Math.min(1, Math.max(0, d + 1)) * (1 - smootherstep((d - 14) / 22)), d};
};

export const computeCopyCamera = (t: number, fmt: CopyFormat): CameraState => {
  const o = orbitAt(t, fmt);
  const {width, height} = LAYOUT[fmt];
  const hand = (k: number) => Math.sin(t * 0.021 + k) * 0.6 + Math.sin(t * 0.047 + 2 * k) * 0.3 + Math.sin(t * 0.093 + 3 * k) * 0.1;
  const j = jolt(t);
  const jo = (a: number, b: number, c: number) => j.s * a * Math.sin(j.d * b + c);
  const az = (o.az + 0.22 * hand(0.3) + jo(0.3, 2.1, 0)) * D2R;
  const el = (o.el + 0.16 * hand(1.7) + jo(0.38, 2.5, 1)) * D2R;
  const roll = (o.roll + 0.12 * hand(4.1) + jo(0.7, 1.8, 2)) * D2R;
  const [tx, ty, tz] = o.target;
  const position: V3 = [tx + o.dist * Math.sin(az) * Math.cos(el), ty + o.dist * Math.sin(el), tz + o.dist * Math.cos(az) * Math.cos(el)];
  const f = norm([tx - position[0], ty - position[1], tz - position[2]]);
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const up: V3 = [u[0] * Math.cos(roll) + r[0] * Math.sin(roll), u[1] * Math.cos(roll) + r[1] * Math.sin(roll), u[2] * Math.cos(roll) + r[2] * Math.sin(roll)];
  const aspect = width / height;
  const fov = (2 * Math.atan(Math.tan((o.hfov * D2R) / 2) / aspect)) / D2R;
  return {position, target: o.target, up, fov, focusPx: [width / 2, o.focus * height], dist: o.dist};
};

const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
