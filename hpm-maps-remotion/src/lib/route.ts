import {getCity} from './city';

export type Route = {
  /** Evenly spaced samples along the route (every STEP units). */
  xs: Float64Array;
  zs: Float64Array;
  length: number;
  /** Arc length at which the head stops for each business. */
  stopS: number[];
};

export const ROUTE_STEP = 0.5;
const FILLET = 16;

let cached: Route | null = null;

export const getRoute = (): Route => {
  if (cached) return cached;
  const city = getCity();
  const w = city.waypoints;

  // Polyline with rounded corners.
  const pts: {x: number; z: number}[] = [w[0]];
  for (let i = 1; i < w.length - 1; i++) {
    const a = w[i - 1];
    const b = w[i];
    const c = w[i + 1];
    const l1 = Math.hypot(b.x - a.x, b.z - a.z);
    const l2 = Math.hypot(c.x - b.x, c.z - b.z);
    const d1 = {x: (b.x - a.x) / l1, z: (b.z - a.z) / l1};
    const d2 = {x: (c.x - b.x) / l2, z: (c.z - b.z) / l2};
    if (Math.abs(d1.x * d2.z - d1.z * d2.x) < 1e-6) {
      pts.push(b);
      continue;
    }
    const r = Math.min(FILLET, l1 / 2, l2 / 2);
    const p0 = {x: b.x - d1.x * r, z: b.z - d1.z * r};
    const p2 = {x: b.x + d2.x * r, z: b.z + d2.z * r};
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      const u = 1 - t;
      pts.push({
        x: u * u * p0.x + 2 * u * t * b.x + t * t * p2.x,
        z: u * u * p0.z + 2 * u * t * b.z + t * t * p2.z,
      });
    }
  }
  pts.push(w[w.length - 1]);

  // Cumulative length, then resample evenly.
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  }
  const length = cum[cum.length - 1];
  const n = Math.floor(length / ROUTE_STEP) + 1;
  const xs = new Float64Array(n);
  const zs = new Float64Array(n);
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = Math.min(length, i * ROUTE_STEP);
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const t = (s - cum[j]) / seg;
    xs[i] = pts[j].x + (pts[j + 1].x - pts[j].x) * t;
    zs[i] = pts[j].z + (pts[j + 1].z - pts[j].z) * t;
  }

  // Each stop: the closest sample to its intersection, searching forward.
  const stopS: number[] = [];
  let from = 0;
  for (const c of city.stopCorners) {
    let best = from;
    let bestD = Infinity;
    for (let i = from; i < n; i++) {
      const d = Math.hypot(xs[i] - c.x, zs[i] - c.z);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
      if (bestD < 0.3 && d > 30) break;
    }
    stopS.push(best * ROUTE_STEP);
    from = best + 1;
  }

  cached = {xs, zs, length, stopS};
  return cached;
};

export const routePoint = (s: number) => {
  const r = getRoute();
  const f = Math.max(0, Math.min(r.xs.length - 1, s / ROUTE_STEP));
  const i = Math.min(r.xs.length - 2, Math.floor(f));
  const t = f - i;
  return {x: r.xs[i] + (r.xs[i + 1] - r.xs[i]) * t, z: r.zs[i] + (r.zs[i + 1] - r.zs[i]) * t};
};

/** Unit travel direction at arc length s (averaged over a short window). */
export const routeDirection = (s: number, window = 4) => {
  const a = routePoint(s - window);
  const b = routePoint(s + window);
  const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  return {x: (b.x - a.x) / len, z: (b.z - a.z) / len};
};
