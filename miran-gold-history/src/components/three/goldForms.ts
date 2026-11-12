import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Deterministic smooth-ish 3D noise from sines (enough for lumpy nuggets and hammered metal). */
const n3 = (x: number, y: number, z: number, seed = 0) =>
  Math.sin(x * 2.1 + seed) * Math.cos(y * 1.7 - seed * 0.7) * Math.sin(z * 2.3 + seed * 1.3) +
  0.5 * Math.sin(x * 4.3 - y * 3.1 + seed) * Math.cos(z * 3.7 + seed * 2.1);

const finish = (g: THREE.BufferGeometry) => {
  g.computeVertexNormals();
  return g;
};

/** A lumpy natural nugget. */
export const nuggetGeometry = (seed = 0) => {
  // Merge the icosahedron's split vertices so the normals come out smooth, not faceted.
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 5).deleteAttribute('normal').deleteAttribute('uv'));
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const r = 1 + 0.2 * n3(v.x, v.y, v.z, seed) + 0.05 * n3(v.x * 3, v.y * 3, v.z * 3, seed + 4);
    v.multiplyScalar(r);
    v.y *= 0.72;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  return finish(g);
};

/** A simple hammered bangle. */
export const bangleGeometry = () => {
  const g = new THREE.TorusGeometry(0.95, 0.17, 48, 180);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const dent = 1 + 0.018 * n3(v.x * 6, v.y * 6, v.z * 6, 2);
    p.setXYZ(i, v.x * dent, v.y * dent, v.z * dent);
  }
  return finish(g);
};

/** Lathe a half profile [radius, height] into a disc facing +z. */
const disc = (profile: [number, number][], segments = 160) => {
  const g = new THREE.LatheGeometry(
    [...profile].reverse().map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
  g.rotateX(Math.PI / 2);
  return finish(g);
};

/** A domed sun disc. */
export const sunGeometry = () =>
  disc([
    [0, 0.16],
    [0.5, 0.13],
    [0.85, 0.08],
    [0.97, 0.06],
    [1, 0.02],
    [1, -0.02],
    [0.97, -0.06],
    [0, -0.06],
  ]);

/** The crisp dinar: thin, with a raised rim and two engraved rings (no inscriptions). */
export const dinarGeometry = () =>
  disc([
    [0, 0.045],
    [0.36, 0.045],
    [0.38, 0.06],
    [0.4, 0.045],
    [0.66, 0.045],
    [0.68, 0.06],
    [0.7, 0.045],
    [0.88, 0.05],
    [0.91, 0.075],
    [0.98, 0.075],
    [1, 0.05],
    [1, -0.05],
    [0.98, -0.075],
    [0.91, -0.075],
    [0.88, -0.05],
    [0, -0.045],
  ]);

/** A thick, slightly irregular Lydian coin with an abstract lion-head (a maned roundel) on its face. */
export const lydianGeometry = () => {
  const body = disc(
    [
      [0, 0.12],
      [0.8, 0.11],
      [0.95, 0.08],
      [1, 0.02],
      [1, -0.04],
      [0.94, -0.1],
      [0, -0.11],
    ],
    96,
  );
  // Irregular outline: ancient coins were struck from uneven blanks.
  const p = body.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.y, v.x);
    const k = 1 + 0.05 * Math.sin(a * 3 + 0.7) + 0.03 * Math.sin(a * 5 + 2);
    p.setXYZ(i, v.x * k * 1.04, v.y * k * 0.96, v.z);
  }
  finish(body);
  // Maned roundel: a 14-spike star with a raised centre.
  const mane = new THREE.Shape();
  const spikes = 14;
  for (let i = 0; i <= spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.6 : 0.46;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) mane.moveTo(x, y);
    else mane.lineTo(x, y);
  }
  const maneG = new THREE.ExtrudeGeometry(mane, {depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2});
  maneG.translate(0, 0, 0.11);
  const head = new THREE.CylinderGeometry(0.3, 0.32, 0.1, 48);
  head.rotateX(Math.PI / 2);
  head.translate(0.02, 0, 0.17);
  return {body, maneG: finish(maneG), head: finish(head)};
};

/** A stamped bar: trapezoid ingot with a raised plaque on its top face. */
export const barGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.62, 0);
  s.lineTo(0.62, 0);
  s.lineTo(0.42, 0.36);
  s.lineTo(-0.42, 0.36);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 2.1, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.05, bevelSegments: 8, curveSegments: 4});
  g.center();
  g.rotateY(Math.PI / 2);
  const plaque = new RoundedBoxGeometry(1.2, 0.03, 0.5, 2, 0.012);
  plaque.translate(0, 0.235, 0);
  return {body: finish(g), plaque: finish(plaque)};
};

export const cubeGeometry = () => finish(new RoundedBoxGeometry(2, 2, 2, 6, 0.06));

/** A shallow prospector's pan (dark metal), facing up. */
export const panGeometry = () => {
  const g = new THREE.LatheGeometry(
    [
      [0, -0.08],
      [0.9, -0.08],
      [1.35, 0.22],
      [1.42, 0.26],
      [1.44, 0.22],
      [1.36, 0.17],
      [0.9, -0.03],
      [0, -0.03],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    96,
  );
  return finish(g);
};

export const NUGGET_PILE: {p: [number, number, number]; s: number; seed: number}[] = [
  {p: [0, 0.05, 0], s: 0.3, seed: 1},
  {p: [-0.45, 0.02, 0.2], s: 0.22, seed: 2},
  {p: [0.42, 0.03, -0.1], s: 0.24, seed: 3},
  {p: [0.15, 0.02, 0.45], s: 0.18, seed: 4},
  {p: [-0.2, 0.02, -0.42], s: 0.2, seed: 5},
  {p: [0.62, 0.01, 0.32], s: 0.14, seed: 6},
];

/** Polished gold; `heat` (0–1) makes it glow molten. */
export const goldMaterial = (roughness = 0.2) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#F2C15A'),
    metalness: 1,
    roughness,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.3,
    emissive: new THREE.Color('#FF6A10'),
    emissiveIntensity: 0,
  });
