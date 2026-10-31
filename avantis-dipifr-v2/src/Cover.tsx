import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {COLORS, COPY} from './data';
import {SANS} from './fonts';
import {Vignette} from './Reel';
import {useTextures} from './lib/textures';
import {Scene} from './three/Scene';
import {Hook} from './ui/Hook';

/** The finished certificate (as in the answer scene), framed lower so the hook fits above it. */
const COVER_FRAME = 250;
const coverCamera = () => {
  const c = new THREE.PerspectiveCamera();
  c.position.set(1.2, 2.3, 28.5);
  c.lookAt(0, 1.45, 0);
  return {position: c.position.clone(), quaternion: c.quaternion.clone()};
};

/**
 * 1080×1920 cover: the hook line above the certificate, all inside the
 * centred 4:5 crop (y 285–1635) that Instagram shows in the profile grid.
 */
export const Cover: React.FC = () => {
  const {width, height} = useVideoConfig();
  // The certificate textures are drawn before the 3D canvas mounts, so its first render includes them.
  const textures = useTextures();
  return (
    <AbsoluteFill style={{background: COLORS.bgBottom}}>
      {textures ? (
      <ThreeCanvas width={width} height={height} flat gl={{antialias: false}} camera={{fov: 30, near: 1, far: 200, position: [0, 0, 25]}}>
        <Scene textures={textures} frameOverride={COVER_FRAME} cameraOverride={coverCamera()} />
      </ThreeCanvas>
      ) : null}
      <Vignette />
      <Hook static frameOverride={80} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1528, textAlign: 'center', fontFamily: SANS, fontSize: 30, fontWeight: 700, letterSpacing: 5, color: COLORS.goldLight}}>
        AVANTIS · {COPY.launch.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
