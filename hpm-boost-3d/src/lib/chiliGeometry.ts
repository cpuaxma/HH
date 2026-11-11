import * as THREE from 'three';

/**
 * A procedurally modelled red chili. The pod is a tube swept along a gently
 * curved spine with a rounded shoulder, three soft lobes and a pointed tip;
 * the calyx is a lobed cap hugging the shoulder; the stem is a short bent tube.
 * Long axis along +x (stem end at -x), centred on its bounding box.
 */
export const CHILI = {length: 8.4, radius: 1.12};

const spine = (s: number) =>
  new THREE.Vector3((s - 0.5) * CHILI.length, 0.75 * s - 1.65 * Math.pow(s, 2.2), 0.32 * Math.sin(Math.PI * s) * (s - 0.35));

const radiusAt = (s: number) => {
  const sh = 0.1;
  if (s < sh) {
    const x = (sh - s) / sh;
    return CHILI.radius * Math.pow(Math.max(0, 1 - Math.pow(x, 2.4)), 0.5) * (0.94 + 0.06 * (1 - x));
  }
  const q = (s - sh) / (1 - sh);
  const tip = Math.pow(Math.max(0, 1 - q), 0.78);
  const roundTip = 1 - Math.pow(Math.max(0, (q - 0.96) / 0.04), 2) * 0.0;
  return CHILI.radius * tip * (1 + 0.05 * Math.sin(q * 5.5)) * roundTip;
};

const lobes = (s: number, phi: number) => 1 + 0.05 * Math.cos(3 * phi + 1.4 * s) + 0.02 * Math.cos(5 * phi - 3 * s);

type Frame = {p: THREE.Vector3; t: THREE.Vector3; n: THREE.Vector3; b: THREE.Vector3};

const frames = (nu: number): Frame[] => {
  const out: Frame[] = [];
  let n = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= nu; i++) {
    const s = i / nu;
    const p = spine(s);
    const t = spine(Math.min(1, s + 1e-3)).sub(spine(Math.max(0, s - 1e-3))).normalize();
    // Parallel transport: remove the tangent component from the previous normal.
    n = n.clone().sub(t.clone().multiplyScalar(n.dot(t))).normalize();
    const b = new THREE.Vector3().crossVectors(t, n).normalize();
    out.push({p, t, n, b});
  }
  return out;
};

const surface = (f: Frame, s: number, phi: number, offset = 0) => {
  const r = radiusAt(s) * lobes(s, phi) + offset;
  return f.p.clone().addScaledVector(f.n, Math.cos(phi) * r).addScaledVector(f.b, Math.sin(phi) * r);
};

export const buildChili = () => {
  const NU = 180;
  const NV = 56;
  const fr = frames(NU);
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NU; i++) {
    const s = i / NU;
    for (let j = 0; j <= NV; j++) {
      const phi = (j / NV) * Math.PI * 2;
      const p = surface(fr[i], s, phi);
      pos.push(p.x, p.y, p.z);
      uv.push(s, j / NV);
    }
  }
  for (let i = 0; i < NU; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j;
      const b = a + NV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  body.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  body.setIndex(idx);
  body.computeVertexNormals();
  // Fix the seam: average normals of the duplicated first/last ring vertices.
  const nrm = body.attributes.normal;
  for (let i = 0; i <= NU; i++) {
    const a = i * (NV + 1);
    const b = a + NV;
    const v = new THREE.Vector3(nrm.getX(a) + nrm.getX(b), nrm.getY(a) + nrm.getY(b), nrm.getZ(a) + nrm.getZ(b)).normalize();
    nrm.setXYZ(a, v.x, v.y, v.z);
    nrm.setXYZ(b, v.x, v.y, v.z);
  }
  body.computeTangents();

  // Calyx: a lobed cap over the shoulder, slightly proud of the skin.
  const CU = 24;
  const cpos: number[] = [];
  const cidx: number[] = [];
  for (let i = 0; i <= CU; i++) {
    const w = i / CU;
    for (let j = 0; j <= NV; j++) {
      const phi = (j / NV) * Math.PI * 2;
      const edge = 0.045 + 0.05 * Math.pow(0.5 + 0.5 * Math.cos(5 * phi + 0.4), 1.6);
      const s = w * edge;
      const fi = Math.min(NU, Math.round(s * NU));
      const lift = 0.045 + 0.02 * (1 - w);
      const p = surface(fr[fi], s, phi, lift * (w < 0.98 ? 1 : 0.4));
      cpos.push(p.x, p.y, p.z);
    }
  }
  for (let i = 0; i < CU; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j;
      const b = a + NV + 1;
      cidx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const calyx = new THREE.BufferGeometry();
  calyx.setAttribute('position', new THREE.Float32BufferAttribute(cpos, 3));
  calyx.setIndex(cidx);
  calyx.computeVertexNormals();

  // Stem: grows out of the shoulder and bends upward.
  const p0 = spine(0);
  const t0 = fr[0].t.clone().negate();
  const up = new THREE.Vector3(0, 1, 0);
  const curve = new THREE.CatmullRomCurve3([
    p0.clone().addScaledVector(t0, -0.1),
    p0.clone().addScaledVector(t0, 0.55).addScaledVector(up, 0.1),
    p0.clone().addScaledVector(t0, 1.15).addScaledVector(up, 0.55),
    p0.clone().addScaledVector(t0, 1.45).addScaledVector(up, 1.2).add(new THREE.Vector3(0, 0, 0.15)),
  ]);
  const stem = new THREE.TubeGeometry(curve, 40, 0.17, 18, false);
  const capPos = curve.getPoint(1);
  const capDir = curve.getTangent(1);

  // Centre everything on the pod's bounding box.
  body.computeBoundingBox();
  const c = new THREE.Vector3();
  body.boundingBox!.getCenter(c);
  [body, calyx, stem].forEach((g) => g.translate(-c.x, -c.y, -c.z));
  return {body, calyx, stem, cap: {pos: capPos.sub(c), dir: capDir}};
};
