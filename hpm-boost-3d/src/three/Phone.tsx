import {useMemo} from 'react';
import * as THREE from 'three';
import {makeBrushedTexture, makeButtonTexture, makeScreenTexture} from '../lib/textures';
import {easeOutCubic, prog, spring} from '../lib/math';
import {BUTTON_LOCAL, PHONE, T, useTime} from '../timeline';

export const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  return s;
};

/** ShapeGeometry with UVs normalised to 0..1 over its bounding box. */
const flatShape = (w: number, h: number, r: number, segs = 24) => {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), segs);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return g;
};

/** Button press curve for one press at time p: 0 rest, 1 fully pressed, small negative pop on release. */
const pressCurve = (x: number) => {
  if (x < 0) return 0;
  if (x < 0.07) return easeOutCubic(x / 0.07);
  return 1 - spring(x - 0.07, 4.2, 0.42);
};

export const buttonState = (t: number) => {
  let press = 0;
  let glow = 0;
  for (const p of T.presses) {
    press += pressCurve(t - p);
    // Anticipation pulse before the press, a flash on it.
    glow += 0.9 * Math.exp(-Math.pow((t - (p - 0.12)) / 0.16, 2)) + 2.4 * Math.exp(-Math.pow((t - p - 0.03) / 0.09, 2));
  }
  // Idle breathing.
  const breathe = 0.25 * (0.5 + 0.5 * Math.sin(t * 5.2));
  return {press, glow: glow + breathe};
};

/** Gentle float; it eases to rest before the chili lands so the wipe ring sits exactly on the glass. */
export const phoneFloat = (t: number) => {
  const k = 1 - prog(2.4, 3.4, t) + prog(4.3, 5.0, t);
  return {y: 0.1 * Math.sin(t * 1.25 + 0.4) * k, yaw: 0.035 * Math.sin(t * 0.8 + 1.1) * k};
};

export const Phone: React.FC = () => {
  const t = useTime();
  const parts = useMemo(() => {
    const bev = 0.17;
    const body = new THREE.ExtrudeGeometry(roundedRect(PHONE.w - 2 * bev, PHONE.h - 2 * bev, PHONE.corner - bev), {
      depth: PHONE.d - 2 * bev,
      bevelEnabled: true,
      bevelThickness: bev,
      bevelSize: bev,
      bevelSegments: 8,
      curveSegments: 28,
    });
    body.translate(0, 0, -(PHONE.d - 2 * bev) / 2);
    body.computeVertexNormals();
    const brushed = makeBrushedTexture();
    brushed.repeat.set(0.4, 0.4);
    const alu = new THREE.MeshPhysicalMaterial({
      color: '#b3aca5',
      metalness: 1,
      roughness: 0.34,
      roughnessMap: brushed,
      envMapIntensity: 1.1,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#030303',
      metalness: 0,
      // Slightly soft so the key light reads as a broad sheen, not a pin-point glint.
      roughness: 0.15,
      envMapIntensity: 1.2,
    });
    const screenTex = makeScreenTexture();
    const display = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      emissive: '#ffffff',
      emissiveMap: screenTex,
      emissiveIntensity: 1.05,
      roughness: 0.16,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const back = new THREE.MeshPhysicalMaterial({
      color: '#1d1a19',
      roughness: 0.22,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const lensGlass = new THREE.MeshPhysicalMaterial({color: '#020202', roughness: 0.02, clearcoat: 1, metalness: 0.3});
    const buttonTex = makeButtonTexture();
    const button = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      emissive: '#ffffff',
      emissiveMap: buttonTex,
      emissiveIntensity: 1.6,
      roughness: 0.15,
      clearcoat: 1,
    });
    const ripple = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {uGrow: {value: 0}, uAlpha: {value: 0}},
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `
        varying vec2 vP; uniform float uGrow; uniform float uAlpha;
        float sdPill(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
        void main(){
          float d = sdPill(vP, vec2(3.05 + uGrow, 0.525 + uGrow), 0.525 + uGrow);
          float ring = exp(-pow(d / 0.06, 2.0)) + 0.35 * exp(-abs(d) / 0.35);
          gl_FragColor = vec4(vec3(1.0, 0.42, 0.16) * 3.0 * ring * uAlpha, 1.0);
        }`,
    });
    return {
      body,
      alu,
      glass,
      display,
      back,
      lensGlass,
      button,
      ripple,
      glassGeo: flatShape(PHONE.w - 0.16, PHONE.h - 0.16, PHONE.corner - 0.08),
      displayGeo: flatShape(PHONE.w - 0.5, PHONE.h - 0.5, PHONE.corner - 0.3),
      buttonGeo: flatShape(6.1, 1.05, 0.525, 20),
    };
  }, []);

  const {press, glow} = buttonState(t);
  parts.button.emissiveIntensity = 1.5 + glow * 1.4;
  // Ripple: the last press drives an outward ring.
  let ripG = 0;
  let ripA = 0;
  for (const p of T.presses) {
    const x = t - p;
    if (x > 0 && x < 0.6) {
      ripG = easeOutCubic(x / 0.6) * 0.9;
      ripA = Math.pow(1 - x / 0.6, 2);
    }
  }
  parts.ripple.uniforms.uGrow.value = ripG;
  parts.ripple.uniforms.uAlpha.value = ripA;
  const f = phoneFloat(t);
  const z = PHONE.d / 2;
  return (
    <group position={[0, f.y, 0]} rotation={[PHONE.tilt, f.yaw, 0, 'YXZ']}>
      <mesh geometry={parts.body} material={parts.alu} castShadow />
      <mesh geometry={parts.glassGeo} material={parts.glass} position={[0, 0, z + 0.004]} />
      <mesh geometry={parts.displayGeo} material={parts.display} position={[0, 0, z + 0.006]} />
      <mesh geometry={parts.glassGeo} material={parts.back} position={[0, 0, -z - 0.004]} rotation={[0, Math.PI, 0]} />
      {/* Camera module on the back, top left when seen from behind. */}
      <group position={[1.9, 5.6, -z - 0.01]} rotation={[0, Math.PI, 0]}>
        <mesh material={parts.back} position={[0, 0, 0.06]}>
          <extrudeGeometry args={[roundedRect(2.9, 2.9, 0.7), {depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3}]} />
        </mesh>
        {[
          [-0.65, 0.65],
          [-0.65, -0.65],
          [0.65, 0],
        ].map(([x, y], i) => (
          <group key={i} position={[x, y, 0.2]}>
            <mesh material={parts.alu} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.52, 0.55, 0.14, 40]} />
            </mesh>
            <mesh material={parts.lensGlass} position={[0, 0, 0.075]}>
              <circleGeometry args={[0.42, 40]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Side buttons. */}
      {[
        [-PHONE.w / 2 - 0.03, 4.2, 1.1],
        [-PHONE.w / 2 - 0.03, 2.6, 1.1],
        [PHONE.w / 2 + 0.03, 3.4, 1.8],
      ].map(([x, y, h], i) => (
        <mesh key={i} material={parts.alu} position={[x, y, 0]}>
          <boxGeometry args={[0.12, h, 0.32]} />
        </mesh>
      ))}
      {/* The Boost Post button: a real pill that presses into the glass. */}
      <group position={[BUTTON_LOCAL[0], BUTTON_LOCAL[1], BUTTON_LOCAL[2] - 0.022 * press]} scale={1 - 0.045 * press}>
        <mesh geometry={parts.buttonGeo} material={parts.button} />
      </group>
      <mesh material={parts.ripple} position={[BUTTON_LOCAL[0], BUTTON_LOCAL[1], BUTTON_LOCAL[2] + 0.01]}>
        <planeGeometry args={[9, 4]} />
      </mesh>
    </group>
  );
};
