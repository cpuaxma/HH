import {HUBS} from '../data';

/** Globe radius in world units. The globe sits at the origin, north is +y, lon 0 faces +z. */
export const R = 100;

export type V3 = [number, number, number];

const DEG = Math.PI / 180;

/** Point on (or `alt` above) the globe at a longitude/latitude in degrees. */
export const lonLat = (lon: number, lat: number, alt = 0): V3 => {
  const r = R + alt;
  return [r * Math.cos(lat * DEG) * Math.sin(lon * DEG), r * Math.sin(lat * DEG), r * Math.cos(lat * DEG) * Math.cos(lon * DEG)];
};

export const len = (v: V3) => Math.hypot(v[0], v[1], v[2]);
export const norm = (v: V3): V3 => {
  const l = len(v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
export const scale = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Spherical interpolation between two unit vectors. */
export const slerp = (a: V3, b: V3, t: number): V3 => {
  const c = Math.max(-1, Math.min(1, dot(a, b)));
  const w = Math.acos(c);
  if (w < 1e-6) return a;
  const s = Math.sin(w);
  const ka = Math.sin((1 - t) * w) / s;
  const kb = Math.sin(t * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
};

export const hubPos = (i: number, alt = 0) => lonLat(HUBS[i].lon, HUBS[i].lat, alt);

/** How high each leg's arc lifts at its middle, per radian of the leg's angle. */
const LIFT = 15;
/** Resampling step along the route, world units. */
export const ROUTE_STEP = 0.25;

type Route = {
  /** Evenly spaced points along the whole route, hub to hub. */
  xs: Float64Array;
  ys: Float64Array;
  zs: Float64Array;
  length: number;
  /** Arc length at each hub. */
  hubS: number[];
};

let cache: Route | null = null;

/** The route: great-circle arcs between consecutive hubs, lifted off the globe in the middle. */
export const getRoute = (): Route => {
  if (cache) return cache;
  const dense: V3[] = [];
  const denseHub: number[] = [0];
  for (let i = 0; i < HUBS.length - 1; i++) {
    const a = norm(hubPos(i));
    const b = norm(hubPos(i + 1));
    const angle = Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
    const n = Math.ceil(angle * 900);
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const t = k / n;
      const lift = LIFT * angle * Math.sin(Math.PI * t);
      dense.push(scale(slerp(a, b, t), R + 0.4 + lift));
    }
    denseHub.push(dense.length - 1);
  }
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + len(sub(dense[i], dense[i - 1])));
  const length = cum[cum.length - 1];
  const count = Math.floor(length / ROUTE_STEP) + 1;
  const xs = new Float64Array(count);
  const ys = new Float64Array(count);
  const zs = new Float64Array(count);
  let j = 0;
  for (let k = 0; k < count; k++) {
    const s = Math.min(length, k * ROUTE_STEP);
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const u = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    xs[k] = dense[j][0] + (dense[j + 1][0] - dense[j][0]) * u;
    ys[k] = dense[j][1] + (dense[j + 1][1] - dense[j][1]) * u;
    zs[k] = dense[j][2] + (dense[j + 1][2] - dense[j][2]) * u;
  }
  cache = {xs, ys, zs, length, hubS: denseHub.map((i) => cum[i])};
  return cache;
};

/** Point on the route at arc length s. */
export const routePoint = (s: number): V3 => {
  const {xs, ys, zs} = getRoute();
  const f = Math.max(0, Math.min(xs.length - 1, s / ROUTE_STEP));
  const i = Math.min(xs.length - 2, Math.floor(f));
  const u = f - i;
  return [xs[i] + (xs[i + 1] - xs[i]) * u, ys[i] + (ys[i + 1] - ys[i]) * u, zs[i] + (zs[i + 1] - zs[i]) * u];
};

/** Unit "north" tangent at a point on the globe (towards +y along the surface). */
export const northAt = (n: V3): V3 => {
  const up: V3 = [0, 1, 0];
  return norm(sub(up, scale(n, dot(up, n))));
};
