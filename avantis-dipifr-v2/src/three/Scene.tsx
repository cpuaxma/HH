import {Bloom, EffectComposer, SMAA} from '@react-three/postprocessing';
import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {CameraState, applyCamera, computeCamera} from '../lib/camera';
import {Textures} from '../lib/textures';
import {Background} from './Background';
import {Certificate} from './Certificate';

const Rig: React.FC<{cam: CameraState}> = ({cam}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    applyCamera(camera as THREE.PerspectiveCamera, cam);
  });
  return null;
};

/** Soft studio reflections for the gold: a room environment, prefiltered once. */
const Studio: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.7;
    pmrem.dispose();
  }, [gl, scene]);
  return null;
};

export const Scene: React.FC<{
  textures: Textures;
  /** Freeze the 3D at this frame and camera (for the cover still). */
  frameOverride?: number;
  cameraOverride?: CameraState;
}> = ({textures, frameOverride, cameraOverride}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const cam = cameraOverride ?? computeCamera(frame);
  const key = useMemo(() => {
    const l = new THREE.DirectionalLight('#FFF4E2', 1.5);
    l.position.set(-6, 9, 14);
    return l;
  }, []);
  const rim = useMemo(() => {
    const l = new THREE.DirectionalLight('#9DB8FF', 1.4);
    l.position.set(8, 4, -6);
    return l;
  }, []);

  return (
    <>
      <Studio />
      <Rig cam={cam} />
      <Background />
      <ambientLight intensity={0.12} />
      <primitive object={key} />
      <primitive object={rim} />
      <Certificate textures={textures} frameOverride={frameOverride} />
      <EffectComposer multisampling={0}>
        <SMAA />
        <Bloom mipmapBlur luminanceThreshold={1.2} luminanceSmoothing={0.15} intensity={0.7} radius={0.6} />
      </EffectComposer>
    </>
  );
};
