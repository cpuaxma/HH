import * as THREE from "three";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A closed tube along `curve` whose radius follows `radius(t, theta)`. Rings wrap, so there is no seam. */
export function profiledTube(
  curve: THREE.Curve<THREE.Vector3>,
  radius: (t: number, theta: number) => number,
  segments = 200,
  radial = 64,
  squash = 1,
) {
  const frames = curve.computeFrenetFrames(segments, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, p);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j < radial; j++) {
      const th = (j / radial) * Math.PI * 2;
      const r = radius(t, th);
      const c = Math.cos(th) * r;
      const s = Math.sin(th) * r * squash;
      pos.push(p.x + N.x * c + B.x * s, p.y + N.y * c + B.y * s, p.z + N.z * c + B.z * s);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const BODY_R = 0.5;
const CAP = 0.085; // share of the body length that rounds the shoulder

/** The chili body: broad round shoulder, long taper, a curl at the tip, faint lengthwise lobes. */
export function chiliBody(detail: "full" | "lite") {
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 2.0, 0),
      new THREE.Vector3(0, 1.55, 0),
      new THREE.Vector3(0.07, 0.85, 0.05),
      new THREE.Vector3(-0.06, 0.05, 0.02),
      new THREE.Vector3(-0.36, -0.8, -0.04),
      new THREE.Vector3(-0.9, -1.45, 0.04),
      new THREE.Vector3(-1.5, -1.78, 0.14),
      new THREE.Vector3(-1.82, -1.74, 0.2),
    ],
    false,
    "centripetal",
  );
  const radius = (t: number, th: number) => {
    const cap = t < CAP ? Math.sqrt(Math.max(0, 1 - Math.pow(1 - t / CAP, 2))) : 1;
    const taper = Math.pow(Math.max(0, 1 - t), 0.62);
    const tip = t > 0.975 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.975) / 0.025, 2))) : 1;
    const lobeAmt = smooth(0.06, 0.22, t) * (1 - smooth(0.8, 1, t));
    const lobes = 1 + lobeAmt * (0.05 * Math.cos(3 * th + 1.4 * t) + 0.018 * Math.cos(5 * th - 4 * t));
    const wobble = 1 + 0.012 * Math.sin(t * 23 + th);
    return BODY_R * cap * Math.max(taper, 0.035) * tip * lobes * wobble;
  };
  const seg = detail === "full" ? 260 : 150;
  const rad = detail === "full" ? 72 : 40;
  return { geometry: profiledTube(curve, radius, seg, rad, 0.93), length: curve.getLength() };
}

/** Calyx: a five-lobed cap that hugs the shoulder and droops over it. */
export function calyx(bodyLength: number, detail: "full" | "lite") {
  const D = CAP * bodyLength; // depth of the rounded shoulder
  const U = detail === "full" ? 28 : 16;
  const T = detail === "full" ? 120 : 60;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= U; i++) {
    const u = i / U;
    for (let j = 0; j < T; j++) {
      const th = (j / T) * Math.PI * 2;
      const lobe = 0.62 + 0.38 * Math.pow(0.5 + 0.5 * Math.cos(5 * th), 1.6);
      const rho = Math.min(u * BODY_R * 1.02 * lobe, BODY_R * 0.985);
      const k = rho / BODY_R;
      const depth = D * (1 - Math.sqrt(Math.max(0, 1 - k * k)));
      const lift = 0.035 + 0.02 * (1 - u);
      const rr = rho + 0.03 * k;
      pos.push(Math.cos(th) * rr, 2.0 - depth + lift, Math.sin(th) * rr * 0.93);
    }
  }
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < T; j++) {
      const a = i * T + j;
      const b = i * T + ((j + 1) % T);
      const c = (i + 1) * T + j;
      const d = (i + 1) * T + ((j + 1) % T);
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Stem: flared where it meets the calyx, bending away, with a cut, rounded end. */
export function stem(detail: "full" | "lite") {
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 1.98, 0),
      new THREE.Vector3(0.01, 2.22, 0),
      new THREE.Vector3(0.09, 2.5, 0.02),
      new THREE.Vector3(0.28, 2.7, 0.05),
      new THREE.Vector3(0.48, 2.76, 0.08),
    ],
    false,
    "centripetal",
  );
  const radius = (t: number) => {
    const flare = 1 + 1.3 * (1 - smooth(0, 0.22, t));
    const end = t > 0.94 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.94) / 0.06, 2))) : 1;
    return 0.062 * flare * Math.pow(end, 0.3);
  };
  return profiledTube(curve, radius, detail === "full" ? 60 : 30, detail === "full" ? 24 : 14);
}
