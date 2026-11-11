// The glowing spheres: poured into the funnel top, spiralling down its inner wall like
// a liquid, through each tier, and out of the spout.
import {FUNNEL, T, funnelR} from '../timeline';
import {makeRandom} from './math';

export const SPHERES = 120;
export const FLOW = {yIn: 13.2, yOut: -12.9, dropFrom: 34, dropTime: 0.62, speed: 14.0, tangential: 11.5};
const DY = 0.05;

/** Accumulated swirl angle as a function of height (shared by every sphere). */
const THETA: number[] = (() => {
  const out = [0];
  let th = 0;
  const vy = FLOW.speed;
  for (let y = FLOW.yIn; y > FLOW.yOut - 1; y -= DY) {
    const r = Math.max(0.4, funnelR(y) - 0.55);
    th += (FLOW.tangential / r) * (DY / vy);
    out.push(th);
  }
  return out;
})();
const thetaAt = (y: number) => {
  const x = (FLOW.yIn - y) / DY;
  const i = Math.max(0, Math.min(THETA.length - 2, Math.floor(x)));
  return THETA[i] + (THETA[i + 1] - THETA[i]) * (x - i);
};

export type Sphere = {release: number; theta0: number; inset: number; size: number; jitterY: number; warm: number};
export const SPHERE_DEFS: Sphere[] = (() => {
  const rnd = makeRandom(5);
  return Array.from({length: SPHERES}, (_, j) => ({
    release: T.pourStart + (j / SPHERES) * T.pourDur + rnd.range(-0.006, 0.006),
    theta0: 0.6 + rnd.range(-0.18, 0.18),
    inset: rnd.range(0, 0.45),
    size: rnd.range(0.2, 0.34),
    jitterY: rnd.range(-0.25, 0.25),
    warm: rnd.next(),
  }));
})();

/** Time the stream's lead reaches the funnel and the spout. */
export const LEAD_IN = T.pourStart + FLOW.dropTime;
export const LEAD_OUT = LEAD_IN + (FLOW.yIn - FLOW.yOut) / FLOW.speed;

export type SphereState = {visible: boolean; x: number; y: number; z: number; scale: number};

export const sphereAt = (j: number, t: number): SphereState => {
  const s = SPHERE_DEFS[j];
  const a = t - s.release;
  const hidden = {visible: false, x: 0, y: 0, z: 0, scale: 0};
  if (a < 0) return hidden;
  const rIn = funnelR(FLOW.yIn) - 0.9 - s.inset;
  if (a < FLOW.dropTime) {
    // Falling in a tight stream into the funnel mouth, accelerating.
    const u = a / FLOW.dropTime;
    const y = FLOW.dropFrom + (FLOW.yIn - FLOW.dropFrom) * (0.45 * u + 0.55 * u * u);
    const r = rIn * (0.82 + 0.18 * u);
    return {visible: true, x: FUNNEL.x + r * Math.cos(s.theta0), y, z: FUNNEL.z + r * Math.sin(s.theta0), scale: s.size};
  }
  const b = a - FLOW.dropTime;
  const y = FLOW.yIn - b * FLOW.speed + s.jitterY;
  if (y < FLOW.yOut - 0.7) return hidden;
  const wall = funnelR(Math.max(FLOW.yOut, y));
  const r = Math.max(0.12, wall - FUNNEL.wall - s.size - 0.05 - s.inset * Math.min(1, wall / 4));
  const th = s.theta0 + thetaAt(y);
  // Squeeze into the spout and vanish into the outlet glow.
  const exit = Math.max(0, Math.min(1, (FLOW.yOut - y) / 0.7));
  const scale = s.size * Math.min(1, (wall - FUNNEL.wall) / (s.size * 2.6)) * (1 - exit);
  return {visible: true, x: FUNNEL.x + r * (1 - exit) * Math.cos(th), y, z: FUNNEL.z + r * (1 - exit) * Math.sin(th), scale};
};

/** Height of the stream's lead at time t (the camera follows it). */
export const leadY = (t: number) => FLOW.yIn - Math.max(0, t - LEAD_IN) * FLOW.speed;
