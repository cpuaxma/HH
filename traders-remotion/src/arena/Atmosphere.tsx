import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import {BEATS, COLORS, SCENES} from '../config';
import {EASE, impulse, prog, rnd} from '../lib/anim';
import {PLAN} from './plan';

/** A dark studio with a few warm softboxes, baked to a PMREM env map so the gold has something to reflect. */
export const StudioEnv: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({color: '#040404', side: THREE.BackSide})));
    const panel = (w: number, h: number, color: string, k: number, p: [number, number, number], look: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide}));
      m.position.set(...p);
      m.lookAt(...look);
      s.add(m);
    };
    panel(10, 5, '#FFE2A8', 1.15, [0, 16, -4], [0, 0, 0]); // overhead softbox
    panel(3, 18, '#FFD38A', 0.95, [-16, 6, 4], [0, 2, 0]); // left strip
    panel(3, 18, '#F5D77A', 0.7, [16, 5, -6], [0, 2, 0]); // right strip
    panel(20, 2, '#FFF1D0', 0.55, [0, 3, 18], [0, 2, 0]); // front kicker
    panel(30, 4, '#3A2A10', 1, [0, -12, 0], [0, 0, 0]); // dim warm bounce from below
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(s, 0.035).texture;
    scene.environment = tex;
    pm.dispose();
    return () => {
      scene.environment = null;
      tex.dispose();
    };
  }, [gl, scene]);
  return null;
};

// ── Gold dust: deterministic drift, computed in the vertex shader from the frame ──
const DUST = 700;
const dustMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {uT: {value: 0}, uGain: {value: 1}, uColor: {value: new THREE.Color(COLORS.goldLight)}, ...THREE.UniformsLib.fog},
    vertexShader: /* glsl */ `
      attribute vec4 seed; uniform float uT; uniform float uGain; varying float vA;
      #include <fog_pars_vertex>
      void main(){
        vec3 p = vec3((seed.x - 0.5) * 22.0, -6.0 + seed.y * 16.0, (seed.z - 0.5) * 22.0);
        p.y = -6.0 + mod(p.y + 6.0 + uT * (0.006 + 0.012 * seed.w), 16.0);
        p.x += sin(uT * 0.011 * (0.5 + seed.w) + seed.z * 20.0) * 0.6;
        p.z += cos(uT * 0.009 * (0.5 + seed.x) + seed.y * 20.0) * 0.6;
        vec4 mvPosition = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = min(7.0, (2.0 + 5.0 * seed.w * seed.w) * (34.0 / -mvPosition.z));
        float edge = smoothstep(-6.0, -4.5, p.y) * (1.0 - smoothstep(8.5, 10.0, p.y));
        vA = (0.35 + 0.65 * (0.5 + 0.5 * sin(uT * (0.05 + 0.1 * seed.x) + seed.y * 40.0))) * edge * uGain;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      #include <fog_pars_fragment>
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor * a * a * vA * 1.6, 1.0);
        #include <fog_fragment>
      }`,
    fog: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

// ── Volumetric light: soft additive cones (fresnel-faded) ──
const coneMaterial = (color: string) =>
  new THREE.ShaderMaterial({
    uniforms: {uColor: {value: new THREE.Color(color)}, uI: {value: 1}, uH: {value: 16}},
    vertexShader: /* glsl */ `
      varying float vY; varying float vF;
      uniform float uH;
      void main(){
        vY = position.y / uH + 0.5;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 n = normalize(mat3(modelMatrix) * normal);
        vec3 v = normalize(cameraPosition - wp.xyz);
        vF = pow(abs(dot(n, v)), 1.6);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uI; varying float vY; varying float vF;
      void main(){
        float a = vF * smoothstep(0.0, 0.35, vY) * (1.0 - smoothstep(0.75, 1.0, vY));
        gl_FragColor = vec4(uColor * a * uI, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

// ── Fog sheets in the abyss: low-frequency noise planes that falling pillars pass through ──
const noiseTexture = () => {
  const S = 128;
  const data = new Uint8Array(S * S * 4);
  const grid = (g: number, x: number, y: number) => rnd(`fog-${g}-${((x % g) + g) % g}-${((y % g) + g) % g}`);
  const smoothN = (g: number, u: number, v: number) => {
    const x = u * g;
    const y = v * g;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = grid(g, x0, y0);
    const b = grid(g, x0 + 1, y0);
    const c = grid(g, x0, y0 + 1);
    const d = grid(g, x0 + 1, y0 + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const n = smoothN(4, u, v) * 0.55 + smoothN(8, u, v) * 0.3 + smoothN(16, u, v) * 0.15;
      const k = Math.max(0, Math.min(255, Math.round(Math.pow(n, 1.6) * 255)));
      data.set([k, k, k, 255], (y * S + x) * 4);
    }
  const t = new THREE.DataTexture(data, S, S);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
};
const fogSheetMaterial = (tex: THREE.Texture, color: string) =>
  new THREE.ShaderMaterial({
    uniforms: {uTex: {value: tex}, uOff: {value: new THREE.Vector2()}, uColor: {value: new THREE.Color(color)}, uI: {value: 1}},
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex; uniform vec2 uOff; uniform vec3 uColor; uniform float uI; varying vec2 vUv;
      void main(){
        float n = texture2D(uTex, vUv * 1.6 + uOff).r * texture2D(uTex, vUv * 0.7 - uOff * 0.6 + 0.3).r;
        float r = length(vUv - 0.5) * 2.0;
        float a = n * (1.0 - smoothstep(0.35, 1.0, r));
        gl_FragColor = vec4(uColor * a * uI, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const parts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(DUST * 4);
    for (let i = 0; i < DUST * 4; i++) seeds[i] = rnd(`dust-${i}`);
    g.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST * 3), 3));
    const tex = noiseTexture();
    return {
      dustGeo: g,
      dust: dustMaterial(),
      cone: coneMaterial('#FFD9A0'),
      cone2: coneMaterial(COLORS.goldLight),
      sheets: [
        {y: -2.2, mat: fogSheetMaterial(tex, '#3A2E1C'), speed: 0.0011},
        {y: -4.5, mat: fogSheetMaterial(tex, '#2A1D14'), speed: -0.0008},
        {y: -7.5, mat: fogSheetMaterial(tex, '#1E1510'), speed: 0.0006},
      ],
    };
  }, []);

  // Scene-driven intensities.
  const hookIn = EASE.out(prog(frame, 4, 40));
  const tension = 1 - 0.35 * prog(frame, SCENES.traps[0], SCENES.traps[0] + 30) + 0.35 * prog(frame, 740, 790);
  const warm = EASE.inOut(prog(frame, BEATS.riseStart - 6, BEATS.riseStart + 60));
  const cta = EASE.inOut(prog(frame, BEATS.arrowFly, BEATS.logoIn));
  const hitPulse = PLAN.traps.reduce((s, t) => s + impulse(frame, t.hit, 18), 0);
  useLayoutEffect(() => {
    parts.dust.uniforms.uT.value = frame;
    parts.dust.uniforms.uGain.value = hookIn * (0.75 + 0.9 * warm) + 0.5 * hitPulse;
    parts.cone.uniforms.uI.value = hookIn * (0.007 * tension + 0.022 * warm) * (1 - 0.85 * cta);
    parts.cone2.uniforms.uI.value = hookIn * (0.005 * tension + 0.018 * warm) * (1 - 0.85 * cta);
    parts.sheets.forEach((s, i) => {
      s.mat.uniforms.uOff.value.set(frame * s.speed, frame * s.speed * 0.6 + i * 0.3);
      s.mat.uniforms.uI.value = hookIn * (0.6 - 0.3 * warm);
    });
  }, [frame, parts, hookIn, tension, warm, hitPulse, cta]);

  const hide = (process.env.REMOTION_DEBUG_HIDE ?? '').split(',');
  return (
    <>
      {hide.includes('dust') ? null : <points geometry={parts.dustGeo} material={parts.dust} frustumCulled={false} renderOrder={5} />}
      {hide.includes('cone') ? null : <><mesh material={parts.cone} position={[0, 7.5, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.6, 8, 16, 48, 1, true]} />
      </mesh>
      <mesh material={parts.cone2} position={[0.3, 8, -0.4]} rotation={[0.05, 0, -0.04]} renderOrder={6}>
        <cylinderGeometry args={[0.3, 4.6, 16, 48, 1, true]} />
      </mesh></>}
      {hide.includes('sheets') ? null : parts.sheets.map((s, i) => (
        <mesh key={i} material={s.mat} position={[0, s.y, 0]} rotation={[-Math.PI / 2, 0, i]} renderOrder={4}>
          <planeGeometry args={[34, 34]} />
        </mesh>
      ))}
    </>
  );
};
