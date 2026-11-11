// 2D geometry for the line-art animals: smooth outlines from a few control points, point
// sampling inside a shape, and a Delaunay triangulation. Pure and deterministic.

export type P = [number, number];
/** A control point: [x, y], or [x, y, 1] for a sharp corner (hoof edges, horn tips, beaks). */
export type C = [number, number] | [number, number, 1];

const sharp = (c: C) => c.length === 3;

/** A closed Catmull-Rom outline through the control points, resampled every `step` units. */
export const outline = (ctrl: C[], step: number, closed = true): P[] => {
  const n = ctrl.length;
  const dense: P[] = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p1 = ctrl[i];
    const p2 = ctrl[(i + 1) % n];
    const p0 = sharp(p1) || (!closed && i === 0) ? p1 : ctrl[(i - 1 + n) % n];
    const p3 = sharp(p2) || (!closed && i + 2 >= n) ? p2 : ctrl[(i + 2) % n];
    for (let k = 0; k < 24; k++) {
      const u = k / 24;
      const cr = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      dense.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if (!closed) dense.push([ctrl[n - 1][0], ctrl[n - 1][1]]);
  // Resample by arc length, keeping the sharp corners exactly.
  const corners = new Set<number>();
  ctrl.forEach((c, i) => {
    if (sharp(c)) corners.add(i * 24);
  });
  const out: P[] = [];
  let acc = 0;
  out.push(dense[0]);
  for (let i = 1; i < dense.length; i++) {
    const a = dense[i - 1];
    const b = dense[i];
    acc += Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (corners.has(i)) {
      out.push(b);
      acc = 0;
    } else if (acc >= step) {
      out.push(b);
      acc = 0;
    }
  }
  if (closed) {
    const f = out[0];
    const l = out[out.length - 1];
    if (Math.hypot(f[0] - l[0], f[1] - l[1]) < step * 0.5) out.pop();
  }
  return out;
};

export const inside = (p: P, poly: P[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};

const segDist = (p: P, a: P, b: P) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = dx * dx + dy * dy || 1;
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l));
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
};

export const edgeDist = (p: P, poly: P[]) => {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) d = Math.min(d, segDist(p, poly[i], poly[j]));
  return d;
};

export const hash2 = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Points spread evenly inside a shape (a jittered triangular grid), away from its edge. */
export const fillPoints = (poly: P[], spacing: number, seed: number): P[] => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of poly) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  const out: P[] = [];
  const h = spacing * 0.866;
  let row = 0;
  for (let y = y0 + h * 0.5; y < y1; y += h, row++) {
    for (let x = x0 + (row % 2 ? spacing * 0.5 : 0); x < x1; x += spacing) {
      const jx = (hash2(x + seed, y) - 0.5) * spacing * 0.5;
      const jy = (hash2(y + seed * 3, x) - 0.5) * spacing * 0.5;
      const p: P = [x + jx, y + jy];
      if (inside(p, poly) && edgeDist(p, poly) > spacing * 0.45) out.push(p);
    }
  }
  return out;
};

/** Delaunay triangulation (Bowyer-Watson). Returns index triples. */
export const delaunay = (pts: P[]): [number, number, number][] => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  const d = Math.max(x1 - x0, y1 - y0) * 20;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const all: P[] = [...pts, [cx - d, cy - d], [cx + d, cy - d], [cx, cy + d]];
  const n = pts.length;
  type Tri = {a: number; b: number; c: number; x: number; y: number; r2: number};
  const circ = (a: number, b: number, c: number): Tri => {
    const [ax, ay] = all[a];
    const [bx, by] = all[b];
    const [qx, qy] = all[c];
    const D = 2 * (ax * (by - qy) + bx * (qy - ay) + qx * (ay - by)) || 1e-9;
    const ux = ((ax * ax + ay * ay) * (by - qy) + (bx * bx + by * by) * (qy - ay) + (qx * qx + qy * qy) * (ay - by)) / D;
    const uy = ((ax * ax + ay * ay) * (qx - bx) + (bx * bx + by * by) * (ax - qx) + (qx * qx + qy * qy) * (bx - ax)) / D;
    return {a, b, c, x: ux, y: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2};
  };
  let tris: Tri[] = [circ(n, n + 1, n + 2)];
  for (let i = 0; i < n; i++) {
    const [px, py] = all[i];
    const bad: Tri[] = [];
    const keep: Tri[] = [];
    for (const t of tris) ((px - t.x) ** 2 + (py - t.y) ** 2 < t.r2 ? bad : keep).push(t);
    const edges = new Map<string, [number, number]>();
    for (const t of bad) {
      for (const [u, v] of [
        [t.a, t.b],
        [t.b, t.c],
        [t.c, t.a],
      ]) {
        const k = u < v ? `${u},${v}` : `${v},${u}`;
        if (edges.has(k)) edges.delete(k);
        else edges.set(k, [u, v]);
      }
    }
    for (const [u, v] of edges.values()) keep.push(circ(u, v, i));
    tris = keep;
  }
  return tris.filter((t) => t.a < n && t.b < n && t.c < n).map((t) => [t.a, t.b, t.c]);
};
