// Motion-blur sample count per frame for the copy trading reel (same rule as the pipeline)
// and a render-time estimate: npm run blur:budget:copy [vertical|feed]
import * as THREE from 'three';
import {LAYOUT, T} from '../src/copy/data';
import {computeCopyCamera} from '../src/copy/camera';
import {phonePose} from '../src/copy/story';
import {applyCamera} from '../src/lib/projection';
import {PHONE} from '../src/lib/story';
import {MOTION_BLUR_RULE} from '../src/three/motionBlurRule';

const fmt = (process.argv[2] as 'vertical' | 'feed') ?? 'vertical';
const {width, height} = LAYOUT[fmt];
const cam = new THREE.PerspectiveCamera();
const corners: THREE.Vector3[] = [];
for (const x of [-PHONE.width / 2, PHONE.width / 2]) for (const y of [-PHONE.height / 2, PHONE.height / 2]) for (const z of [-0.04, 0.04]) corners.push(new THREE.Vector3(x, y, z));
const project = (t: number) => {
  applyCamera(cam, t, fmt, width, height, computeCopyCamera);
  const p = phonePose(t);
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...p.pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot, 'YXZ')), new THREE.Vector3(1, 1, 1));
  return corners.map((c) => {
    const v = c.clone().applyMatrix4(m).project(cam);
    return new THREE.Vector2((v.x * 0.5 + 0.5) * width, (0.5 - v.y * 0.5) * height);
  });
};
let total = 0;
const runs: string[] = [];
let runStart = -1;
const N = T.endCardStart + 60;
for (let f = 0; f < N; f++) {
  const a = project(f - MOTION_BLUR_RULE.shutter / 2);
  const b = project(f + MOTION_BLUR_RULE.shutter / 2);
  const travel = Math.max(...a.map((p, i) => p.distanceTo(b[i])));
  const k = MOTION_BLUR_RULE.samples(travel);
  total += k;
  if (k > 1 && runStart < 0) runStart = f;
  if (k === 1 && runStart >= 0) {
    runs.push(`${runStart}-${f - 1}`);
    runStart = -1;
  }
}
console.log(`${fmt}: ${total - N} extra scene renders; blurred runs: ${runs.join(' ') || 'none'}`);
console.log(`estimated render ≈ ${((N * 1.65 + (total - N) * 0.55 + (T.durationInFrames - N) * 0.4) / 60).toFixed(0)} min`);
