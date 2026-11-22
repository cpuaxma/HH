import React, {useLayoutEffect, useMemo} from 'react';
import {random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BURSTS, VIDEO} from '../config';
import {orbS} from '../lib/director';
import {pointAtS, tangentAtS} from '../lib/track';

/**
 * Sparks flying off the track (thrill), gold confetti (euphoria) and red embers streaking up
 * past the lens (panic). Every particle is precomputed from seeded randomness: birth frame,
 * origin, velocity, gravity. The shader just evaluates the trajectory at the current frame.
 */
const vertexShader = /* glsl */ `
uniform float uFrame;
uniform float uRes;
attribute float aBirth;
attribute float aLife;
attribute vec3 aVel;
attribute float aGrav;
attribute float aSize;
attribute vec3 aColor;
attribute float aKind;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float age = uFrame - aBirth;
  if (age < 0.0 || age > aLife) {
    gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
    gl_PointSize = 0.0;
    vAlpha = 0.0;
    return;
  }
  vec3 p = position + aVel * age + vec3(0.0, 0.5 * aGrav * age * age, 0.0);
  float flip = 1.0;
  if (aKind > 0.5 && aKind < 1.5) {
    // confetti flutters and flips
    p.x += sin(age * 0.21 + aSeed * 20.0) * 0.5;
    p.z += cos(age * 0.17 + aSeed * 13.0) * 0.5;
    flip = 0.25 + 0.75 * abs(sin(age * 0.35 + aSeed * 9.0));
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float w = -mv.z;
  gl_Position = projectionMatrix * mv;
  float px = aSize * projectionMatrix[1][1] * uRes * 0.5 / max(w, 0.05);
  gl_PointSize = clamp(px * flip, 0.0, 46.0);
  float t = age / aLife;
  vAlpha = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.55, 1.0, t)) * smoothstep(0.3, 1.2, w);
  vColor = aColor;
}
`;
const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = pow(max(1.0 - d, 0.0), 1.3);
  float core = pow(max(1.0 - d, 0.0), 6.0);
  gl_FragColor = vec4(vColor * (1.0 + core * 2.0), a * vAlpha);
}
`;

const COLORS = {
  spark: ['#FFE7A3', '#FFD25C', '#FFFFFF'],
  confetti: ['#F5D77A', '#D4AF37', '#FFF1C8', '#E8C25A'],
  ember: ['#FF3B2E', '#FF6A3A', '#FF1530'],
};

export const Emitters: React.FC = () => {
  const frame = useCurrentFrame();

  const {points, uniforms} = useMemo(() => {
    type P = {o: number[]; v: number[]; b: number; l: number; g: number; s: number; c: THREE.Color; k: number; seed: number};
    const list: P[] = [];
    let n = 0;
    for (const burst of BURSTS) {
      for (let f = burst.from; f <= burst.to; f++) {
        for (let j = 0; j < burst.rate; j++) {
          const r = (k: string) => random(`em-${n}-${k}`);
          const sAt = orbS(f + r('t'));
          const orb = pointAtS(sAt);
          const t = tangentAtS(sAt);
          const pal = COLORS[burst.kind];
          const c = new THREE.Color(pal[Math.floor(r('c') * pal.length)]);
          if (burst.kind === 'spark') {
            // thrown off the rails, backwards and outwards
            const side = r('side') > 0.5 ? 1 : -1;
            list.push({
              o: [orb[0], orb[1] - 0.1, orb[2] + side * 0.4],
              v: [-t[0] * (0.08 + r('a') * 0.2) + (r('x') - 0.5) * 0.12, 0.08 + r('y') * 0.22, side * (0.06 + r('z') * 0.22)],
              b: f + r('t'),
              l: 14 + r('l') * 16,
              g: -0.016,
              s: 0.05 + r('s') * 0.07,
              c: c.multiplyScalar(2.4),
              k: 0,
              seed: r('seed'),
            });
          } else if (burst.kind === 'confetti') {
            const th = r('th') * Math.PI * 2;
            const sp = 0.05 + r('sp') * 0.16;
            list.push({
              o: [orb[0] + t[0] * 2 + (r('x') - 0.5) * 2, orb[1] + 0.6 + r('y') * 1.5, orb[2] + (r('z') - 0.5) * 2],
              v: [Math.cos(th) * sp + t[0] * 0.12, 0.1 + r('vy') * 0.16, Math.sin(th) * sp],
              b: f + r('t'),
              l: 34 + r('l') * 30,
              g: -0.0065,
              s: 0.07 + r('s') * 0.09,
              c: c.multiplyScalar(1.8),
              k: 1,
              seed: r('seed'),
            });
          } else {
            // embers: born ahead of and below the orb, streaking upward past the camera
            const ahead = pointAtS(sAt + 2 + r('a') * 10);
            list.push({
              o: [ahead[0] + (r('x') - 0.5) * 6, ahead[1] - 1 - r('y') * 5, ahead[2] + (r('z') - 0.5) * 6],
              v: [(r('vx') - 0.5) * 0.05, 0.25 + r('vy') * 0.4, (r('vz') - 0.5) * 0.05],
              b: f + r('t'),
              l: 22 + r('l') * 22,
              g: 0.004,
              s: 0.035 + r('s') * 0.06,
              c: c.multiplyScalar(2.2),
              k: 2,
              seed: r('seed'),
            });
          }
          n++;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    const N = list.length;
    const arr = (k: number) => new Float32Array(N * k);
    const pos = arr(3), vel = arr(3), col = arr(3), birth = arr(1), life = arr(1), grav = arr(1), size = arr(1), kind = arr(1), seed = arr(1);
    list.forEach((p, i) => {
      pos.set(p.o, i * 3);
      vel.set(p.v, i * 3);
      col.set([p.c.r, p.c.g, p.c.b], i * 3);
      birth[i] = p.b;
      life[i] = p.l;
      grav[i] = p.g;
      size[i] = p.s;
      kind[i] = p.k;
      seed[i] = p.seed;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aVel', new THREE.BufferAttribute(vel, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1));
    geo.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    geo.setAttribute('aGrav', new THREE.BufferAttribute(grav, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const uniforms = {uFrame: {value: 0}, uRes: {value: VIDEO.height}};
    const mat = new THREE.ShaderMaterial({uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending});
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = 6;
    return {points, uniforms};
  }, []);

  useLayoutEffect(() => {
    uniforms.uFrame.value = frame;
    points.visible = frame < 640;
  });

  return <primitive object={points} />;
};
