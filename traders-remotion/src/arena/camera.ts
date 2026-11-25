// One continuous camera for the whole film: spherical keyframes interpolated with a monotone cubic
// (C1-continuous: moves blend into each other, no cuts), plus a shake on every counter hit.
import * as THREE from 'three';
import {BEATS, type MechanismId, VIDEO} from '../config';
import {impulse} from '../lib/anim';
import {type Key, monotone} from '../lib/hermite';
import {PLAN} from './plan';

export const AZ_END = 1.1; // azimuth the arrow faces the camera from
export const ARROW_CENTER = new THREE.Vector3(0, 4.1, 0);

type Pose = {az: number; el: number; d: number; tx: number; ty: number; tz: number; fov: number; roll: number; oy: number};
type CamKey = {f: number} & Partial<Pose>;

const BASE: Pose = {az: 0, el: 0.88, d: 21.0, tx: 0, ty: 0, tz: 0, fov: 40, roll: 0.02, oy: 110};

/** Each trap's shot, keyed by mechanism. u = position inside the trap's window (0..1). */
const SHOTS: Record<MechanismId, ({u: number} & Partial<Pose>)[]> = {
  // Slow orbit.
  wander: [
    {u: 0.1, az: 0.05, el: 0.86, d: 21.3, tz: 0.4},
    {u: 0.92, az: 0.6, el: 0.8, d: 20.1, tz: 0.4},
  ],
  // Low dolly across the floor.
  crack: [
    {u: 0.1, az: 0.48, el: 0.52, d: 18.9, ty: 0.3, tz: 0.6, fov: 42, roll: -0.03},
    {u: 0.92, az: 0.28, el: 0.42, d: 15.6, ty: 0.3, tz: -0.2, fov: 42, roll: -0.05},
  ],
  // High crane over the lever band.
  lever: [
    {u: 0.1, az: 0.22, el: 1.0, d: 21.3, tx: 1.2, tz: -0.6, roll: 0.05},
    {u: 0.55, az: 0.1, el: 1.1, d: 22.2, tx: 1.6, tz: -0.8, roll: 0.06},
    {u: 0.92, az: -0.05, el: 1.18, d: 23.1, tx: 1.6, tz: -0.8, roll: 0.06},
  ],
  // Orbit the other way, tighter.
  chain: [
    {u: 0.1, az: -0.25, el: 0.8, d: 18.9, tx: 0.4, tz: 0.6},
    {u: 0.92, az: -0.8, el: 0.7, d: 17.7, tx: 0.4, tz: 0.4, roll: -0.04},
  ],
  // Behind the runners, then a fast push toward the peak.
  fomo: [
    {u: 0.1, az: -0.12, el: 0.66, d: 20.4, tx: 0.3, ty: 0.6, tz: -1.6, oy: 40},
    {u: 0.3, az: -0.08, el: 0.62, d: 19.5, tx: 0.3, ty: 0.7, tz: -2.2, oy: 40},
    {u: 0.6, az: 0.0, el: 0.52, d: 15.6, tx: 0.5, ty: 0.9, tz: -4.4, oy: 20, fov: 44},
    {u: 0.92, az: 0.04, el: 0.5, d: 14.8, tx: 0.5, ty: 0.9, tz: -4.6, oy: 20, fov: 44},
  ],
  // Drifting, slightly uneasy roll.
  rumor: [
    {u: 0.1, az: 0.3, el: 0.98, d: 21.3, roll: -0.05},
    {u: 0.92, az: 0.58, el: 0.92, d: 20.1, roll: -0.08},
  ],
};

const KEYS: CamKey[] = [
  // Hook: high, far and rotated, swooping in as the arena lights up.
  {f: 0, az: -0.95, el: 1.28, d: 46.5, roll: 0.14, fov: 36},
  {f: 30, az: -0.55, el: 1.06, d: 31.5, roll: 0.08},
  {f: 78, az: -0.12, el: 0.92, d: 23.1, roll: 0.03},
  // Setup: a slow, held push.
  {f: 146, az: 0, el: 0.88, d: 21.6},
  ...PLAN.traps.flatMap((t) => SHOTS[t.def.mechanism].map(({u, ...p}) => ({f: t.start + u * t.len, ...p}))),
  // Reveal: pull high above the arena.
  {f: 776, az: 0.72, el: 1.36, d: 29.2, tz: 0.2, roll: 0, oy: 60},
  {f: 836, az: 0.8, el: 1.4, d: 30.8, tz: 0.2, roll: 0, oy: 60},
  // Survivors: low and close as they rise into the light.
  {f: 886, az: 0.86, el: 0.4, d: 21.9, ty: 1.9, roll: 0.02, oy: 70},
  {f: 984, az: 1.04, el: 0.26, d: 21.0, ty: 2.6, roll: 0.0, oy: 80},
  // Arrow: square on.
  {f: BEATS.arrowLock, az: AZ_END, el: 0.05, d: 20.1, tx: ARROW_CENTER.x, ty: ARROW_CENTER.y, tz: ARROW_CENTER.z, roll: 0, oy: 140},
  {f: 1062, az: AZ_END + 0.02, el: 0.05, d: 21.0, tx: 0, ty: ARROW_CENTER.y, roll: 0, oy: 170},
  {f: VIDEO.durationInFrames, az: AZ_END + 0.07, el: 0.06, d: 22.5, tx: 0, ty: ARROW_CENTER.y, roll: 0, oy: 170},
];

// Missing channels fall back to BASE (so a shot never inherits another shot's target), then one curve per channel.
const filled = [...KEYS].sort((a, b) => a.f - b.f).map((k) => ({...BASE, ...k}) as Pose & {f: number});
const channel = (c: keyof Pose) => monotone(filled.map((k): Key => ({f: k.f, v: k[c]})));
const CH = {az: channel('az'), el: channel('el'), d: channel('d'), tx: channel('tx'), ty: channel('ty'), tz: channel('tz'), fov: channel('fov'), roll: channel('roll'), oy: channel('oy')};

/** Camera shake impulses: the counter slam and every trap's hit. */
export const SHAKES = [{at: BEATS.counterSlam, amp: 0.2}, ...PLAN.traps.map((t) => ({at: t.hit, amp: 0.13}))];

export const poseAt = (f: number) => {
  const p: Pose = {az: CH.az(f), el: CH.el(f), d: CH.d(f), tx: CH.tx(f), ty: CH.ty(f), tz: CH.tz(f), fov: CH.fov(f), roll: CH.roll(f), oy: CH.oy(f)};
  let sx = 0;
  let sy = 0;
  let sr = 0;
  for (const s of SHAKES) {
    const a = impulse(f, s.at, 16) * s.amp;
    if (!a) continue;
    const t = f - s.at;
    sx += a * Math.sin(t * 2.1 + 0.3);
    sy += a * Math.sin(t * 2.9 + 1.7);
    sr += a * 0.12 * Math.sin(t * 2.4 + 0.9);
  }
  return {...p, sx, sy, sr};
};

const tmpTarget = new THREE.Vector3();
const W = VIDEO.width;
const H = VIDEO.height;

/** Configure `cam` for (possibly fractional) frame f. */
export const applyCamera = (cam: THREE.PerspectiveCamera, f: number) => {
  const p = poseAt(f);
  const ce = Math.cos(p.el);
  tmpTarget.set(p.tx, p.ty, p.tz);
  cam.position.set(p.tx + p.d * ce * Math.sin(p.az), p.ty + p.d * Math.sin(p.el), p.tz + p.d * ce * Math.cos(p.az));
  cam.up.set(0, 1, 0);
  cam.lookAt(tmpTarget);
  cam.rotateZ(p.roll + p.sr);
  cam.translateX(p.sx);
  cam.translateY(p.sy);
  cam.fov = p.fov;
  cam.aspect = W / H;
  cam.near = 0.1;
  cam.far = 120;
  cam.setViewOffset(W, H, 0, p.oy, W, H);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  return cam;
};

const projCam = new THREE.PerspectiveCamera();
const v = new THREE.Vector3();
/** Screen position (px) of a world point at frame f — for DOM overlays that track 3D things. */
export const project = (f: number, x: number, y: number, z: number) => {
  applyCamera(projCam, f);
  v.set(x, y, z).project(projCam);
  return {x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, behind: v.z > 1};
};
