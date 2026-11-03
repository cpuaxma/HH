// The red streak: the pepper from the logo, glowing hot, whipping across the frame with a
// tapered light trail and a red light that sweeps over the phones as it passes.
// Its path is defined relative to the camera (so it always crosses the frame cleanly, even
// while the camera pulls back) and evaluated per sub-frame, so it gets real motion blur.
import {useMemo, useRef} from 'react';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {BRAND, FormatId, LAYOUT, TIMING} from '../data';
import {clamp01} from '../lib/ease';
import {computeCamera} from '../lib/camera';
import {PEPPER_OUTLINE} from '../lib/logoTrace';
import {useAnimator, useProbe} from './Pipeline';

const TRAIL = 56;
/** Trail length in frames. */
const TRAIL_SPAN = 7;
const DIST = 2.4;

/** Progress across the frame (0 → 1): a quick ease in, very fast middle, ease out. */
const progress = (t: number) => {
  const x = clamp01((t - TIMING.streakStart) / (TIMING.streakEnd - TIMING.streakStart));
  return x < 0.5 ? 0.5 * Math.pow(2 * x, 1.7) : 1 - 0.5 * Math.pow(2 * (1 - x), 1.7);
};

/** World position of the streak head at time t (camera-relative path). */
const headAt = (t: number, fmt: FormatId) => {
  const c = computeCamera(t, fmt);
  const pos = new THREE.Vector3(...c.position);
  const f = new THREE.Vector3(...c.target).sub(pos).normalize();
  const up0 = new THREE.Vector3(...c.up);
  const r = new THREE.Vector3().crossVectors(f, up0).normalize();
  const u = new THREE.Vector3().crossVectors(r, f).normalize();
  const {width, height} = LAYOUT[fmt];
  const halfH = DIST * Math.tan((c.fov * Math.PI) / 360);
  const halfW = halfH * (width / height);
  const s = progress(t);
  const x = (-1.7 + 3.4 * s) * halfW;
  const y = (-0.42 + 0.62 * s + 0.3 * Math.sin(Math.PI * s)) * halfH;
  return pos.addScaledVector(f, DIST).addScaledVector(r, x).addScaledVector(u, y);
};

const pepperGeometry = () => {
  const xs = PEPPER_OUTLINE.map((p) => p[0]);
  const ys = PEPPER_OUTLINE.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const w = Math.max(...xs) - Math.min(...xs);
  // Unit: 1 = the pepper's length; y flipped (SVG y is down).
  const shape = new THREE.Shape(PEPPER_OUTLINE.filter((_, i) => i % 2 === 0).map(([x, y]) => new THREE.Vector2((x - cx) / w, -(y - cy) / w)));
  const g = new THREE.ExtrudeGeometry(shape, {depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.012, bevelSegments: 3, curveSegments: 4});
  g.center();
  return g;
};

export const Streak: React.FC = () => {
  const fmt: FormatId = useVideoConfig().height > 1500 ? 'vertical' : 'feed';
  const head = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const geo = useMemo(pepperGeometry, []);
  const headMat = useMemo(
    () => new THREE.MeshStandardMaterial({color: BRAND.red, emissive: BRAND.glow, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0}),
    [],
  );
  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(TRAIL * 2 * 3), 3));
    g.setAttribute('fade', new THREE.Float32BufferAttribute(new Float32Array(TRAIL * 2), 1));
    const idx: number[] = [];
    for (let i = 0; i < TRAIL - 1; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    g.setIndex(idx);
    return g;
  }, []);
  const trailMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {color: {value: new THREE.Color(BRAND.red)}, core: {value: new THREE.Color(BRAND.orange)}},
        vertexShader: /* glsl */ `
          attribute float fade; varying float vFade; varying float vSide;
          void main() { vFade = fade; vSide = float(gl_VertexID % 2) * 2.0 - 1.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 color; uniform vec3 core; varying float vFade; varying float vSide;
          void main() { float edge = 1.0 - abs(vSide); float a = vFade * smoothstep(0.0, 0.9, edge);
            vec3 c = mix(color, core, pow(edge, 4.0) * vFade * 0.6);
            gl_FragColor = vec4(c, a); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const probePts = useMemo(() => [new THREE.Vector3(0, 0, 0)], []);
  useProbe(head, probePts);

  useAnimator((t) => {
    const active = t > TIMING.streakStart - 1 && t < TIMING.streakEnd + TRAIL_SPAN + 2;
    if (head.current) head.current.visible = active && progress(t) < 1;
    if (trail.current) trail.current.visible = active;
    if (light.current) light.current.intensity = active ? 26 * Math.sin(Math.PI * progress(t)) : 0;
    if (!active) return;
    const p = headAt(t, fmt);
    const p2 = headAt(t + 0.2, fmt);
    const dir = p2.clone().sub(p);
    const c = computeCamera(t, fmt);
    const camPos = new THREE.Vector3(...c.position);
    if (head.current) {
      head.current.position.copy(p);
      // Face the camera, long axis along the motion.
      head.current.lookAt(camPos);
      const toCam = camPos.clone().sub(p).normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toCam).normalize();
      const up = new THREE.Vector3().crossVectors(toCam, right);
      const ang = Math.atan2(dir.dot(up), dir.dot(right));
      head.current.rotateZ(ang + Math.PI);
      head.current.scale.setScalar(0.34);
    }
    if (light.current) light.current.position.copy(p);
    // Trail: the head's recent path as a camera-facing ribbon, tapering and fading.
    const pos = trailGeo.attributes.position as THREE.BufferAttribute;
    const fade = trailGeo.attributes.fade as THREE.BufferAttribute;
    for (let i = 0; i < TRAIL; i++) {
      const k = i / (TRAIL - 1);
      const ti = t - k * TRAIL_SPAN;
      const a = headAt(Math.max(TIMING.streakStart, ti), fmt);
      const b = headAt(Math.max(TIMING.streakStart, ti) + 0.1, fmt);
      const tangent = b.sub(a).normalize();
      const view = camPos.clone().sub(a).normalize();
      const side = new THREE.Vector3().crossVectors(tangent, view).normalize();
      const w = 0.05 * Math.pow(1 - k, 0.7) + 0.003;
      pos.setXYZ(2 * i, a.x + side.x * w, a.y + side.y * w, a.z + side.z * w);
      pos.setXYZ(2 * i + 1, a.x - side.x * w, a.y - side.y * w, a.z - side.z * w);
      const alive = ti >= TIMING.streakStart ? 1 : 0;
      const fv = alive * Math.pow(1 - k, 1.6) * (1 - clamp01((t - TIMING.streakEnd) / TRAIL_SPAN));
      fade.setX(2 * i, fv);
      fade.setX(2 * i + 1, fv);
    }
    pos.needsUpdate = true;
    fade.needsUpdate = true;
    trailGeo.computeBoundingSphere();
  });

  return (
    <>
      <group ref={head} visible={false}>
        <mesh geometry={geo} material={headMat} />
      </group>
      <mesh ref={trail} geometry={trailGeo} material={trailMat} frustumCulled={false} visible={false} />
      <pointLight ref={light} color={BRAND.glow} intensity={0} distance={0} decay={2} />
    </>
  );
};
