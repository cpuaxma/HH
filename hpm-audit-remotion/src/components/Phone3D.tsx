import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ExtrudeGeometry, PMREMGenerator, Shape, ShapeGeometry} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {CAM_Z, FOV, PHONE, Pose, poseQuaternion, projectLocal, SCREEN, SCREEN_R_PX, screenTransform} from '../lib/projection';
import {HEIGHT, WIDTH} from '../theme';

export type PhoneSpec = {id: string; pose: Pose; screen: React.ReactNode};

const roundedRect = (w: number, h: number, r: number) => {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const useGeometries = () =>
  useMemo(() => {
    const b = 0.018;
    const body = new ExtrudeGeometry(roundedRect(PHONE.w - 2 * b, PHONE.h - 2 * b, PHONE.r - b), {
      depth: PHONE.d - 2 * b,
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 5,
      curveSegments: 28,
    });
    body.translate(0, 0, -(PHONE.d - 2 * b) / 2);
    const glass = new ShapeGeometry(roundedRect(PHONE.w - 0.012, PHONE.h - 0.012, PHONE.r - 0.006), 28);
    const bump = new ExtrudeGeometry(roundedRect(0.36, 0.36, 0.09), {depth: 0.018, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 16});
    return {body, glass, bump};
  }, []);

// Studio environment for reflections, built once per WebGL context.
const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pm = new PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    pm.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);
  return null;
};

const PhoneMesh: React.FC<{pose: Pose}> = ({pose}) => {
  const g = useGeometries();
  const q = poseQuaternion(pose);
  const lens = (x: number, y: number) => (
    <group position={[x, y, -PHONE.d / 2 - 0.03]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.062, 0.066, 0.024, 32]} />
        <meshPhysicalMaterial color="#2a2a2c" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.0125, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.002, 32]} />
        <meshPhysicalMaterial color="#05060a" roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  );
  return (
    <group position={[pose.x, pose.y, pose.z]} quaternion={q}>
      <mesh geometry={g.body}>
        <meshPhysicalMaterial color="#202022" metalness={0.75} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.15} envMapIntensity={1.1} />
      </mesh>
      <mesh geometry={g.glass} position={[0, 0, PHONE.d / 2 + 0.0008]}>
        <meshPhysicalMaterial color="#060606" metalness={0.1} roughness={0.06} clearcoat={1} envMapIntensity={1.4} />
      </mesh>
      {/* Back: camera bump + lenses (seen during the 360° spin) */}
      <mesh geometry={g.bump} position={[0.24, 0.76, -PHONE.d / 2 - 0.018]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color="#2a2a2d" metalness={0.6} roughness={0.2} clearcoat={1} />
      </mesh>
      {lens(0.17, 0.84)}
      {lens(0.31, 0.69)}
      {/* Side buttons */}
      <mesh position={[PHONE.w / 2 + 0.004, 0.42, 0]}>
        <boxGeometry args={[0.014, 0.22, 0.032]} />
        <meshPhysicalMaterial color="#2c2c2e" metalness={0.8} roughness={0.3} />
      </mesh>
      {[0.55, 0.32].map((y) => (
        <mesh key={y} position={[-PHONE.w / 2 - 0.004, y, 0]}>
          <boxGeometry args={[0.014, 0.15, 0.032]} />
          <meshPhysicalMaterial color="#2c2c2e" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// Soft contact shadow under a floating phone (DOM, behind the canvas).
const Shadow: React.FC<{pose: Pose}> = ({pose}) => {
  const [lx, ly] = projectLocal({...pose, rx: 0, rz: 0}, [-PHONE.w / 2, -PHONE.h / 2 - 0.22, 0]);
  const [rx] = projectLocal({...pose, rx: 0, rz: 0}, [PHONE.w / 2, -PHONE.h / 2 - 0.22, 0]);
  const w = Math.abs(rx - lx) * 1.25 + 60;
  const cx = (lx + rx) / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: ly - 30,
        width: w,
        height: 70,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(15,15,15,0.28), rgba(15,15,15,0))',
      }}
    />
  );
};

// The profile layer, projected onto the glass. A reflection band sweeps across it.
const ScreenOverlay: React.FC<{pose: Pose; frame: number; children: React.ReactNode}> = ({pose, frame, children}) => {
  const st = screenTransform(pose);
  if (st.facing < 0.06) return null;
  const vis = Math.min(1, (st.facing - 0.06) / 0.12);
  const phase = frame / 200 + pose.ry * 0.5 + pose.rx * 0.3;
  const sweep = -1500 + (((phase % 1) + 1) % 1) * 3600;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: SCREEN.w,
        height: SCREEN.h,
        transformOrigin: '0 0',
        transform: st.transform,
        borderRadius: SCREEN_R_PX,
        overflow: 'hidden',
        opacity: vis,
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${(1 - st.facing) * 0.45})`}} />
      <div
        style={{
          position: 'absolute',
          top: -400,
          left: sweep,
          width: 700,
          height: SCREEN.h + 800,
          transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 35%)'}} />
    </div>
  );
};

export const Phone3D: React.FC<{phones: PhoneSpec[]}> = ({phones}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {phones.map((p) => (
        <Shadow key={`s${p.id}`} pose={p.pose} />
      ))}
      <ThreeCanvas
        width={WIDTH}
        height={HEIGHT}
        camera={{fov: FOV, position: [0, 0, CAM_Z], near: 0.05, far: 100}}
        gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
        style={{position: 'absolute', inset: 0}}
      >
        <Env />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 8]} intensity={2.2} color="#FFF6EC" />
        <directionalLight position={[-5, 3, -4]} intensity={3.2} color="#FFD7C9" />
        <directionalLight position={[4, -3, -2]} intensity={1.6} color="#FFFFFF" />
        {phones.map((p) => (
          <PhoneMesh key={p.id} pose={p.pose} />
        ))}
      </ThreeCanvas>
      {phones.map((p) => (
        <ScreenOverlay key={`o${p.id}`} pose={p.pose} frame={frame}>
          {p.screen}
        </ScreenOverlay>
      ))}
    </AbsoluteFill>
  );
};
