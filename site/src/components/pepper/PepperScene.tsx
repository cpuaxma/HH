"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { calyx, chiliBody, stem } from "./geometry";
import { LEVELS, getHeat } from "@/lib/heat";

export type SceneProps = {
  lite: boolean;
  reduced: boolean;
  active: boolean;
  /** Where the pepper sits, in viewport fractions: x from centre, y from centre. */
  layout: "desktop" | "phone" | "center";
  onLowFps?: () => void;
  onReady?: () => void;
  capture?: boolean;
  skipIntro?: boolean;
};

const pointer = { x: 0, y: 0 };

function Pepper({ lite, reduced, layout, onLowFps, onReady, capture, skipIntro }: Omit<SceneProps, "active">) {
  const detail = lite ? "lite" : "full";
  const { body, cap, stalk } = useMemo(() => {
    const b = chiliBody(detail);
    return { body: b.geometry, cap: calyx(b.length, detail), stalk: stem(detail) };
  }, [detail]);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(LEVELS[getHeat()].pepper),
        roughness: 0.2,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 1,
        ior: 1.5,
        sheen: 0.25,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color("#ff9a6a"),
        envMapIntensity: 1.15,
      }),
    [],
  );
  const greenMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#3d5a1c"),
        roughness: 0.42,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
        envMapIntensity: 0.9,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const stemMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#5a6b2a"), roughness: 0.55, clearcoat: 0.2, envMapIntensity: 0.8 }),
    [],
  );

  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Color(), []);
  const drop = useRef({ y: reduced || capture || skipIntro ? 0 : 5.5, v: 0 });
  const tilt = useRef({ x: 0, z: 0 });
  const fps = useRef({ frames: 0, time: 0, warm: 0, done: false });
  const readyFired = useRef(false);
  const spinVel = useRef(0);
  const lastHeat = useRef(getHeat());
  const { viewport, size } = useThree();

  useEffect(() => () => { body.dispose(); cap.dispose(); stalk.dispose(); }, [body, cap, stalk]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 20);
    if (!readyFired.current) { readyFired.current = true; onReady?.(); }

    // Frame-rate watch: after warm-up, average two seconds; below 50fps hands over to the still.
    const f = fps.current;
    if (!f.done && onLowFps && !capture) {
      f.warm += 1;
      if (f.warm > 40) {
        f.frames += 1;
        f.time += dt;
        if (f.time > 2) {
          f.done = true;
          if (f.frames / f.time < 50) onLowFps();
        }
      }
    }

    const h = getHeat();
    if (h !== lastHeat.current) { spinVel.current += h > lastHeat.current ? 7 : -5; lastHeat.current = h; }
    spinVel.current *= Math.exp(-d * 2.4);
    target.set(LEVELS[h].pepper);
    bodyMat.color.lerp(target, 1 - Math.exp(-d * 4));

    // Drop in on a spring.
    const k = 70, c = 9;
    const dr = drop.current;
    if (!reduced) {
      const a = -k * dr.y - c * dr.v;
      dr.v += a * d;
      dr.y += dr.v * d;
    }

    const scrollP = typeof window === "undefined" ? 0 : Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    const g = root.current, s = spin.current;
    if (!g || !s) return;

    const tx = reduced ? 0 : pointer.y * 0.28;
    const tz = reduced ? 0 : -pointer.x * 0.22;
    tilt.current.x += (tx - tilt.current.x) * (1 - Math.exp(-d * 3));
    tilt.current.z += (tz - tilt.current.z) * (1 - Math.exp(-d * 3));

    const phone = layout === "phone";
    const center = layout === "center";
    const sp = center ? 0 : scrollP;
    const baseX = center ? 0 : phone ? -0.15 : viewport.width * 0.245;
    const baseY = center ? -0.05 : phone ? -viewport.height * 0.06 : viewport.height * 0.035;
    g.position.set(baseX, baseY + dr.y - sp * (phone ? 1.4 : 2.2), 0);
    g.rotation.set(tilt.current.x + sp * 0.9, 0, -0.62 + tilt.current.z + sp * 0.5);
    if (!reduced && !capture) s.rotation.y += d * (0.32 + spinVel.current);
    if (capture) s.rotation.y = 0.9;
    const sc = center
      ? Math.min(viewport.width, viewport.height) / 5.1
      : (phone ? Math.min(viewport.width / 3.9, 0.86) : Math.min(viewport.height / 5.6, 1.12)) * (1 + sp * 0.12);
    g.scale.setScalar(sc);
  });

  void size;
  return (
    <group ref={root}>
      <group ref={spin}>
        {/* Centre the pepper on its own mass so the spin reads as a turn, not an orbit. */}
        <group position={layout === "center" ? [0.68, -0.5, 0] : [0.42, -0.25, 0]}>
          <mesh geometry={body} material={bodyMat} />
          <mesh geometry={cap} material={greenMat} />
          <mesh geometry={stalk} material={stemMat} />
        </group>
      </group>
    </group>
  );
}

function Studio({ lite }: { lite: boolean }) {
  return (
    <Environment resolution={lite ? 128 : 256} frames={1}>
      {/* Key softbox overhead, long strip to the left for the glossy streak, warm rim behind right. */}
      <Lightformer form="rect" intensity={2.4} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={4} position={[-6, 1, 3]} rotation-y={Math.PI / 2.4} scale={[1.2, 12, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[5, 0, 4]} rotation-y={-Math.PI / 2.6} scale={[2.5, 8, 1]} />
      <Lightformer form="rect" color="#ff6a2a" intensity={3} position={[4, 2, -5]} rotation-y={-Math.PI / 1.3} scale={[3, 10, 1]} />
      <Lightformer form="ring" intensity={1.2} position={[0, -5, 3]} rotation-x={-Math.PI / 2} scale={3} />
    </Environment>
  );
}

function Pointer() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return null;
}

export default function PepperScene(props: SceneProps) {
  const { lite, active, capture } = props;
  return (
    <Canvas
      dpr={capture ? 2 : lite ? 1 : [1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!capture }}
      camera={{ position: [0, 0, 9], fov: 30 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{ background: "transparent" }}
    >
      <Pointer />
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 5, 6]} intensity={1.6} color="#fff4ea" />
      <pointLight position={[3, -2, 3]} intensity={6} distance={12} color="#ff7a3a" />
      <Studio lite={lite} />
      <Pepper {...props} />
      {!lite && props.layout !== "center" && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
