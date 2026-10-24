import {random} from 'remotion';

export type Pt = [number, number];

// Smooth path through points (Catmull-Rom -> cubic Béziers).
export const smoothPath = (pts: Pt[]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

const jitter = (seed: string, i: number, amp: number) => (random(`${seed}-${i}`) * 2 - 1) * amp;

// A marker scribble around an ellipse: a little more than one loop, uneven radius, open ends.
export const scribbleEllipse = (cx: number, cy: number, rx: number, ry: number, seed = 'c', turns = 1.12, wobble = 0.05) => {
  const n = 28;
  const start = -2.2 + jitter(seed, 99, 0.2);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + t * turns * Math.PI * 2;
    // Radius drifts outward over the loop so the overlap doesn't sit on top of itself.
    const k = 1 + wobble * Math.sin(a * 2 + 1.3) + jitter(seed, i, wobble * 0.5) + t * 0.06;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smoothPath(pts);
};

// A hand-drawn straight stroke with a slight bow and jitter.
export const handLine = (x1: number, y1: number, x2: number, y2: number, seed = 'l', amp = 3, bow = 6) => {
  const n = 6;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = Math.sin(t * Math.PI) * bow + jitter(seed, i, amp);
    pts.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off]);
  }
  return smoothPath(pts);
};

// A curved hand-drawn arrow: shaft (quadratic-ish curve) and a two-stroke head.
export const handArrow = (from: Pt, to: Pt, curve = 0.35, seed = 'a', head = 46) => {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const ctrl: Pt = [mx - dy * curve, my + dx * curve];
  const pts: Pt[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * ctrl[0] + t * t * to[0];
    const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * ctrl[1] + t * t * to[1];
    pts.push([x + jitter(seed, i, 2), y + jitter(seed, i + 50, 2)]);
  }
  // Tangent at the tip
  const tx = to[0] - ctrl[0];
  const ty = to[1] - ctrl[1];
  const a = Math.atan2(ty, tx);
  const h1: Pt = [to[0] - head * Math.cos(a - 0.5), to[1] - head * Math.sin(a - 0.5)];
  const h2: Pt = [to[0] - head * Math.cos(a + 0.45), to[1] - head * Math.sin(a + 0.45)];
  return {
    shaft: smoothPath(pts),
    head: `M ${h1[0].toFixed(1)} ${h1[1].toFixed(1)} L ${to[0].toFixed(1)} ${to[1].toFixed(1)} L ${h2[0].toFixed(1)} ${h2[1].toFixed(1)}`,
  };
};

// Check mark inside a box of size s (top-left at x, y).
export const handCheck = (x: number, y: number, s: number) =>
  `M ${x + s * 0.12} ${y + s * 0.55} Q ${x + s * 0.3} ${y + s * 0.68} ${x + s * 0.4} ${y + s * 0.84} Q ${x + s * 0.58} ${y + s * 0.42} ${x + s * 0.9} ${y + s * 0.14}`;

// Two strokes of an ✗.
export const handCross = (x: number, y: number, s: number, seed = 'x') => [
  handLine(x + s * 0.1, y + s * 0.12, x + s * 0.9, y + s * 0.9, `${seed}1`, 3, 8),
  handLine(x + s * 0.88, y + s * 0.1, x + s * 0.12, y + s * 0.86, `${seed}2`, 3, -6),
];

// Gentle wave across the frame width (for background lines).
export const wavePath = (y: number, amp: number, phase: number, width = 1080, waves = 1.6) => {
  const pts: Pt[] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([-40 + t * (width + 80), y + Math.sin(t * Math.PI * 2 * waves + phase) * amp]);
  }
  return smoothPath(pts);
};
