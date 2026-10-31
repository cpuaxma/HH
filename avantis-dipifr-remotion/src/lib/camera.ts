import * as THREE from 'three';
import {FOCUS_Y, HUBS, TIMING} from '../data';
import {R, V3, add, cross, dot, lonLat, norm, northAt, routePoint, scale, slerp, sub} from './geo';
import {easeInOut, hopAt, journeyS, lerp, ramp} from './timeline';

const DEG = Math.PI / 180;
export const W = 1080;
export const H = 1920;

/**
 * Camera framing. The camera hovers over an "anchor" point on the globe, looks at
 * a target between the globe's centre (k = 0) and that surface point (k = 1),
 * from `dist` away, tilted `tilt` degrees towards the south so the globe's
 * northern edge curves away at the top of the frame.
 */
export const CAMERA = {
  fov: 30,
  hook: {dist: 1050, tilt: 0, k: 0, lonDrift: 4},
  global: {dist: 860, tilt: 12, k: 0.15, lon: [-45, 92], lat: [36, 14]},
  course: {dist: 300, tilt: 42, k: 1, hop: 1.0},
  benefits: {dist: 1200, tilt: 9, k: 0, lon: [-52, -28], lat: [34, 38]},
  /** Gaussian smoothing of every camera track, in frames. */
  smooth: 9,
};

type Track = {anchor: V3; k: number; logDist: number; tilt: number; focusY: number};

const blend = (a: Track, b: Track, t: number): Track =>
  t <= 0
    ? a
    : t >= 1
      ? b
      : {
          anchor: slerp(a.anchor, b.anchor, t),
          k: lerp(a.k, b.k, t),
          logDist: lerp(a.logDist, b.logDist, t),
          tilt: lerp(a.tilt, b.tilt, t),
          focusY: lerp(a.focusY, b.focusY, t),
        };

const unit = (lon: number, lat: number) => norm(lonLat(lon, lat));

/** The unsmoothed camera plan: one shot per scene, blended with eased weights. */
const rawTrack = (f: number): Track => {
  const C = CAMERA;
  const ny = HUBS[0];
  const hook: Track = {
    anchor: unit(ny.lon + C.hook.lonDrift * ramp(f, 0, 300, (t) => t), ny.lat),
    k: C.hook.k,
    logDist: Math.log(C.hook.dist),
    tilt: C.hook.tilt * DEG,
    focusY: FOCUS_Y.hook,
  };
  const gp = ramp(f, 190, 505, easeInOut);
  const global: Track = {
    anchor: unit(lerp(C.global.lon[0], C.global.lon[1], gp), lerp(C.global.lat[0], C.global.lat[1], gp)),
    k: C.global.k,
    logDist: Math.log(C.global.dist),
    tilt: C.global.tilt * DEG,
    focusY: FOCUS_Y.global,
  };
  const course: Track = {
    anchor: norm(routePoint(journeyS(f))),
    k: C.course.k,
    logDist: Math.log(C.course.dist * (1 + C.course.hop * hopAt(f))),
    tilt: C.course.tilt * DEG,
    focusY: FOCUS_Y.course,
  };
  const bp = ramp(f, TIMING.pullOutStart, TIMING.durationInFrames, (t) => t);
  const benefits: Track = {
    anchor: unit(lerp(C.benefits.lon[0], C.benefits.lon[1], bp), lerp(C.benefits.lat[0], C.benefits.lat[1], bp)),
    k: C.benefits.k,
    logDist: Math.log(C.benefits.dist),
    tilt: C.benefits.tilt * DEG,
    focusY: FOCUS_Y.benefits,
  };
  let t = blend(hook, global, ramp(f, 150, 275));
  t = blend(t, course, ramp(f, TIMING.diveStart, TIMING.diveEnd));
  t = blend(t, benefits, ramp(f, TIMING.pullOutStart, TIMING.pullOutEnd));
  return t;
};

// Every track is precomputed for the whole reel and smoothed over time, so no
// blend or stop can ever produce a sudden turn.
const PAD = 60;
let tracks: Track[] | null = null;

const getTracks = () => {
  if (tracks) return tracks;
  const n = TIMING.durationInFrames + PAD * 2;
  const raw = Array.from({length: n}, (_, i) => rawTrack(i - PAD));
  const sigma = CAMERA.smooth;
  const Rk = Math.ceil(sigma * 3);
  const weights = Array.from({length: Rk * 2 + 1}, (_, k) => Math.exp(-((k - Rk) ** 2) / (2 * sigma * sigma)));
  tracks = raw.map((_, i) => {
    let ax = 0;
    let ay = 0;
    let az = 0;
    let k = 0;
    let ld = 0;
    let tl = 0;
    let fy = 0;
    let ws = 0;
    for (let j = -Rk; j <= Rk; j++) {
      const r = raw[Math.max(0, Math.min(n - 1, i + j))];
      const w = weights[j + Rk];
      ax += r.anchor[0] * w;
      ay += r.anchor[1] * w;
      az += r.anchor[2] * w;
      k += r.k * w;
      ld += r.logDist * w;
      tl += r.tilt * w;
      fy += r.focusY * w;
      ws += w;
    }
    return {anchor: norm([ax, ay, az]), k: k / ws, logDist: ld / ws, tilt: tl / ws, focusY: fy / ws};
  });
  return tracks;
};

const trackAt = (f: number): Track => {
  const t = getTracks();
  const x = Math.max(0, Math.min(t.length - 1, f + PAD));
  const i = Math.min(t.length - 2, Math.floor(x));
  return blend(t[i], t[i + 1], x - i);
};

export type CameraState = {
  position: V3;
  /** Quaternion [x, y, z, w]. */
  quaternion: [number, number, number, number];
  target: V3;
  /** Distance from the camera to its target. */
  dist: number;
  fov: number;
  focusY: number;
  /** 0..1 depth-of-field strength (close-ups only). */
  dof: number;
  /** Screen pixels per world unit on the globe's surface under the camera. */
  surfacePx: number;
};

const wave = (f: number, period: number, phase: number) => Math.sin((2 * Math.PI * f) / period + phase);

export const computeCamera = (f: number): CameraState => {
  const t = trackAt(f);
  let n = t.anchor;
  // Hand-held drift: slow, layered sines nudging the anchor and the roll.
  const east = norm(cross([0, 1, 0], n));
  const north = northAt(n);
  const sway = 0.0035 * Math.exp(t.logDist) / 300;
  n = norm(
    add(
      n,
      add(scale(east, sway * (0.7 * wave(f, 287, 0.3) + 0.4 * wave(f, 173, 1.1))), scale(north, sway * (0.7 * wave(f, 311, 2.2) + 0.4 * wave(f, 197, 0.4)))),
    ),
  );
  const tilt = t.tilt + 0.25 * DEG * wave(f, 241, 2.0);
  const roll = 0.3 * DEG * wave(f, 199, 0.7) + 0.15 * DEG * wave(f, 331, 1.9);

  const dist = Math.exp(t.logDist);
  const target = scale(n, R * t.k);
  const nN = northAt(n);
  const back = norm(sub(scale(n, Math.cos(tilt)), scale(nN, Math.sin(tilt))));
  const up0 = norm(add(scale(nN, Math.cos(tilt)), scale(n, Math.sin(tilt))));
  const position = add(target, scale(back, dist));
  // Camera basis: +z points back at the viewer, +y up the screen (north), rolled slightly.
  const z = back;
  const x0 = norm(cross(up0, z));
  const y0 = cross(z, x0);
  const x = add(scale(x0, Math.cos(roll)), scale(y0, Math.sin(roll)));
  const y = cross(z, x);
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z));
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  return {
    position,
    quaternion: [q.x, q.y, q.z, q.w],
    target,
    dist,
    fov: CAMERA.fov,
    focusY: t.focusY,
    dof: t.k > 0.5 ? ramp(t.k, 0.5, 1) : 0,
    surfacePx: H / 2 / (Math.tan((CAMERA.fov * DEG) / 2) * (dist - R * (1 - t.k))),
  };
};

/** A three.js camera matching computeCamera(f), with the target placed at (540, focusY). */
export const applyCamera = (c: THREE.PerspectiveCamera, cam: CameraState, width = W, height = H) => {
  c.fov = cam.fov;
  c.aspect = width / height;
  c.near = Math.max(0.5, cam.dist * 0.03);
  c.far = cam.dist + R * 4;
  c.position.set(...cam.position);
  c.quaternion.set(...cam.quaternion);
  const sy = height / H;
  c.setViewOffset(width, height, 0, height / 2 - cam.focusY * sy, width, height);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
};

const projCam = new THREE.PerspectiveCamera();
let projFrame = NaN;
let projState: CameraState | null = null;

export const cameraAt = (f: number) => {
  if (f !== projFrame || !projState) {
    projState = computeCamera(f);
    applyCamera(projCam, projState);
    projFrame = f;
  }
  return projState;
};

/**
 * Screen position (1080×1920 px) of a world point at frame f, its depth, how
 * many pixels one world unit covers there, and how much it faces the camera
 * (for points on the globe: 1 facing, ≤ 0 on the far side).
 */
export const project = (f: number, p: V3) => {
  const cam = cameraAt(f);
  const v = new THREE.Vector3(...p).project(projCam);
  const view = new THREE.Vector3(...p).applyMatrix4(projCam.matrixWorldInverse);
  const depth = -view.z;
  const pxPerUnit = H / 2 / (Math.tan((cam.fov * DEG) / 2) * Math.max(1e-3, depth));
  const toCam = norm(sub(cam.position, p));
  return {
    x: (v.x * 0.5 + 0.5) * W,
    y: (-v.y * 0.5 + 0.5) * H,
    depth,
    pxPerUnit,
    facing: dot(norm(p), toCam),
  };
};
