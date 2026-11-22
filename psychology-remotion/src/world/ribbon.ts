import * as THREE from 'three';
import {VIDEO} from '../config';

/**
 * A camera-facing ribbon through a list of points. Width is in world units but never thinner than
 * `minPx`, so the same line works for the close chase cam and the far chart view. The profile is
 * a soft gaussian (glow) with an optional hot core, and it is drawn additively, so there are no
 * hard edges to alias.
 */
export class RibbonGeometry extends THREE.BufferGeometry {
  readonly count: number;
  private pos: Float32Array;
  private prev: Float32Array;
  private next: Float32Array;

  constructor(count: number, colors?: THREE.Color[]) {
    super();
    this.count = count;
    const v = count * 2;
    this.pos = new Float32Array(v * 3);
    this.prev = new Float32Array(v * 3);
    this.next = new Float32Array(v * 3);
    const side = new Float32Array(v);
    const u = new Float32Array(v);
    const col = new Float32Array(v * 3);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      for (let k = 0; k < 2; k++) {
        const j = i * 2 + k;
        side[j] = k === 0 ? -1 : 1;
        u[j] = t;
        const c = colors?.[i] ?? new THREE.Color(1, 1, 1);
        col[j * 3] = c.r;
        col[j * 3 + 1] = c.g;
        col[j * 3 + 2] = c.b;
      }
    }
    const index: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.setIndex(index);
    this.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.setAttribute('aPrev', new THREE.BufferAttribute(this.prev, 3));
    this.setAttribute('aNext', new THREE.BufferAttribute(this.next, 3));
    this.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    this.setAttribute('aU', new THREE.BufferAttribute(u, 1));
    this.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  }

  /** points: flat xyz array with `count` points */
  setPoints(points: ArrayLike<number>) {
    const n = this.count;
    for (let i = 0; i < n; i++) {
      const ip = Math.max(0, i - 1);
      const inx = Math.min(n - 1, i + 1);
      for (let k = 0; k < 2; k++) {
        const j = (i * 2 + k) * 3;
        for (let c = 0; c < 3; c++) {
          this.pos[j + c] = points[i * 3 + c];
          this.prev[j + c] = points[ip * 3 + c];
          this.next[j + c] = points[inx * 3 + c];
        }
      }
    }
    (this.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (this.getAttribute('aPrev') as THREE.BufferAttribute).needsUpdate = true;
    (this.getAttribute('aNext') as THREE.BufferAttribute).needsUpdate = true;
  }
}

const vertexShader = /* glsl */ `
uniform vec2 uRes;
uniform float uWidth;
uniform float uMinPx;
uniform float uNear;
attribute vec3 aPrev;
attribute vec3 aNext;
attribute float aSide;
attribute float aU;
attribute vec3 aColor;
varying float vSide;
varying float vU;
varying vec3 vColor;
varying float vDepth;
varying float vPx;

void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 c = mvp * vec4(position, 1.0);
  vec4 p = mvp * vec4(aPrev, 1.0);
  vec4 n = mvp * vec4(aNext, 1.0);
  vSide = aSide;
  vU = aU;
  vColor = aColor;
  // keep the vertex in front of the camera: slide it toward the neighbour that is in front
  if (c.w < uNear) {
    vec4 q = n.w > p.w ? n : p;
    if (q.w > uNear) {
      c = mix(c, q, (uNear - c.w) / (q.w - c.w));
    } else {
      gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
      vDepth = -1.0;
      vPx = 0.0;
      return;
    }
  }
  if (p.w < uNear) p = c;
  if (n.w < uNear) n = c;
  vDepth = c.w;
  vec2 half_ = uRes * 0.5;
  vec2 cs = c.xy / c.w * half_;
  vec2 ps = p.xy / p.w * half_;
  vec2 ns = n.xy / n.w * half_;
  vec2 d1 = cs - ps;
  vec2 d2 = ns - cs;
  vec2 dir = length(d1) + length(d2) > 1e-5 ? normalize(normalize(d1 + 1e-6) + normalize(d2 + 1e-6)) : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float px = uWidth * projectionMatrix[1][1] * half_.y / c.w;
  px = max(px, uMinPx);
  vPx = px;
  c.xy += nrm * aSide * px / half_ * c.w;
  gl_Position = c;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uGold;
uniform float uGoldMix;
uniform vec3 uTint;
uniform float uIntensity;
uniform float uCore;
uniform float uSharp;
uniform float uOpacity;
uniform float uFog;
uniform vec2 uNearFade;
uniform vec2 uDraw;
uniform float uOrbU;
uniform float uTrail;
uniform float uTrailBoost;
uniform float uPulseU;
uniform float uPulseAmt;
varying float vSide;
varying float vU;
varying vec3 vColor;
varying float vDepth;
varying float vPx;

void main() {
  if (vDepth < 0.0) discard;
  if (vU < uDraw.x || vU > uDraw.y + 0.0005) discard;
  float d = abs(vSide);
  float prof = exp(-d * d * uSharp);
  float core = uCore > 0.0 ? exp(-d * d * 60.0) * uCore : 0.0;
  vec3 col = mix(vColor, uGold, uGoldMix) * uTint;
  // glowing wake behind the orb
  float behind = uOrbU - vU;
  float wake = behind >= -0.002 ? exp(-max(behind, 0.0) / max(uTrail, 1e-4)) : 0.0;
  float boost = 1.0 + wake * uTrailBoost + uPulseAmt * exp(-pow((vU - uPulseU) / 0.035, 2.0));
  vec3 c = col * prof * uIntensity * boost + vec3(1.0, 0.96, 0.88) * core * boost;
  float fog = exp(-vDepth * uFog);
  float nearK = smoothstep(uNearFade.x, uNearFade.y, vDepth);
  // soft end at the draw head
  float head = smoothstep(uDraw.y + 0.0005, uDraw.y - 0.004, vU);
  float a = uOpacity * fog * nearK * (uDraw.y >= 1.0 ? 1.0 : head);
  gl_FragColor = vec4(c, a);
}
`;

export type RibbonUniforms = {
  uRes: {value: THREE.Vector2};
  uWidth: {value: number};
  uMinPx: {value: number};
  uNear: {value: number};
  uGold: {value: THREE.Color};
  uGoldMix: {value: number};
  uTint: {value: THREE.Color};
  uIntensity: {value: number};
  uCore: {value: number};
  uSharp: {value: number};
  uOpacity: {value: number};
  uFog: {value: number};
  uNearFade: {value: THREE.Vector2};
  uDraw: {value: THREE.Vector2};
  uOrbU: {value: number};
  uTrail: {value: number};
  uTrailBoost: {value: number};
  uPulseU: {value: number};
  uPulseAmt: {value: number};
};

export const makeRibbonMaterial = (o: Partial<{width: number; minPx: number; intensity: number; core: number; sharp: number; gold: string}> = {}) => {
  const uniforms: RibbonUniforms = {
    uRes: {value: new THREE.Vector2(VIDEO.width, VIDEO.height)},
    uWidth: {value: o.width ?? 0.1},
    uMinPx: {value: o.minPx ?? 1},
    uNear: {value: 0.15},
    uGold: {value: new THREE.Color(o.gold ?? '#D4AF37')},
    uGoldMix: {value: 0},
    uTint: {value: new THREE.Color(1, 1, 1)},
    uIntensity: {value: o.intensity ?? 1},
    uCore: {value: o.core ?? 0},
    uSharp: {value: o.sharp ?? 4},
    uOpacity: {value: 1},
    uFog: {value: 0},
    uNearFade: {value: new THREE.Vector2(0.4, 2.2)},
    uDraw: {value: new THREE.Vector2(0, 1)},
    uOrbU: {value: -1},
    uTrail: {value: 0.02},
    uTrailBoost: {value: 0},
    uPulseU: {value: -1},
    uPulseAmt: {value: 0},
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  return {mat, uniforms};
};
