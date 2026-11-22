import React, {useLayoutEffect, useMemo} from 'react';
import {random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {VIDEO} from '../config';
import {getWorld} from '../lib/director';
import {CHART_CENTER, TRACK_LENGTH, pointAtS} from '../lib/track';

const COUNT_NEAR = 5200;
const COUNT_FAR = 900;

const vertexShader = /* glsl */ `
uniform float uFrame;
uniform float uDrift;
uniform float uRes;
uniform float uSize;
uniform float uFog;
attribute float aSeed;
attribute float aSize;
varying float vAlpha;
void main() {
  vec3 p = position;
  float span = 34.0;
  float local = fract((p.y + uDrift * (0.6 + 0.8 * fract(aSeed * 7.13))) / span + aSeed);
  p.y = p.y - span * 0.5 + local * span;
  p.x += sin(uFrame * 0.013 * (0.5 + aSeed) + aSeed * 31.0) * 0.35;
  p.z += cos(uFrame * 0.011 * (0.5 + aSeed) + aSeed * 17.0) * 0.35;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float w = -mv.z;
  gl_Position = projectionMatrix * mv;
  float px = aSize * uSize * projectionMatrix[1][1] * uRes * 0.5 / max(w, 0.05);
  gl_PointSize = clamp(px, 1.2, 40.0);
  float edge = smoothstep(0.0, 0.08, local) * smoothstep(1.0, 0.92, local);
  float tw = 0.6 + 0.4 * sin(uFrame * 0.09 * (0.4 + aSeed) + aSeed * 40.0);
  float near = smoothstep(0.25, 1.4, w);
  vAlpha = edge * tw * near * exp(-w * uFog) / (1.0 + max(px - 6.0, 0.0) * 0.12);
  if (w < 0.05) vAlpha = 0.0;
}
`;
const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = pow(max(1.0 - d, 0.0), 1.6);
  gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
}
`;

/** Drifting dust around the track, plus distant specks that give the far chart view depth. */
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);

  const {points, uniforms} = useMemo(() => {
    const n = COUNT_NEAR + COUNT_FAR;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r1 = random(`p-a-${i}`);
      const r2 = random(`p-b-${i}`);
      const r3 = random(`p-c-${i}`);
      const r4 = random(`p-d-${i}`);
      let p: [number, number, number];
      if (i < COUNT_NEAR) {
        const base = pointAtS(r1 * (TRACK_LENGTH + 20) - 10);
        const th = r2 * Math.PI * 2;
        const ph = Math.acos(2 * r3 - 1);
        const rad = 1.2 + Math.pow(r4, 1.6) * 17;
        p = [base[0] + Math.sin(ph) * Math.cos(th) * rad, base[1] + Math.cos(ph) * rad, base[2] + Math.sin(ph) * Math.sin(th) * rad];
        size[i] = 0.05 + Math.pow(random(`p-e-${i}`), 3) * 0.12;
      } else {
        p = [CHART_CENTER[0] + (r1 - 0.5) * 520, CHART_CENTER[1] + (r2 - 0.5) * 700, -60 - r3 * 380];
        size[i] = 0.22 + r4 * 0.45;
      }
      pos.set(p, i * 3);
      seed[i] = random(`p-s-${i}`);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const uniforms = {
      uFrame: {value: 0},
      uDrift: {value: 0},
      uRes: {value: VIDEO.height},
      uSize: {value: 1},
      uFog: {value: 0},
      uColor: {value: new THREE.Color(1, 1, 1)},
      uOpacity: {value: 1},
    };
    const mat = new THREE.ShaderMaterial({uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending});
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = 0;
    return {points, uniforms};
  }, []);

  useLayoutEffect(() => {
    uniforms.uFrame.value = frame;
    uniforms.uDrift.value = w.drift;
    uniforms.uFog.value = w.fogDensity * 0.8;
    uniforms.uColor.value.copy(w.stage.color).lerp(new THREE.Color(1, 0.95, 0.85), 0.35).multiplyScalar(1.1);
    // calmer, fewer specks once the world becomes a chart
    uniforms.uOpacity.value = 0.9 - 0.45 * w.shape.flatten;
  });

  return <primitive object={points} />;
};
