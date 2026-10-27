import {PEPPER_ROUTE} from '../data';
import {PEPPER_OUTLINE} from './logoTrace';

export type Route = {
  /** Evenly spaced samples along the route (every ROUTE_STEP units). */
  xs: Float64Array;
  zs: Float64Array;
  length: number;
};

export const ROUTE_STEP = 0.5;

let cached: Route | null = null;

/**
 * The route is the outline of the pepper from the logo, laid over the city
 * (logo x → map x, logo y → map z, so north-up shows it the right way round).
 * It runs clockwise from the base of the stem and ends where it started.
 */
export const getRoute = (): Route => {
  if (cached) return cached;
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const [x, y] of PEPPER_OUTLINE) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  const k = PEPPER_ROUTE.width / (x1 - x0);
  const [cx, cz] = PEPPER_ROUTE.center;
  const pts = PEPPER_OUTLINE.map(([x, y]) => ({x: cx + (x - (x0 + x1) / 2) * k, z: cz + (y - (y0 + y1) / 2) * k}));

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
    const t = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    xs[i] = pts[j].x + (pts[j + 1].x - pts[j].x) * t;
    zs[i] = pts[j].z + (pts[j + 1].z - pts[j].z) * t;
  }
  cached = {xs, zs, length};
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

let index: {cell: number; buckets: Map<string, [number, number][]>} | null = null;

/** Distance from (x, z) to the route, for keeping buildings and trees off it. */
export const distanceToRoute = (x: number, z: number) => {
  if (!index) {
    const r = getRoute();
    const cell = 25;
    const buckets = new Map<string, [number, number][]>();
    for (let i = 0; i < r.xs.length; i += 2) {
      const key = `${Math.floor(r.xs[i] / cell)},${Math.floor(r.zs[i] / cell)}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push([r.xs[i], r.zs[i]]);
    }
    index = {cell, buckets};
  }
  const {cell, buckets} = index;
  const ci = Math.floor(x / cell);
  const cj = Math.floor(z / cell);
  let best = Infinity;
  for (let di = -2; di <= 2; di++) {
    for (let dj = -2; dj <= 2; dj++) {
      const b = buckets.get(`${ci + di},${cj + dj}`);
      if (!b) continue;
      for (const [px, pz] of b) best = Math.min(best, Math.hypot(px - x, pz - z));
    }
  }
  return best;
};

/** Is (x, z) inside the pepper outline? (even-odd ray cast on the route samples) */
export const insidePepper = (x: number, z: number) => {
  const r = getRoute();
  let inside = false;
  for (let i = 0, j = r.xs.length - 1; i < r.xs.length; j = i, i += 4) {
    const xi = r.xs[i];
    const zi = r.zs[i];
    const xj = r.xs[j];
    const zj = r.zs[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};
