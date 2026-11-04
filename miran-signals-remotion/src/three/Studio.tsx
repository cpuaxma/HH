// The studio: a deep navy cyclorama with a soft gold key, gold rim lights and a glossy dark floor.
//
// Phones: a procedural environment for reflections (three.js RoomEnvironment through PMREM,
// no HDRI, kept dim), a warm gold key from above-left, gold rim strips behind and a top
// softbox (rect area lights, so they show as clean highlights along the titanium edges).
//
// Floor and wall: one seamless cyclorama shaded by a designed, unlit shader (navy gradient
// up the wall, a soft pool of light on the floor, and a glossy floor that reflects a blurred
// painted studio with Fresnel), so software WebGL spends its time on the phones. The phones
// sit on it through soft projected decal shadows (no shadow maps), and their screens throw
// coloured light pools: cold red under the left, warm gold under the right.
import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {BRAND, STUDIO} from '../data';
import {PhonePose} from '../lib/story';
import {useAnimator} from './Pipeline';
import {studioReflection} from './glass';

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
    uniforms: {
      wallTop: {value: new THREE.Color(STUDIO.wallTop)},
      wallBottom: {value: new THREE.Color(STUDIO.wallBottom)},
      floorCol: {value: new THREE.Color(STUDIO.floor)},
      gold: {value: new THREE.Color(STUDIO.goldGlow)},
      refl: {value: studioReflection()},
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 wallTop; uniform vec3 wallBottom; uniform vec3 floorCol; uniform vec3 gold; uniform sampler2D refl;
      varying vec3 vW;
      const float PI = 3.141592653589793;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        // Floor: a soft pool of light just in front of the phones, falling off into the dark.
        vec2 d = vec2(vW.x / 4.6, (vW.z - 0.4) / 4.0);
        float pool = exp(-dot(d, d) * 1.5);
        vec3 floorC = floorCol * mix(0.42, 1.35, pool);
        // Wall: the navy gradient (bgBottom near the sweep, bgTop above), a soft gold key behind the phones.
        float hW = smoothstep(0.6, 8.5, vW.y);
        vec3 wallC = mix(wallBottom * 1.2, wallTop, hW) * mix(1.0, 0.7, smoothstep(3.0, 14.0, abs(vW.x)));
        wallC += gold * 0.075 * exp(-(vW.x * vW.x) / 9.0 - (vW.y - 2.4) * (vW.y - 2.4) / 5.0);
        float k = smoothstep(0.15, 2.6, vW.y);
        vec3 c = mix(floorC, wallC, k);
        // Glossy floor: a blurred reflection of the studio lights, stronger at grazing angles.
        vec3 V = normalize(cameraPosition - vW);
        vec3 R = reflect(-V, vec3(0.0, 1.0, 0.0));
        float cosT = clamp(V.y, 0.0, 1.0);
        float fres = 0.03 + 0.97 * pow(1.0 - cosT, 5.0);
        vec2 ruv = vec2(atan(R.x, R.z) / (2.0 * PI) + 0.5, acos(clamp(R.y, -1.0, 1.0)) / PI);
        vec3 env = texture2D(refl, ruv, 3.5).rgb;
        c += env * fres * 0.55 * (1.0 - k) * mix(0.5, 1.0, pool);
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
    scene.environmentIntensity = 0.5;
    scene.background = new THREE.Color(BRAND.bgTop);
    pmrem.dispose();
    return () => env.dispose();
  }, [gl, scene]);

  const lights = useMemo(() => {
    const key = new THREE.DirectionalLight(STUDIO.keyLight, 1.0);
    key.position.copy(KEY_DIR).multiplyScalar(8);
    const rect = (color: string, intensity: number, w: number, h: number, pos: [number, number, number], look: [number, number, number]) => {
      const l = new THREE.RectAreaLight(color, intensity, w, h);
      l.position.set(...pos);
      l.lookAt(...look);
      return l;
    };
    return [
      key,
      // Top softbox: broad and warm, a clean highlight along the top of the frames.
      rect('#FFE9C4', 1.6, 4.5, 1.4, [0, 4.6, 2.2], [0, 1.0, 0]),
      // Gold rim strips at the sides, a little behind: they catch the titanium edges.
      rect(STUDIO.goldHot, 12, 0.45, 3.2, [-2.6, 1.5, -0.9], [-0.5, 1.1, 0]),
      rect(STUDIO.goldHot, 12, 0.45, 3.2, [2.6, 1.5, -0.9], [0.5, 1.1, 0]),
      // A cool, faint kicker from behind for separation against the navy wall.
      rect('#9FB4E0', 3, 3.0, 0.4, [0, 3.2, -2.4], [0, 1.1, 0]),
    ];
  }, []);

  return (
    <>
      <hemisphereLight args={['#2A3550', '#0A0E18', 0.5]} />
      {lights.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      <mesh geometry={cyc} material={cycMat} renderOrder={-2} />
    </>
  );
};

/**
 * Everything a phone does to the floor: a soft projected shadow along the key light, a
 * contact shadow right under it (both tighten as it lands), the coloured pool of light its
 * screen throws, and a soft halo behind it.
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
  const contactMat = useMemo(() => new THREE.MeshBasicMaterial({map: tex, color: '#000000', transparent: true, depthWrite: false}), [tex]);
  const castMat = useMemo(() => new THREE.MeshBasicMaterial({map: shTex, color: '#000000', transparent: true, depthWrite: false}), [shTex]);
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
      pool.current.position.set(x + 0.02, 0.004, z + 0.5);
      pool.current.scale.set(2.6, 2.5, 1);
      poolMat.color.copy(g.color).multiplyScalar(0.62 * g.strength);
    }
    if (halo.current) {
      halo.current.position.set(x, y + 0.02, z - 0.3);
      halo.current.scale.set(2.2, 2.9, 1);
      haloMat.color.copy(g.color).multiplyScalar(0.035 * g.strength);
    }
    if (contact.current) {
      contact.current.position.set(x, 0.002, z + 0.01);
      const s = 1 + Math.max(0, lift) * 1.6;
      contact.current.scale.set((0.32 + 0.95 * Math.abs(Math.cos(yaw))) * s, 0.42 * s, 1);
      contactMat.opacity = 0.6 / (1 + Math.max(0, lift) * 5);
    }
    if (cast.current) {
      const near = bottom * slope;
      const far = (bottom + 1.62) * slope;
      const mid = (near + far) / 2;
      cast.current.position.set(x + away.x * mid, 0.003, z + away.y * mid);
      cast.current.rotation.set(-Math.PI / 2, 0, Math.atan2(away.x, away.y) + Math.PI);
      const width = 0.12 + 0.82 * Math.abs(Math.cos(yaw));
      cast.current.scale.set(width * (1 + lift * 0.4), (far - near) * 1.25, 1);
      castMat.opacity = 0.35 / (1 + Math.max(0, lift) * 3);
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

export const GOLD = new THREE.Color(STUDIO.goldGlow);
export const RED = new THREE.Color(STUDIO.redGlow);
