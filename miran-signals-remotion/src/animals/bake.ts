// Turning a figure into meshes, and the compact format they are stored in (public/animals/,
// written by scripts/bake-animals.ts). Each part: shared vertices (positions and normals as
// 16-bit fixed point inside its box, the baked cavity shade as a byte) and 32-bit indices.
import * as THREE from 'three';
import type {FigureDef} from './figures';
import {Sdf, bakeCavity, meshPart, partSdf} from './sdf';

/** Mesh every part of a figure at rest, with the cavity shading from the whole figure's field. */
export const bakeFigure = (def: FigureDef) => {
  const parts = def.joints.map((j) => ({j, part: j.part()}));
  const fields = parts.map((p) => partSdf(p.part));
  const whole: Sdf = (x, y, z) => {
    let d = Infinity;
    for (const f of fields) d = Math.min(d, f(x, y, z));
    return d;
  };
  const cavity = def.cavity ?? {reach: 0.06, strength: 1.5, floor: 0.35};
  const out = new Map<string, THREE.BufferGeometry>();
  for (const p of parts) {
    const g = meshPart(p.part, p.j.res);
    bakeCavity(g, whole, cavity);
    out.set(p.j.name, g);
  }
  return out;
};

const HEADER = 40;
const q16 = (v: number, lo: number, hi: number) => Math.round(((v - lo) / (hi - lo || 1)) * 65534 - 32767);
const d16 = (q: number, lo: number, hi: number) => lo + ((q + 32767) / 65534) * (hi - lo);

/** Merge the marching-cubes triangle soup into shared vertices and pack it. */
export const encodePart = (g: THREE.BufferGeometry): Uint8Array => {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const col = g.getAttribute('color');
  const n = pos.count;
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    const v = [pos.getX(i), pos.getY(i), pos.getZ(i)];
    for (let k = 0; k < 3; k++) {
      lo[k] = Math.min(lo[k], v[k]);
      hi[k] = Math.max(hi[k], v[k]);
    }
  }
  const index = new Map<string, number>();
  const ids = new Uint32Array(n);
  const qp: number[] = [];
  const qn: number[] = [];
  const qc: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = q16(pos.getX(i), lo[0], hi[0]);
    const b = q16(pos.getY(i), lo[1], hi[1]);
    const c = q16(pos.getZ(i), lo[2], hi[2]);
    const key = `${a},${b},${c}`;
    let id = index.get(key);
    if (id === undefined) {
      id = qp.length / 3;
      index.set(key, id);
      qp.push(a, b, c);
      qn.push(Math.round(nor.getX(i) * 32767), Math.round(nor.getY(i) * 32767), Math.round(nor.getZ(i) * 32767));
      qc.push(Math.round(Math.max(0, Math.min(1, col.getX(i))) * 255));
    }
    ids[i] = id;
  }
  const v = qp.length / 3;
  const colEnd = HEADER + v * 12 + v;
  const idxAt = Math.ceil(colEnd / 4) * 4;
  const buf = new ArrayBuffer(idxAt + n * 4);
  const head = new DataView(buf);
  head.setUint32(0, v, true);
  head.setUint32(4, n, true);
  for (let k = 0; k < 3; k++) {
    head.setFloat32(16 + k * 4, lo[k], true);
    head.setFloat32(28 + k * 4, hi[k], true);
  }
  new Int16Array(buf, HEADER, v * 3).set(qp);
  new Int16Array(buf, HEADER + v * 6, v * 3).set(qn);
  new Uint8Array(buf, HEADER + v * 12, v).set(qc);
  new Uint32Array(buf, idxAt, n).set(ids);
  return new Uint8Array(buf);
};

export const decodePart = (buf: ArrayBuffer): THREE.BufferGeometry => {
  const head = new DataView(buf);
  const v = head.getUint32(0, true);
  const n = head.getUint32(4, true);
  const lo = [0, 1, 2].map((k) => head.getFloat32(16 + k * 4, true));
  const hi = [0, 1, 2].map((k) => head.getFloat32(28 + k * 4, true));
  const qp = new Int16Array(buf, HEADER, v * 3);
  const qn = new Int16Array(buf, HEADER + v * 6, v * 3);
  const qc = new Uint8Array(buf, HEADER + v * 12, v);
  const idxAt = Math.ceil((HEADER + v * 13) / 4) * 4;
  const pos = new Float32Array(v * 3);
  const nor = new Float32Array(v * 3);
  const col = new Float32Array(v * 3);
  for (let i = 0; i < v; i++) {
    for (let k = 0; k < 3; k++) pos[i * 3 + k] = d16(qp[i * 3 + k], lo[k], hi[k]);
    const x = qn[i * 3] / 32767;
    const y = qn[i * 3 + 1] / 32767;
    const z = qn[i * 3 + 2] / 32767;
    const l = Math.hypot(x, y, z) || 1;
    nor[i * 3] = x / l;
    nor[i * 3 + 1] = y / l;
    nor[i * 3 + 2] = z / l;
    const c = qc[i] / 255;
    col[i * 3] = c;
    col[i * 3 + 1] = c;
    col[i * 3 + 2] = c;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(buf.slice(idxAt, idxAt + n * 4)), 1));
  g.computeBoundingSphere();
  return g;
};
