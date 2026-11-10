// Sculpting from primitives: each part of an animal is a signed distance field built from
// ellipsoids, tapered capsules and rounded boxes joined with smooth unions (so the joins read
// as one cast surface), with carved detail (grooves, sockets, nostrils), sculpted surface
// texture (fur strands, feathers, pleats) and inset eyes. It is turned into a mesh once with
// marching cubes, with normals from the field's own gradient (so texture finer than the mesh
// still shades), and a baked cavity term (ambient occlusion from the field) in the vertex
// colours, which darkens creases the way a cast and polished statue does. Everything here
// runs once at mount and is cached: no per-frame work, no state.
import * as THREE from 'three';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';

export type Vec = [number, number, number];
export type Sdf = (x: number, y: number, z: number) => number;
/** A primitive with an axis-aligned bound (for culling) and an optional blend of its own. */
export type Bounded = {f: Sdf; min: Vec; max: Vec; k?: number};

const len3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);
const norm = (v: Vec): Vec => {
  const l = len3(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const crossV = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Give a primitive its own blend width. */
export const withK = <T extends Bounded>(p: T, k: number): T => ({...p, k});
export const allK = (ps: Bounded[], k: number) => ps.map((p) => withK(p, k));

/** Rotation (Euler XYZ, radians) applied to the query point, inverse of the shape's rotation. */
const rotator = (rot?: Vec) => {
  if (!rot || (rot[0] === 0 && rot[1] === 0 && rot[2] === 0)) return null;
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])).invert();
  const e = m.elements;
  return (x: number, y: number, z: number): Vec => [e[0] * x + e[4] * y + e[8] * z, e[1] * x + e[5] * y + e[9] * z, e[2] * x + e[6] * y + e[10] * z];
};

const ellDist = (px: number, py: number, pz: number, r: Vec) => {
  const k0 = len3(px / r[0], py / r[1], pz / r[2]);
  const k1 = len3(px / (r[0] * r[0]), py / (r[1] * r[1]), pz / (r[2] * r[2]));
  return k1 === 0 ? -Math.min(r[0], r[1], r[2]) : (k0 * (k0 - 1)) / k1;
};

/** Ellipsoid with radii r, centre c, optional rotation (Euler XYZ). */
export const ell = (c: Vec, r: Vec, rot?: Vec): Bounded => {
  const R = rotator(rot);
  const m = Math.max(...r);
  return {
    f: (x, y, z) => {
      let px = x - c[0];
      let py = y - c[1];
      let pz = z - c[2];
      if (R) [px, py, pz] = R(px, py, pz);
      return ellDist(px, py, pz, r);
    },
    min: [c[0] - m, c[1] - m, c[2] - m],
    max: [c[0] + m, c[1] + m, c[2] + m],
  };
};

/**
 * A flattened ellipsoid spanning a → b: `w` is its half width, `th` its half thickness, and
 * `up` the direction its thickness faces (feathers, fins, flukes, ears, claws' blades).
 */
export const blade = (a: Vec, b: Vec, w: number, th: number, up: Vec = [0, 1, 0]): Bounded => {
  const ax = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const side = norm(crossV(up, ax));
  const n = crossV(ax, side);
  const half = len3(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2;
  const c: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const r: Vec = [half, th, w];
  const m = Math.max(half, w, th);
  return {
    f: (x, y, z) => {
      const p: Vec = [x - c[0], y - c[1], z - c[2]];
      return ellDist(dot(p, ax), dot(p, n), dot(p, side), r);
    },
    min: [c[0] - m, c[1] - m, c[2] - m],
    max: [c[0] + m, c[1] + m, c[2] + m],
  };
};

/**
 * A feather (or any flat blade with rounded ends): a slab spanning a → b, `w` its half width
 * at the root and `wb` at the tip (rounded ends), `th` its half thickness, with rounded edges.
 */
export const feather = (a: Vec, b: Vec, w: number, wb: number, th: number, up: Vec = [0, 1, 0]): Bounded => {
  const ax = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const side = norm(crossV(up, ax));
  const n = crossV(ax, side);
  const L = len3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const m = Math.max(w, wb) + th;
  const r = th * 0.9;
  return {
    f: (x, y, z) => {
      const p: Vec = [x - a[0], y - a[1], z - a[2]];
      const u = dot(p, ax);
      const v = dot(p, side);
      const h = Math.abs(dot(p, n));
      // The plan: a capsule from 0 to L whose radius goes from w to wb (2D round cone).
      const t = Math.max(0, Math.min(1, u / L));
      const ww = w + (wb - w) * t;
      const du = u < 0 ? u : u > L ? u - L : 0;
      const plan = Math.sqrt(du * du + v * v) - ww;
      const qx = Math.max(plan + r, 0);
      const qy = Math.max(h - th + r, 0);
      return Math.sqrt(qx * qx + qy * qy) + Math.min(Math.max(plan + r, h - th + r), 0) - r;
    },
    min: [Math.min(a[0], b[0]) - m, Math.min(a[1], b[1]) - m, Math.min(a[2], b[2]) - m],
    max: [Math.max(a[0], b[0]) + m, Math.max(a[1], b[1]) + m, Math.max(a[2], b[2]) + m],
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

/** A chain of tapered capsules through [x, y, z, radius] points (horns, legs, tails, claws). */
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

// ─── Noise (deterministic, for sculpted texture) ─────────────────────────────

const hash3 = (x: number, y: number, z: number) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h & 0xffff) / 0x7fff - 1;
};
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** Value noise in [-1, 1]. */
export const noise3 = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const w = fade(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
};

/**
 * Carved strands (fur, feather barbs): ridged noise stretched along `flow`, so grooves run
 * that way. Returns a displacement (≥ 0 carves in) of up to `amp`, highest along thin lines.
 */
export const strands = (amp: number, freq: number, flow: (x: number, y: number, z: number) => Vec, stretch = 4, sharp = 5) => (x: number, y: number, z: number) => {
  const d = norm(flow(x, y, z));
  // Squash the noise along the flow direction: p' = p + (stretch⁻¹ − 1)(p·d)d.
  const s = (1 / stretch - 1) * (x * d[0] + y * d[1] + z * d[2]);
  const qx = (x + s * d[0]) * freq;
  const qy = (y + s * d[1]) * freq;
  const qz = (z + s * d[2]) * freq;
  const warp = 0.6 * noise3(qx * 0.37 + 11, qy * 0.37, qz * 0.37);
  const n = noise3(qx + warp, qy - warp, qz + 3.1);
  // Thin grooves along the noise's zero lines, so the surface reads as carved strokes.
  return amp * Math.pow(1 - Math.abs(n), sharp);
};

/**
 * Overlapping shingles (feathers on a bird's body, locks of fur): rows of rounded or pointed
 * scales, each rising from its root to a proud free edge, the rows offset by half a scale.
 * `map` gives a point's surface coordinates: u along the flow (towards the free edges) and
 * v across it, both in units. Returns a displacement (≥ 0 carves in) of up to `amp`.
 */
export const shingles = (amp: number, cell: [number, number], map: (x: number, y: number, z: number) => [number, number], point = 2) => (x: number, y: number, z: number) => {
  const [u, v] = map(x, y, z);
  const fu = u / cell[0];
  const row = Math.floor(fu);
  const a = fu - row;
  const fv = v / cell[1] + (((row % 2) + 2) % 2) * 0.5 + 0.37 * Math.sin(row * 1.7);
  const col = Math.floor(fv);
  const b = fv - col - 0.5;
  // Each scale a little different: its length and how far it stands proud.
  const r1 = 0.5 + 0.5 * hash3(row, col, 7);
  const r2 = 0.5 + 0.5 * hash3(row, col, 13);
  const edge = (1 - Math.pow(Math.abs(2 * b), point) * 0.6) * (0.78 + 0.22 * r1);
  let d: number;
  if (a < edge) d = 1 - a / edge;
  else {
    const t = Math.min(1, (a - edge) / 0.3);
    d = t * t * (3 - 2 * t);
  }
  return amp * (0.75 + 0.25 * r2) * (0.8 * d + 0.2 * (2 * b) * (2 * b));
};

/** A smooth 0 → 1 → 0 mask: 1 inside the ellipsoid (c, r), fading out over `soft`. */
export const regionMask = (c: Vec, r: Vec, soft = 0.4) => (x: number, y: number, z: number) => {
  const q = len3((x - c[0]) / r[0], (y - c[1]) / r[1], (z - c[2]) / r[2]);
  const t = Math.max(0, Math.min(1, (1 + soft - q) / soft));
  return t * t * (3 - 2 * t);
};

// ─── Parts ───────────────────────────────────────────────────────────────────

/** Polynomial smooth minimum. */
const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const smaxSub = (d: number, e: number, k: number) => {
  const h = Math.max(k - Math.abs(d - e), 0) / k;
  return Math.max(d, e) + h * h * k * 0.25;
};

export type Part = {
  /** Primitives joined with a smooth union of width `blend` (or each one's own `k`). */
  prims: Bounded[];
  blend?: number;
  /** Sculpted surface texture: a displacement (≥ 0 carves in) added near the surface. */
  detail?: Sdf;
  /** The largest displacement `detail` returns (for culling). */
  detailAmp?: number;
  /** Primitives carved out afterwards (smooth subtraction, `k` default 0.02). */
  carve?: Bounded[];
  /** Primitives added last, after the carving (eyes set in their sockets, lids), `k` default 0.006. */
  after?: Bounded[];
};

/** Lower bound on the distance from a point to a primitive's box. */
const boxDist = (b: Bounded, x: number, y: number, z: number) => {
  const dx = Math.max(b.min[0] - x, 0, x - b.max[0]);
  const dy = Math.max(b.min[1] - y, 0, y - b.max[1]);
  const dz = Math.max(b.min[2] - z, 0, z - b.max[2]);
  return len3(dx, dy, dz);
};
// The ellipsoid distance is an estimate, so culling keeps a margin.
const CULL = 0.7;

export const partSdf = (p: Part): Sdf => {
  const k0 = p.blend ?? 0.06;
  const prims = p.prims;
  const carve = p.carve ?? [];
  const after = p.after ?? [];
  const band = (p.detailAmp ?? 0) * 3 + 0.01;
  return (x, y, z) => {
    let d = Infinity;
    for (let i = 0; i < prims.length; i++) {
      const q = prims[i];
      const k = q.k ?? k0;
      if (boxDist(q, x, y, z) * CULL > d + k) continue;
      d = smin(d, q.f(x, y, z), k);
    }
    if (p.detail && Math.abs(d) < band) d += p.detail(x, y, z);
    for (let i = 0; i < carve.length; i++) {
      const q = carve[i];
      const k = q.k ?? 0.02;
      if (boxDist(q, x, y, z) * CULL > k - d) continue;
      d = smaxSub(d, -q.f(x, y, z), k);
    }
    for (let i = 0; i < after.length; i++) {
      const q = after[i];
      const k = q.k ?? 0.006;
      if (boxDist(q, x, y, z) * CULL > d + k) continue;
      d = smin(d, q.f(x, y, z), k);
    }
    return d;
  };
};

const partBox = (p: Part) => {
  const min: Vec = [Infinity, Infinity, Infinity];
  const max: Vec = [-Infinity, -Infinity, -Infinity];
  for (const q of [...p.prims, ...(p.after ?? [])]) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], q.min[i]);
      max[i] = Math.max(max[i], q.max[i]);
    }
  }
  return {min, max};
};

/**
 * Mesh a part: marching cubes over its bounding box at `res` cells along the longest side,
 * with smooth normals from the field gradient. Blocks of cells far from the surface are
 * filled without evaluating the field. Returns a non-indexed BufferGeometry in the part's
 * own coordinates.
 */
export const meshPart = (p: Part, res = 96): THREE.BufferGeometry => {
  const f = partSdf(p);
  const {min, max} = partBox(p);
  const ext = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * 1.08 + 0.04;
  const c: Vec = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 1500000);
  const half = res / 2;
  const cell = ext / res;
  const scale = 1 / cell;
  const world = (i: number, ci: number) => ci + ((i - half) / half) * (ext / 2);
  // Inside > isolation: field = iso − d / cell (about one unit per cell near the surface).
  const B = 4;
  const far = (8 + B * 0.87 * 2) * cell;
  for (let bz = 0; bz < res; bz += B) {
    for (let by = 0; by < res; by += B) {
      for (let bx = 0; bx < res; bx += B) {
        const dc = f(world(bx + B / 2, c[0]), world(by + B / 2, c[1]), world(bz + B / 2, c[2]));
        if (Math.abs(dc) > far * 1.6) {
          const v = mc.isolation - (dc > 0 ? 8 : -8);
          for (let z = bz; z < Math.min(res, bz + B); z++)
            for (let y = by; y < Math.min(res, by + B); y++) for (let x = bx; x < Math.min(res, bx + B); x++) mc.field[z * res * res + y * res + x] = v;
          continue;
        }
        for (let z = bz; z < Math.min(res, bz + B); z++) {
          const wz = world(z, c[2]);
          for (let y = by; y < Math.min(res, by + B); y++) {
            const wy = world(y, c[1]);
            const row = z * res * res + y * res;
            for (let x = bx; x < Math.min(res, bx + B); x++) {
              const d = f(world(x, c[0]), wy, wz);
              mc.field[row + x] = mc.isolation - Math.max(-8, Math.min(8, d * scale));
            }
          }
        }
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

/**
 * Bake a cavity term into vertex colours: ambient occlusion sampled from the whole figure's
 * field (all its parts, at rest) along each normal. Creases, the gaps between feathers or
 * strands, and the joins between parts come out darker.
 */
export const bakeCavity = (g: THREE.BufferGeometry, field: Sdf, opts: {reach: number; strength: number; floor: number}) => {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const nor = g.getAttribute('normal') as THREE.BufferAttribute;
  const n = pos.count;
  const col = new Float32Array(n * 3);
  const steps = [0.08, 0.2, 0.45, 1];
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const nx = nor.getX(i);
    const ny = nor.getY(i);
    const nz = nor.getZ(i);
    let occ = 0;
    let wsum = 0;
    for (let s = 0; s < steps.length; s++) {
      const h = steps[s] * opts.reach;
      const d = field(x + nx * h, y + ny * h, z + nz * h);
      const w = 1 / (1 + s);
      occ += w * Math.max(0, h - d) / h;
      wsum += w;
    }
    const ao = Math.max(0, 1 - opts.strength * (occ / wsum));
    const v = opts.floor + (1 - opts.floor) * ao * ao;
    col[i * 3] = v;
    col[i * 3 + 1] = v;
    col[i * 3 + 2] = v;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
};
