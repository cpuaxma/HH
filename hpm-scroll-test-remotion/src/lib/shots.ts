// The camera and the phone's pose as pure functions of (fractional) time.
// No state, no useFrame: the renderer samples this at sub-frame times for motion blur,
// the HTML overlays use it to point the callout leader lines at the post, and
// scripts/check-camera.ts checks it for jerks.
import * as THREE from 'three';
import {CamKey, PhonePose, SHOTS, Shot, T} from '../data';
import {EASES, clamp01, easeIn, easeInOutQuint, lerp, noise1, ramp} from './ease';
import {PHONE, SCREEN} from './layout';
import {HERO_CELL, heroTop} from './scroll';
import {POST, VIEW_TOP} from './layout';

const DEG = Math.PI / 180;

export const shotIndexAt = (t: number) => {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i].start) return i;
  return 0;
};

/** The range a motion-blur sample may come from: never across a hard cut. */
export const shotRange = (t: number): [number, number] => {
  const s = SHOTS[shotIndexAt(t)];
  return [s.start, s.end];
};

type Key = {focusPx: [number, number] | null; yaw: number; pitch: number; dist: number; fov: number; roll: number; frameY: number};
const toKey = (k: CamKey): Key => ({...k, focusPx: k.focus === 'center' ? null : k.focus});

const mixKey = (a: Key, b: Key, u: number): Key => ({
  // A focus on the screen blends in screen px; 'center' is the middle of the screen.
  focusPx:
    a.focusPx === null && b.focusPx === null
      ? null
      : [
          lerp(a.focusPx?.[0] ?? SCREEN.w / 2, b.focusPx?.[0] ?? SCREEN.w / 2, u),
          lerp(a.focusPx?.[1] ?? SCREEN.h / 2, b.focusPx?.[1] ?? SCREEN.h / 2, u),
        ],
  yaw: lerp(a.yaw, b.yaw, u),
  pitch: lerp(a.pitch, b.pitch, u),
  dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), u)),
  fov: lerp(a.fov, b.fov, u),
  roll: lerp(a.roll, b.roll, u),
  frameY: lerp(a.frameY, b.frameY, u),
});
const mixPose = (a: PhonePose, b: PhonePose, u: number): PhonePose => ({
  yaw: lerp(a.yaw, b.yaw, u),
  tilt: lerp(a.tilt, b.tilt, u),
  roll: lerp(a.roll, b.roll, u),
  y: lerp(a.y, b.y, u),
  x: lerp(a.x, b.x, u),
});

/** A shot's own move at time t (from → to over the whole shot). */
const shotMove = (s: Shot, t: number) => {
  const u = EASES[s.ease](clamp01((t - s.start) / (s.end - s.start)));
  return {cam: mixKey(toKey(s.from), toKey(s.to), u), pose: mixPose(s.phoneFrom, s.phoneTo, u)};
};

const baseAt = (t: number) => {
  const i = shotIndexAt(t);
  const s = SHOTS[i];
  const own = shotMove(s, t);
  if (!s.whipIn || i === 0) return own;
  // Whip: blend from where the previous shot ended into this shot's move.
  const prev = shotMove(SHOTS[i - 1], SHOTS[i - 1].end);
  const u = easeInOutQuint(clamp01((t - s.start) / s.whipIn));
  return {cam: mixKey(prev.cam, own.cam, u), pose: mixPose(prev.pose, own.pose, u)};
};

/** The stop: a decaying impact shake and a quick zoom punch. */
const impact = (t: number) => {
  const u = t - T.brake;
  const shakeEnv = u < 0 ? 0 : Math.exp(-u / 1.6) * clamp01(u / 0.5);
  const punch = u < 0 ? 0 : clamp01(u / 2.5) ** 0.7 * Math.exp(-Math.max(0, u - 2.5) / 16);
  return {
    shakeX: shakeEnv * noise1(t * 2.2, 1),
    shakeY: shakeEnv * noise1(t * 2.2, 2),
    punch,
  };
};

/** The phone's physical jolt at the stop: it rocks back and settles (damped). */
const jolt = (t: number) => {
  const u = t - T.brake;
  if (u <= 0) return 0;
  return Math.exp(-u / 9) * Math.sin(u * 0.32) * clamp01(u / 1.5);
};

export type PhoneState = {matrix: THREE.Matrix4; position: THREE.Vector3; quaternion: THREE.Quaternion};

export const phoneAt = (t: number): PhoneState => {
  const {pose} = baseAt(t);
  // A slow float.
  const bob = Math.sin((t / 210) * Math.PI * 2) * 0.03;
  const wobX = Math.sin((t / 260) * Math.PI * 2 + 1.3) * 0.6;
  const wobZ = Math.sin((t / 330) * Math.PI * 2 + 0.4) * 0.5;
  // End card: the phone glides up and away, accelerating.
  const off = ramp(t, T.phoneOff, T.phoneOff + 54, easeIn);
  const j = jolt(t);
  const position = new THREE.Vector3(pose.x + off * 1.1, pose.y + bob + off * 4.6, 0);
  const e = new THREE.Euler(
    (-(pose.tilt + wobX) + j * 3.2 - off * 10) * DEG,
    (pose.yaw + off * -16) * DEG,
    (pose.roll + wobZ - off * 14) * DEG,
    'YXZ',
  );
  const quaternion = new THREE.Quaternion().setFromEuler(e);
  const matrix = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
  return {matrix, position, quaternion};
};

/** A point on the screen (screen-texture px) in phone-local coordinates. */
export const screenLocal = (px: number, py: number) =>
  new THREE.Vector3((px / SCREEN.w - 0.5) * PHONE.screenW, (0.5 - py / SCREEN.h) * PHONE.screenH, PHONE.depth / 2 + 0.002);

/** A point on the hero post (hero-post px) in screen px, at time t (the hero scrolls). */
export const heroPointToScreen = (t: number, x: number, y: number): [number, number] => [x, VIEW_TOP + heroTop(t) + y];

export type CameraState = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  fov: number;
  /** NDC shift of the principal point, so the focus lands at frameY. */
  shiftY: number;
  focus: THREE.Vector3;
  dist: number;
};

const UP = new THREE.Vector3(0, 1, 0);

export const cameraAt = (t: number, phone = phoneAt(t)): CameraState => {
  const {cam} = baseAt(t);
  const focusLocal = cam.focusPx ? screenLocal(cam.focusPx[0], cam.focusPx[1]) : new THREE.Vector3(0, 0, 0);
  const focus = focusLocal.applyMatrix4(phone.matrix);
  // Drift: slow layered sines for a hand-held feel (tiny).
  const drift = (k: number) => (Math.sin(t / 97 + k) * 0.6 + Math.sin(t / 41 + 2 * k) * 0.3) * 0.5;
  const yaw = (cam.yaw + drift(0.3)) * DEG;
  const pitch = (cam.pitch + drift(1.7) * 0.6) * DEG;
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  const position = focus.clone().addScaledVector(dir, cam.dist);
  const m = new THREE.Matrix4().lookAt(position, focus, UP);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(m);
  const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (cam.roll + drift(4.1) * 0.5) * DEG);
  quaternion.multiply(roll);
  // Impact shake (in camera space) and zoom punch.
  const imp = impact(t);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);
  position.addScaledVector(right, imp.shakeX * 0.016 * cam.dist).addScaledVector(up, imp.shakeY * 0.016 * cam.dist);
  const fov = cam.fov * (1 - 0.075 * imp.punch);
  const shiftY = 1 - (2 * cam.frameY) / 1920;
  return {position, quaternion, fov, shiftY, focus, dist: cam.dist};
};

/** Builds a projection-ready camera for a state (used by the renderer and for projecting points). */
export const applyCamera = (c: THREE.PerspectiveCamera, s: CameraState, aspect: number, jitter: [number, number] = [0, 0], size: [number, number] = [1080, 1920]) => {
  c.fov = s.fov;
  c.aspect = aspect;
  c.near = 0.05;
  c.far = 80;
  c.position.copy(s.position);
  c.quaternion.copy(s.quaternion);
  c.updateProjectionMatrix();
  const e = c.projectionMatrix.elements;
  // Shift the principal point (y_ndc moves by −e[9]) and add the sub-pixel AA jitter.
  e[9] = -s.shiftY;
  e[8] += (2 * jitter[0]) / size[0];
  e[9] += (2 * jitter[1]) / size[1];
  c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
  c.updateMatrixWorld(true);
};

const tmpCam = new THREE.PerspectiveCamera();
/** Projects a world point to frame px (1080 × 1920) at time t. */
export const projectAt = (t: number, world: THREE.Vector3): [number, number] => {
  applyCamera(tmpCam, cameraAt(t), 1080 / 1920);
  const p = world.clone().project(tmpCam);
  return [(p.x * 0.5 + 0.5) * 1080, (0.5 - p.y * 0.5) * 1920];
};

/** Projects a hero-post point to frame px at time t. */
export const projectHeroPoint = (t: number, x: number, y: number): [number, number] => {
  const [sx, sy] = heroPointToScreen(t, x, y);
  return projectAt(t, screenLocal(sx, sy).applyMatrix4(phoneAt(t).matrix));
};

export {HERO_CELL, POST};
