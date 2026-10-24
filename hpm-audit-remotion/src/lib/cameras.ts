import {Easing} from 'remotion';
import {T} from '../timeline';
import {EASE_IN, EASE_IN_OUT, EASE_OUT} from '../theme';
import {deg, drift, kick, progress} from './anim';
import {FlatCam, lerpPose, Pose, poseAt, poseFromFlat} from './projection';
import {LAYOUT} from '../components/Profile';
import {REEL_TILE, TILE} from '../components/Tiles';

// ── Flat camera (profile px → frame px) ──────────────────────────────────────
// Keyframes; each segment eases with the curve on its *target* key.
type Key = {f: number; cam: FlatCam; ease?: (t: number) => number};

export const HANDOFF_IN: FlatCam = {s: 1, fx: 540, fy: 1170};
export const HANDOFF_OUT: FlatCam = {s: 0.62, fx: 540, fy: 1170};
export const BIO_CAM: FlatCam = {s: 1.0, fx: 524, fy: 616}; // bio left edge at x 64
export const GRID_CAM: FlatCam = {s: 0.8, fx: 600, fy: 1575};
const reel = LAYOUT.tile(REEL_TILE);
export const REEL_FOCUS = {fx: reel.x + TILE / 2, fy: reel.y + TILE / 2};
const OVERSHOOT = Easing.bezier(0.3, 1.35, 0.5, 1);

const KEYS: Key[] = [
  {f: T.dive, cam: HANDOFF_IN},
  {f: T.bioWhipEnd, cam: BIO_CAM, ease: Easing.out(Easing.quad)},
  {f: T.bioCard, cam: {s: 1.03, fx: 510, fy: 618}, ease: EASE_IN_OUT},
  {f: T.bioCheck, cam: {s: 1.06, fx: 498, fy: 622}, ease: EASE_IN_OUT},
  {f: T.bioContext, cam: {s: 1.07, fx: 495, fy: 636}, ease: EASE_IN_OUT},
  {f: T.bioContext + 26, cam: {s: 0.95, fx: 540, fy: 720}, ease: EASE_OUT},
  {f: T.gridWhip[0], cam: {s: 0.95, fx: 540, fy: 680}, ease: EASE_IN_OUT},
  {f: T.gridWhip[1], cam: {s: 0.8, fx: 600, fy: 1610}, ease: EASE_IN},
  {f: T.gridWhip[1] + 12, cam: GRID_CAM, ease: EASE_OUT},
  {f: T.scatter, cam: {s: 0.82, fx: 600, fy: 1585}, ease: EASE_IN_OUT},
  {f: T.scatter + 25, cam: {s: 0.72, fx: 600, fy: 1590}, ease: EASE_OUT},
  {f: T.snap, cam: {s: 0.82, fx: 600, fy: 1585}, ease: EASE_IN},
  {f: T.gridCheck, cam: {s: 0.82, fx: 600, fy: 1580}, ease: EASE_IN_OUT},
  {f: T.zoomThrough[0] + 6, cam: {s: 1.15, ...REEL_FOCUS}, ease: EASE_IN_OUT},
  {f: T.zoomThrough[1], cam: {s: 2.6, ...REEL_FOCUS}, ease: EASE_IN},
  {f: T.reelShrink[0], cam: {s: 2.6, ...REEL_FOCUS}},
  {f: T.reelShrink[1], cam: GRID_CAM, ease: EASE_OUT},
  {f: T.pullOut, cam: HANDOFF_OUT, ease: Easing.in(Easing.quad)},
];

export const flatCam = (frame: number): FlatCam => {
  let i = 0;
  while (i < KEYS.length - 1 && frame >= KEYS[i + 1].f) i++;
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const t = b.f === a.f ? 1 : Math.max(0, Math.min(1, (frame - a.f) / (b.f - a.f)));
  const e = (b.ease ?? ((x: number) => x))(t);
  // Handheld drift, faded to zero at the 3D hand-offs so those cuts stay pixel-exact.
  const w = Math.max(0, Math.min(1, (frame - T.dive) / 24, (T.pullOut - frame) / 24, Math.abs(frame - T.zoomThrough[1]) / 18));
  const s = a.cam.s + (b.cam.s - a.cam.s) * e;
  return {
    s,
    fx: a.cam.fx + (b.cam.fx - a.cam.fx) * e + (drift(frame, 1.3, 6) * w) / s,
    fy: a.cam.fy + (b.cam.fy - a.cam.fy) * e + (drift(frame, 4.1, 5) * w) / s,
  };
};

export const camTransform = (c: FlatCam) => `translate(${540 - c.fx * c.s}px, ${960 - c.fy * c.s}px) scale(${c.s})`;
export const camPoint = (c: FlatCam, x: number, y: number) => [(x - c.fx) * c.s + 540, (y - c.fy) * c.s + 960] as const;

// ── Pour clock for the reel (and its grid thumbnail) ────────────────────────
export const reelTime = (frame: number) => {
  const start = 40;
  if (frame < T.zoomThrough[1]) return start;
  if (frame < T.freeze) return start + (frame - T.zoomThrough[1]);
  const frozen = start + (T.freeze - T.zoomThrough[1]);
  if (frame < T.colorSnap) return frozen;
  return frozen + (frame - T.colorSnap);
};

// ── 3D: HOOK ────────────────────────────────────────────────────────────────
const REST_DIST = 8.5;
const hookRest = (f: number): Pose => {
  const base = poseAt(540, 1150, REST_DIST);
  const u = Math.max(0, f - T.hookLand);
  return {
    ...base,
    y: base.y + 0.03 * Math.sin(f / 35) - 0.07 * kick(f, T.hookLand),
    z: base.z + u * 0.0025,
    rx: deg(5 + 2 * Math.sin(f / 55)),
    ry: deg(-15 + 5 * Math.sin(u / 40)),
    rz: deg(-3 + 1.2 * Math.sin(f / 70) + 2.5 * kick(f, T.hookLand)),
  };
};

export const hookPose = (f: number): Pose => {
  const start: Pose = {x: 2.6, y: 2.4, z: poseAt(540, 1150, REST_DIST).z - 3, rx: deg(28), ry: deg(-15 - 420), rz: deg(-32)};
  const p = progress(f, -3, T.hookLand + 3, Easing.out(Easing.cubic));
  const pose = lerpPose(start, hookRest(f), p);
  const dive = progress(f, T.diveStart, T.dive - T.diveStart, Easing.in(Easing.quad));
  return lerpPose(pose, poseFromFlat(HANDOFF_IN), dive);
};

// ── 3D: BEFORE / AFTER ──────────────────────────────────────────────────────
const resultRest = (f: number): Pose => {
  const base = poseAt(540, 1150, REST_DIST);
  const u = f - T.pullOut;
  const spin = progress(f, T.spin[0], T.spin[1] - T.spin[0], EASE_IN_OUT);
  return {
    ...base,
    y: base.y + 0.03 * Math.sin(f / 33) - 0.07 * kick(f, T.spin[1]) - 0.05 * kick(f, T.landBack),
    rx: deg(5 + 2 * Math.sin(f / 50)),
    ry: deg(-12 + 6 * Math.sin(u / 45)) + spin * Math.PI * 2,
    rz: deg(-2 + 2 * kick(f, T.spin[1])),
  };
};

const SPLIT_DIST = 11;
const orbit2 = (f: number) => deg(4 * Math.sin((f - T.split[0]) / 50));

export const afterPose = (f: number): Pose => {
  const pull = progress(f, T.pullOut, T.landBack - T.pullOut, Easing.out(Easing.quad));
  let pose = lerpPose(poseFromFlat(HANDOFF_OUT), resultRest(f), pull);
  const split = progress(f, T.split[0], T.split[1] - T.split[0], EASE_OUT);
  if (split > 0) {
    const target = poseAt(742, 1130, SPLIT_DIST, {rx: deg(4 + 1.5 * Math.sin(f / 40)), ry: deg(-20) + orbit2(f), rz: deg(1)});
    pose = lerpPose(pose, {...target, ry: target.ry + Math.PI * 2}, split);
  }
  return pose;
};

export const beforePose = (f: number): Pose => {
  const p = progress(f, T.split[0], T.split[1] - T.split[0], EASE_OUT);
  const target = poseAt(338, 1130, SPLIT_DIST, {rx: deg(4 + 1.5 * Math.sin(f / 37)), ry: deg(20) + orbit2(f), rz: deg(-1)});
  const start = poseAt(-520, 1060, SPLIT_DIST, {rx: deg(10), ry: deg(70), rz: deg(-12)});
  const pose = lerpPose(start, target, p);
  return {...pose, y: pose.y - 0.06 * kick(f, T.split[1] - 4)};
};
