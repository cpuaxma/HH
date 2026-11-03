// The studio.
//
// Phones: a procedural environment for reflections (three.js RoomEnvironment through
// PMREM, no HDRI), a warm key from above-left, two rim strips behind and a top softbox
// (rect area lights, so they also show as clean highlights on the aluminium).
//
// Floor and wall: one seamless cyclorama, shaded like a lit studio sweep (a pool of light
// under the phones, falling off to the edges and up the wall) by a cheap unlit shader, so
// software WebGL spends its time on the phones. The phones sit on it through soft
// projected shadows and contact shadows, and the screens throw coloured light pools.
import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {BRAND, STUDIO} from '../data';
import {PhonePose} from '../lib/story';
import {useAnimator} from './Pipeline';

RectAreaLightUniformsLib.init();

/** Key light direction (from the scene towards the light). */
export const KEY_DIR = new THREE.Vector3(-1.7, 7.2, 3.0).normalize();

/** Floor that curves up into a back wall (no horizon line). */
const cycGeometry = () => {
  const prof: [number, number][] = []; // z, y
  const R = 3.2;
  const wallZ = -4.2;
  for (let i = 0; i <= 24; i++) prof.push([16 - (i / 24) * (16 - (wallZ + R)), 0]);
  for (let i = 1; i <= 40; i++) {
    const a = (i / 40) * (Math.PI / 2);
    prof.push([wallZ + R - R * Math.sin(a), R - R * Math.cos(a)]);
  }
  for (let i = 1; i <= 10; i++) prof.push([wallZ, R + (i / 10) * 22]);
  const xs = [-40, -12, 0, 12, 40];
  const pos: number[] = [];
  const index: number[] = [];
  prof.forEach(([z, y]) => xs.forEach((x) => pos.push(x, y, z)));
  for (let j = 0; j < prof.length - 1; j++) {
    for (let i = 0; i < xs.length - 1; i++) {
      const a = j * xs.length + i;
      const b = (j + 1) * xs.length + i;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  return g;
};

const cycMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {base: {value: new THREE.Color(STUDIO.floor)}, exposure: {value: 1.06}},
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 base; uniform float exposure; varying vec3 vW;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        // Floor: a broad pool of light centred just in front of the phones.
        vec2 d = vec2(vW.x / 6.5, (vW.z - 0.7) / 5.5);
        float floorL = mix(0.74, 1.0, exp(-dot(d, d) * 1.4));
        // Wall: brightest just above the sweep, darker towards the top and the sides.
        float wallL = mix(0.98, 0.76, smoothstep(1.5, 10.0, vW.y)) * mix(1.0, 0.86, smoothstep(3.0, 16.0, abs(vW.x)));
        float k = smoothstep(0.2, 3.0, vW.y);
        float L = mix(floorL, wallL, k);
        // A soft darkening in the bend of the sweep.
        L *= 1.0 - 0.05 * smoothstep(0.0, 1.0, vW.y) * (1.0 - smoothstep(1.0, 3.0, vW.y));
        vec3 c = base * L * exposure;
        c += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });

/** Radial gradient texture (white centre → transparent edge), for glows and contact shadows. */
export const radialTexture = (falloff = 2.2, size = 256) => {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5;
      const dy = (y + 0.5) / size - 0.5;
      const r = Math.min(1, Math.hypot(dx, dy) * 2);
      const v = Math.pow(1 - r, falloff) * (r < 1 ? 1 : 0);
      const k = (y * size + x) * 4;
      img.data[k] = 255;
      img.data[k + 1] = 255;
      img.data[k + 2] = 255;
      img.data[k + 3] = Math.round(v * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
};

/** A blurred rounded rectangle: the soft shadow of a phone lying along the key light. */
const shadowTexture = () => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.filter = 'blur(14px)';
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(34, 30, 60, 196, 26);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
};

export const Studio: React.FC = () => {
  const {gl, scene} = useThree();
  const cyc = useMemo(cycGeometry, []);
  const cycMat = useMemo(cycMaterial, []);

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    scene.background = new THREE.Color(BRAND.offWhite);
    pmrem.dispose();
    return () => env.dispose();
  }, [gl, scene]);

  const lights = useMemo(() => {
    const key = new THREE.DirectionalLight('#FFF3E6', 1.1);
    key.position.copy(KEY_DIR).multiplyScalar(8);
    const rect = (color: string, intensity: number, w: number, h: number, pos: [number, number, number], look: [number, number, number]) => {
      const l = new THREE.RectAreaLight(color, intensity, w, h);
      l.position.set(...pos);
      l.lookAt(...look);
      return l;
    };
    return [
      key,
      // Top softbox: broad and soft, a clean highlight along the top of the frames.
      rect('#FFF6EC', 1.8, 4.5, 1.4, [0, 4.6, 2.2], [0, 1.0, 0]),
      // Rim strips behind, left (cool) and right (warm white).
      rect('#EEF3FF', 5, 0.5, 3.4, [-2.9, 2.0, -2.0], [-0.5, 1.1, 0]),
      rect('#FFF1E4', 5, 0.5, 3.4, [2.9, 2.0, -2.0], [0.5, 1.1, 0]),
    ];
  }, []);

  return (
    <>
      <hemisphereLight args={['#FFFFFF', '#E9E1D7', 0.35]} />
      {lights.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      <mesh geometry={cyc} material={cycMat} />
    </>
  );
};

/**
 * Everything a phone does to the floor: a soft projected shadow along the key light, a
 * contact shadow right under it (both tighten as it lands), the coloured pool of light
 * its screen throws, and a soft halo behind it.
 */
export const PhoneGlow: React.FC<{
  pose: (t: number) => PhonePose;
  glow: (t: number) => {color: THREE.Color; strength: number};
}> = ({pose, glow}) => {
  const tex = useMemo(() => radialTexture(2.4), []);
  const texSoft = useMemo(() => radialTexture(1.6), []);
  const shTex = useMemo(shadowTexture, []);
  const pool = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const contact = useRef<THREE.Mesh>(null);
  const cast = useRef<THREE.Mesh>(null);
  const additive = (map: THREE.Texture) =>
    new THREE.MeshBasicMaterial({map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
  const poolMat = useMemo(() => additive(tex), [tex]);
  const haloMat = useMemo(() => additive(texSoft), [texSoft]);
  const contactMat = useMemo(() => new THREE.MeshBasicMaterial({map: tex, color: '#2a2018', transparent: true, depthWrite: false}), [tex]);
  const castMat = useMemo(() => new THREE.MeshBasicMaterial({map: shTex, color: '#3a2c20', transparent: true, depthWrite: false}), [shTex]);
  // Shadow direction on the floor (away from the key light).
  const away = useMemo(() => new THREE.Vector2(-KEY_DIR.x, -KEY_DIR.z).normalize(), []);
  const slope = Math.hypot(KEY_DIR.x, KEY_DIR.z) / KEY_DIR.y;

  useAnimator((t) => {
    const p = pose(t);
    const g = glow(t);
    const [x, y, z] = p.pos;
    const lift = y - 1.08;
    const bottom = y - 0.81;
    const yaw = p.rot[1];
    if (pool.current) {
      pool.current.position.set(x + 0.02, 0.004, z + 0.55);
      pool.current.scale.set(2.8, 2.6, 1);
      poolMat.color.copy(g.color).multiplyScalar(0.95 * g.strength);
    }
    if (halo.current) {
      halo.current.position.set(x, y + 0.02, z - 0.24);
      halo.current.scale.set(2.3, 3.0, 1);
      haloMat.color.copy(g.color).multiplyScalar(0.34 * g.strength);
    }
    if (contact.current) {
      contact.current.position.set(x, 0.002, z + 0.01);
      const s = 1 + Math.max(0, lift) * 1.6;
      contact.current.scale.set((0.32 + 0.95 * Math.abs(Math.cos(yaw))) * s, 0.42 * s, 1);
      contactMat.opacity = 0.5 / (1 + Math.max(0, lift) * 5);
    }
    if (cast.current) {
      // The phone's shadow starts under its bottom edge and runs away from the light.
      const near = bottom * slope;
      const far = (bottom + 1.62) * slope;
      const mid = (near + far) / 2;
      cast.current.position.set(x + away.x * mid, 0.003, z + away.y * mid);
      cast.current.rotation.set(-Math.PI / 2, 0, Math.atan2(away.x, away.y) + Math.PI);
      const width = 0.12 + 0.82 * Math.abs(Math.cos(yaw));
      cast.current.scale.set(width * (1 + lift * 0.4), (far - near) * 1.25, 1);
      castMat.opacity = 0.2 / (1 + Math.max(0, lift) * 3);
    }
  });
  return (
    <>
      <mesh ref={cast} material={castMat} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh ref={contact} rotation={[-Math.PI / 2, 0, 0]} material={contactMat} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} material={poolMat} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh ref={halo} material={haloMat} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  );
};

export const WARM = new THREE.Color(STUDIO.warmGlow);
export const COLD = new THREE.Color(STUDIO.coldGlow);
export const RED = new THREE.Color(BRAND.glow);
