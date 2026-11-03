// Estimates the motion-blur sample count per frame (same rule as the pipeline: phone-corner
// travel on screen during the shutter) and the render time: npm run blur:budget [vertical|feed]
import * as THREE from 'three';
import {LAYOUT, TIMING} from '../src/data';
import {applyCamera} from '../src/lib/projection';
import {PHONE, PhonePose, competitorPose, youPose} from '../src/lib/story';
import {MOTION_BLUR_RULE} from '../src/three/motionBlurRule';

const fmt = (process.argv[2] as 'vertical' | 'feed') ?? 'vertical';
const {width, height} = LAYOUT[fmt];
const cam = new THREE.PerspectiveCamera();
const corners: THREE.Vector3[] = [];
for (const x of [-PHONE.width / 2, PHONE.width / 2]) for (const y of [-PHONE.height / 2, PHONE.height / 2]) for (const z of [-0.04, 0.04]) corners.push(new THREE.Vector3(x, y, z));
const mat = (p: PhonePose) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p.pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot, 'YXZ')), new THREE.Vector3(p.scale, p.scale, p.scale));
const project = (t: number) => {
  applyCamera(cam, t, fmt, width, height);
  const out: THREE.Vector2[] = [];
  for (const m of [mat(youPose(t)), mat(competitorPose(t))])
    for (const c of corners) {
      const v = c.clone().applyMatrix4(m).project(cam);
      out.push(new THREE.Vector2((v.x * 0.5 + 0.5) * width, (0.5 - v.y * 0.5) * height));
    }
  return out;
};
let total = 0;
let blurred = 0;
const hist = new Map<number, number>();
const runs: string[] = [];
let runStart = -1;
for (let f = 0; f < TIMING.endCardStart + 60; f++) {
  const a = project(f - MOTION_BLUR_RULE.shutter / 2);
  const b = project(f + MOTION_BLUR_RULE.shutter / 2);
  let travel = 0;
  a.forEach((p, i) => {
    const on = (q: THREE.Vector2) => q.x > -200 && q.x < width + 200 && q.y > -200 && q.y < height + 200;
    if (on(p) || on(b[i])) travel = Math.max(travel, p.distanceTo(b[i]));
  });
  // The streak always needs blur while it crosses.
  if (f >= TIMING.streakStart && f <= TIMING.streakEnd) travel = Math.max(travel, 60);
  const k = MOTION_BLUR_RULE.samples(travel);
  hist.set(k, (hist.get(k) ?? 0) + 1);
  total += k;
  if (k > 1) {
    blurred++;
    if (runStart < 0) runStart = f;
  } else if (runStart >= 0) {
    runs.push(`${runStart}-${f - 1}`);
    runStart = -1;
  }
}
const est = (TIMING.endCardStart + 60) * 1.65 + (total - (TIMING.endCardStart + 60)) * 0.55 + (TIMING.durationInFrames - TIMING.endCardStart - 60) * 0.4;
console.log(`${fmt}: ${blurred} blurred frames, ${total} scene renders; samples histogram`, Object.fromEntries([...hist].sort((x, y) => x[0] - y[0])));
console.log('blurred runs:', runs.join(' '));
console.log(`estimated render ≈ ${(est / 60).toFixed(0)} min`);
