// The whole camera as a pure function of the (fractional) frame: no state, no useFrame.
//
// The reel is a list of shots. Each shot is a smooth function of time (an orbit around a
// target with its own slow drift), defined beyond its own window. Transitions blend one
// shot into the next with a speed-ramp easing. Because both shots keep moving through the
// blend and every easing has zero slope at both ends, the camera velocity stays continuous
// through every whip, crane and push (scripts/check-camera.ts checks this).
import {Easing} from 'remotion';
import {FormatId, LAYOUT, NEWS, TIMING} from '../data';
import {lerp, ramp, smootherstep, smoothSteep, whip} from './ease';
import {BASE, LEAN_MAX, Side, V3, bob, lean} from './story';

/** A push that starts from rest and glides in (zero velocity at both ends). */
const pushIn = Easing.bezier(0.42, 0, 0.12, 1);

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

/** A point on a phone's front, in phone-local units, in world space (base pose + lean, no buzz). */
export const phonePoint = (side: Side, local: V3, t: number): V3 => {
  const b = BASE[side];
  const cy = Math.cos(b.yaw);
  const sy = Math.sin(b.yaw);
  const tilt = BASE.tilt - LEAN_MAX * lean(t);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  // Tilt about x, then yaw about y.
  const [lx, ly0, lz0] = local;
  const ly = ly0 * ct - lz0 * st;
  const lz = ly0 * st + lz0 * ct;
  const x = lx * cy + lz * sy;
  const z = -lx * sy + lz * cy;
  return [b.pos[0] + x, b.pos[1] + ly + bob(side, t), b.pos[2] + z];
};

const fy = (fmt: FormatId, wide: boolean) => (wide ? LAYOUT[fmt].focusY : LAYOUT[fmt].macroFocusY) / LAYOUT[fmt].height;
const ds = (fmt: FormatId) => LAYOUT[fmt].distScale;
/** Slow eased drift between two values over a window (defined, and smooth, outside it too). */
const drift = (t: number, a: number, b: number, from: number, to: number) => lerp(from, to, smootherstep((t - a) / (b - a)));

export const SHOTS: Record<string, Shot> = {
  // 1. Hook: wide two-shot in the navy studio, a slow push with a slight arc.
  wide: {
    name: 'Wide two-shot',
    at: (t, fmt) => ({
      target: [0, 1.04, 0],
      az: drift(t, -40, 220, 8, -4),
      el: drift(t, -40, 220, 8.5, 4.5),
      dist: drift(t, -40, 220, 6.9, 6.05) * ds(fmt),
      hfov: 20,
      roll: drift(t, -40, 220, 0.6, -0.3),
      focus: fy(fmt, true),
    }),
  },
  // 2a. Strategy, left: macro on the screen, creeping down to the "?" trade rows.
  leftMacro: {
    name: 'Left macro (strategy)',
    at: (t, fmt) => ({
      target: phonePoint('left', [0.0, drift(t, 170, 250, 0.0, -0.3), 0.04], t),
      az: drift(t, 160, 250, 16, 10),
      el: drift(t, 160, 250, -5, -2),
      dist: drift(t, 160, 250, 2.62, 2.36) * ds(fmt),
      hfov: 26,
      roll: drift(t, 160, 250, 1.6, 0.6),
      focus: fy(fmt, false),
    }),
  },
  // 2b. Strategy, right: macro on the Miran signal card as it builds.
  rightMacro: {
    name: 'Right macro (strategy)',
    at: (t, fmt) => ({
      target: phonePoint('right', [0.0, drift(t, 236, 310, -0.14, -0.36), 0.04], t),
      az: drift(t, 230, 320, -9, -14),
      el: drift(t, 230, 320, 2, -1),
      dist: drift(t, 230, 320, 2.5, 2.3) * ds(fmt),
      hfov: 26,
      roll: drift(t, 230, 320, -0.8, -1.4),
      focus: fy(fmt, false),
    }),
  },
  // 2c. Risk management: low 3/4 across both phones, drifting along them.
  riskLow: {
    name: 'Low 3/4 across both (risk)',
    at: (t, fmt) => ({
      target: [drift(t, 290, 440, -0.12, 0.0), drift(t, 290, 440, 1.0, 1.02), 0],
      az: drift(t, 290, 440, -21, -15),
      el: drift(t, 290, 440, -8, -5),
      dist: drift(t, 290, 440, 5.0, 4.7) * ds(fmt),
      hfov: 24,
      roll: drift(t, 290, 440, 2.6, 1.4),
      focus: fy(fmt, true) + 0.035,
    }),
  },
  // 2d. Market updates: overhead crane over the leaning phones, with a speed-ramped push on the news candle.
  overhead: {
    name: 'Overhead (market updates)',
    at: (t, fmt) => {
      // Slow drift in, a fast push as the news candle hits, then slow again (each piece C2-smooth).
      const k = 0.32 * smootherstep((t - 420) / 56) + 0.46 * smoothSteep((t - (NEWS.at - 6)) / 22) + 0.22 * smootherstep((t - (NEWS.at + 16)) / 60);
      return {
        target: [lerp(0, 0.02, k), lerp(0.95, 0.98, k), lerp(0.16, 0.1, k)],
        az: lerp(-7, 3, k),
        el: lerp(62, 71, k),
        dist: lerp(5.35, 4.95, k) * ds(fmt),
        hfov: 26,
        roll: lerp(0.8, -0.6, k),
        focus: fy(fmt, true) + 0.045,
      };
    },
  },
  // 3. The twist: push in on the right phone's screen, landing on the Miran checklist card.
  pushRight: {
    name: 'Push-in on the checklist (twist)',
    at: (t, fmt) => {
      const p = ramp(t, 530, 700, pushIn);
      return {
        target: phonePoint('right', [lerp(0, 0.0, p), lerp(0.02, -0.06, p), 0.04], t),
        az: lerp(-6, -10, p),
        el: lerp(5, 3, p),
        dist: Math.exp(lerp(Math.log(3.6), Math.log(2.38), p)) * ds(fmt),
        hfov: lerp(22, 20, p),
        roll: lerp(0, -1.0, p),
        focus: lerp(fy(fmt, false), LAYOUT[fmt].pushFocusY / LAYOUT[fmt].height, p),
      };
    },
  },
  // 4. The flip: low 3/4 hero two-shot from the left phone's side, orbiting round to the front.
  hero: {
    name: 'Low 3/4 hero, orbit to front (flip)',
    at: (t, fmt) => ({
      target: [drift(t, 730, 1060, -0.18, 0), drift(t, 730, 1060, 1.0, 1.05), 0],
      az: drift(t, 730, 1060, -34, -2),
      el: drift(t, 730, 1060, 0.5, 7),
      dist: drift(t, 730, 1060, 5.4, 6.7) * ds(fmt),
      hfov: drift(t, 730, 1060, 24, 20),
      roll: drift(t, 730, 1060, 2.4, 0),
      focus: fy(fmt, true),
    }),
  },
};

/** The edit: which shot runs when, and how each one hands over to the next. */
export const EDIT: {shot: keyof typeof SHOTS; until: number; blend: number; ease: (x: number) => number}[] = [
  {shot: 'wide', until: 166, blend: 26, ease: whip},
  {shot: 'leftMacro', until: 232, blend: 22, ease: whip},
  {shot: 'rightMacro', until: 298, blend: 34, ease: smoothSteep},
  {shot: 'riskLow', until: 418, blend: 42, ease: smootherstep},
  {shot: 'overhead', until: 532, blend: 44, ease: whip},
  {shot: 'pushRight', until: 718, blend: 42, ease: whip},
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
