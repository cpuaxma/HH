import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, COLORS} from '../config';
import {mix, prog} from '../lib/anim';
import {Atmosphere, StudioEnv} from './Atmosphere';
import {applyCamera} from './camera';
import {Pillars} from './Pillars';
import {Post} from './Post';
import {Tiles} from './Tiles';
import {TrapFx} from './TrapFx';

const BG = new THREE.Color(COLORS.black);
/** Look-dev only: comma list of layers to hide (REMOTION_DEBUG_HIDE=tiles,pillars,fx,dust,cone,sheets,refl). */
const HIDE = (process.env.REMOTION_DEBUG_HIDE ?? '').split(',');

const Rig: React.FC = () => {
  const frame = useCurrentFrame();
  const {camera, scene} = useThree();
  useLayoutEffect(() => {
    applyCamera(camera as THREE.PerspectiveCamera, frame);
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      // Thinner fog for the high reveal shot so the whole board reads; thicker as the floor sinks away.
      const reveal = prog(frame, 760, 790) * (1 - prog(frame, 830, 870));
      const sink = prog(frame, BEATS.riseStart, BEATS.riseStart + 90);
      fog.density = mix(0.022, 0.016, reveal) + 0.008 * sink;
    }
  }, [frame, camera, scene]);
  return null;
};

export const Arena: React.FC<{post?: boolean; blur?: boolean}> = ({post = true, blur = true}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      gl={{stencil: true, antialias: false, alpha: false, powerPreference: 'high-performance'}}
      camera={{fov: 38, near: 0.1, far: 120, position: [0, 12, 12]}}
      style={{position: 'absolute', inset: 0}}
    >
      <color attach="background" args={[BG]} />
      <fogExp2 attach="fog" args={[BG, 0.022]} />
      <Rig />
      <StudioEnv />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-4, 10, 3]} intensity={0.9} color="#FFE3B0" />
      <directionalLight position={[6, 4, -6]} intensity={0.5} color="#F5D77A" />
      {HIDE.includes('tiles') ? null : <Tiles />}
      {HIDE.includes('pillars') ? null : <Pillars />}
      {HIDE.includes('fx') ? null : <TrapFx />}
      <Atmosphere />
      {post ? <Post blur={blur} /> : null}
    </ThreeCanvas>
  );
};
