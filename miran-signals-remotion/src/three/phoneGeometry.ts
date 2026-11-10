// Procedural iPhone-style phone geometry (no logos, no brand marks).
//
// The outline uses continuous ("squircle") corners: each corner is a superellipse quadrant,
// so the curvature eases in from the straight sides instead of starting abruptly like a
// circular arc. The frame is a sweep of that outline times a superellipse edge profile
// (flat titanium sides with softly rounded edges into the glass). Normals are analytic, so
// the metal shades smoothly (no flatShading: it produced NaN pixels in software WebGL).
//
// Antenna bands: thin dark strips across the frame, made with vertex colours on extra
// vertices placed exactly at the band edges.
import * as THREE from 'three';
import {PHONE, SCREEN} from '../lib/story';

/** Corner superellipse exponent (2 = circle) and how much larger than the nominal radius it reaches. */
const CORNER_N = 2.7;
const CORNER_REACH = 1.22;

type PathPt = {x: number; y: number; nx: number; ny: number; dark: number};

/**
 * Points, outward normals and antenna flags around a continuous-corner rounded rectangle
 * (counter-clockwise, closed). `bands` lists band centres along each straight edge.
 */
const outlinePath = (
  w: number,
  h: number,
  r: number,
  {perCorner = 22, bands = {top: [] as number[], bottom: [] as number[], left: [] as number[], right: [] as number[]}, bandW = 0.009} = {},
): PathPt[] => {
  const R = Math.min(r * CORNER_REACH, w / 2 - 1e-4, h / 2 - 1e-4);
  const n = CORNER_N;
  const corner = (cx: number, cy: number, a0: number) => {
    const pts: PathPt[] = [];
    for (let i = 0; i <= perCorner; i++) {
      const a = a0 + (i / perCorner) * (Math.PI / 2);
      const c = Math.cos(a);
      const s = Math.sin(a);
      const px = R * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
      const py = R * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
      // Gradient of |x/R|^n + |y/R|^n.
      let gx = Math.sign(px) * Math.pow(Math.abs(px) / R, n - 1);
      let gy = Math.sign(py) * Math.pow(Math.abs(py) / R, n - 1);
      const l = Math.hypot(gx, gy) || 1;
      gx /= l;
      gy /= l;
      pts.push({x: cx + px, y: cy + py, nx: gx, ny: gy, dark: 0});
    }
    return pts;
  };
  /** Straight edge from (x0, y0) to (x1, y1), with sharp dark bands at the given positions. */
  const edge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number, centres: number[], along: 'x' | 'y') => {
    const pts: PathPt[] = [];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const dir = [(x1 - x0) / len, (y1 - y0) / len];
    const start = along === 'x' ? x0 : y0;
    const sgn = along === 'x' ? Math.sign(x1 - x0) : Math.sign(y1 - y0);
    const ds = centres.map((c) => (c - start) * sgn).filter((d) => d > bandW && d < len - bandW).sort((a, b) => a - b);
    const at = (d: number, dark: number) => pts.push({x: x0 + dir[0] * d, y: y0 + dir[1] * d, nx, ny, dark});
    for (const d of ds) {
      at(d - bandW / 2, 0);
      at(d - bandW / 2, 1);
      at(d + bandW / 2, 1);
      at(d + bandW / 2, 0);
    }
    return pts;
  };
  const hw = w / 2;
  const hh = h / 2;
  return [
    ...corner(hw - R, hh - R, 0),
    ...edge(hw - R, hh, -hw + R, hh, 0, 1, bands.top, 'x'),
    ...corner(-hw + R, hh - R, Math.PI / 2),
    ...edge(-hw, hh - R, -hw, -hh + R, -1, 0, bands.left, 'y'),
    ...corner(-hw + R, -hh + R, Math.PI),
    ...edge(-hw + R, -hh, hw - R, -hh, 0, -1, bands.bottom, 'x'),
    ...corner(hw - R, -hh + R, (3 * Math.PI) / 2),
    ...edge(hw, -hh + R, hw, hh - R, 1, 0, bands.right, 'y'),
  ];
};

/** Flat continuous-corner plate facing +z, with UVs mapped 0–1 across its bounds. */
export const plateGeometry = (w: number, h: number, r: number) => {
  const pts = outlinePath(w, h, r, {perCorner: 28});
  const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, p.y)));
  const g = new THREE.ShapeGeometry(shape, 1);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return g;
};

/** Edge bulge of the frame (how far the sides roll out past the glass outline). */
const BULGE = 0.008;

/**
 * A continuous-corner band swept by a superellipse profile, centred on z = 0.
 * Its flat faces (z = ±depth/2) are open: cover them with plates of size (width − 2·bulge).
 * Vertex colours carry the antenna bands (1 = metal, BAND_SHADE = dark band).
 */
export const sweepGeometry = ({
  width,
  height,
  radius,
  depth,
  bulge,
  n = 6,
  bands,
}: {width: number; height: number; radius: number; depth: number; bulge: number; n?: number; bands?: {top: number[]; bottom: number[]; left: number[]; right: number[]}}) => {
  const a = bulge;
  const b = depth / 2;
  const pts = outlinePath(width - 2 * a, height - 2 * a, radius - a, {bands});
  const M = 30;
  const prof: {o: number; z: number; no: number; nz: number}[] = [];
  for (let j = 0; j <= M; j++) {
    const phi = -Math.PI / 2 + (j / M) * Math.PI;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const o = a * Math.pow(Math.max(0, c), 2 / n);
    const z = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    let no = (n * Math.pow(o / a, n - 1)) / a;
    let nz = (n * Math.sign(z) * Math.pow(Math.abs(z) / b, n - 1)) / b;
    const l = Math.hypot(no, nz) || 1;
    no /= l;
    nz /= l;
    prof.push({o, z, no, nz});
  }
  const N = pts.length;
  const position: number[] = [];
  const normal: number[] = [];
  const color: number[] = [];
  const uv: number[] = [];
  for (let i = 0; i <= N; i++) {
    const p = pts[i % N];
    // Bands stop just short of the glass edges, like the real ones.
    for (let j = 0; j <= M; j++) {
      const q = prof[j];
      position.push(p.x + p.nx * q.o, p.y + p.ny * q.o, q.z);
      normal.push(p.nx * q.no, p.ny * q.no, q.nz);
      const inBand = p.dark > 0 && j > 2 && j < M - 2;
      const shade = inBand ? BAND_SHADE : 1;
      color.push(shade, shade, shade);
      uv.push(i / N, j / M);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a0 = i * (M + 1) + j;
      const a1 = (i + 1) * (M + 1) + j;
      index.push(a0, a1, a0 + 1, a1, a1 + 1, a0 + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  return g;
};

const BAND_SHADE = 0.16;

/** The phone frame, with antenna bands where an iPhone-style frame has them. */
export const frameGeometry = () => {
  const hh = PHONE.height / 2;
  return sweepGeometry({
    width: PHONE.width,
    height: PHONE.height,
    radius: PHONE.cornerRadius,
    depth: PHONE.depth,
    bulge: BULGE,
    bands: {top: [0.14], bottom: [-0.2, 0.2], left: [hh - 0.16, -hh + 0.16], right: [hh - 0.16, -hh + 0.16]},
  });
};

/** The glass outline (front and back plates sit exactly on the frame's flat faces). */
export const GLASS = {
  width: PHONE.width - 2 * BULGE,
  height: PHONE.height - 2 * BULGE,
  radius: PHONE.cornerRadius - BULGE,
};

export const SCREEN_RADIUS = GLASS.radius - (GLASS.width - SCREEN.width) / 2;
