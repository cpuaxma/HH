import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {makeNoteTextures} from '../lib/textures';
import {makeRandom, smooth, wobble} from '../lib/math';
import {noiseTexture} from '../lib/noise';
import {NOTE, NOTES, bendZ, burnMask, burnTimeFor, noteState} from '../lib/notes';
import {makeAshMaterial, makeEmberMaterial, makeParticleBuffers, pointScale} from '../lib/particles';
import {ringRadius} from '../lib/ring';
import {IMPACT_WORLD, PHONE, SCREEN_NORMAL, T, phoneToWorld, simTime, useTime} from '../timeline';

const makeNoteMaterial = (map: THREE.Texture, bump: THREE.Texture, clip: THREE.Plane, seedU: number, seedV: number, phase: number) => {
  const uniforms = {
    uTime: {value: 0},
    uCurl: {value: 0},
    uFlutter: {value: 0},
    uBurn: {value: 0},
    uPhase: {value: phase},
    uSeed: {value: new THREE.Vector2(seedU, seedV)},
    uNoise: {value: noiseTexture()},
  };
  const m = new THREE.MeshStandardMaterial({
    map,
    bumpMap: bump,
    bumpScale: 1.4,
    roughness: 0.8,
    metalness: 0,
    side: THREE.DoubleSide,
    clippingPlanes: [clip],
  });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    const W = NOTE.w.toFixed(4);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime; uniform float uCurl; uniform float uFlutter; uniform float uPhase;
float bendZ(vec2 p) {
  float hx = p.x / (${W} * 0.5);
  return uCurl * hx * hx * 0.9 + uFlutter * (0.22 * sin(1.3 * p.x + 4.6 * uTime + uPhase) * hx + 0.12 * sin(2.2 * p.y + 3.1 * uTime + uPhase));
}`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `float hx_ = position.x / (${W} * 0.5);
float dzdx = uCurl * 0.9 * 2.0 * hx_ / (${W} * 0.5)
  + uFlutter * 0.22 * (1.3 * cos(1.3 * position.x + 4.6 * uTime + uPhase) * hx_ + sin(1.3 * position.x + 4.6 * uTime + uPhase) / (${W} * 0.5));
float dzdy = uFlutter * 0.12 * 2.2 * cos(2.2 * position.y + 3.1 * uTime + uPhase);
vec3 objectNormal = normalize(vec3(-dzdx, -dzdy, 1.0));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(tangent.xyz);
#endif`,
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position.xy, position.z + bendZ(position.xy));');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uBurn; uniform vec2 uSeed; uniform sampler2D uNoise;
float burnMask(vec2 uv) {
  float dx = min(uv.x, 1.0 - uv.x) * ${W};
  float dy = min(uv.y, 1.0 - uv.y) * ${NOTE.h.toFixed(4)};
  float d = min(dx, dy) / (${NOTE.h.toFixed(4)} * 0.5);
  float a = ${(NOTE.w / NOTE.h).toFixed(5)};
  float n = texture2D(uNoise, vec2(uv.x * a * 0.085, uv.y * 0.085) + uSeed).r * 0.65
          + texture2D(uNoise, vec2(uv.x * a * 0.24, uv.y * 0.24) + uSeed * 1.7).r * 0.35;
  return d * 0.7 + n * 0.55;
}`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
float bm = burnMask(vMapUv);
float th = uBurn * 1.3 - 0.02;
float on = step(0.0005, uBurn);
if (on > 0.5 && bm < th) discard;
float band = bm - th;
float charA = on * (1.0 - smoothstep(0.0, 0.085, band));
float scorch = on * (1.0 - smoothstep(0.0, 0.26, band));
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.55, 0.36, 0.2), scorch * 0.8);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.025, 0.02, 0.018), charA);
float glowA = on * (1.0 - smoothstep(0.0, 0.028, band));`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0, 0.36, 0.09) * glowA * 7.0 + vec3(0.6, 0.12, 0.02) * charA * 0.6 * (1.0 - glowA);`,
      );
  };
  m.customProgramCacheKey = () => 'banknote';
  return {material: m, uniforms};
};

const EMBERS_PER_NOTE = 120;
const ASH_PER_NOTE = 26;

type Spark = {birth: number; p0: THREE.Vector3; nrm: THREE.Vector3; life: number; size: number; seed: number; v0: number};

/** Born on the burn front: sample uv, find when the front passes it and where the paper is then. */
const makeSparks = (perNote: number, seed: number, lifeMin: number, lifeMax: number, sizeMin: number, sizeMax: number) => {
  const rnd = makeRandom(seed);
  const out: Spark[] = [];
  NOTES.forEach((n, i) => {
    for (let k = 0; k < perNote; k++) {
      const u = rnd.next();
      const v = rnd.next();
      const birth = burnTimeFor(burnMask(u, v, n), n);
      const st = noteState(i, birth);
      const x = (u - 0.5) * NOTE.w;
      const y = (v - 0.5) * NOTE.h;
      const local = new THREE.Vector3(x, y, bendZ(x, y, st, n.phase));
      const p0 = local.applyQuaternion(st.quaternion).add(st.position);
      const nrm = new THREE.Vector3(0, 0, rnd.sign()).applyQuaternion(st.quaternion);
      out.push({birth, p0, nrm, life: rnd.range(lifeMin, lifeMax), size: rnd.range(sizeMin, sizeMax), seed: rnd.range(0, 100), v0: rnd.range(0.4, 1.4)});
    }
  });
  return out;
};

/** Push particles out with the wipe ring and fade them; returns the remaining alpha factor. */
const sweep = (p: THREE.Vector3, t: number) => {
  const R = ringRadius(t);
  if (R <= 0) return 1;
  const I = TMP_I;
  const d = p.distanceTo(I);
  if (d >= R) return 1;
  const push = R - d;
  const dir = p.clone().sub(I).normalize();
  p.copy(I).addScaledVector(dir, d + push * 0.94);
  return Math.exp(-push / 2.6);
};
const TMP_I = new THREE.Vector3(...IMPACT_WORLD);

export const Notes: React.FC = () => {
  const t = useTime();
  const s = simTime(t);
  const {size, camera} = useThree();
  const res = useMemo(() => {
    const {map, bump} = makeNoteTextures();
    const surf = phoneToWorld([0, 0, PHONE.d / 2 + 0.02]);
    const n = new THREE.Vector3(...SCREEN_NORMAL);
    const clip = new THREE.Plane(n, -n.dot(new THREE.Vector3(...surf)));
    const geo = new THREE.PlaneGeometry(NOTE.w, NOTE.h, 48, 22);
    const mats = NOTES.map((nd) => makeNoteMaterial(map, bump, clip, nd.seedU, nd.seedV, nd.phase));
    const embers = makeSparks(EMBERS_PER_NOTE, 11, 0.45, 1.5, 0.06, 0.13);
    const ash = makeSparks(ASH_PER_NOTE, 12, 99, 99, 0.06, 0.15);
    const eb = makeParticleBuffers(embers.length);
    const ab = makeParticleBuffers(ash.length);
    return {geo, mats, embers, ash, eb, ab, emberMat: makeEmberMaterial(), ashMat: makeAshMaterial()};
  }, []);
  const {gl} = useThree();
  gl.localClippingEnabled = true;

  const states = NOTES.map((_, i) => noteState(i, s));
  states.forEach((st, i) => {
    const u = res.mats[i].uniforms;
    u.uTime.value = st.time;
    u.uCurl.value = st.curl;
    u.uFlutter.value = st.flutter;
    u.uBurn.value = st.burn;
  });

  useLayoutEffect(() => {
    const scale = pointScale(size.height, (camera as THREE.PerspectiveCamera).fov);
    res.emberMat.uniforms.uScale.value = scale;
    res.ashMat.uniforms.uScale.value = scale;
    const up = new THREE.Vector3(0, 1, 0);
    const p = new THREE.Vector3();
    res.embers.forEach((e, k) => {
      const a = s - e.birth;
      const i3 = k * 3;
      if (a < 0 || a > e.life) {
        res.eb.alpha[k] = 0;
        return;
      }
      p.copy(e.p0)
        .addScaledVector(e.nrm, 0.5 * e.v0 * (1 - Math.exp(-3 * a)))
        .addScaledVector(up, 0.7 * a + 1.2 * a * a)
        .add(new THREE.Vector3(0.6 * wobble(a * 3 + e.seed, e.seed) * a, 0, 0.6 * wobble(a * 2.6 + e.seed * 2, e.seed + 1) * a));
      const fade = sweep(p, t);
      const h = 1 - a / e.life;
      res.eb.pos.set([p.x, p.y, p.z], i3);
      const hot = smooth(Math.min(1, h * 1.4));
      res.eb.color.set([0.9 + 5.5 * hot, 0.12 + 2.6 * hot * hot, 0.02 + 1.0 * hot * hot * hot], i3);
      res.eb.alpha[k] = Math.min(1, a / 0.04) * Math.pow(h, 0.6) * fade;
      res.eb.size[k] = e.size * (0.55 + 0.45 * h);
    });
    res.ash.forEach((e, k) => {
      const a = s - e.birth;
      const i3 = k * 3;
      if (a < 0) {
        res.ab.alpha[k] = 0;
        return;
      }
      const settle = 1 - Math.exp(-a);
      p.copy(e.p0)
        .addScaledVector(e.nrm, 0.35 * (1 - Math.exp(-2 * a)))
        .addScaledVector(up, 1.6 * (1 - Math.exp(-0.8 * a)) + 0.22 * a)
        .add(new THREE.Vector3(0.9 * wobble(a * 0.9 + e.seed, e.seed) * settle, 0, 0.7 * wobble(a * 0.8 + e.seed * 3, e.seed + 2) * settle));
      const fade = sweep(p, t);
      res.ab.pos.set([p.x, p.y, p.z], i3);
      const glow = Math.max(0, 1 - a / 0.4);
      const g = 0.035 + 0.012 * Math.sin(e.seed);
      res.ab.color.set([g + 2.6 * glow * glow, g * 0.92 + 0.5 * glow * glow * glow, g * 0.86 + 0.05 * glow], i3);
      res.ab.alpha[k] = 0.85 * Math.min(1, a / 0.05) * fade;
      res.ab.size[k] = e.size * (0.75 + 0.25 * Math.min(1, a * 3));
      res.ab.rot[k] = e.seed + a * (0.9 + (e.seed % 1.3));
    });
    res.eb.commit();
    res.ab.commit();
  });

  const visibleAny = t < T.impact + T.ringDur + 0.2;
  return (
    <group visible={visibleAny}>
      {states.map((st, i) => (
        <mesh key={i} geometry={res.geo} material={res.mats[i].material} visible={st.visible} position={st.position} quaternion={st.quaternion} />
      ))}
      <points geometry={res.eb.geometry} material={res.emberMat} frustumCulled={false} renderOrder={3} />
      <points geometry={res.ab.geometry} material={res.ashMat} frustumCulled={false} renderOrder={2} />
    </group>
  );
};
