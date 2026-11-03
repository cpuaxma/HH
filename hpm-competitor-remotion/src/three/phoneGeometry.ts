// Procedural, unbranded phone geometry.
//
// The frame is a sweep: a rounded-rectangle path (the phone outline) times a superellipse
// edge profile (flat satin sides that roll into the glass). Every normal is computed
// analytically from that profile, so the aluminium shades smoothly with no faceting
// (and no flatShading, which produced NaN pixels in software WebGL).
import * as THREE from 'three';
import {PHONE, SCREEN} from '../lib/story';

/** Points and outward normals around a rounded rectangle (counter-clockwise, closed). */
const roundedRectPath = (w: number, h: number, r: number, perCorner = 18) => {
  const pts: [number, number][] = [];
  const nrm: [number, number][] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= perCorner; i++) {
      const a = a0 + (i / perCorner) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      nrm.push([Math.cos(a), Math.sin(a)]);
    }
  }
  return {pts, nrm};
};

export const roundedRectShape = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w / 2 + r, h / 2);
  s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w / 2, -h / 2 + r);
  s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, (3 * Math.PI) / 2, false);
  return s;
};

/** Flat rounded-rect plate facing +z with UVs mapped 0–1 across its bounds. */
export const plateGeometry = (w: number, h: number, r: number) => {
  const g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 24);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return g;
};

/** Edge bulge of the phone frame (how far the sides roll out past the glass outline). */
const BULGE = 0.012;

/**
 * A rounded-rect band swept by a superellipse profile, centred on z = 0.
 * Its flat faces (z = ±depth/2) are open: cover them with plates of size (width − 2·bulge).
 */
export const sweepGeometry = ({
  width,
  height,
  radius,
  depth,
  bulge,
  n = 4,
}: {width: number; height: number; radius: number; depth: number; bulge: number; n?: number}) => {
  const a = bulge;
  const b = depth / 2;
  const {pts, nrm} = roundedRectPath(width - 2 * a, height - 2 * a, radius - a);
  const M = 28;
  const prof: {o: number; z: number; no: number; nz: number}[] = [];
  for (let j = 0; j <= M; j++) {
    const phi = -Math.PI / 2 + (j / M) * Math.PI;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const o = a * Math.pow(Math.max(0, c), 2 / n);
    const z = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    // Gradient of (o/a)^n + (|z|/b)^n
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
  const uv: number[] = [];
  for (let i = 0; i <= N; i++) {
    const k = i % N;
    const [px, py] = pts[k];
    const [nx, ny] = nrm[k];
    for (let j = 0; j <= M; j++) {
      const p = prof[j];
      position.push(px + nx * p.o, py + ny * p.o, p.z);
      normal.push(nx * p.no, ny * p.no, p.nz);
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
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  return g;
};

export const frameGeometry = () =>
  sweepGeometry({width: PHONE.width, height: PHONE.height, radius: PHONE.cornerRadius, depth: PHONE.depth, bulge: BULGE});

/** The glass outline (front and back plates sit exactly on the frame's flat faces). */
export const GLASS = {
  width: PHONE.width - 2 * BULGE,
  height: PHONE.height - 2 * BULGE,
  radius: PHONE.cornerRadius - BULGE,
};

export const SCREEN_RADIUS = GLASS.radius - (GLASS.width - SCREEN.width) / 2;
