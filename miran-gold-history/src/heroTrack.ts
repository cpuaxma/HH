import {interpolate, spring} from 'remotion';
import {EASE, SCENES, VIDEO} from './theme';

/**
 * The one gold object, through history. Each segment is a form with its pose; between
 * consecutive segments the object melts into a molten drop and recasts (MELT frames,
 * centred on `at`). Positions are world units in the hero canvas (see HERO_CANVAS).
 */
export type Form = 'nugget' | 'bangle' | 'sun' | 'lydian' | 'dinar' | 'pile' | 'bar' | 'none' | 'cube';
type Pose = {pos: [number, number, number]; scale: number; rot: [number, number, number]};
type Segment = Pose & {form: Form; at: number};

export const HERO_CANVAS = {top: 680, h: 860};
const FOV = 30;
const CAM_Z = 7.5;
/** Pixels per world unit at the hero plane (z = 0). */
export const PX = HERO_CANVAS.h / (2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180));
export const CAMERA = {fov: FOV, z: CAM_Z};
/** Screen px → world units at z = 0. */
export const toWorld = (x: number, y: number): [number, number] => [(x - VIDEO.width / 2) / PX, -(y - (HERO_CANVAS.top + HERO_CANVAS.h / 2)) / PX];
/** World units at z = 0 → screen px. */
export const toScreen = (wx: number, wy: number) => ({x: VIDEO.width / 2 + wx * PX, y: HERO_CANVAS.top + HERO_CANVAS.h / 2 - wy * PX});

export const MELT = 46;
const S = SCENES;

const at = (x: number, y: number, scale: number, rot: [number, number, number]): Pose => {
  const [wx, wy] = toWorld(x, y);
  return {pos: [wx, wy, 0], scale, rot};
};

export const CHART_START = {x: 190, y: 1372};

export const SEGMENTS: Segment[] = [
  {form: 'nugget', at: 25, ...at(540, 1100, 0.62, [0.35, 0, 0])},
  {form: 'bangle', at: S.first[0] + 32, ...at(540, 1090, 0.72, [1.05, 0, 0.15])},
  {form: 'sun', at: S.egypt[0] + 80, ...at(540, 868, 0.48, [0.08, 0, 0])},
  {form: 'lydian', at: S.lydia[0] + 42, ...at(540, 1090, 0.64, [0.15, 0, 0])},
  {form: 'dinar', at: S.dinar[0] + 42, ...at(540, 1090, 0.66, [0.1, 0, 0])},
  {form: 'pile', at: S.rush[0] + 45, ...at(540, 1200, 0.92, [0.82, 0, 0])},
  {form: 'bar', at: S.standard[0] + 38, ...at(760, 1120, 0.55, [0.35, -0.5, 0])},
  {form: 'none', at: S.modern[0] + 22, ...at(CHART_START.x, CHART_START.y, 0.2, [0, 0, 0])},
];

/** Frames of the special beats outside the melts. */
export const BEATS = {
  heroRise: 25,
  lydianFlip: S.lydia[0] + 100,
  barRise: S.break1971[0] + 142, // just after the chain snaps
  cubeRise: S.cube[0] + 20,
  cubeTilt: S.cube[0] + 100,
  recede: S.today[0] + 10,
  fadeOut: S.cta[0] + 2,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export type HeroState = {
  /** Forms drawn this frame with their own squash/scale. */
  parts: {form: Form; sx: number; sy: number; s: number}[];
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  heat: number; // 0–1: how molten it glows
  drop: number; // 0–1: size of the molten drop (0 = none)
  flash: number; // 0–1: the white-hot flash as it recasts
  opacity: number;
};

/** Everything the hero does at an absolute frame. */
export const heroState = (frame: number): HeroState => {
  const fade = interpolate(frame, [BEATS.fadeOut, BEATS.fadeOut + 16], [1, 0], clamp);

  // The cube: rises molten from the floor, cools, the camera tilts up it, then it recedes down the corridor.
  if (frame >= BEATS.cubeRise - 5) {
    const rise = interpolate(frame, [BEATS.cubeRise, BEATS.cubeRise + 80], [0, 1], {...clamp, easing: EASE.enter});
    const tilt = interpolate(frame, [BEATS.cubeTilt, BEATS.cubeTilt + 90], [0, 1], {...clamp, easing: EASE.inOut});
    const recede = interpolate(frame, [BEATS.recede, BEATS.recede + 190], [0, 1], {...clamp, easing: EASE.glide});
    const [, wyVp] = toWorld(540, 1010);
    const y = lerp(lerp(-4.2, -0.18, rise), -0.45, tilt);
    const pos: [number, number, number] = [0, lerp(y, wyVp, recede), 0];
    const scale = lerp(0.78 + 0.08 * tilt, 0.12, recede);
    return {
      parts: [{form: 'cube', sx: 1, sy: 1, s: 1}],
      pos,
      rot: [0.42 - 0.12 * tilt, -0.62 + (frame - BEATS.cubeRise) * 0.0012, 0],
      scale,
      heat: interpolate(rise, [0, 0.5, 1], [1, 0.5, 0], clamp),
      drop: 0,
      flash: 0,
      opacity: interpolate(frame, [BEATS.cubeRise - 5, BEATS.cubeRise + 5], [0, 1], clamp) * fade,
    };
  }

  // Which segment / transition are we in?
  let i = 0;
  while (i + 1 < SEGMENTS.length && frame >= SEGMENTS[i + 1].at - MELT / 2) i++;
  const cur = SEGMENTS[i];
  const next = SEGMENTS[i + 1];
  const prev = i > 0 ? SEGMENTS[i - 1] : null;

  // Transition into `cur` (from prev) if we are within its melt window.
  const tIn = prev ? interpolate(frame, [cur.at - MELT / 2, cur.at + MELT / 2], [0, 1], clamp) : 1;
  const melting = prev && tIn < 1;

  const rise = Math.max(0, spring({frame: frame - BEATS.heroRise, fps: VIDEO.fps, config: {damping: 14, stiffness: 110}}));
  let pose: Pose = cur;
  const parts: HeroState['parts'] = [];
  let heat = 0;
  let drop = 0;
  let flash = 0;

  if (melting && prev) {
    const t = tIn;
    const move = interpolate(t, [0.15, 0.85], [0, 1], {...clamp, easing: EASE.inOut});
    pose = {pos: lerp3(prev.pos, cur.pos, move), scale: lerp(prev.scale, cur.scale, move), rot: lerp3(prev.rot, cur.rot, move)};
    heat = interpolate(t, [0, 0.35, 0.65, 1], [0, 1, 1, 0], clamp);
    drop = interpolate(t, [0.25, 0.45, 0.55, 0.75], [0, 1, 1, 0], clamp);
    flash = interpolate(t, [0.5, 0.58, 0.8], [0, 1, 0], clamp);
    if (t < 0.5) {
      const e = EASE.inOut(t / 0.5);
      parts.push({form: prev.form, sx: 1 + 0.28 * e, sy: 1 - 0.72 * e, s: 1 - 0.4 * e});
    } else if (cur.form !== 'none') {
      const e = EASE.enter((t - 0.5) / 0.5);
      parts.push({form: cur.form, sx: 1.28 - 0.28 * e, sy: 0.28 + 0.72 * e, s: 0.6 + 0.4 * e});
    } else {
      drop = interpolate(t, [0.25, 0.45, 1], [0, 1, 0], clamp); // the drop runs on to the chart's start and vanishes
    }
  } else if (cur.form !== 'none') {
    parts.push({form: cur.form, sx: 1, sy: 1, s: 1});
  }

  // Idle motion and per-form beats.
  const rot: [number, number, number] = [...pose.rot];
  const coin = cur.form === 'lydian' || cur.form === 'dinar' || cur.form === 'sun';
  rot[1] += coin ? Math.sin(frame * 0.02) * 0.35 : (frame - cur.at) * 0.004; // idle turn, relative to this form's start
  if (cur.form === 'lydian' && !melting) rot[1] += interpolate(frame, [BEATS.lydianFlip, BEATS.lydianFlip + 26], [0, Math.PI * 2], {...clamp, easing: EASE.inOut});
  const pos: [number, number, number] = [...pose.pos];
  if (cur.form === 'bar' || (prev?.form === 'bar' && melting)) {
    pos[1] += interpolate(frame, [BEATS.barRise, BEATS.barRise + 40], [0, 0.5], {...clamp, easing: EASE.enter});
  }
  // The hook's first rise.
  const s = i === 0 ? 0.7 + 0.3 * rise : 1;
  if (i === 0) pos[1] -= (1 - Math.min(1, rise)) * 0.6;

  return {
    parts,
    pos,
    rot,
    scale: pose.scale * s,
    heat,
    drop,
    flash,
    opacity: (i === 0 ? interpolate(frame, [BEATS.heroRise, BEATS.heroRise + 12], [0, 1], clamp) : 1) * fade,
  };
};

/** Brightness boost for the bar after it breaks free in 1971. */
export const barGlow = (frame: number) => interpolate(frame, [BEATS.barRise, BEATS.barRise + 40], [0, 1], clamp);
