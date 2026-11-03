// The whole camera as a pure function of the (fractional) frame: no state, no useFrame.
//
// The reel is a list of shots. Each shot is a smooth function of time (an orbit around a
// target with its own slow drift), defined beyond its own window. Transitions blend
// one shot into the next with a speed-ramp easing. Because both shots keep moving
// through the blend and the easing has zero slope at both ends, the camera velocity
// stays continuous through every whip, crane and push (scripts/check-camera.ts checks this).
import {FormatId, LAYOUT, TIMING} from '../data';
import {lerp, ramp, smootherstep, smoothSteep, whip} from './ease';
import {Easing} from 'remotion';

/** A push that starts from rest and glides in (zero velocity at both ends). */
const pushIn = Easing.bezier(0.42, 0, 0.12, 1);
import {BASE, V3} from './story';

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
  /** Depth-of-field strength (0 = off). */
  dof: number;
};

type Shot = {name: string; at: (t: number, fmt: FormatId) => Orbit};

const D2R = Math.PI / 180;

/** A point on a phone's front, in phone-local units, in world space (base pose, no buzz). */
export const phonePoint = (which: 'you' | 'competitor', local: V3, t: number): V3 => {
  const b = BASE[which];
  const cy = Math.cos(b.yaw);
  const sy = Math.sin(b.yaw);
  const ct = Math.cos(BASE.tilt);
  const st = Math.sin(BASE.tilt);
  // Tilt about x, then yaw about y.
  const [lx, ly0, lz0] = local;
  const ly = ly0 * ct - lz0 * st;
  const lz = ly0 * st + lz0 * ct;
  const x = lx * cy + lz * sy;
  const z = -lx * sy + lz * cy;
  const bob = which === 'competitor' ? 0.016 * Math.sin((2 * Math.PI * t) / 150 + 0.4) : 0.009 * Math.sin((2 * Math.PI * t) / 190 + 1.1);
  return [b.pos[0] + x, b.pos[1] + ly + bob, b.pos[2] + z];
};

const fy = (fmt: FormatId, wide: boolean) => (wide ? LAYOUT[fmt].focusY : LAYOUT[fmt].macroFocusY) / LAYOUT[fmt].height;
const ds = (fmt: FormatId) => LAYOUT[fmt].distScale;
/** Slow eased drift between two values over a window (defined, and smooth, outside it too). */
const drift = (t: number, a: number, b: number, from: number, to: number) => lerp(from, to, smootherstep((t - a) / (b - a)));

export const SHOTS: Record<string, Shot> = {
  // 1. Hook: wide two-shot, slow push with a slight arc towards the competitor.
  wide: {
    name: 'Wide two-shot',
    at: (t, fmt) => ({
      target: [0.02, 1.06, 0],
      az: drift(t, -40, 230, -9, 4),
      el: drift(t, -40, 230, 8, 4.5),
      dist: drift(t, -40, 230, 7.3, 6.5) * ds(fmt),
      hfov: 20,
      roll: drift(t, -40, 230, -0.6, 0.3),
      focus: fy(fmt, true),
      dof: 0,
    }),
  },
  // 2. The gap, competitor: low 3/4 macro on the screen, creeping down to the comments.
  compMacro: {
    name: 'Competitor macro (low 3/4)',
    at: (t, fmt) => ({
      target: phonePoint('competitor', [0.02, drift(t, 170, 320, -0.16, -0.34), 0.04], t),
      az: drift(t, 170, 320, 30, 22),
      el: drift(t, 170, 320, -10, -5),
      dist: drift(t, 170, 320, 1.72, 1.5) * ds(fmt),
      hfov: 26,
      roll: drift(t, 170, 320, 2.2, 0.8),
      focus: fy(fmt, false),
      dof: 0,
    }),
  },
  // 3. The gap, you: straight-on macro, almost still (nothing is happening).
  youMacro: {
    name: 'Your macro (straight on)',
    at: (t, fmt) => ({
      target: phonePoint('you', [0, -0.08, 0.04], t),
      az: drift(t, 300, 440, 9, 6),
      el: drift(t, 300, 440, 9, 12),
      dist: drift(t, 300, 440, 2.12, 1.86) * ds(fmt),
      hfov: 26,
      roll: 0,
      focus: fy(fmt, false) + 0.05,
      dof: 0,
    }),
  },
  // 4. The gap, both: overhead crane, the warm pool under theirs, nothing under yours.
  overhead: {
    name: 'Overhead',
    at: (t, fmt) => ({
      target: [0, 0.62, 0.22],
      az: drift(t, 420, 580, -14, 4),
      el: drift(t, 420, 580, 62, 70),
      dist: drift(t, 420, 580, 5.9, 5.5) * ds(fmt),
      hfov: 27,
      roll: 0,
      focus: fy(fmt, true),
      dof: 0,
    }),
  },
  // 5. The twist: push in on the competitor's profile, landing on the "Managed by" tag.
  profilePush: {
    name: 'Push-in on the profile',
    at: (t, fmt) => {
      const p = ramp(t, 536, 700, pushIn);
      return {
        target: phonePoint('competitor', [lerp(0, -0.06, p), lerp(0.1, 0.225, p), 0.04], t),
        az: lerp(-3, -8, p),
        el: lerp(4, 6, p),
        dist: Math.exp(lerp(Math.log(3.9), Math.log(2.0), p)) * ds(fmt),
        hfov: lerp(22, 20, p),
        roll: lerp(0, -1.2, p),
        focus: fy(fmt, false) - 0.02,
        dof: 0,
      };
    },
  },
  // 6. The flip: low 3/4 hero two-shot from your side, orbiting round to the front.
  hero: {
    name: 'Low 3/4 hero, orbit to front',
    at: (t, fmt) => ({
      target: [drift(t, 730, 1060, -0.18, 0), drift(t, 730, 1060, 1.0, 1.06), 0],
      az: drift(t, 730, 1060, -34, -2),
      el: drift(t, 730, 1060, 0.5, 7),
      dist: drift(t, 730, 1060, 5.4, 6.7) * ds(fmt),
      hfov: drift(t, 730, 1060, 24, 20),
      roll: drift(t, 730, 1060, 2.4, 0),
      focus: fy(fmt, true),
      dof: 0,
    }),
  },
};

/** The edit: which shot runs when, and how each one hands over to the next. */
export const EDIT: {shot: keyof typeof SHOTS; until: number; blend: number; ease: (x: number) => number}[] = [
  {shot: 'wide', until: 166, blend: 34, ease: whip},
  {shot: 'compMacro', until: 300, blend: 26, ease: whip},
  {shot: 'youMacro', until: 420, blend: 38, ease: smoothSteep},
  {shot: 'overhead', until: 532, blend: 44, ease: smootherstep},
  {shot: 'profilePush', until: 718, blend: 42, ease: whip},
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
  dof: lerp(a.dof, b.dof, k),
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

/** Index of the shot (for labels and QA). */
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
  dof: number;
  dist: number;
};

export const computeCamera = (t: number, fmt: FormatId): CameraState => {
  const o = orbitAt(t, fmt);
  const {width, height} = LAYOUT[fmt];
  // Hand-held drift: layered slow sines (tiny), plus the impact shake on the landing.
  const hand = (k: number) => Math.sin(t * 0.021 + k) * 0.6 + Math.sin(t * 0.047 + 2 * k) * 0.3 + Math.sin(t * 0.093 + 3 * k) * 0.1;
  const since = t - TIMING.impactAt;
  const shake = since > -1 && since < 48 ? Math.exp(-Math.max(0, since) / 9) * smoothIn(since + 1) * (1 - smootherstep((since - 20) / 28)) : 0;
  const az = (o.az + 0.22 * hand(0.3) + shake * 0.35 * Math.sin(since * 1.9)) * D2R;
  const el = (o.el + 0.16 * hand(1.7) + shake * 0.45 * Math.sin(since * 2.3 + 1)) * D2R;
  const roll = (o.roll + 0.12 * hand(4.1) + shake * 0.9 * Math.sin(since * 1.6 + 2)) * D2R;
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
  return {position, target: o.target, up, fov, focusPx: [width / 2, o.focus * height], dof: o.dof, dist: o.dist};
};

const smoothIn = (x: number) => Math.min(1, Math.max(0, x));
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
