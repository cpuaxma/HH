// The animals reel's camera as a pure function of the (fractional) frame: one shot per
// animal (an orbit with its own slow drift, defined beyond its window) and eased blends
// between them, so the camera's velocity stays continuous through every change. Same model
// as the other reels (src/lib/camera.ts, src/copy/camera.ts).
import {lerp, smootherstep} from '../lib/ease';
import type {CameraState, Orbit} from '../lib/camera';
import type {V3} from '../lib/story';
import {AnimalsFormat, LAYOUT, T} from './data';

const D2R = Math.PI / 180;
const ds = (fmt: AnimalsFormat) => LAYOUT[fmt].distScale;
const drift = (t: number, a: number, b: number, from: number, to: number) => lerp(from, to, smootherstep((t - a) / (b - a)));
/** A short push towards the subject after a beat's big moment. */
const push = (t: number, at: number, amount: number) => amount * smootherstep((t - at) / 18) * (1 - smootherstep((t - at - 40) / 70));

type Shot = (t: number, fmt: AnimalsFormat) => Orbit;

export const SHOTS: Record<string, Shot> = {
  // 1. The face-off: both animals in profile, a slow push.
  hook: (t, fmt) => ({
    target: [-0.14, 0.86, 0],
    az: drift(t, -30, 260, 7, 1),
    el: drift(t, -30, 260, 7.5, 5),
    dist: drift(t, -30, 260, 9.0, 8.3) * ds(fmt),
    hfov: 21,
    roll: drift(t, -30, 260, 0.6, 0),
    focus: LAYOUT[fmt].focus,
  }),
  // 2. The bull: a three-quarter hero angle that arcs round as it tosses its horns.
  bull: (t, fmt) => ({
    target: [-0.04, 0.72, 0.05],
    az: drift(t, 200, 520, 10, 20),
    el: drift(t, 200, 520, 8, 5.5),
    dist: (drift(t, 200, 520, 6.1, 5.6) - push(t, T.bullThrust[0], 0.25) - push(t, T.bullThrust[1], 0.2)) * ds(fmt),
    hfov: 20,
    roll: drift(t, 200, 520, -0.5, 0.3),
    focus: LAYOUT[fmt].focus,
  }),
  // 3. The bear: slightly low, so it towers; drifts in at the swipe.
  bear: (t, fmt) => ({
    target: [0.04, 1.02, 0],
    az: drift(t, 470, 760, 12, 3),
    el: drift(t, 470, 760, 2.5, 5),
    dist: (drift(t, 470, 760, 6.9, 6.5) - push(t, T.bearSwipe, 0.3)) * ds(fmt),
    hfov: 20,
    roll: drift(t, 470, 760, 0.5, -0.3),
    focus: LAYOUT[fmt].focus,
  }),
  // 4. The whale: wider and a touch higher, to see it break the floor.
  whale: (t, fmt) => ({
    target: [0.02, 0.42, -0.12],
    az: drift(t, 720, 1010, -8, 5),
    el: drift(t, 720, 1010, 10, 7),
    dist: drift(t, 720, 1010, 8.4, 7.9) * ds(fmt),
    hfov: 20,
    roll: drift(t, 720, 1010, 0.4, 0),
    focus: LAYOUT[fmt].focus,
  }),
  // 5. The hawk: framed for the dive, then settles on it hovering.
  hawk: (t, fmt) => ({
    target: [0, lerp(1.1, 0.98, smootherstep((t - T.hawkDive) / 80)), 0],
    az: drift(t, 980, 1300, 7, -4),
    el: drift(t, 980, 1300, 3, 6),
    dist: (drift(t, 980, 1300, 6.6, 6.0) - push(t, T.hawkStrike, 0.25)) * ds(fmt),
    hfov: 20,
    roll: drift(t, 980, 1300, -0.4, 0.2),
    focus: LAYOUT[fmt].focus,
  }),
  // 6. The dove: a low angle looking up as it rises.
  dove: (t, fmt) => ({
    target: [0, lerp(0.85, 1.12, smootherstep((t - T.doveRise) / 160)), 0],
    az: drift(t, 1270, 1550, -6, 4),
    el: drift(t, 1270, 1550, 1, 5),
    dist: drift(t, 1270, 1550, 6.2, 5.8) * ds(fmt),
    hfov: 20,
    roll: drift(t, 1270, 1550, 0.4, -0.2),
    focus: LAYOUT[fmt].focus,
  }),
  // Tie-in and end: the phone between the hawk and the dove, then a pull back.
  phone: (t, fmt) => ({
    target: [0, 1.24, 0],
    az: drift(t, 1510, 1810, 6, 1.5),
    el: drift(t, 1510, 1810, 3.5, 3),
    dist: (drift(t, 1510, 1730, 5.9, 5.5) + drift(t, 1750, 1890, 0, 0.6)) * ds(fmt),
    hfov: 20,
    roll: drift(t, 1510, 1810, -0.3, 0),
    focus: LAYOUT[fmt].focus,
  }),
};

export const EDIT: {shot: keyof typeof SHOTS; until: number; blend: number}[] = [
  {shot: 'hook', until: T.bullAt - 22, blend: 56},
  {shot: 'bull', until: T.bearAt - 10, blend: 56},
  {shot: 'bear', until: T.whaleAt - 20, blend: 52},
  {shot: 'whale', until: T.hawkAt - 6, blend: 44},
  {shot: 'hawk', until: T.doveAt - 18, blend: 52},
  {shot: 'dove', until: T.phoneAt - 20, blend: 60},
  {shot: 'phone', until: Infinity, blend: 0},
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

export const orbitAt = (t: number, fmt: AnimalsFormat): Orbit => {
  for (let i = 0; i < EDIT.length; i++) {
    const e = EDIT[i];
    if (t < e.until) return SHOTS[e.shot](t, fmt);
    if (t < e.until + e.blend && i + 1 < EDIT.length) {
      const k = smootherstep((t - e.until) / e.blend);
      return blendOrbit(SHOTS[e.shot](t, fmt), SHOTS[EDIT[i + 1].shot](t, fmt), k);
    }
  }
  return SHOTS.phone(t, fmt);
};

/** A small decaying jolt (eased in, settles to exactly zero) at each animal's big moment. */
const JOLTS: {at: number; s: number}[] = [
  {at: T.bullThrust[0] + 6, s: 0.6},
  {at: T.bullThrust[1] + 6, s: 0.45},
  {at: T.bearSwipe + 10, s: 1},
  {at: T.whaleSurface + 8, s: 0.5},
  {at: T.hawkStrike, s: 0.7},
];
const jolt = (t: number, k: number) => {
  let v = 0;
  for (const j of JOLTS) {
    const d = t - j.at;
    if (d <= 0 || d >= 40) continue;
    v += j.s * Math.exp(-d / 7) * smootherstep(d / 3) * (1 - smootherstep((d - 16) / 24)) * Math.sin(d * (1.9 + 0.3 * k) + k);
  }
  return v;
};

export const computeAnimalsCamera = (t: number, fmt: AnimalsFormat): CameraState => {
  const o = orbitAt(t, fmt);
  const {width, height} = LAYOUT[fmt];
  const hand = (k: number) => Math.sin(t * 0.021 + k) * 0.6 + Math.sin(t * 0.047 + 2 * k) * 0.3 + Math.sin(t * 0.093 + 3 * k) * 0.1;
  const az = (o.az + 0.22 * hand(0.3) + 0.3 * jolt(t, 0)) * D2R;
  const el = (o.el + 0.16 * hand(1.7) + 0.38 * jolt(t, 1)) * D2R;
  const roll = (o.roll + 0.12 * hand(4.1) + 0.6 * jolt(t, 2)) * D2R;
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
