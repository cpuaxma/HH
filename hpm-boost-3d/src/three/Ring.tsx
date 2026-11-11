import {useMemo} from 'react';
import * as THREE from 'three';
import {prog} from '../lib/math';
import {ringRadius} from '../lib/ring';
import {IMPACT_WORLD, SCREEN_NORMAL, T, useTime} from '../timeline';

const FRAG = /* glsl */ `
varying vec2 vP;
uniform float uR;
uniform float uFade;
uniform float uFlash;
void main() {
  float r = length(vP);
  float w = 0.22 + uR * 0.018;
  float band = exp(-pow((r - uR) / w, 2.0));
  float trail = r < uR ? exp((r - uR) / (1.2 + uR * 0.12)) * 0.22 : 0.0;
  float core = exp(-r / 1.4) * uFlash;
  vec3 col = vec3(1.0, 0.33, 0.09) * (band * 4.0 + trail * 0.9) + vec3(1.0, 0.5, 0.22) * core * 1.6;
  gl_FragColor = vec4(col * uFade, 1.0);
}`;

export const Ring: React.FC = () => {
  const t = useTime();
  const r = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}',
      fragmentShader: FRAG,
      uniforms: {uR: {value: 0}, uFade: {value: 0}, uFlash: {value: 0}},
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const n = new THREE.Vector3(...SCREEN_NORMAL);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const pos = new THREE.Vector3(...IMPACT_WORLD).addScaledVector(n, 0.06);
    const light = new THREE.PointLight('#ff4a1a', 0, 0, 2);
    light.position.copy(new THREE.Vector3(...IMPACT_WORLD).addScaledVector(n, 3.2).add(new THREE.Vector3(0, 2.5, 0)));
    return {mat, q, pos, light};
  }, []);
  const x = t - T.impact;
  const active = x > 0 && x < T.ringDur + 0.3;
  const R = ringRadius(t);
  r.mat.uniforms.uR.value = R;
  r.mat.uniforms.uFade.value = active ? Math.min(1, x / 0.03) * (1 - prog(0.55, T.ringDur + 0.3, x)) : 0;
  r.mat.uniforms.uFlash.value = active ? Math.exp(-x / 0.16) : 0;
  r.light.intensity = active && x < 0.7 ? 70 * Math.exp(-x / 0.2) * Math.min(1, x / 0.02) * (1 - x / 0.7) : 0;
  return (
    <>
      <mesh visible={active} material={r.mat} position={r.pos} quaternion={r.q} renderOrder={6} frustumCulled={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>
      <primitive object={r.light} />
    </>
  );
};
