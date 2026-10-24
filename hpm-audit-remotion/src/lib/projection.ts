import {Euler, Matrix4, PerspectiveCamera, Quaternion, Vector3} from 'three';
import {HEIGHT, WIDTH} from '../theme';

// One fixed camera for the whole film. "Camera moves" are applied to the phone instead, so the
// R3F scene and the DOM screen overlay share exactly the same math.
export const CAM_Z = 10;
export const FOV = 30;
const ASPECT = WIDTH / HEIGHT;
const TAN = Math.tan((FOV / 2) * (Math.PI / 180));

// Phone in world units. The screen is 1080×2340 profile px, so 1 world unit = 1161 px on the glass.
export const PHONE = {w: 1.0, h: 2.085, d: 0.09, r: 0.14, screenW: 0.93, screenH: 0.93 * (2340 / 1080), screenR: 0.11};
export const SCREEN = {w: 1080, h: 2340};
export const PX_PER_UNIT = SCREEN.w / PHONE.screenW;
export const BEZEL_PX = ((PHONE.w - PHONE.screenW) / 2) * PX_PER_UNIT;
export const BODY_R_PX = PHONE.r * PX_PER_UNIT;
export const SCREEN_R_PX = PHONE.screenR * PX_PER_UNIT;
const FRONT_Z = PHONE.d / 2 + 0.002;

export type Pose = {x: number; y: number; z: number; rx: number; ry: number; rz: number};

const camera = new PerspectiveCamera(FOV, ASPECT, 0.05, 100);
camera.position.set(0, 0, CAM_Z);
camera.updateMatrixWorld();
camera.updateProjectionMatrix();

export const poseQuaternion = (p: Pose) => new Quaternion().setFromEuler(new Euler(p.rx, p.ry, p.rz, 'YXZ'));

export const poseMatrix = (p: Pose) =>
  new Matrix4().compose(new Vector3(p.x, p.y, p.z), poseQuaternion(p), new Vector3(1, 1, 1));

export const toPx = (v: Vector3) => [((v.x + 1) / 2) * WIDTH, ((1 - v.y) / 2) * HEIGHT] as const;

export const projectLocal = (p: Pose, local: [number, number, number]) => {
  const v = new Vector3(...local).applyMatrix4(poseMatrix(p)).project(camera);
  return toPx(v);
};

// Visible world width / height at a distance from the camera.
const visibleH = (dist: number) => 2 * dist * TAN;
const visibleW = (dist: number) => visibleH(dist) * ASPECT;

// A flat-camera framing: profile point (fx, fy) sits at frame centre, scaled by s.
export type FlatCam = {s: number; fx: number; fy: number};

// The 3D pose whose screen projects exactly onto a flat-camera framing (phone facing the lens).
// Used at both 3D↔flat hand-offs so the cut is seamless.
export const poseFromFlat = (cam: FlatCam): Pose => {
  const dist = PHONE.screenW / (cam.s * visibleW(1));
  // Screen centre in frame px
  const cx = (SCREEN.w / 2 - cam.fx) * cam.s + WIDTH / 2;
  const cy = (SCREEN.h / 2 - cam.fy) * cam.s + HEIGHT / 2;
  return {
    x: ((cx - WIDTH / 2) / WIDTH) * visibleW(dist),
    y: (-(cy - HEIGHT / 2) / HEIGHT) * visibleH(dist),
    z: CAM_Z - dist - FRONT_Z,
    rx: 0,
    ry: 0,
    rz: 0,
  };
};

// World position for a pose that puts the phone centre at frame px (px, py) at a distance.
export const poseAt = (px: number, py: number, dist: number, rot: Partial<Pose> = {}): Pose => ({
  x: ((px - WIDTH / 2) / WIDTH) * visibleW(dist),
  y: (-(py - HEIGHT / 2) / HEIGHT) * visibleH(dist),
  z: CAM_Z - dist,
  rx: 0,
  ry: 0,
  rz: 0,
  ...rot,
});

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
  rx: a.rx + (b.rx - a.rx) * t,
  ry: a.ry + (b.ry - a.ry) * t,
  rz: a.rz + (b.rz - a.rz) * t,
});

// ── Screen overlay: 4 projected corners -> CSS matrix3d ─────────────────────
type M3 = number[];
const adj = (m: M3): M3 => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
];
const mulMM = (a: M3, b: M3): M3 => {
  const c: number[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j];
      c[3 * i + j] = s;
    }
  return c;
};
const mulMV = (m: M3, v: number[]) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];
const basisToPoints = (p: number[]) => {
  const m = [p[0], p[2], p[4], p[1], p[3], p[5], 1, 1, 1];
  const v = mulMV(adj(m), [p[6], p[7], 1]);
  return mulMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};

// Maps a w×h element (transform-origin 0 0) onto the quad TL, TR, BL, BR.
export const quadToMatrix3d = (w: number, h: number, dst: readonly (readonly [number, number])[]) => {
  const src = basisToPoints([0, 0, w, 0, 0, h, w, h]);
  const d = basisToPoints([dst[0][0], dst[0][1], dst[1][0], dst[1][1], dst[2][0], dst[2][1], dst[3][0], dst[3][1]]);
  const t = mulMM(d, adj(src)).map((x, _, arr) => x / arr[8]);
  return `matrix3d(${t[0]},${t[3]},0,${t[6]},${t[1]},${t[4]},0,${t[7]},0,0,1,0,${t[2]},${t[5]},0,${t[8]})`;
};

// Projected screen: CSS transform for the 1080×2340 profile layer, plus how squarely it faces us.
export const screenTransform = (p: Pose) => {
  const hw = PHONE.screenW / 2;
  const hh = PHONE.screenH / 2;
  const corners = [
    projectLocal(p, [-hw, hh, FRONT_Z]),
    projectLocal(p, [hw, hh, FRONT_Z]),
    projectLocal(p, [-hw, -hh, FRONT_Z]),
    projectLocal(p, [hw, -hh, FRONT_Z]),
  ];
  const m = poseMatrix(p);
  const centre = new Vector3(0, 0, FRONT_Z).applyMatrix4(m);
  const normal = new Vector3(0, 0, 1).applyQuaternion(poseQuaternion(p));
  const toCam = new Vector3(0, 0, CAM_Z).sub(centre).normalize();
  return {transform: quadToMatrix3d(SCREEN.w, SCREEN.h, corners), facing: normal.dot(toCam), corners};
};
