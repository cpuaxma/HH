import {getInputProps} from 'remotion';
import {useCurrentFrame} from 'remotion';
import T from './timeline.json';
import {V3} from './lib/math';

export {T};
export const FPS = T.fps;
export const DURATION_FRAMES = T.fps * T.duration;

/**
 * Sub-frame offset (in frames) for this render pass. The final video averages
 * several passes rendered at offsets inside a 180-degree shutter, which gives
 * real motion blur. 0 in the studio.
 */
const SUB = Number((getInputProps() as {sub?: number}).sub ?? 0);

/** Current time in seconds, including the motion-blur sub-frame offset. */
export const useTime = () => (useCurrentFrame() + SUB) / FPS;

// ---- world layout ---------------------------------------------------------

export const FLOOR_Y = -22;
/** The phone floats at the origin, leaning back a little. */
export const PHONE = {w: 7.6, h: 15.8, d: 0.86, tilt: -0.16, corner: 1.15};
/** Screen-space (phone local) point where the chili touches the glass. */
export const IMPACT_LOCAL: V3 = [0.5, 2.8, PHONE.d / 2];
/** Phone-local centre of the Boost Post button. */
export const BUTTON_LOCAL: V3 = [0, -5.25, PHONE.d / 2 + 0.03];

const ct = Math.cos(PHONE.tilt);
const st = Math.sin(PHONE.tilt);
/** Phone local → world (ignores the tiny float bob, which is 0 at the impact). */
export const phoneToWorld = (p: V3): V3 => [p[0], p[1] * ct - p[2] * st, p[1] * st + p[2] * ct];
export const SCREEN_NORMAL: V3 = [0, -st, ct];
export const IMPACT_WORLD = phoneToWorld(IMPACT_LOCAL);

/** The funnel stands behind the phone. */
export const FUNNEL = {x: 0, z: -70, yTop: 14, yBot: -13, rTop: 7.6, rBot: 0.95, wall: 0.22};
/** Inner radius of the funnel profile at height y. */
export const funnelR = (y: number) => {
  const u = Math.min(1, Math.max(0, (y - FUNNEL.yBot) / (FUNNEL.yTop - FUNNEL.yBot)));
  return FUNNEL.rBot + (FUNNEL.rTop - FUNNEL.rBot) * Math.pow(u, 1.25);
};
export const TIERS: {top: number; bot: number}[] = [
  {top: 14, bot: 6.8},
  {top: 6.2, bot: -0.4},
  {top: -1.0, bot: -7.0},
  {top: -7.6, bot: -13},
];
export const COIN = {r: 1.38, h: 0.3};

/** Final resting place of the hero chili (scene 4) and the final camera. */
export const END_CAM: V3 = [12.2, -14.6, -53.2];
const END_DIST = 31;
const yaw = (20 * Math.PI) / 180;
const pitch = (5 * Math.PI) / 180;
export const CHILI_END: V3 = [
  END_CAM[0] + END_DIST * Math.sin(yaw) * Math.cos(pitch),
  END_CAM[1] + END_DIST * Math.sin(pitch),
  END_CAM[2] - END_DIST * Math.cos(yaw) * Math.cos(pitch),
];

// ---- slow motion ----------------------------------------------------------

/** Playback rate of the "simulation" clock (notes, embers, ash). */
const simRate = (t: number) => {
  if (t < T.slowStart) return 1;
  const u = Math.min(1, (t - T.slowStart) / (T.slowFull - T.slowStart));
  return 1 + (T.slowRate - 1) * (u * u * (3 - 2 * u));
};
const SIM_DT = 1 / 600;
const SIM_TABLE: number[] = (() => {
  const out = [0];
  let acc = 0;
  for (let i = 1; i <= T.duration * 600 + 600; i++) {
    const t = (i - 0.5) * SIM_DT;
    acc += simRate(t) * SIM_DT;
    out.push(acc);
  }
  return out;
})();
/** Simulation time for wall time t (slows to ~0.12x during the turn). */
export const simTime = (t: number) => {
  if (t <= 0) return t;
  const x = t / SIM_DT;
  const i = Math.floor(x);
  if (i >= SIM_TABLE.length - 1) return SIM_TABLE[SIM_TABLE.length - 1];
  return SIM_TABLE[i] + (SIM_TABLE[i + 1] - SIM_TABLE[i]) * (x - i);
};
