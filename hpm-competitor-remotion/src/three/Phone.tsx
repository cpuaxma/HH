// One phone: satin aluminium frame, black glass front, emissive screen under a clear
// coat (so the studio reflects in it), frosted-glass back with a generic camera bump.
// No brand marks. All motion comes from `pose(t)` through the pipeline's animator.
import {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {STUDIO} from '../data';
import {PHONE, PhonePose, SCREEN} from '../lib/story';
import {useAnimator, useProbe} from './Pipeline';
import {glassMaterial} from './glass';
import {ScreenTextures} from './useScreenTexture';
import {GLASS, SCREEN_RADIUS, frameGeometry, plateGeometry, sweepGeometry} from './phoneGeometry';

const Z = PHONE.depth / 2;

/** Shared geometry and the materials that do not change per phone. */
const useShared = () =>
  useMemo(() => {
    const frame = frameGeometry();
    const glass = plateGeometry(GLASS.width, GLASS.height, GLASS.radius);
    const screen = plateGeometry(SCREEN.width, SCREEN.height, SCREEN_RADIUS);
    const bumpW = 0.25;
    const bumpH = 0.25;
    const bumpSide = sweepGeometry({width: bumpW, height: bumpH, radius: 0.075, depth: 0.018, bulge: 0.006, n: 3});
    const bumpCap = plateGeometry(bumpW - 0.012, bumpH - 0.012, 0.069);
    const lens = new THREE.CylinderGeometry(0.044, 0.044, 0.012, 48, 1);
    const lensRing = new THREE.TorusGeometry(0.047, 0.0055, 16, 48);
    const flash = new THREE.CircleGeometry(0.014, 24);
    const button = new THREE.CapsuleGeometry(0.0085, 0.13, 8, 24);

    const aluminium = new THREE.MeshPhysicalMaterial({
      color: STUDIO.aluminium,
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 1.1,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
    });
    const blackGlass = glassMaterial({base: '#060607', reflStrength: 1.1});
    const backGlass = new THREE.MeshPhysicalMaterial({
      color: STUDIO.backGlass,
      metalness: 0,
      roughness: 0.42,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.8,
    });
    const lensGlass = new THREE.MeshPhysicalMaterial({
      color: '#07080b',
      metalness: 0.2,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.2,
    });
    const flashMat = new THREE.MeshStandardMaterial({color: '#f4ecd8', roughness: 0.4, emissive: '#3a3020'});
    return {frame, glass, screen, bumpSide, bumpCap, lens, lensRing, flash, button, aluminium, blackGlass, backGlass, lensGlass, flashMat, bumpW, bumpH};
  }, []);

export type PhoneProps = {
  texture: ScreenTextures;
  pose: (t: number) => PhonePose;
  /** Screen brightness (emissive intensity) at time t. */
  brightness: (t: number) => number;
};

export const Phone: React.FC<PhoneProps> = ({texture, pose, brightness}) => {
  const s = useShared();
  const group = useRef<THREE.Group>(null);

  const screenMat = useMemo(() => glassMaterial({map: texture.lo, reflStrength: 0.85}), [texture]);

  // Probe points: the eight corners of the phone, for the motion-blur sample count.
  const probes = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (const x of [-PHONE.width / 2, PHONE.width / 2])
      for (const y of [-PHONE.height / 2, PHONE.height / 2]) for (const z of [-Z, Z]) pts.push(new THREE.Vector3(x, y, z));
    return pts;
  }, []);
  useProbe(group, probes);

  useAnimator((t) => {
    const g = group.current;
    if (!g) return;
    const p = pose(t);
    g.position.set(...p.pos);
    g.rotation.set(p.rot[0], p.rot[1], p.rot[2], 'YXZ');
    g.scale.setScalar(p.scale);
    screenMat.uniforms.brightness.value = brightness(t);
    screenMat.uniforms.map.value = texture.active.current;
  });

  const bumpX = -GLASS.width / 2 + 0.06 + s.bumpW / 2;
  const bumpY = GLASS.height / 2 - 0.06 - s.bumpH / 2;

  return (
    <group ref={group}>
      <mesh geometry={s.frame} material={s.aluminium} />
      {/* Front: black glass with the screen set into it. */}
      <mesh geometry={s.glass} material={s.blackGlass} position={[0, 0, Z + 0.0004]} />
      <mesh geometry={s.screen} material={screenMat} position={[0, 0, Z + 0.0009]} />
      {/* Back: frosted glass and a generic two-lens camera bump (on the back's top-left). */}
      <group rotation={[0, Math.PI, 0]}>
        <mesh geometry={s.glass} material={s.backGlass} position={[0, 0, Z + 0.0004]} />
        <group position={[bumpX, bumpY, Z + 0.009]}>
          <mesh geometry={s.bumpSide} material={s.aluminium} />
          <mesh geometry={s.bumpCap} material={s.backGlass} position={[0, 0, 0.009 + 0.0003]} />
          {[
            [-0.052, 0.052],
            [0.052, -0.052],
          ].map(([x, y], i) => (
            <group key={i} position={[x, y, 0.012]}>
              <mesh geometry={s.lens} material={s.lensGlass} rotation={[Math.PI / 2, 0, 0]} />
              <mesh geometry={s.lensRing} material={s.aluminium} position={[0, 0, 0.004]} />
            </group>
          ))}
          <mesh geometry={s.flash} material={s.flashMat} position={[0.056, 0.058, 0.0096]} />
        </group>
      </group>
      {/* Side buttons. */}
      <mesh geometry={s.button} material={s.aluminium} position={[PHONE.width / 2 - 0.004, 0.3, 0]} scale={[0.7, 1, 1.5]} />
      <mesh geometry={s.button} material={s.aluminium} position={[-PHONE.width / 2 + 0.004, 0.43, 0]} scale={[0.7, 0.7, 1.5]} />
      <mesh geometry={s.button} material={s.aluminium} position={[-PHONE.width / 2 + 0.004, 0.27, 0]} scale={[0.7, 0.7, 1.5]} />
    </group>
  );
};

