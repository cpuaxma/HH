// Flags discontinuities in the camera path: the largest frame-to-frame changes in velocity
// (2nd differences) of the camera position (relative to its distance), its view direction
// and its roll, plus the on-screen motion of the phone. Hard cuts are skipped; whips are not.
// Run: npm run check:camera
import * as THREE from 'three';
import {DURATION, SHOTS} from '../src/data';
import {cameraAt, phoneAt} from '../src/lib/shots';

const cuts = new Set(SHOTS.filter((s, i) => i > 0 && !s.whipIn).map((s) => s.start));
const n = DURATION;
const cams = Array.from({length: n}, (_, f) => cameraAt(f));
const fwd = cams.map((c) => new THREE.Vector3(0, 0, -1).applyQuaternion(c.quaternion));
const upv = cams.map((c) => new THREE.Vector3(0, 1, 0).applyQuaternion(c.quaternion));
type Row = {f: number; jerkPos: number; jerkDir: number; jerkUp: number; speed: number};
const rows: Row[] = [];
for (let f = 2; f < n; f++) {
  // Skip any difference that spans a hard cut.
  if (cuts.has(f) || cuts.has(f - 1)) continue;
  const p = (i: number) => cams[i].position;
  const d = cams[f].dist;
  const acc = p(f).clone().sub(p(f - 1).clone().multiplyScalar(2)).add(p(f - 2));
  const accDir = fwd[f].clone().sub(fwd[f - 1].clone().multiplyScalar(2)).add(fwd[f - 2]);
  const accUp = upv[f].clone().sub(upv[f - 1].clone().multiplyScalar(2)).add(upv[f - 2]);
  rows.push({f, jerkPos: acc.length() / d, jerkDir: accDir.length() * 57.3, jerkUp: accUp.length() * 57.3, speed: p(f).distanceTo(p(f - 1)) / d});
}
for (const key of ['jerkPos', 'jerkDir', 'jerkUp', 'speed'] as const) {
  const top = [...rows].sort((a, b) => b[key] - a[key]).slice(0, 8);
  console.log(key.padEnd(8), top.map((r) => `f${r.f}:${r[key].toFixed(4)}`).join('  '));
}
// Per-shot summary (max jerk inside each shot, excluding the brake's impact window).
for (const s of SHOTS) {
  const inShot = rows.filter((r) => r.f >= s.start && r.f < s.end);
  const m = (k: keyof Row) => Math.max(...inShot.map((r) => r[k] as number)).toFixed(4);
  console.log(`${s.name.padEnd(44)} jerkPos ${m('jerkPos')}  jerkDir ${m('jerkDir')}°  jerkUp ${m('jerkUp')}°`);
}
void phoneAt;
