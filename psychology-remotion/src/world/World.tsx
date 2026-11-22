import {EffectComposer} from '@react-three/postprocessing';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {BloomEffect, KernelSize} from 'postprocessing';
import React, {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {applyPose, getWorld} from '../lib/director';
import {Atmosphere} from './Atmosphere';
import {Chart} from './Chart';
import {Emitters} from './Emitters';
import {GradeEffect} from './GradeEffect';
import {Orb} from './Orb';
import {Particles} from './Particles';
import {Track} from './Track';

/** Drives the camera, the fog and both post effects from the director. */
const Rig: React.FC<{bloom: BloomEffect; grade: GradeEffect}> = ({bloom, grade}) => {
  const frame = useCurrentFrame();
  const {camera, scene} = useThree();
  const w = getWorld(frame);

  useLayoutEffect(() => {
    applyPose(camera as THREE.PerspectiveCamera, w.cam);
    (scene.fog as THREE.FogExp2).density = w.fogDensity;
    bloom.intensity = w.grade.bloom;
    const g = w.grade;
    grade.set('uTint', g.tint);
    grade.set('uTintAmt', g.tintAmt);
    grade.set('uSat', g.sat);
    grade.set('uExposure', g.exposure);
    grade.set('uSplit', g.split);
    grade.set('uRadial', g.radial);
    grade.set('uVignette', g.vignette);
    grade.set('uVigColor', g.vigColor);
    grade.set('uGrain', g.grain);
    grade.set('uSeed', frame % 97);
    grade.set('uFlash', g.flash);
    grade.set('uFlashColor', g.flashColor);
    grade.set('uLift', 0.0025 + w.fogBanks * 0.004);
  });
  return null;
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);
  const bloom = useMemo(
    () =>
      new BloomEffect({
        mipmapBlur: true,
        luminanceThreshold: 0.72,
        luminanceSmoothing: 0.3,
        intensity: 1,
        radius: 0.55,
        kernelSize: KernelSize.LARGE,
      }),
    [],
  );
  const grade = useMemo(() => new GradeEffect(), []);

  return (
    <>
      <color attach="background" args={['#030303']} />
      <fogExp2 attach="fog" args={['#000000', 0.016]} />
      <Rig bloom={bloom} grade={grade} />
      <Particles />
      <Atmosphere />
      <Track />
      <Chart />
      <Emitters />
      <Orb pos={w.orb.pos} color={w.orb.color} opacity={w.orb.opacity} scale={w.orb.scale} pulse={w.orb.pulse} heat={1 + w.grade.bloom * 0.15} />
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <primitive object={bloom} />
        <primitive object={grade} />
      </EffectComposer>
    </>
  );
};

export const World: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      gl={{antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true}}
      dpr={1}
      camera={{fov: 50, near: 0.1, far: 5000, position: [0, 0, 10]}}
      style={{position: 'absolute', inset: 0}}
    >
      <Scene />
    </ThreeCanvas>
  );
};
