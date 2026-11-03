// Glossy glass for the screens and the black bezel, cheap enough for software WebGL.
//
// The screen is the UI texture (unlit, so text stays exactly as drawn) under a glass layer:
// a Fresnel-weighted reflection of a painted studio (a big softbox overhead, two rim strips,
// the warm floor). The reflection moves correctly with the camera, so the glass reads as
// glass, while costing a fraction of a full PBR clear-coat with area lights.
import * as THREE from 'three';

let studioTex: THREE.Texture | null = null;

/** Equirectangular "studio" for the glass reflections: softboxes on a dark surround. */
export const studioReflection = () => {
  if (studioTex) return studioTex;
  const w = 512;
  const h = 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  // Surround: dark above, the warm off-white floor below the horizon.
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a1918');
  g.addColorStop(0.47, '#3a3835');
  g.addColorStop(0.53, '#8f8a82');
  g.addColorStop(1, '#6d6860');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const soft = (x: number, y: number, rw: number, rh: number, a: number, blur: number) => {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = `rgba(255,250,242,${a})`;
    ctx.beginPath();
    ctx.roundRect(x - rw / 2, y - rh / 2, rw, rh, Math.min(rw, rh) * 0.2);
    ctx.fill();
    ctx.restore();
  };
  // u = 0.5 is behind the camera (+z), v = 0 is straight up.
  soft(w * 0.5, h * 0.2, w * 0.34, h * 0.13, 1, 6); // overhead softbox, front
  soft(w * 0.3, h * 0.36, w * 0.05, h * 0.36, 0.7, 4); // left strip
  soft(w * 0.7, h * 0.36, w * 0.05, h * 0.36, 0.7, 4); // right strip
  soft(w * 0.02, h * 0.3, w * 0.06, h * 0.3, 0.5, 4); // rims behind
  soft(w * 0.98, h * 0.3, w * 0.06, h * 0.3, 0.5, 4);
  studioTex = new THREE.CanvasTexture(c);
  studioTex.colorSpace = THREE.SRGBColorSpace;
  studioTex.wrapS = THREE.RepeatWrapping;
  return studioTex;
};

const vert = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform sampler2D map;
uniform bool hasMap;
uniform vec3 base;
uniform float brightness;
uniform sampler2D refl;
uniform float reflStrength;
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormal;
const float PI = 3.141592653589793;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  if (!gl_FrontFacing) N = -N;
  vec3 R = reflect(-V, N);
  float cosT = clamp(dot(N, V), 0.0, 1.0);
  float fres = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);
  vec2 ruv = vec2(atan(R.x, R.z) / (2.0 * PI) + 0.5, acos(clamp(R.y, -1.0, 1.0)) / PI);
  vec3 env = texture2D(refl, ruv).rgb * 3.2;
  vec3 c = hasMap ? texture2D(map, vUv).rgb * brightness : base;
  // Glass: the emissive image shows through (less at grazing angles), reflections on top.
  c = c * (1.0 - fres) + env * fres * reflStrength;
  gl_FragColor = vec4(c, 1.0);
}`;

export const glassMaterial = ({map, base = '#050506', reflStrength = 1}: {map?: THREE.Texture; base?: string; reflStrength?: number}) =>
  new THREE.ShaderMaterial({
    uniforms: {
      map: {value: map ?? null},
      hasMap: {value: !!map},
      base: {value: new THREE.Color(base)},
      brightness: {value: 1},
      refl: {value: studioReflection()},
      reflStrength: {value: reflStrength},
    },
    vertexShader: vert,
    fragmentShader: frag,
  });
