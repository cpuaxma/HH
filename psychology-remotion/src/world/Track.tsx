import React, {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {getWorld, stageColorAtS} from '../lib/director';
import {LATERAL, SAMPLES, SAMPLE_U, TRACK_LENGTH, shapeAt, pointAtS, tangentAtS} from '../lib/track';
import {RibbonGeometry, makeRibbonMaterial} from './ribbon';

const RAIL_GAP = 0.42;

const TIE_VERT = /* glsl */ `
varying vec3 vColor;
varying float vDepth;
void main() {
  vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
#ifdef USE_INSTANCING_COLOR
  vColor = instanceColor;
#else
  vColor = vec3(1.0);
#endif
  gl_Position = projectionMatrix * mv;
}
`;
const TIE_FRAG = /* glsl */ `
uniform float uOpacity;
uniform float uFog;
uniform vec3 uTint;
varying vec3 vColor;
varying float vDepth;
void main() {
  float a = uOpacity * smoothstep(1.6, 5.0, vDepth) * exp(-vDepth * uFog);
  gl_FragColor = vec4(vColor * uTint, a);
}
`;
const tieUniforms = {uOpacity: {value: 1}, uFog: {value: 0}, uTint: {value: new THREE.Color(1, 1, 1)}};
const TIE_SPACING = 0.9;

/** The rollercoaster: two glowing rails, a soft glow under them and cross-ties. */
export const Track: React.FC = () => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);

  const parts = useMemo(() => {
    const colors = SAMPLE_U.map((u) => stageColorAtS(u * TRACK_LENGTH));
    const left = new RibbonGeometry(SAMPLES, colors);
    const right = new RibbonGeometry(SAMPLES, colors);
    const glow = new RibbonGeometry(SAMPLES, colors);
    const rail = makeRibbonMaterial({width: 0.05, minPx: 1.25, intensity: 2.6, core: 1.2, sharp: 2.2});
    const railR = makeRibbonMaterial({width: 0.05, minPx: 1.25, intensity: 2.6, core: 1.2, sharp: 2.2});
    const halo = makeRibbonMaterial({width: 1.1, minPx: 9, intensity: 0.32, sharp: 3.2});
    const buf = {
      l: new Float32Array(SAMPLES * 3),
      r: new Float32Array(SAMPLES * 3),
      c: new Float32Array(SAMPLES * 3),
    };

    // ties: instanced boxes along the arc, oriented to the track
    const tieCount = Math.floor(TRACK_LENGTH / TIE_SPACING);
    const tieMaterial = new THREE.ShaderMaterial({
      uniforms: tieUniforms,
      vertexShader: TIE_VERT,
      fragmentShader: TIE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const ties = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      tieMaterial,
      tieCount,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < tieCount; i++) {
      const s = (i + 0.5) * TIE_SPACING;
      const p = new THREE.Vector3(...pointAtS(s));
      const t = new THREE.Vector3(...tangentAtS(s));
      const lat = new THREE.Vector3().crossVectors(t, new THREE.Vector3(0, 1, 0)).normalize();
      const up = new THREE.Vector3().crossVectors(lat, t).normalize();
      const basis = new THREE.Matrix4().makeBasis(t, up, lat);
      q.setFromRotationMatrix(basis);
      m.compose(p.add(up.clone().multiplyScalar(-0.06)), q, new THREE.Vector3(0.07, 0.035, RAIL_GAP * 2.7));
      ties.setMatrixAt(i, m);
      ties.setColorAt(i, stageColorAtS(s).clone().multiplyScalar(0.55));
    }
    ties.frustumCulled = false;
    return {left, right, glow, rail, railR, halo, buf, ties};
  }, []);

  useLayoutEffect(() => {
    const {buf} = parts;
    const gap = RAIL_GAP * w.rails;
    for (let i = 0; i < SAMPLES; i++) {
      const p = shapeAt(i, w.shape, frame);
      const l = LATERAL[i];
      for (let c = 0; c < 3; c++) {
        buf.c[i * 3 + c] = p[c];
        buf.l[i * 3 + c] = p[c] - l[c] * gap;
        buf.r[i * 3 + c] = p[c] + l[c] * gap;
      }
    }
    parts.left.setPoints(buf.l);
    parts.right.setPoints(buf.r);
    parts.glow.setPoints(buf.c);

    const far = 1 - w.rails; // 0 on the ride, 1 on the flat chart
    for (const mat of [parts.rail, parts.railR, parts.halo]) {
      const u = mat.uniforms;
      u.uGoldMix.value = w.trackGold;
      u.uFog.value = w.fogDensity;
      u.uOrbU.value = w.orb.opacity > 0.01 ? w.orb.u : -1;
      u.uTrail.value = w.trail;
      u.uPulseU.value = w.pulse.u;
      u.uPulseAmt.value = w.pulse.amt;
      u.uTrailBoost.value = (1 - far) * 0.7 + 0.6;
      u.uOpacity.value = w.trackOpacity;
      u.uNearFade.value.set((1.3 + w.hang * 3) * (1 - far), (4.6 + w.hang * 6) * (1 - far) + 0.001);
    }
    // the wide glow is the thing that floods the lens when it passes close: fade it earlier
    parts.halo.uniforms.uNearFade.value.set((2.2 + w.hang * 4) * (1 - far), (7.5 + w.hang * 7) * (1 - far) + 0.001);
    parts.rail.uniforms.uIntensity.value = 2.6 * w.trackBright;
    parts.railR.uniforms.uIntensity.value = 2.6 * w.trackBright;
    // on the flat chart the two rails merge into one line: halve each so the sum stays even
    const railScale = 1 - far * 0.35;
    parts.rail.uniforms.uIntensity.value *= railScale;
    parts.railR.uniforms.uIntensity.value *= railScale;
    parts.halo.uniforms.uIntensity.value = (0.32 + far * 0.18) * w.trackBright;
    // thicker lines in the far chart view
    parts.rail.uniforms.uMinPx.value = 1.25 + far * 0.9;
    parts.railR.uniforms.uMinPx.value = 1.25 + far * 0.9;
    parts.halo.uniforms.uMinPx.value = 9 + far * 13;

    tieUniforms.uOpacity.value = w.ties * 0.85;
    tieUniforms.uFog.value = w.fogDensity;
    tieUniforms.uTint.value.setScalar(w.trackBright);
    parts.ties.visible = w.ties > 0.01;
  });

  return (
    <>
      <mesh geometry={parts.glow} material={parts.halo.mat} frustumCulled={false} renderOrder={1} />
      <primitive object={parts.ties} />
      <mesh geometry={parts.left} material={parts.rail.mat} frustumCulled={false} renderOrder={2} />
      <mesh geometry={parts.right} material={parts.railR.mat} frustumCulled={false} renderOrder={2} />
    </>
  );
};
