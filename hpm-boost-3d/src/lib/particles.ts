import * as THREE from 'three';

const VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute float aRot;
attribute vec3 aColor;
varying float vAlpha;
varying float vRot;
varying vec3 vColor;
uniform float uScale;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aAlpha <= 0.001 ? 0.0 : max(1.5, aSize * uScale / -mv.z);
  vAlpha = aAlpha;
  vRot = aRot;
  vColor = aColor;
}`;

const FRAG_EMBER = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = length(p);
  float a = smoothstep(1.0, 0.25, d);
  if (a * vAlpha < 0.06) discard;
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}`;

const FRAG_ASH = /* glsl */ `
varying float vAlpha;
varying float vRot;
varying vec3 vColor;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float c = cos(vRot), s = sin(vRot);
  p = mat2(c, -s, s, c) * p;
  p.y *= 1.9 + 0.6 * sin(vRot * 1.7);
  float ang = atan(p.y, p.x);
  float edge = 0.78 + 0.12 * sin(ang * 3.0 + vRot) + 0.07 * sin(ang * 7.0 - vRot * 2.0);
  float d = length(p);
  if (d > edge) discard;
  float shade = 0.75 + 0.25 * p.x;
  gl_FragColor = vec4(vColor * shade, vAlpha);
  if (vAlpha < 0.05) discard;
}`;

export type ParticleBuffers = {
  geometry: THREE.BufferGeometry;
  pos: Float32Array;
  color: Float32Array;
  size: Float32Array;
  alpha: Float32Array;
  rot: Float32Array;
  commit: () => void;
};

export const makeParticleBuffers = (n: number): ParticleBuffers => {
  const geometry = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const color = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const alpha = new Float32Array(n);
  const rot = new Float32Array(n);
  const attrs = {
    position: new THREE.BufferAttribute(pos, 3),
    aColor: new THREE.BufferAttribute(color, 3),
    aSize: new THREE.BufferAttribute(size, 1),
    aAlpha: new THREE.BufferAttribute(alpha, 1),
    aRot: new THREE.BufferAttribute(rot, 1),
  };
  Object.entries(attrs).forEach(([k, a]) => {
    a.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute(k, a);
  });
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return {
    geometry,
    pos,
    color,
    size,
    alpha,
    rot,
    commit: () => Object.values(attrs).forEach((a) => (a.needsUpdate = true)),
  };
};

export const makeEmberMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG_EMBER,
    uniforms: {uScale: {value: 1000}},
    transparent: true,
    // Writes depth so the depth of field treats embers like the solid objects around them.
    depthWrite: true,
    blending: THREE.AdditiveBlending,
  });

export const makeAshMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG_ASH,
    uniforms: {uScale: {value: 1000}},
    transparent: true,
    depthWrite: true,
  });

/** Pixels per world unit at distance 1 for the current camera and canvas. */
export const pointScale = (heightPx: number, fovDeg: number) => heightPx / (2 * Math.tan((fovDeg * Math.PI) / 360));
