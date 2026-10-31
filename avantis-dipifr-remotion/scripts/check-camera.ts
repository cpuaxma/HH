// Checks the camera path numerically: prints the largest frame-to-frame changes in
// acceleration (position relative to distance, view direction, focus point on
// screen) and the fastest moments. Large isolated spikes mean a jerk or a sudden turn.
// Run: npm run check:camera
import {TIMING} from '../src/data';
import {computeCamera} from '../src/lib/camera';
import * as THREE from 'three';

const n = TIMING.durationInFrames;
const cams = Array.from({length: n}, (_, f) => computeCamera(f));
const fwd = cams.map((c) => new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(...c.quaternion)));
type Row = {f: number; jerkPos: number; jerkDir: number; jerkFocus: number; speed: number; turn: number};
const rows: Row[] = [];
for (let f = 3; f < n; f++) {
  const p = (i: number) => cams[i].position;
  // Third difference (jerk), relative to the distance to the target.
  const j3 = [0, 1, 2].map((k) => p(f)[k] - 3 * p(f - 1)[k] + 3 * p(f - 2)[k] - p(f - 3)[k]);
  const d = cams[f].dist;
  const dir = (i: number) => fwd[i];
  const jd = dir(f).clone().sub(dir(f - 1).clone().multiplyScalar(3)).add(dir(f - 2).clone().multiplyScalar(3)).sub(dir(f - 3));
  const fy = (i: number) => cams[i].focusY;
  rows.push({
    f,
    jerkPos: Math.hypot(...j3) / d,
    jerkDir: jd.length() * 57.3,
    jerkFocus: Math.abs(fy(f) - 3 * fy(f - 1) + 3 * fy(f - 2) - fy(f - 3)),
    speed: Math.hypot(...[0, 1, 2].map((k) => p(f)[k] - p(f - 1)[k])) / d,
    turn: fwd[f].angleTo(fwd[f - 1]) * 57.3,
  });
}
const fmt = (v: number) => v.toExponential(2);
for (const key of ['jerkPos', 'jerkDir', 'jerkFocus', 'speed', 'turn'] as const) {
  const top = [...rows].sort((a, b) => b[key] - a[key]).slice(0, 6);
  const median = [...rows].sort((a, b) => a[key] - b[key])[Math.floor(rows.length / 2)][key];
  console.log(`${key.padEnd(9)} median ${fmt(median)} | max`, top.map((r) => `f${r.f}:${fmt(r[key])}`).join('  '));
}
// Fail if any frame's jerk is far above its neighbours' (a kink), not just large.
let worst = {f: 0, ratio: 0};
for (let i = 10; i < rows.length - 10; i++) {
  const around = rows.slice(i - 10, i + 11).map((r) => r.jerkPos).sort((a, b) => a - b)[10];
  const ratio = rows[i].jerkPos / Math.max(around, 1e-7);
  if (ratio > worst.ratio && rows[i].jerkPos > 1e-5) worst = {f: rows[i].f, ratio};
}
console.log(`largest jerk spike vs its neighbourhood median: ${worst.ratio.toFixed(2)}x at f${worst.f}`);
const maxTurn = Math.max(...rows.map((r) => r.turn));
console.log(`max turn per frame: ${maxTurn.toFixed(3)}°`);
