import * as THREE from 'three';
import {COLORS} from '../../config';
import {PILLAR_H, TILE} from '../grid';

const lin = (hex: string) => new THREE.Color(hex);

const NOISE = /* glsl */ `
float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float noise3(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
// Distance to the nearest Voronoi edge (crack network).
float voronoiEdge(vec2 x){
  vec2 n = floor(x); vec2 f = fract(x); vec2 mg, mr; float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j)); vec2 o = hash22(n + g); vec2 r = g + o - f; float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  md = 8.0;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j)); vec2 o = hash22(n + g); vec2 r = g + o - f;
    if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
  }
  return md;
}
`;

// ── Pillars: gold metal (env-lit) with per-instance glow / red / cracks / dissolve / grey / heat ──
export const makePillarMaterial = () => {
  const mat = new THREE.MeshStandardMaterial({color: lin(COLORS.gold), metalness: 1, roughness: 0.3, envMapIntensity: 1.5, emissive: new THREE.Color(0, 0, 0)});
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uGoldE = {value: lin(COLORS.goldLight)};
    sh.uniforms.uRedE = {value: lin(COLORS.red)};
    sh.uniforms.uRedBase = {value: new THREE.Color(COLORS.red).multiplyScalar(0.35)};
    sh.uniforms.uGoldB = {value: lin(COLORS.gold)};
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nattribute vec4 aFx; attribute vec4 aFx2; varying vec4 vFx; varying vec4 vFx2; varying vec3 vLocal;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvFx = aFx; vFx2 = aFx2; vLocal = position;`);
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform vec3 uGoldE; uniform vec3 uGoldB; uniform vec3 uRedE; uniform vec3 uRedBase; varying vec4 vFx; varying vec4 vFx2; varying vec3 vLocal;\n${NOISE}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `float nd = 1.0;
        if (vFx.w > 0.002) {
          nd = noise3(vLocal * vec3(7.0, 3.5, 7.0) + vFx2.z * 17.0) * 0.75 + noise3(vLocal * 19.0 + vFx2.z * 5.0) * 0.25;
          if (nd < vFx.w * 1.08 - 0.02) discard;
        }
        #include <clipping_planes_fragment>`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, uRedBase, vFx.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16), vFx2.x);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.55, max(vFx.y * 0.7, vFx2.x));`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.35, max(vFx2.x, vFx.y * 0.75));`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float hgt = clamp(vLocal.y / ${PILLAR_H.toFixed(3)}, 0.0, 1.2);
        float live = (1.0 - vFx.y) * (1.0 - vFx2.x);
        totalEmissiveRadiance += (uGoldB * (0.1 + 0.5 * pow(hgt, 2.5)) + uGoldE * 1.15 * smoothstep(0.975, 1.0, hgt)) * vFx.x * live;
        if (vFx.z > 0.002) {
          float cn = abs(noise3(vLocal * vec3(10.0, 4.0, 10.0) + vFx2.z * 7.0) - 0.5);
          float crackLine = 1.0 - smoothstep(0.0, 0.022 + 0.03 * vFx.z, cn);
          totalEmissiveRadiance += uRedE * crackLine * vFx.z * 4.0;
        }
        totalEmissiveRadiance += uRedE * vFx.y * (0.22 + 0.45 * hgt);
        if (vFx.w > 0.002) {
          float edge = 1.0 - smoothstep(0.0, 0.07, nd - (vFx.w * 1.08 - 0.02));
          totalEmissiveRadiance += uRedE * edge * 5.0;
        }
        totalEmissiveRadiance += vec3(1.0, 0.86, 0.62) * vFx2.y * 2.2;`,
      );
  };
  return mat;
};

// ── Reflections: the pillars mirrored under the glass, additive and stencil-masked to the tiles ──
export const makeReflectionMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uGold: {value: lin(COLORS.gold)},
      uRed: {value: lin(COLORS.red)},
      ...THREE.UniformsLib.fog,
    },
    vertexShader: /* glsl */ `
      attribute vec4 aFx; attribute vec4 aFx2;
      varying float vFade; varying vec4 vFx; varying vec4 vFx2; varying float vSide;
      #include <fog_pars_vertex>
      void main(){
        vFx = aFx; vFx2 = aFx2;
        vFade = 1.0 - clamp(position.y / ${PILLAR_H.toFixed(3)}, 0.0, 1.0);
        vSide = abs(normal.y) < 0.5 ? 1.0 : 0.6;
        vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGold; uniform vec3 uRed;
      varying float vFade; varying vec4 vFx; varying vec4 vFx2; varying float vSide;
      #include <fog_pars_fragment>
      void main(){
        vec3 c = mix(uGold, uRed, vFx.y) * (0.16 + 0.12 * vFx.x) * vSide;
        c *= vFade * vFade * vFx2.w * (1.0 - vFx2.x);
        gl_FragColor = vec4(c, 1.0);
        #include <fog_fragment>
      }`,
    fog: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.EqualStencilFunc,
    stencilFail: THREE.KeepStencilOp,
    stencilZFail: THREE.KeepStencilOp,
    stencilZPass: THREE.KeepStencilOp,
  });

// ── Tiles: floating black glass with a gold rim, red cracks, and the whisper ripple ──
const TILE_VERT = /* glsl */ `
  attribute vec4 aT1; attribute vec4 aT2;
  uniform float uHalfSign;
  varying vec3 vN; varying vec3 vWorld; varying vec2 vUv2; varying vec4 vT1; varying vec4 vT2; varying float vTop;
  #include <fog_pars_vertex>
  void main(){
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vUv2 = vec2((position.x + uHalfSign * ${(TILE / 4).toFixed(4)}) / ${TILE.toFixed(3)} + 0.5, position.z / ${TILE.toFixed(3)} + 0.5);
    vTop = normal.y;
    vT1 = aT1; vT2 = aT2;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;

export const makeTileMaterial = (halfSign: number) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uHalfSign: {value: halfSign},
      uGold: {value: lin(COLORS.gold)},
      uGoldL: {value: lin(COLORS.goldLight)},
      uRed: {value: lin(COLORS.red)},
      uRipple: {value: lin(COLORS.whisper)},
      uKey: {value: new THREE.Vector3(-0.35, 1, -0.55).normalize()},
      uSheen: {value: 1},
      ...THREE.UniformsLib.fog,
    },
    vertexShader: TILE_VERT,
    fragmentShader: /* glsl */ `
      uniform vec3 uGold; uniform vec3 uGoldL; uniform vec3 uRed; uniform vec3 uRipple; uniform vec3 uKey; uniform float uSheen;
      varying vec3 vN; varying vec3 vWorld; varying vec2 vUv2; varying vec4 vT1; varying vec4 vT2; varying float vTop;
      #include <fog_pars_fragment>
      ${NOISE}
      void main(){
        float glow = vT1.x; float dead = vT1.y; float flash = vT1.z; float opacity = vT1.w;
        float seed = vT2.y; float ripple = vT2.z;
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vWorld);
        vec2 uv = vUv2;
        vec2 e2 = min(uv, 1.0 - uv);
        float e = min(e2.x, e2.y);
        float top = step(0.5, vTop);
        // Black glass: a faint fresnel sheen and a long soft highlight from an overhead softbox.
        float ndv = max(dot(N, V), 0.0);
        float fres = pow(1.0 - ndv, 5.0);
        vec3 R = reflect(-V, N);
        float spec = pow(max(dot(R, uKey), 0.0), 24.0);
        vec3 col = vec3(0.006, 0.0055, 0.005) + (fres * vec3(0.05, 0.042, 0.03) + spec * vec3(0.05, 0.04, 0.026)) * uSheen * (1.0 - 0.6 * dead);
        // Micro-variation so the glass is not flat.
        col *= 0.85 + 0.3 * hash12(floor(uv * 6.0) + seed * 9.0);
        // Gold rim: a crisp line plus a soft inner bloom.
        float rim = exp(-e * 140.0) * 1.5 + exp(-e * 30.0) * 0.05;
        col += (top > 0.5 ? uGoldL : uGold * 0.6) * rim * glow;
        // Cracks spread out from the centre as the tile dies (only evaluated on dying/dead tiles).
        float crackLine = 0.0;
        if (max(dead, flash) > 0.002 && top > 0.5) {
          vec2 cuv = (uv - 0.5) * 3.2 + seed * 17.0;
          float ve = voronoiEdge(cuv);
          float r = length(uv - 0.5);
          float spreadMask = smoothstep(max(dead, flash) * 0.95, max(dead, flash) * 0.95 - 0.12, r);
          crackLine = (1.0 - smoothstep(0.0, 0.035, ve)) * spreadMask;
          vec2 cd = uv - 0.5 + vec2(1e-4, 0.0);
          float radial = 1.0 - smoothstep(0.0, 0.02, abs(sin(atan(cd.y, cd.x) * 3.0 + seed * 40.0)) * r);
          crackLine = max(crackLine, radial * spreadMask * 0.7);
        }
        col *= 1.0 - 0.45 * dead;
        col += uRed * crackLine * (0.22 * dead + 2.6 * flash) * top;
        col += uRed * flash * 0.06;
        // Whisper ripple: a pale ring passing through the glass.
        col += uRipple * ripple * (0.08 + 0.6 * exp(-e * 22.0)) * top;
        float a = clamp(opacity * (top > 0.5 ? 1.0 : 0.95), 0.0, 1.0);
        // Never let a stray NaN/Inf reach the bloom (it would smear across the frame).
        if (any(isnan(col)) || any(isinf(col))) col = vec3(0.0);
        gl_FragColor = vec4(clamp(col, 0.0, 6.0), a);
        #include <fog_fragment>
      }`,
    fog: true,
    transparent: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    depthWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilZPass: THREE.ReplaceStencilOp,
  });

/** Depth-only copy of the tiles so pillars that fall below the floor are hidden by the glass. */
export const makeTileDepthMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute vec4 aT1; varying float vOp;
      void main(){ vOp = aT1.w; gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `varying float vOp; void main(){ if (vOp < 0.6) discard; gl_FragColor = vec4(0.0); }`,
    colorWrite: false,
    depthWrite: true,
  });
