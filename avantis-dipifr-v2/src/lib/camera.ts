import * as THREE from 'three';
import {TIMING} from '../data';
import {impacts} from './choreo';
import {easeCamera, lerp, ramp, shakeAt} from './timeline';

export const W = 1080;
export const H = 1920;
export const FOV = 30;

type Shot = {pos: [number, number, number]; look: [number, number, number]};

const mix = (a: Shot, b: Shot, t: number): Shot => ({
  pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
  look: [lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t)],
});

/**
 * One framing per scene, blended with cubic in/out weights. The certificate
 * stays near the middle of the frame; the camera only dollies and arcs a little.
 */
export const SHOTS = {
  answerFrom: {pos: [1.6, 0.9, 27], look: [0, 0.2, 0]} as Shot,
  answer: {pos: [-0.8, 0.5, 24], look: [0, 0.15, 0]} as Shot,
  course: {pos: [0.9, 0.2, 25], look: [0, 0.35, 0]} as Shot,
  courseEnd: {pos: [-0.9, 0.5, 24.2], look: [0, 0.4, 0]} as Shot,
  seal: {pos: [0.5, 1.4, 23], look: [0, 1.1, 0]} as Shot,
  rest: {pos: [0, 0.4, 26], look: [0, 0.3, 0]} as Shot,
};

/** The camera path without shake: smooth by construction (only eased blends and slow sines). */
export const basePath = (f: number): Shot => {
  let s = mix(SHOTS.answerFrom, SHOTS.answer, ramp(f, TIMING.answerStart - 12, TIMING.breakStart, easeCamera));
  s = mix(s, SHOTS.course, ramp(f, TIMING.breakStart - 10, TIMING.courseStart + 40, easeCamera));
  s = mix(s, SHOTS.courseEnd, ramp(f, TIMING.courseStart + 40, TIMING.morphStart - 20, easeCamera));
  s = mix(s, SHOTS.seal, ramp(f, TIMING.morphStart - 20, TIMING.sealStamp + 10, easeCamera));
  s = mix(s, SHOTS.rest, ramp(f, TIMING.benefitsStart - 10, TIMING.benefitsStart + 60, easeCamera));
  // Hand-held drift: slow layered sines.
  const d = (p: number, ph: number) => Math.sin((2 * Math.PI * f) / p + ph);
  return {
    pos: [s.pos[0] + 0.12 * d(283, 0.3) + 0.06 * d(167, 1.2), s.pos[1] + 0.1 * d(311, 2.1) + 0.05 * d(193, 0.4), s.pos[2] + 0.15 * d(347, 1.7)],
    look: [s.look[0] + 0.03 * d(229, 0.9), s.look[1] + 0.03 * d(257, 2.6), s.look[2]],
  };
};

export type CameraState = {position: THREE.Vector3; quaternion: THREE.Quaternion};

// A camera, so lookAt points its -z axis at the target.
const tmp = new THREE.PerspectiveCamera();

export const computeCamera = (f: number): CameraState => {
  const s = basePath(f);
  // Impact shake: a short, decaying wobble that starts from rest.
  let sx = 0;
  let sy = 0;
  let roll = 0;
  for (const at of impacts()) {
    const k = shakeAt(f, at);
    sx += 0.07 * k;
    sy += 0.1 * shakeAt(f - 2, at);
    roll += 0.004 * shakeAt(f - 1, at);
  }
  tmp.position.set(s.pos[0] + sx, s.pos[1] + sy, s.pos[2]);
  tmp.up.set(Math.sin(roll), Math.cos(roll), 0);
  tmp.lookAt(s.look[0] + sx * 0.4, s.look[1] + sy * 0.4, s.look[2]);
  return {position: tmp.position.clone(), quaternion: tmp.quaternion.clone()};
};

export const applyCamera = (c: THREE.PerspectiveCamera, cam: CameraState) => {
  c.fov = FOV;
  c.aspect = W / H;
  c.near = 1;
  c.far = 200;
  c.position.copy(cam.position);
  c.quaternion.copy(cam.quaternion);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
};
