// The whole camera as a pure function of the (fractional) frame: no state, no useFrame.
//
// The reel is a list of shots. Each shot is a smooth function of time (an orbit around a
// target with its own slow drift), defined beyond its own window. Transitions blend one
// shot into the next with a speed-ramp easing. Because both shots keep moving through the
// blend and every easing has zero slope at both ends, the camera velocity stays continuous
// through every whip, crane and push (scripts/check-camera.ts checks this).
import {FormatId, LAYOUT, NEWS, TIMING} from '../data';
import {lerp, smootherstep, smoothSteep, whip} from './ease';
import {BASE, Side, V3, bob} from './story';

export type Orbit = {
  target: V3;
  /** Degrees around the target, 0 = straight in front (+z), positive = camera to the right. */
  az: number;
  /** Degrees above the target. */
  el: number;
  dist: number;
  /** Horizontal field of view in degrees (kept across formats, so framing stays the same width). */
  hfov: number;
  roll: number;
  /** Where the target lands on screen, as a fraction of the frame height. */
  focus: number;
};

type Shot = {name: string; at: (t: number, fmt: FormatId) => Orbit};

const D2R = Math.PI / 180;

/** A point on a phone's front, in phone-local units, in world space (base pose, no buzz). */
export const phonePoint = (side: Side, local: V3, t: number): V3 => {
  const b = BASE[side];
  const cy = Math.cos(b.yaw);
  const sy = Math.sin(b.yaw);
  const ct = Math.cos(BASE.tilt);
  const st = Math.sin(BASE.tilt);
  const [lx, ly0, lz0] = local;
  const ly = ly0 * ct - lz0 * st;
  const lz = ly0 * st + lz0 * ct;
  const x = lx * cy + lz * sy;
  const z = -lx * sy + lz * cy;
  return [b.pos[0] + x, b.pos[1] + ly + bob(side, t), b.pos[2] + z];
};

const fy = (fmt: FormatId) => LAYOUT[fmt].focusY / LAYOUT[fmt].height;
const ds = (fmt: FormatId) => LAYOUT[fmt].distScale;
/** Slow eased drift between two values over a window (defined, and smooth, outside it too). */
const drift = (t: number, a: number, b: number, from: number, to: number) => lerp(from, to, smootherstep((t - a) / (b - a)));

// Every story shot keeps BOTH phones large and in frame, so the viewer always sees who is who.
export const SHOTS: Record<string, Shot> = {
  // 1. Hook: wide two-shot, a slow push with a slight arc.
  wide: {
    name: 'Wide two-shot (hook)',
    at: (t, fmt) => ({
      target: [0, 1.06, 0],
      az: drift(t, -40, 230, 7, 2),
      el: drift(t, -40, 230, 6, 3),
      dist: drift(t, -40, 230, 6.5, 5.85) * ds(fmt),
      hfov: 20,
      roll: drift(t, -40, 230, 0.5, 0),
      focus: fy(fmt),
    }),
  },
  // 2. The entry: a closer two-shot, arcing slowly from left to right.
  two: {
    name: 'Two-shot, slow arc (entry)',
    at: (t, fmt) => ({
      target: [0, 1.06, 0],
      az: drift(t, 150, 520, 3, -3),
      el: drift(t, 150, 520, 3, 1.5),
      dist: drift(t, 150, 520, 5.75, 5.5) * ds(fmt),
      hfov: 20,
      roll: drift(t, 150, 520, 0, -0.3),
      focus: fy(fmt),
    }),
  },
  // 3. The warning: drifts a little towards the right phone (the Miran update), left still in frame.
  favourRight: {
    name: 'Two-shot favouring the right (warning)',
    at: (t, fmt) => ({
      target: [drift(t, 450, 720, 0.02, 0.06), 1.06, 0],
      az: drift(t, 450, 720, -3.5, -6),
      el: drift(t, 450, 720, 2, 1),
      dist: drift(t, 450, 720, 5.55, 5.45) * ds(fmt),
      hfov: 20,
      roll: drift(t, 450, 720, -0.3, -0.6),
      focus: fy(fmt),
    }),
  },
  // 4. The news: square to both phones, with a speed-ramped push as the candle hits.
  news: {
    name: 'Square two-shot, push on the news',
    at: (t, fmt) => {
      const k = 0.25 * smootherstep((t - 690) / 70) + 0.55 * smoothSteep((t - (NEWS.at - 4)) / 22) + 0.2 * smootherstep((t - (NEWS.at + 18)) / 80);
      return {
        target: [lerp(-0.02, -0.04, k), 1.06, 0],
        az: lerp(0, 1.5, k),
        el: lerp(2, 1, k),
        dist: lerp(5.6, 5.36, k) * ds(fmt),
        hfov: 20,
        roll: lerp(0.3, -0.2, k),
        focus: fy(fmt),
      };
    },
  },
  // 5. The payoff: a slow pull back with both results side by side.
  pull: {
    name: 'Slow pull back (payoff)',
    at: (t, fmt) => ({
      target: [0, 1.06, 0],
      az: drift(t, 820, 1128, 1, -1),
      el: drift(t, 820, 1128, 1, 3),
      dist: drift(t, 820, 1128, 5.3, 5.75) * ds(fmt),
      hfov: 20,
      roll: drift(t, 820, 1128, -0.2, 0.2),
      focus: fy(fmt),
    }),
  },
  // 6. The switch: low 3/4 hero two-shot from the left phone's side, orbiting round to the front.
  hero: {
    name: 'Low 3/4 hero, orbit to front (switch)',
    at: (t, fmt) => ({
      target: [drift(t, 1108, 1408, -0.16, 0), 1.06, 0],
      az: drift(t, 1108, 1408, -30, -2),
      el: drift(t, 1108, 1408, 0.5, 5),
      dist: drift(t, 1108, 1408, 5.4, 6.05) * ds(fmt),
      hfov: drift(t, 1108, 1408, 22, 20),
      roll: drift(t, 1108, 1408, 2.0, 0),
      focus: fy(fmt),
    }),
  },
};

/** The edit: which shot runs when, and how each one hands over to the next. */
export const EDIT: {shot: keyof typeof SHOTS; until: number; blend: number; ease: (x: number) => number}[] = [
  {shot: 'wide', until: 160, blend: 50, ease: smootherstep},
  {shot: 'two', until: 450, blend: 60, ease: smootherstep},
  {shot: 'favourRight', until: 680, blend: 50, ease: smootherstep},
  {shot: 'news', until: 830, blend: 60, ease: smootherstep},
  {shot: 'pull', until: 1088, blend: 40, ease: whip},
  {shot: 'hero', until: Infinity, blend: 0, ease: smootherstep},
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

export const orbitAt = (t: number, fmt: FormatId): Orbit => {
  for (let i = 0; i < EDIT.length; i++) {
    const e = EDIT[i];
    if (t < e.until) return SHOTS[e.shot].at(t, fmt);
    if (t < e.until + e.blend && i + 1 < EDIT.length) {
      const k = e.ease((t - e.until) / e.blend);
      return blendOrbit(SHOTS[e.shot].at(t, fmt), SHOTS[EDIT[i + 1].shot].at(t, fmt), k);
    }
  }
  return SHOTS.hero.at(t, fmt);
};

/** Name of the shot on screen (for labels and QA). */
export const shotAt = (t: number) => {
  for (let i = 0; i < EDIT.length; i++) if (t < EDIT[i].until + EDIT[i].blend / 2) return EDIT[i].shot;
  return 'hero';
};

export type CameraState = {
  position: V3;
  target: V3;
  up: V3;
  /** Vertical FOV for this frame's aspect. */
  fov: number;
  /** Target's screen position (px). */
  focusPx: [number, number];
  dist: number;
};

/** A decaying shake starting at frame `at` (0 before it). */
const shakeAt = (t: number, at: number, len: number, tau: number) => {
  const since = t - at;
  if (since <= -1 || since >= len) return {s: 0, since};
  return {s: Math.exp(-Math.max(0, since) / tau) * Math.min(1, Math.max(0, since + 1)) * (1 - smootherstep((since - len * 0.4) / (len * 0.6))), since};
};

export const computeCamera = (t: number, fmt: FormatId): CameraState => {
  const o = orbitAt(t, fmt);
  const {width, height} = LAYOUT[fmt];
  // Hand-held drift: layered slow sines (tiny), plus the jolts on the news candle and the flip landing.
  const hand = (k: number) => Math.sin(t * 0.021 + k) * 0.6 + Math.sin(t * 0.047 + 2 * k) * 0.3 + Math.sin(t * 0.093 + 3 * k) * 0.1;
  const imp = shakeAt(t, TIMING.impactAt, 48, 9);
  const news = shakeAt(t, NEWS.at, 40, 7);
  const jolt = (a: number, b: number, c: number) => imp.s * a * Math.sin(imp.since * b + c) + news.s * a * 1.25 * Math.sin(news.since * (b + 0.4) + c + 0.7);
  const az = (o.az + 0.22 * hand(0.3) + jolt(0.35, 1.9, 0)) * D2R;
  const el = (o.el + 0.16 * hand(1.7) + jolt(0.45, 2.3, 1)) * D2R;
  const roll = (o.roll + 0.12 * hand(4.1) + jolt(0.9, 1.6, 2)) * D2R;
  const [tx, ty, tz] = o.target;
  const position: V3 = [
    tx + o.dist * Math.sin(az) * Math.cos(el),
    ty + o.dist * Math.sin(el),
    tz + o.dist * Math.cos(az) * Math.cos(el),
  ];
  // Up vector rolled around the view direction.
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
