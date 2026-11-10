// Sculpting from primitives: each part of an animal is a signed distance field built from
// ellipsoids and tapered capsules joined with smooth unions (so the joins read as one cast
// surface), turned into a mesh once with marching cubes, with normals from the field's own
// gradient. Everything here runs once at mount and is cached: no per-frame work, no state.
import * as THREE from 'three';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';

export type Vec = [number, number, number];
export type Sdf = (x: number, y: number, z: number) => number;
/** An axis-aligned bound for a primitive (centre ± half extent), so the mesher knows the box. */
type Bounded = {f: Sdf; min: Vec; max: Vec};

const len3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);

/** Rotation (Euler XYZ, radians) applied to the query point, inverse of the shape's rotation. */
const rotator = (rot?: Vec) => {
  if (!rot || (rot[0] === 0 && rot[1] === 0 && rot[2] === 0)) return null;
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])).invert();
  const e = m.elements;
  return (x: number, y: number, z: number): Vec => [e[0] * x + e[4] * y + e[8] * z, e[1] * x + e[5] * y + e[9] * z, e[2] * x + e[6] * y + e[10] * z];
};

/** Ellipsoid with radii r, centre c, optional rotation. */
export const ell = (c: Vec, r: Vec, rot?: Vec): Bounded => {
  const R = rotator(rot);
  const m = Math.max(...r);
  return {
    f: (x, y, z) => {
      let px = x - c[0];
      let py = y - c[1];
      let pz = z - c[2];
      if (R) [px, py, pz] = R(px, py, pz);
      const k0 = len3(px / r[0], py / r[1], pz / r[2]);
      const k1 = len3(px / (r[0] * r[0]), py / (r[1] * r[1]), pz / (r[2] * r[2]));
      return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
    },
    min: [c[0] - m, c[1] - m, c[2] - m],
    max: [c[0] + m, c[1] + m, c[2] + m],
  };
};

/** A capsule from a to b whose radius tapers from ra to rb (iq's round cone). */
export const cone = (a: Vec, b: Vec, ra: number, rb: number): Bounded => {
  const bax = b[0] - a[0];
  const bay = b[1] - a[1];
  const baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = ra - rb;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  const m = Math.max(ra, rb);
  return {
    f: (x, y, z) => {
      const pax = x - a[0];
      const pay = y - a[1];
      const paz = z - a[2];
      const yv = pax * bax + pay * bay + paz * baz;
      const zv = yv - l2;
      const qx = pax * l2 - bax * yv;
      const qy = pay * l2 - bay * yv;
      const qz = paz * l2 - baz * yv;
      const x2 = qx * qx + qy * qy + qz * qz;
      const y2 = yv * yv * l2;
      const z2 = zv * zv * l2;
      const k = Math.sign(rr) * rr * rr * x2;
      if (Math.sign(zv) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - rb;
      if (Math.sign(yv) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - ra;
      return (Math.sqrt(x2 * a2 * il2) + yv * rr) * il2 - ra;
    },
    min: [Math.min(a[0], b[0]) - m, Math.min(a[1], b[1]) - m, Math.min(a[2], b[2]) - m],
    max: [Math.max(a[0], b[0]) + m, Math.max(a[1], b[1]) + m, Math.max(a[2], b[2]) + m],
  };
};

/** A chain of tapered capsules through [x, y, z, radius] points (horns, legs, tails). */
export const chain = (pts: [number, number, number, number][]): Bounded[] => {
  const out: Bounded[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    out.push(cone([p[0], p[1], p[2]], [q[0], q[1], q[2]], p[3], q[3]));
  }
  return out;
};

/** Mirror a primitive list across z = 0 (left / right pairs). */
export const pairZ = (make: (s: 1 | -1) => Bounded[]): Bounded[] => [...make(1), ...make(-1)];

/** Polynomial smooth minimum. */
const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

export type Part = {
  /** Primitives joined with a smooth union of width `blend`. */
  prims: Bounded[];
  blend?: number;
  /** Primitives carved out afterwards (smooth subtraction). */
  carve?: Bounded[];
};

const partSdf = (p: Part): Sdf => {
  const k = p.blend ?? 0.06;
  const prims = p.prims;
  const carve = p.carve ?? [];
  return (x, y, z) => {
    let d = prims[0].f(x, y, z);
    for (let i = 1; i < prims.length; i++) d = smin(d, prims[i].f(x, y, z), k);
    for (const c of carve) {
      const e = -c.f(x, y, z);
      const h = Math.max(0.02 - Math.abs(d - e), 0) / 0.02;
      d = Math.max(d, e) + h * h * 0.02 * 0.25;
    }
    return d;
  };
};

/**
 * Mesh a part: marching cubes over its bounding box at `res` cells along the longest side,
 * with smooth normals from the field gradient. Returns a non-indexed BufferGeometry in the
 * part's own coordinates.
 */
export const meshPart = (p: Part, res = 96): THREE.BufferGeometry => {
  const f = partSdf(p);
  const min: Vec = [Infinity, Infinity, Infinity];
  const max: Vec = [-Infinity, -Infinity, -Infinity];
  for (const q of p.prims) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], q.min[i]);
      max[i] = Math.max(max[i], q.max[i]);
    }
  }
  const ext = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * 1.12 + 0.04;
  const c: Vec = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 400000);
  const half = res / 2;
  const cell = ext / res;
  const scale = 1 / cell;
  // Inside > isolation: field = iso − d / cell (about one unit per cell near the surface).
  for (let z = 0; z < res; z++) {
    const wz = c[2] + ((z - half) / half) * (ext / 2);
    for (let y = 0; y < res; y++) {
      const wy = c[1] + ((y - half) / half) * (ext / 2);
      const row = z * res * res + y * res;
      for (let x = 0; x < res; x++) {
        const wx = c[0] + ((x - half) / half) * (ext / 2);
        const d = f(wx, wy, wz);
        mc.field[row + x] = mc.isolation - Math.max(-8, Math.min(8, d * scale));
      }
    }
  }
  mc.update();
  const n = mc.count;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const e = 0.25 * cell;
  for (let i = 0; i < n; i++) {
    const x = c[0] + mc.positionArray[i * 3] * (ext / 2);
    const y = c[1] + mc.positionArray[i * 3 + 1] * (ext / 2);
    const z = c[2] + mc.positionArray[i * 3 + 2] * (ext / 2);
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    const gx = f(x + e, y, z) - f(x - e, y, z);
    const gy = f(x, y + e, z) - f(x, y - e, z);
    const gz = f(x, y, z + e) - f(x, y, z - e);
    const l = len3(gx, gy, gz) || 1;
    nor[i * 3] = gx / l;
    nor[i * 3 + 1] = gy / l;
    nor[i * 3 + 2] = gz / l;
  }
  mc.geometry.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.computeBoundingSphere();
  return g;
};

const cache = new Map<string, THREE.BufferGeometry>();
/** Meshes a part once per page and reuses it (all compositions, all frames). */
export const cachedPart = (key: string, make: () => Part, res?: number) => {
  let g = cache.get(key);
  if (!g) {
    g = meshPart(make(), res);
    cache.set(key, g);
  }
  return g;
};
