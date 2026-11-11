import {MeshReflectorMaterial} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {cameraAt} from '../lib/camera';
import {CHILI_END, FLOOR_Y, FUNNEL, useTime} from '../timeline';

export const PALETTE = {
  charcoal: '#141110',
  red: '#d4210f',
  ember: '#ff6a26',
  warm: '#fff1e2',
};
export const FOG_COLOR = new THREE.Color('#110e0d');

/** Studio environment for reflections: a dark room, a big softbox upper left, warm strips behind. */
const useStudioEnvironment = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const env = new THREE.Scene();
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(100, 60, 100),
      new THREE.MeshBasicMaterial({color: new THREE.Color(0.012, 0.01, 0.009), side: THREE.BackSide}),
    );
    env.add(room);
    const panel = (w: number, h: number, color: THREE.Color, pos: V, look: V) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide}));
      m.position.set(...pos);
      m.lookAt(...look);
      env.add(m);
    };
    type V = [number, number, number];
    // Key softbox: large, soft, upper left front.
    panel(26, 18, new THREE.Color(1, 0.94, 0.86).multiplyScalar(5.5), [-26, 22, 18], [0, 0, 0]);
    // Thin top strip for a long highlight on glossy edges.
    panel(40, 2.2, new THREE.Color(1, 0.95, 0.9).multiplyScalar(2.2), [0, 29, -4], [0, 0, 0]);
    // Warm red-orange rim strips behind.
    panel(3.5, 34, new THREE.Color(1, 0.3, 0.1).multiplyScalar(3), [-18, 6, -40], [0, 0, 0]);
    panel(3.5, 34, new THREE.Color(1, 0.36, 0.12).multiplyScalar(3), [22, 6, -40], [0, 0, 0]);
    // Faint fill on the right.
    panel(20, 14, new THREE.Color(1, 0.92, 0.86).multiplyScalar(0.35), [34, 6, 14], [0, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.03);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.9;
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
};

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`;
const SKY_FRAG = /* glsl */ `
varying vec3 vDir;
uniform vec3 uHorizon;
uniform vec3 uTop;
void main() {
  float h = clamp(vDir.y, -1.0, 1.0);
  vec3 c = mix(uHorizon, uTop, smoothstep(-0.2, 0.85, h));
  // Very soft warm bloom low in the backdrop, like light spilling on a cyc wall.
  c += vec3(0.010, 0.004, 0.002) * smoothstep(0.5, -0.1, abs(h - 0.05));
  gl_FragColor = vec4(c, 1.0);
}`;

/** Seamless backdrop: a huge gradient dome that matches the fog at the horizon. */
const Backdrop: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {uHorizon: {value: FOG_COLOR.clone()}, uTop: {value: new THREE.Color('#070606')}},
      }),
    [],
  );
  const {camera} = useThree();
  return <mesh material={mat} position={camera.position} renderOrder={-10} frustumCulled={false}>
    <sphereGeometry args={[520, 32, 16]} />
  </mesh>;
};

const HAZE_VERT = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const HAZE_FRAG = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;
uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
void main() {
  vec3 p = vWorld * 0.045 + vec3(0.0, uTime * 0.035, uTime * 0.02);
  float n = noise(p) * 0.6 + noise(p * 2.1 + 3.1) * 0.3 + noise(p * 4.3 + 7.7) * 0.1;
  // Brighter toward the key light (upper left of frame), soft shaft falloff.
  float shaft = smoothstep(-0.25, 1.1, (1.0 - vUv.x) * 0.55 + vUv.y * 0.75);
  float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
  // Fade out toward the floor so the slices never show a hard line where they cut it.
  float ground = smoothstep(${FLOOR_Y.toFixed(1)}, ${(FLOOR_Y + 9).toFixed(1)}, vWorld.y);
  float a = uAlpha * (0.35 + 0.9 * n) * (0.35 + 0.9 * shaft) * edge * ground;
  gl_FragColor = vec4(uColor, a);
}`;

const HAZE_DEPTHS = [9, 18, 32, 55, 90];

/** Volumetric haze: camera-facing slices that sample 3D noise in world space. */
const Haze: React.FC = () => {
  const t = useTime();
  const {camera} = useThree();
  const layers = useMemo(
    () =>
      HAZE_DEPTHS.map(
        (d) =>
          new THREE.ShaderMaterial({
            vertexShader: HAZE_VERT,
            fragmentShader: HAZE_FRAG,
            transparent: true,
            depthWrite: false,
            fog: false,
            uniforms: {
              uTime: {value: 0},
              uAlpha: {value: 0.011 + d * 0.00012},
              uColor: {value: new THREE.Color(0.42, 0.36, 0.31)},
            },
          }),
      ),
    [],
  );
  const cam = cameraAt(t);
  const c = camera as THREE.PerspectiveCamera;
  const pos = new THREE.Vector3(...cam.position);
  const fwd = new THREE.Vector3(...cam.look).sub(pos).normalize();
  const m = new THREE.Matrix4().lookAt(pos, pos.clone().add(fwd), new THREE.Vector3(0, 1, 0));
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  const tanH = Math.tan(((c.fov || 39.6) * Math.PI) / 360);
  return (
    <>
      {HAZE_DEPTHS.map((d, i) => {
        layers[i].uniforms.uTime.value = t;
        const h = 2 * d * tanH * 1.25;
        return (
          <mesh
            key={d}
            material={layers[i]}
            position={pos.clone().addScaledVector(fwd, d)}
            quaternion={q}
            scale={[h * (9 / 16) * 1.3, h, 1]}
            renderOrder={5}
            frustumCulled={false}
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
        );
      })}
    </>
  );
};

const SpotRim: React.FC<{pos: [number, number, number]; target: [number, number, number]; intensity: number; angle?: number; color?: string; reach: number}> = ({
  pos,
  target,
  intensity,
  angle = 0.5,
  color = '#ff4a1a',
  reach,
}) => {
  const light = useMemo(() => {
    // No inverse-square falloff, but a hard reach so the rim never pools on the floor beyond the subject.
    const l = new THREE.SpotLight(color, intensity, reach, angle, 0.65, 0);
    l.position.set(...pos);
    l.target.position.set(...target);
    return l;
  }, [pos, target, intensity, angle, color, reach]);
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

const RIM_PHONE: [number, number, number] = [3, 12, -24];
const RIM_PHONE_T: [number, number, number] = [0, 3.5, 0];
const RIM_FUNNEL: [number, number, number] = [-6, 26, -100];
const RIM_FUNNEL_T: [number, number, number] = [0, -2, -70];
const RIM_FUNNEL2: [number, number, number] = [-14, -6, -96];
const RIM_FUNNEL2_T: [number, number, number] = [0, -9, -70];
const RIM_END: [number, number, number] = [CHILI_END[0] + 4, CHILI_END[1] + 9, CHILI_END[2] - 22];

export const Stage: React.FC = () => {
  useStudioEnvironment();
  const key = useMemo(() => {
    const l = new THREE.DirectionalLight('#fff0e0', 2.4);
    const dir = new THREE.Vector3(-0.62, 1.0, 0.55).normalize();
    const target = new THREE.Vector3(2, -8, -42);
    l.position.copy(target).addScaledVector(dir, 160);
    l.target.position.copy(target);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const c = l.shadow.camera;
    c.left = -62;
    c.right = 62;
    c.top = 70;
    c.bottom = -70;
    c.near = 60;
    c.far = 280;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.04;
    l.shadow.radius = 10;
    l.shadow.blurSamples = 16;
    return l;
  }, []);
  const endRim = useMemo(() => [CHILI_END[0], CHILI_END[1], CHILI_END[2]] as [number, number, number], []);
  return (
    <>
      <color attach="background" args={[FOG_COLOR.r, FOG_COLOR.g, FOG_COLOR.b]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.0085]} />
      <Backdrop />
      <hemisphereLight args={['#3a3230', '#0c0a09', 0.35]} />
      <primitive object={key} />
      <primitive object={key.target} />
      <SpotRim pos={RIM_PHONE} target={RIM_PHONE_T} intensity={8} angle={0.42} reach={36} />
      <SpotRim pos={RIM_FUNNEL} target={RIM_FUNNEL_T} intensity={7} angle={0.5} color="#ff5a22" reach={46} />
      <SpotRim pos={RIM_FUNNEL2} target={RIM_FUNNEL2_T} intensity={2.2} angle={0.4} color="#ff7a3a" reach={40} />
      <SpotRim pos={RIM_END} target={endRim} intensity={12} angle={0.35} reach={34} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[FUNNEL.x, FLOOR_Y, -40]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <MeshReflectorMaterial
          resolution={512}
          blur={[420, 140]}
          mixBlur={1}
          mixStrength={2.2}
          mixContrast={1}
          mirror={0}
          depthScale={0.6}
          minDepthThreshold={0.6}
          maxDepthThreshold={1.4}
          color="#1b1817"
          roughness={0.78}
          metalness={0.15}
          envMapIntensity={0.1}
        />
      </mesh>
      <Haze />
    </>
  );
};
