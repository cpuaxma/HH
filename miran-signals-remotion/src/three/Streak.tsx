// The gold streak: a small bevelled gold bar, glowing, whipping across the frame with a long
// tapered light trail and a warm light that sweeps over the phones as it passes.
// Its path is defined relative to the camera (so it always crosses the frame cleanly, even
// while the camera moves) and evaluated per sub-frame, so it gets real motion blur.
import {useMemo, useRef} from 'react';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {BRAND, FormatId, LAYOUT, TIMING} from '../data';
import {clamp01} from '../lib/ease';
import {computeCamera} from '../lib/camera';
import {useAnimator, useProbe} from './Pipeline';

const TRAIL = 56;
/** Trail length in frames. */
const TRAIL_SPAN = 8;
const DIST = 2.4;

/** Progress across the frame (0 → 1): a quick ease in, very fast middle, ease out. */
const progress = (t: number) => {
  const x = clamp01((t - TIMING.streakStart) / (TIMING.streakEnd - TIMING.streakStart));
  return x < 0.5 ? 0.5 * Math.pow(2 * x, 1.7) : 1 - 0.5 * Math.pow(2 * (1 - x), 1.7);
};

/** World position of the streak head at time t (camera-relative path, right to left and rising). */
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
  const x = (1.7 - 3.4 * s) * halfW;
  const y = (-0.4 + 0.6 * s + 0.3 * Math.sin(Math.PI * s)) * halfH;
  return pos.addScaledVector(f, DIST).addScaledVector(r, x).addScaledVector(u, y);
};

/** A gold bar: trapezoid cross-section extruded along its length, with soft bevels. */
const barGeometry = () => {
  const bw = 0.42;
  const tw = 0.3;
  const hh = 0.16;
  const shape = new THREE.Shape([
    new THREE.Vector2(-bw / 2, -hh / 2),
    new THREE.Vector2(bw / 2, -hh / 2),
    new THREE.Vector2(tw / 2, hh / 2),
    new THREE.Vector2(-tw / 2, hh / 2),
  ]);
  const g = new THREE.ExtrudeGeometry(shape, {depth: 0.9, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3, curveSegments: 1});
  g.center();
  g.computeVertexNormals();
  return g;
};

export const Streak: React.FC = () => {
  const fmt: FormatId = useVideoConfig().height > 1500 ? 'vertical' : 'feed';
  const head = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const geo = useMemo(barGeometry, []);
  const headMat = useMemo(
    () => new THREE.MeshStandardMaterial({color: BRAND.goldA, emissive: BRAND.goldB, emissiveIntensity: 0.55, roughness: 0.22, metalness: 1, envMapIntensity: 1.6}),
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
        uniforms: {color: {value: new THREE.Color(BRAND.goldA)}, core: {value: new THREE.Color('#FFF4D2')}},
        vertexShader: /* glsl */ `
          attribute float fade; varying float vFade; varying float vSide;
          void main() { vFade = fade; vSide = float(gl_VertexID % 2) * 2.0 - 1.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 color; uniform vec3 core; varying float vFade; varying float vSide;
          void main() { float edge = 1.0 - abs(vSide); float a = vFade * smoothstep(0.0, 0.9, edge);
            vec3 c = mix(color, core, pow(edge, 3.0) * vFade) * (1.0 + 0.8 * vFade);
            gl_FragColor = vec4(c, a); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );

  const probePts = useMemo(() => [new THREE.Vector3(0, 0, 0)], []);
  useProbe(head, probePts);

  const basis = useMemo(() => new THREE.Matrix4(), []);
  useAnimator((t) => {
    const active = t > TIMING.streakStart - 1 && t < TIMING.streakEnd + TRAIL_SPAN + 2;
    if (head.current) head.current.visible = active && progress(t) < 1;
    if (trail.current) trail.current.visible = active;
    if (light.current) light.current.intensity = active ? 22 * Math.sin(Math.PI * progress(t)) : 0;
    if (!active) return;
    const p = headAt(t, fmt);
    const p2 = headAt(t + 0.2, fmt);
    const dir = p2.clone().sub(p).normalize();
    const c = computeCamera(t, fmt);
    const camPos = new THREE.Vector3(...c.position);
    if (head.current) {
      // Long axis along the motion, top towards the camera, tumbling slowly so it glints.
      const toCam = camPos.clone().sub(p).normalize();
      const y = toCam.clone().addScaledVector(dir, -toCam.dot(dir)).normalize();
      const x = new THREE.Vector3().crossVectors(y, dir).normalize();
      basis.makeBasis(x, y, dir);
      head.current.position.copy(p);
      head.current.quaternion.setFromRotationMatrix(basis);
      head.current.rotateZ(0.9 * Math.sin((t - TIMING.streakStart) / 7) + 0.4);
      head.current.scale.setScalar(0.22);
    }
    if (light.current) light.current.position.copy(p);
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
      const fv = alive * Math.pow(1 - k, 1.5) * (1 - clamp01((t - TIMING.streakEnd) / TRAIL_SPAN));
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
      <pointLight ref={light} color={BRAND.goldB} intensity={0} distance={0} decay={2} />
    </>
  );
};
