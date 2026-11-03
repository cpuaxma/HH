// Checks the camera path numerically for jerks: run `npm run check:camera`.
// For every frame it measures, relative to the camera distance, the speed, acceleration and
// jerk (change of acceleration) of the camera position and of its aim, at 10 samples per
// frame. A smooth path has jerk that rises and falls gradually; a discontinuity shows up as
// a spike far above its neighbours. Exits non-zero if any spike exceeds the threshold.
import {TIMING} from '../src/data';
import {EDIT, computeCamera, shotAt} from '../src/lib/camera';

const SUB = 10;
const n = TIMING.durationInFrames;
const fmt = (process.argv[2] as 'vertical' | 'feed') ?? 'vertical';
type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(...a);
const dirOf = (t: number): V => {
  const c = computeCamera(t, fmt);
  const d = sub(c.target, c.position);
  const l = len(d);
  return [d[0] / l, d[1] / l, d[2] / l];
};

const rows: {f: number; speed: number; acc: number; jerk: number; aimJerk: number}[] = [];
const h = 1 / SUB;
for (let i = 3 * SUB; i < (n - 3) * SUB; i++) {
  const t = i * h;
  const P = (k: number) => computeCamera(t + k * h, fmt).position as V;
  const dist = computeCamera(t, fmt).dist;
  // Finite differences per frame² / frame³, normalised by distance.
  const v = len(sub(P(1), P(-1))) / (2 * h) / dist;
  const a = len(sub(sub(P(1), P(0)), sub(P(0), P(-1)))) / (h * h) / dist;
  const j = len(sub(sub(sub(P(2), P(1)), sub(P(1), P(0))), sub(sub(P(1), P(0)), sub(P(0), P(-1))))) / (h * h * h) / dist;
  const D = (k: number) => dirOf(t + k * h);
  const aj = len(sub(sub(sub(D(2), D(1)), sub(D(1), D(0))), sub(sub(D(1), D(0)), sub(D(0), D(-1))))) / (h * h * h);
  rows.push({f: t, speed: v, acc: a, jerk: j, aimJerk: aj});
}

// A discontinuity is an isolated spike: jerk at a sample far above the jerk a few samples
// either side. A fast but smooth move (a whip) rises and falls gradually and passes.
const spikes: string[] = [];
const K = 4;
for (const key of ['jerk', 'aimJerk'] as const) {
  for (let i = K; i < rows.length - K; i++) {
    const r = rows[i];
    const around = Math.max(rows[i - K][key], rows[i + K][key]);
    // The impact shake is an intended jolt.
    if (r.f >= TIMING.impactAt - 1.5 && r.f <= TIMING.impactAt + 2) continue;
    if (r[key] > 0.01 && r[key] > around * 3) spikes.push(`${key} f${r.f.toFixed(1)} (${shotAt(r.f)}): ${r[key].toFixed(4)} vs ${around.toFixed(4)} around`);
  }
}

const top = (key: 'speed' | 'acc' | 'jerk' | 'aimJerk') =>
  [...rows].sort((a, b) => b[key] - a[key]).filter((r, i, arr) => arr.findIndex((q) => Math.abs(q.f - r.f) < 6) === i).slice(0, 5).map((r) => `f${r.f.toFixed(1)}:${r[key].toFixed(4)}`).join('  ');
console.log(`Camera path check (${fmt}), ${SUB} samples per frame`);
console.log('shots:', EDIT.map((e) => `${e.shot}→${e.until === Infinity ? 'end' : e.until}+${e.blend}`).join('  '));
console.log('peak speed (dist/frame)  ', top('speed'));
console.log('peak acceleration        ', top('acc'));
console.log('peak jerk                ', top('jerk'));
console.log('peak aim jerk            ', top('aimJerk'));
if (spikes.length) {
  console.log(`\n${spikes.length} discontinuities:`);
  for (const s of spikes.slice(0, 30)) console.log('  ' + s);
  process.exit(1);
}
console.log('\nNo discontinuities: every move eases in and out.');
