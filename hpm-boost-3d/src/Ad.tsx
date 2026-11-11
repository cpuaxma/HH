import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Scene} from './three/Scene';

export const BoostAd: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#110e0d'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="variance"
        gl={{toneMapping: THREE.NoToneMapping, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'}}
        camera={{fov: 39.6, near: 0.1, far: 900, position: [0, 0, 30]}}
      >
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
