// Checks the camera numerically. Prints the largest frame-to-frame jerks and
// turns of (a) the base path, which must be smooth everywhere, and (b) the full
// camera with the impact shakes, which must stay continuous (no jumps).
// Run: npm run check:camera
import * as THREE from 'three';
import {TIMING} from '../src/data';
import {basePath, computeCamera} from '../src/lib/camera';

const n = TIMING.durationInFrames;
const report = (name: string, pos: THREE.Vector3[], fwd: THREE.Vector3[]) => {
  const rows: {f: number; jerk: number; jump: number; turn: number}[] = [];
  for (let f = 3; f < n; f++) {
    const j = pos[f].clone().sub(pos[f - 1].clone().multiplyScalar(3)).add(pos[f - 2].clone().multiplyScalar(3)).sub(pos[f - 3]);
    rows.push({f, jerk: j.length(), jump: pos[f].distanceTo(pos[f - 1]), turn: (fwd[f].angleTo(fwd[f - 1]) * 180) / Math.PI});
  }
  const top = (k: 'jerk' | 'jump' | 'turn') =>
    [...rows]
      .sort((a, b) => b[k] - a[k])
      .slice(0, 4)
      .map((r) => `f${r.f}:${r[k].toExponential(2)}`)
      .join('  ');
  console.log(`${name}\n  jerk ${top('jerk')}\n  step ${top('jump')}\n  turn° ${top('turn')}`);
  // Only jerks that matter (over 5% of the largest) count as spikes; tiny steps where an
  // eased blend starts or ends are invisible.
  const floor = Math.max(...rows.map((r) => r.jerk)) * 0.05;
  let worst = {f: 0, ratio: 0};
  for (let i = 10; i < rows.length - 10; i++) {
    if (rows[i].jerk < floor) continue;
    const around = rows.slice(i - 10, i + 11).map((r) => r.jerk).sort((a, b) => a - b)[10];
    const ratio = rows[i].jerk / Math.max(around, 1e-7);
    if (ratio > worst.ratio) worst = {f: rows[i].f, ratio};
  }
  console.log(`  largest jerk spike vs its neighbourhood: ${worst.ratio.toFixed(2)}x at f${worst.f}`);
};

const cam = new THREE.PerspectiveCamera();
const base = Array.from({length: n}, (_, f) => basePath(f));
report(
  'Base path (eased blends + drift)',
  base.map((s) => new THREE.Vector3(...s.pos)),
  base.map((s) => new THREE.Vector3(...s.look).sub(new THREE.Vector3(...s.pos)).normalize()),
);
const full = Array.from({length: n}, (_, f) => computeCamera(f));
report(
  'Full camera (with impact shakes)',
  full.map((c) => c.position),
  full.map((c) => {
    cam.quaternion.copy(c.quaternion);
    return new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  }),
);
