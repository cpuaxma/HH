import {BUSINESSES, TIMING, arrivalFrame, departFrame} from '../data';
import {getCity} from './city';
import {getRoute, routeDirection, routePoint} from './route';
import {closeUpWeights, easeInOut, easeOut, finaleProgress, headS, hopAt, ramp} from './timeline';

const DEG = Math.PI / 180;

/** Camera framing. Distances are in map units from the look-at target. */
export const CAMERA = {
  fov: 46,
  chase: {pitch: 55, dist: 300},
  closeUp: {pitch: 42, dist: 205},
  /** Orbit around each pin during the close-up, degrees. */
  orbit: {from: -10, to: 5},
  hook: {pitch: 89.5, dist: 1400},
  finale: {pitch: 89.5, dist: 1560, creep: 0.04},
  /** Extra height mid-hop between stops (fraction of distance). */
  hop: 0.4,
  /** Maximum bank on turns, degrees. */
  maxBank: 4,
};

export type CameraState = {
  position: [number, number, number];
  /** Euler angles, order YXZ. */
  rotation: [number, number, number];
  target: [number, number, number];
  dist: number;
  fov: number;
  /** 0..1 depth-of-field strength. */
  dof: number;
  fogNear: number;
  fogFar: number;
};

const yawOf = (d: {x: number; z: number}) => Math.atan2(-d.x, -d.z);

// Travel heading per frame, unwrapped, then smoothed over time so turns
// become gentle pans instead of whip-pans.
const PAD = 90;
let smoothYaw: Float64Array | null = null;

const getSmoothYaw = () => {
  if (smoothYaw) return smoothYaw;
  const n = TIMING.durationInFrames + PAD * 2;
  const raw = new Float64Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const f = i - PAD;
    let y = yawOf(routeDirection(headS(f), 5));
    if (i > 0) {
      while (y - prev > Math.PI) y -= Math.PI * 2;
      while (y - prev < -Math.PI) y += Math.PI * 2;
    }
    raw[i] = y;
    prev = y;
  }
  const sigma = 13;
  const R = 40;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let wsum = 0;
    for (let k = -R; k <= R; k++) {
      const j = Math.max(0, Math.min(n - 1, i + k));
      const w = Math.exp(-(k * k) / (2 * sigma * sigma));
      sum += raw[j] * w;
      wsum += w;
    }
    out[i] = sum / wsum;
  }
  smoothYaw = out;
  return out;
};

// The chase target follows the route head, smoothed over time so tight corners
// taken at speed become curves instead of kinks.
let smoothHead: {x: Float64Array; z: Float64Array} | null = null;

const getSmoothHead = () => {
  if (smoothHead) return smoothHead;
  const n = TIMING.durationInFrames + PAD * 2;
  const rx = new Float64Array(n);
  const rz = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = routePoint(headS(i - PAD));
    rx[i] = p.x;
    rz[i] = p.z;
  }
  const sigma = 8;
  const R = 24;
  const x = new Float64Array(n);
  const z = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sx = 0;
    let sz = 0;
    let ws = 0;
    for (let k = -R; k <= R; k++) {
      const j = Math.max(0, Math.min(n - 1, i + k));
      const w = Math.exp(-(k * k) / (2 * sigma * sigma));
      sx += rx[j] * w;
      sz += rz[j] * w;
      ws += w;
    }
    x[i] = sx / ws;
    z[i] = sz / ws;
  }
  smoothHead = {x, z};
  return smoothHead;
};

const headAt = (f: number) => {
  const h = getSmoothHead();
  const i = Math.max(0, Math.min(h.x.length - 1, Math.round(f) + PAD));
  return {x: h.x[i], z: h.z[i]};
};

const yawAt = (f: number) => {
  const y = getSmoothYaw();
  const x = Math.max(0, Math.min(y.length - 1, f + PAD));
  const i = Math.min(y.length - 2, Math.floor(x));
  return y[i] + (y[i + 1] - y[i]) * (x - i);
};

/** Where each close-up looks: the featured building, a little below its roof. */
export const stopFocus = (i: number) => {
  const r = getCity().featured[i].roof;
  return {x: r.x, y: r.y * 0.62, z: r.z};
};

/** Centre of the finale's top-down view: the middle of the whole route. */
export const finaleCenter = () => {
  const {xs, zs} = getRoute();
  let x0 = Infinity;
  let x1 = -Infinity;
  let z0 = Infinity;
  let z1 = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    x0 = Math.min(x0, xs[i]);
    x1 = Math.max(x1, xs[i]);
    z0 = Math.min(z0, zs[i]);
    z1 = Math.max(z1, zs[i]);
  }
  return {x: (x0 + x1) / 2 - 30, z: (z0 + z1) / 2 - 60};
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const logLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));
const wave = (f: number, period: number, phase: number) => Math.sin((2 * Math.PI * f) / period + phase);

export const computeCamera = (f: number): CameraState => {
  const head = headAt(f);
  const weights = closeUpWeights(f);
  const w = Math.min(1, weights.reduce((a, b) => a + b, 0));

  // Chase → close-up.
  let tx = head.x;
  let ty = 0;
  let tz = head.z;
  let yaw = yawAt(f);
  weights.forEach((wi, i) => {
    if (wi <= 0) return;
    const focus = stopFocus(i);
    tx += (focus.x - head.x) * wi;
    ty += focus.y * wi;
    tz += (focus.z - head.z) * wi;
    const orbitT = ramp(f, arrivalFrame(i) - 34, departFrame(i) + 30, easeInOut);
    yaw += wi * lerp(CAMERA.orbit.from, CAMERA.orbit.to, orbitT) * DEG;
  });
  let pitch = lerp(CAMERA.chase.pitch, CAMERA.closeUp.pitch, w) * DEG;
  // Rise a little mid-hop, so the ground doesn't race past the lens.
  let dist = lerp(CAMERA.chase.dist, CAMERA.closeUp.dist, w) * (1 + CAMERA.hop * hopAt(f));

  // Bank into turns while travelling.
  const turnRate = yawAt(f + 1) - yawAt(f - 1);
  let roll = Math.max(-CAMERA.maxBank * DEG, Math.min(CAMERA.maxBank * DEG, turnRate * 0.9)) * (1 - w);

  // Dive from high above at the end of the hook.
  const diveDist = ramp(f, TIMING.hookEnd, TIMING.diveEnd, easeInOut);
  const divePitch = ramp(f, TIMING.hookEnd + 35, TIMING.diveEnd, easeInOut);
  dist = logLerp(CAMERA.hook.dist, dist, diveDist);
  pitch = lerp(CAMERA.hook.pitch * DEG, pitch, divePitch);

  // Finale: pull far up into a north-up top-down view.
  const fp = finaleProgress(f);
  if (fp > 0) {
    const c = finaleCenter();
    tx = lerp(tx, c.x, fp);
    ty = lerp(ty, 0, fp);
    tz = lerp(tz, c.z, fp);
    let goal = 0;
    while (goal - yaw > Math.PI) goal -= Math.PI * 2;
    while (goal - yaw < -Math.PI) goal += Math.PI * 2;
    yaw = lerp(yaw, goal, fp);
    pitch = lerp(pitch, CAMERA.finale.pitch * DEG, ramp(f, TIMING.finaleStart, TIMING.finaleSettled - 15, easeInOut));
    const creep = 1 + CAMERA.finale.creep * ramp(f, TIMING.finaleSettled - 30, TIMING.durationInFrames, easeOut);
    dist = logLerp(dist, CAMERA.finale.dist * creep, fp);
    roll *= 1 - fp;
  }

  // Hand-held drift: slow, layered sines, scaled with distance so it reads the same on screen.
  const sway = dist * 0.0055;
  tx += sway * (0.7 * wave(f, 287, 0.3) + 0.4 * wave(f, 173, 1.1));
  tz += sway * (0.7 * wave(f, 311, 2.2) + 0.4 * wave(f, 197, 0.4));
  yaw += 0.35 * DEG * wave(f, 331, 0.4);
  pitch += 0.3 * DEG * wave(f, 241, 2.0) * (1 - fp);
  roll += 0.25 * DEG * wave(f, 199, 0.7);

  const cp = Math.cos(pitch);
  const fx = -Math.sin(yaw) * cp;
  const fy = -Math.sin(pitch);
  const fz = -Math.cos(yaw) * cp;

  const fogNear = dist * 0.9 + 170;
  const fogFar = dist * 1.45 + 720;

  return {
    position: [tx - fx * dist, ty - fy * dist, tz - fz * dist],
    rotation: [-pitch, yaw, roll],
    target: [tx, ty, tz],
    dist,
    fov: CAMERA.fov,
    dof: w * (1 - fp),
    fogNear,
    fogFar,
  };
};

export const STOP_COUNT = BUSINESSES.length;
