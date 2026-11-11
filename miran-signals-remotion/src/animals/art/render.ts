// The line-art animals: each figure is a few parts (body, head, a wing...), each part one or
// more smooth outlines filled with lit facets (a Delaunay mesh over points spread inside,
// raised into a soft relief so every facet catches the light differently), finished with
// thin bright facet edges, a crisp gold or silver outline and a few engraved detail lines.
// A frame is a pure function of the pose: the whole figure comes out as an SVG string.
import {C, P, delaunay, edgeDist, fillPoints, hash2, inside, outline} from './geo';

export type Metal = 'gold' | 'silver';

export type ArtPoly = {
  ctrl: C[];
  /** Outline sample spacing (shape units). */
  step?: number;
  /** Spacing of the points inside (bigger = bigger facets). */
  fill?: number;
  /** How high the middle stands (relief), and over what distance from the edge it rises. */
  relief?: number;
  reach?: number;
  /** Extra points that pin facets to the anatomy (shoulder, hip, jaw...). */
  landmarks?: P[];
};

export type ArtLine = {ctrl: C[]; closed?: boolean; w?: number; a?: number; dark?: boolean};

export type ArtPart = {
  name: string;
  parent?: string;
  pivot: P;
  /** Draw order: lower is further back. */
  layer: number;
  /** Brightness (far legs and the far wing sit back in shadow). */
  shade?: number;
  polys: ArtPoly[];
  lines?: ArtLine[];
};

export type ArtShape = {id: string; metal: Metal; parts: ArtPart[]};

export type PartPose = {rot?: number; sx?: number; sy?: number; dx?: number; dy?: number};

export type ArtPose = {
  /** Screen position (px) of the shape's origin, scale (px per shape unit), rotation, mirror. */
  x: number;
  y: number;
  s: number;
  rot?: number;
  flip?: boolean;
  parts?: Record<string, PartPose>;
  /** 0 → 1: the figure assembles (facets fly in along `revealDir`). */
  reveal?: number;
  revealDir?: P;
  /** 0 → 1: the figure breaks into its facets and they drift away. */
  vanish?: number;
  /** A band of light sweeping across (screen x, px), or null. */
  sheenX?: number | null;
  /** Overall brightness flash (0 = none). */
  flash?: number;
  opacity?: number;
};

type Mesh = {
  part: ArtPart;
  v: [number, number, number][];
  tris: [number, number, number][];
  loops: P[][];
  lines: {pts: P[]; closed: boolean; w: number; a: number; dark: boolean}[];
};

const meshes = new Map<string, Mesh[]>();

const buildPart = (part: ArtPart, seed: number): Mesh => {
  const v: [number, number, number][] = [];
  const tris: [number, number, number][] = [];
  const loops: P[][] = [];
  part.polys.forEach((poly, pi) => {
    const step = poly.step ?? 26;
    const fill = poly.fill ?? 64;
    const relief = poly.relief ?? 1;
    const reach = poly.reach ?? 160;
    const loop = outline(poly.ctrl, step);
    loops.push(loop);
    const inner = [...fillPoints(loop, fill, seed + pi * 17), ...(poly.landmarks ?? []).filter((p) => inside(p, loop) && edgeDist(p, loop) > step * 0.4)];
    // Drop fill points that crowd a landmark.
    const lm = poly.landmarks ?? [];
    const pts: P[] = [...loop, ...inner.filter((p, i) => i >= inner.length - lm.length || lm.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > fill * 0.45))];
    const base = v.length;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const d = i < loop.length ? 0 : edgeDist(p, loop);
      const h = Math.sqrt(Math.min(1, d / reach)) * relief * reach * 0.9 * (0.85 + 0.3 * hash2(p[0] + seed, p[1]));
      v.push([p[0], p[1], h]);
    }
    for (const [a, b, c] of delaunay(pts)) {
      const A = pts[a];
      const B = pts[b];
      const Cc = pts[c];
      const cen: P = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3];
      const mids: P[] = [
        [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2],
        [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2],
        [(Cc[0] + A[0]) / 2, (Cc[1] + A[1]) / 2],
      ];
      if (!inside(cen, loop)) continue;
      if (mids.some((m) => !inside(m, loop) && edgeDist(m, loop) > step * 0.2)) continue;
      tris.push([base + a, base + b, base + c]);
    }
  });
  const lines = (part.lines ?? []).map((l) => ({pts: outline(l.ctrl, 8, !!l.closed), closed: !!l.closed, w: l.w ?? 1.6, a: l.a ?? 0.8, dark: !!l.dark}));
  return {part, v, tris, loops, lines};
};

const getMeshes = (shape: ArtShape) => {
  let m = meshes.get(shape.id);
  if (!m) {
    m = shape.parts.map((p, i) => buildPart(p, i * 31 + shape.id.length * 7));
    meshes.set(shape.id, m);
  }
  return m;
};

/** Triangle count per shape (for the gallery). */
export const shapeStats = (shape: ArtShape) => getMeshes(shape).reduce((a, m) => a + m.tris.length, 0);

// ─── Colour ──────────────────────────────────────────────────────────────────

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PALETTE: Record<Metal, {stops: RGB[]; edge: RGB; line: RGB; dark: RGB}> = {
  gold: {
    stops: [hex('#2E1D07'), hex('#6B4614'), hex('#B07A2A'), hex('#E0AE50'), hex('#F6D78A'), hex('#FFF3D0')],
    edge: hex('#FFE7A6'),
    line: hex('#FFE29A'),
    dark: hex('#2A1A06'),
  },
  silver: {
    stops: [hex('#151A24'), hex('#3B4558'), hex('#6F7C93'), hex('#A9B4C7'), hex('#DCE3EE'), hex('#FFFFFF')],
    edge: hex('#F2F6FF'),
    line: hex('#EEF3FF'),
    dark: hex('#10141C'),
  },
};
const ramp = (stops: RGB[], k: number): RGB => {
  const x = Math.max(0, Math.min(0.9999, k)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
};
const css = (c: RGB, a = 1) =>
  a >= 0.999 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

/** The key light: from the upper left, in front. */
const LIGHT = (() => {
  const l = [-0.55, -0.75, 0.62];
  const n = Math.hypot(...l);
  return l.map((x) => x / n) as [number, number, number];
})();
const HALF = (() => {
  const h = [LIGHT[0], LIGHT[1], LIGHT[2] + 1];
  const n = Math.hypot(...h);
  return h.map((x) => x / n) as [number, number, number];
})();

// ─── Transforms ──────────────────────────────────────────────────────────────

/** 2D affine [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f. */
type M = [number, number, number, number, number, number];
const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
const T = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const R = (r: number): M => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
const S = (x: number, y: number): M => [x, 0, 0, y, 0, 0];
const ap = (m: M, x: number, y: number): P => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

const sm = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
const f2 = (x: number) => (Math.round(x * 10) / 10).toString();

/** One frame of one figure, as SVG elements (no wrapping <svg>). */
export const drawShape = (shape: ArtShape, pose: ArtPose, uid: string): string => {
  const ms = getMeshes(shape);
  const pal = PALETTE[shape.metal];
  const reveal = pose.reveal ?? 1;
  const vanish = pose.vanish ?? 0;
  const opacity = pose.opacity ?? 1;
  if (reveal <= 0 || vanish >= 1 || opacity <= 0) return '';
  const flip = pose.flip ? -1 : 1;
  const root: M = mul(mul(T(pose.x, pose.y), R(pose.rot ?? 0)), S(pose.s * flip, pose.s));

  // Part matrices, nested by parent.
  const mats = new Map<string, M>();
  const partM = (p: ArtPart): M => {
    const got = mats.get(p.name);
    if (got) return got;
    const parent = p.parent ? partM(shape.parts.find((q) => q.name === p.parent)!) : root;
    const pp = pose.parts?.[p.name] ?? {};
    const local = mul(mul(mul(T(p.pivot[0] + (pp.dx ?? 0), p.pivot[1] + (pp.dy ?? 0)), R(pp.rot ?? 0)), S(pp.sx ?? 1, pp.sy ?? 1)), T(-p.pivot[0], -p.pivot[1]));
    const m = mul(parent, local);
    mats.set(p.name, m);
    return m;
  };

  // The figure's extent in shape units, for the reveal and vanish ordering.
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const m of ms)
    for (const [x, y] of m.v) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const span = Math.max(x1 - x0, y1 - y0);
  const rd = pose.revealDir ?? [1, -0.35];
  const rl = Math.hypot(rd[0], rd[1]);
  const order = (x: number, y: number) => 0.5 + (((x - cx) * rd[0] + (y - cy) * rd[1]) / rl / span) * 0.95;
  const W = 0.32;

  const facets: string[] = [];
  const glows: string[] = [];
  const flash = pose.flash ?? 0;
  const sheenX = pose.sheenX ?? null;
  const sorted = [...ms].sort((a, b) => a.part.layer - b.part.layer);

  for (const m of sorted) {
    const M0 = partM(m.part);
    const shade = m.part.shade ?? 1;
    const sv = m.v.map(([x, y, z]) => {
      const [sx, sy] = ap(M0, x, y);
      return [sx, sy, z * pose.s] as [number, number, number];
    });
    // Scale and sign of this part on screen (mirrors flip the winding).
    const det = M0[0] * M0[3] - M0[1] * M0[2];
    let partRev = 1;
    let partVan = 0;
    const tri: string[] = [];
    for (const [a, b, c] of m.tris) {
      const A = sv[a];
      const B = sv[b];
      const Cc = sv[c];
      const ox = (m.v[a][0] + m.v[b][0] + m.v[c][0]) / 3;
      const oy = (m.v[a][1] + m.v[b][1] + m.v[c][1]) / 3;
      const hk = hash2(ox * 0.37, oy * 0.53);
      const k = order(ox, oy) + (hk - 0.5) * 0.12;
      const rIn = sm((reveal * (1 + W) - k) / W);
      const rOut = sm((vanish * (1 + W) - (1 - k)) / W);
      if (rIn <= 0.001 || rOut >= 0.999) continue;
      partRev = Math.min(partRev, rIn);
      partVan = Math.max(partVan, rOut);
      // Lighting from the facet's normal (z towards the viewer).
      const ux = B[0] - A[0];
      const uy = B[1] - A[1];
      const uz = B[2] - A[2];
      const vx = Cc[0] - A[0];
      const vy = Cc[1] - A[1];
      const vz = Cc[2] - A[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      if (nz * Math.sign(det || 1) < 0 || nz < 0) {
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;
      const diff = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const spec = Math.pow(Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]), 38);
      const rim = Math.pow(1 - nz, 2.2) * 0.35;
      const scx = (A[0] + B[0] + Cc[0]) / 3;
      const scy = (A[1] + B[1] + Cc[1]) / 3;
      const sheen = sheenX === null ? 0 : 0.35 * Math.exp(-Math.pow((scx - sheenX + (scy - pose.y) * 0.35) / 70, 2));
      const bounce = 0.16 * Math.max(0, ny);
      let lum = (0.16 + 0.6 * diff + bounce + rim + 0.06 * (hk - 0.5)) * shade + 0.55 * spec * shade + sheen + 0.25 * flash;
      lum = Math.max(0, Math.min(1.1, lum));
      const col = ramp(pal.stops, lum * 0.92);
      // Assemble: each facet grows out of its centre; break up: it shrinks and drifts away.
      const g = rIn * (1 - rOut);
      const drift = rOut * rOut;
      const dxv = (ox - cx) * 0.25 + (hk - 0.5) * 260;
      const dyv = (oy - cy) * 0.25 - 120 - hash2(oy, ox) * 200;
      const tx = drift * dxv * pose.s * flip;
      const ty = drift * dyv * pose.s + (1 - rIn) * (1 - rIn) * 40;
      const scl = 0.2 + 0.8 * g;
      const pt = (Q: [number, number, number]) => `${f2(scx + (Q[0] - scx) * scl + tx)},${f2(scy + (Q[1] - scy) * scl + ty)}`;
      const ea = 0.22 + 0.5 * spec + 0.6 * (1 - rIn) * rIn * 4 * (1 - rOut);
      tri.push(
        `<polygon points="${pt(A)} ${pt(B)} ${pt(Cc)}" fill="${css(col, g < 0.999 ? g : 1)}" stroke="${css(pal.edge, Math.min(1, ea) * g)}" stroke-width="0.9" stroke-linejoin="round"/>`,
      );
    }
    const partOut: string[] = [];
    const partDet: string[] = [];
    // The outline: drawn on along with the facets, gone once they break up.
    const oa = sm((reveal - 0.15) / 0.6) * (1 - sm(vanish / 0.35)) * Math.min(1, 0.4 + 0.6 * shade);
    if (oa > 0.001) {
      for (const loop of m.loops) {
        const d = 'M' + loop.map((p) => ap(M0, p[0], p[1]).map(f2).join(',')).join('L') + 'Z';
        const dash = sm(reveal / 0.8);
        const da = dash < 0.999 ? ` pathLength="1" stroke-dasharray="${dash.toFixed(4)} 1"` : '';
        partOut.push(`<path d="${d}" fill="none" stroke="${css(pal.line, 0.95 * oa)}" stroke-width="2.4" stroke-linejoin="round"${da}/>`);
        glows.push(`<path d="${d}" fill="none" stroke="${css(pal.line, 0.32 * oa)}" stroke-width="6" stroke-linejoin="round"${da}/>`);
      }
      for (const l of m.lines) {
        const d = 'M' + l.pts.map((p) => ap(M0, p[0], p[1]).map(f2).join(',')).join('L') + (l.closed ? 'Z' : '');
        partDet.push(`<path d="${d}" fill="none" stroke="${css(l.dark ? pal.dark : pal.line, l.a * oa)}" stroke-width="${f2(l.w * Math.max(0.6, pose.s * 1.4))}" stroke-linecap="round" stroke-linejoin="round"/>`);
      }
    }
    facets.push(tri.join('') + partDet.join('') + partOut.join(''));
    void partRev;
    void partVan;
  }

  return (
    `<g opacity="${opacity.toFixed(3)}">` +
    `<g filter="url(#${uid}-glow)">${glows.join('')}</g>` +
    facets.join('') +
    `</g>`
  );
};

/** The <defs> a figure's SVG needs (its glow filter). */
export const shapeDefs = (uid: string, blur = 7) =>
  `<defs><filter id="${uid}-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`;
