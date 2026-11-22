import * as THREE from 'three';
import {random} from 'remotion';
import {StageKey, TRACK_POINTS} from '../config';

export type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------
// The one curve. Everything (ride, chart, crowd orbs, labels) is derived from TRACK_POINTS.
// ---------------------------------------------------------------------------------------------
const curve = new THREE.CatmullRomCurve3(
  TRACK_POINTS.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
  false,
  'centripetal',
);
curve.arcLengthDivisions = 3000;

export const TRACK_LENGTH = curve.getLength();

// arc-length position of every stage point
const lengths = curve.getLengths(3000);
export const STAGE_S: Record<StageKey, number> = {} as Record<StageKey, number>;
TRACK_POINTS.forEach((p, i) => {
  if (!p.stage) return;
  const t = i / (TRACK_POINTS.length - 1);
  STAGE_S[p.stage] = lengths[Math.round(t * 3000)];
});

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

/** Point at arc length s. Beyond the ends the track continues straight along its end tangent. */
export const pointAtS = (s: number): V3 => {
  if (s < 0) {
    curve.getPointAt(0, tmp);
    curve.getTangentAt(0, tmp2);
    return [tmp.x + tmp2.x * s, tmp.y + tmp2.y * s, tmp.z + tmp2.z * s];
  }
  if (s > TRACK_LENGTH) {
    curve.getPointAt(1, tmp);
    curve.getTangentAt(1, tmp2);
    const d = s - TRACK_LENGTH;
    return [tmp.x + tmp2.x * d, tmp.y + tmp2.y * d, tmp.z + tmp2.z * d];
  }
  curve.getPointAt(s / TRACK_LENGTH, tmp);
  return [tmp.x, tmp.y, tmp.z];
};

export const tangentAtS = (s: number): V3 => {
  curve.getTangentAt(THREE.MathUtils.clamp(s / TRACK_LENGTH, 0, 1), tmp2);
  return [tmp2.x, tmp2.y, tmp2.z];
};

// ---------------------------------------------------------------------------------------------
// Shapes the line morphs through after the reveal. All are sampled at the same N arc-length
// positions, so any two can be blended point by point.
// ---------------------------------------------------------------------------------------------
export const SAMPLES = 1100;
export const SAMPLE_U = Array.from({length: SAMPLES}, (_, i) => i / (SAMPLES - 1));
export const BASE: V3[] = SAMPLE_U.map((u) => pointAtS(u * TRACK_LENGTH));

const xs = BASE.map((p) => p[0]);
const ys = BASE.map((p) => p[1]);
export const CHART = {
  minX: Math.min(...xs),
  maxX: Math.max(...xs),
  minY: Math.min(...ys),
  maxY: Math.max(...ys),
};
export const CHART_CENTER: V3 = [(CHART.minX + CHART.maxX) / 2, (CHART.minY + CHART.maxY) / 2, 0];
export const CHART_WIDTH = CHART.maxX - CHART.minX;
export const FLAT_STRETCH = 0.5;
/** y on the stretched flat chart */
export const flatY = (y: number, flatten = 1) => CHART_CENTER[1] + (y - CHART_CENTER[1]) * (1 + FLAT_STRETCH * flatten);

/** Sideways direction for the two rails (horizontal, perpendicular to the track). */
export const LATERAL: V3[] = SAMPLE_U.map((u) => {
  const t = tangentAtS(u * TRACK_LENGTH);
  const l = new THREE.Vector3(...t).cross(new THREE.Vector3(0, 1, 0)).normalize();
  return [l.x, l.y, l.z];
});

/** One slow, calm gold wave across the same width (the quote). */
export const waveAt = (u: number, frame: number): V3 => {
  const x = THREE.MathUtils.lerp(CHART.minX, CHART.maxX, u);
  const y = CHART_CENTER[1] - 2 + 15 * Math.sin(u * Math.PI * 2 * 1.05 - frame * 0.035 + 0.6);
  return [x, y, 0];
};

// ECG beats: irregular and tall on the left (the emotions), small and steady on the right (calm).
const BEATS: {u: number; amp: number}[] = (() => {
  const out: {u: number; amp: number}[] = [];
  let u = 0.04;
  let i = 0;
  while (u < 0.98) {
    const calm = THREE.MathUtils.smoothstep(u, 0.25, 0.62);
    const amp = THREE.MathUtils.lerp(17 + random(`ecg-a-${i}`) * 9, 5.2, calm);
    out.push({u, amp});
    const gap = THREE.MathUtils.lerp(0.045 + random(`ecg-g-${i}`) * 0.05, 0.105, calm);
    u += gap;
    i++;
  }
  return out;
})();

const ecgPulse = (d: number) => {
  // d in "beat units" around the beat centre: P wave, QRS spike, T wave
  const p = 0.12 * Math.exp(-(((d + 0.09) / 0.018) ** 2));
  const q = -0.18 * Math.exp(-(((d + 0.012) / 0.004) ** 2));
  const r = 1.0 * Math.exp(-((d / 0.0055) ** 2));
  const s = -0.3 * Math.exp(-(((d - 0.012) / 0.005) ** 2));
  const t = 0.22 * Math.exp(-(((d - 0.07) / 0.022) ** 2));
  return p + q + r + s + t;
};

export const ecgAt = (u: number): V3 => {
  const x = THREE.MathUtils.lerp(CHART.minX, CHART.maxX, u);
  let y = 0;
  for (const b of BEATS) {
    const d = u - b.u;
    if (Math.abs(d) < 0.15) y += ecgPulse(d) * b.amp;
  }
  return [x, CHART_CENTER[1] - 4 + y * 1.35, 0];
};

/** The calm loop behind the logo: a little more than one turn, coiling inward. */
export const RING_CENTER: V3 = [CHART_CENTER[0], CHART_CENTER[1] + 6, 0];
export const ringAt = (u: number, frame: number): V3 => {
  const turns = 1.12;
  const a = Math.PI / 2 + u * Math.PI * 2 * turns + frame * 0.006;
  const r = 34 * (1 - 0.09 * u);
  return [RING_CENTER[0] + Math.cos(a) * r, RING_CENTER[1] + Math.sin(a) * r, 3 * Math.sin(a * 2 + frame * 0.02)];
};

export type ShapeWeights = {flatten: number; wave: number; ecg: number; ring: number};

/** The line at sample u for the current morph weights. */
export const shapeAt = (i: number, w: ShapeWeights, frame: number): V3 => {
  const b = BASE[i];
  const u = SAMPLE_U[i];
  let x = b[0];
  // the flat chart is stretched vertically so it fills more of the 9:16 frame
  let y = CHART_CENTER[1] + (b[1] - CHART_CENTER[1]) * (1 + FLAT_STRETCH * w.flatten);
  let z = b[2] * (1 - w.flatten);
  if (w.wave > 0) {
    const p = waveAt(u, frame);
    x += (p[0] - x) * w.wave;
    y += (p[1] - y) * w.wave;
    z += (p[2] - z) * w.wave;
  }
  if (w.ecg > 0) {
    const p = ecgAt(u);
    x += (p[0] - x) * w.ecg;
    y += (p[1] - y) * w.ecg;
    z += (p[2] - z) * w.ecg;
  }
  if (w.ring > 0) {
    // the coil starts at the right end, so the line "winds up" from where it was
    const p = ringAt(u, frame);
    const k = THREE.MathUtils.smoothstep(w.ring * 1.25 - (1 - u) * 0.25, 0, 1);
    x += (p[0] - x) * k;
    y += (p[1] - y) * k;
    z += (p[2] - z) * k;
  }
  return [x, y, z];
};

/** Same as shapeAt but for any u (interpolates between samples). */
export const shapeAtU = (u: number, w: ShapeWeights, frame: number): V3 => {
  const f = THREE.MathUtils.clamp(u, 0, 1) * (SAMPLES - 1);
  const i = Math.min(SAMPLES - 2, Math.floor(f));
  const a = shapeAt(i, w, frame);
  const b = shapeAt(i + 1, w, frame);
  const k = f - i;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};

export const sToU = (s: number) => s / TRACK_LENGTH;
