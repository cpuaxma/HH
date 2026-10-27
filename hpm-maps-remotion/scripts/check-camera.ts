// Flags discontinuities in the camera path: prints the largest frame-to-frame
// changes in velocity (position, angles). Run: npx esbuild ... (see README).
import {TIMING} from '../src/data';
import {computeCamera} from '../src/lib/camera';

const n = TIMING.durationInFrames;
const cams = Array.from({length: n}, (_, f) => computeCamera(f));
type Row = {f: number; jerkPos: number; jerkYaw: number; jerkPitch: number; speed: number};
const rows: Row[] = [];
for (let f = 2; f < n; f++) {
  const p = (i: number) => cams[i].position;
  const acc = [0, 1, 2].map((k) => p(f)[k] - 2 * p(f - 1)[k] + p(f - 2)[k]);
  const dist = cams[f].dist;
  const speed = Math.hypot(...[0, 1, 2].map((k) => p(f)[k] - p(f - 1)[k])) / dist;
  const ang = (k: number) => cams[f].rotation[k] - 2 * cams[f - 1].rotation[k] + cams[f - 2].rotation[k];
  rows.push({f, jerkPos: Math.hypot(...acc) / dist, jerkYaw: Math.abs(ang(1)) * 57.3, jerkPitch: Math.abs(ang(0)) * 57.3, speed});
}
for (const key of ['jerkPos', 'jerkYaw', 'jerkPitch'] as const) {
  const top = [...rows].sort((a, b) => b[key] - a[key]).slice(0, 6);
  console.log(key, top.map((r) => `f${r.f}:${r[key].toFixed(4)}`).join('  '));
}
const maxSpeed = [...rows].sort((a, b) => b.speed - a.speed).slice(0, 5);
console.log('speed (dist/frame)', maxSpeed.map((r) => `f${r.f}:${r.speed.toFixed(4)}`).join('  '));
