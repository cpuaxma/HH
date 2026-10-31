import {EffectComposer, SMAA} from '@react-three/postprocessing';
import {useThree} from '@react-three/fiber';
import {DepthOfFieldEffect, EffectPass} from 'postprocessing';
import {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BRAND} from '../data';
import {applyCamera, computeCamera} from '../lib/camera';
import {R} from '../lib/geo';
import {Globe, HAZE_UNIFORMS} from './Globe';
import {Pulses} from './Pulses';
import {RouteLine} from './Route';

/** Key light direction in camera space: from the upper left, a little in front. */
const KEY_DIR_CAM = new THREE.Vector3(-0.55, 0.75, 0.6).normalize();

/** Drives the camera, the key light (which travels with the camera), the haze and the depth of field. */
const Rig: React.FC<{dof: DepthOfFieldEffect; dofPass: EffectPass; sun: THREE.DirectionalLight}> = ({dof, dofPass, sun}) => {
  const frame = useCurrentFrame();
  const {camera, size} = useThree();
  const cam = computeCamera(frame);

  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    applyCamera(c, cam, size.width, size.height);
    // The globe is always lit from the camera's upper left, wherever the camera goes.
    const dir = KEY_DIR_CAM.clone().applyQuaternion(c.quaternion);
    sun.position.copy(dir.multiplyScalar(R * 4));
    sun.target.position.set(0, 0, 0);
    sun.target.updateMatrixWorld();
    sun.updateMatrixWorld();
    // Globe centre in view space, for the edge haze.
    HAZE_UNIFORMS.uCenterView.value.set(0, 0, 0).applyMatrix4(c.matrixWorldInverse);
    dof.target!.set(...cam.target);
    dof.cocMaterial.worldFocusRange = cam.dist * 0.45;
    dof.bokehScale = 1.6 * cam.dof;
    // Depth of field only runs during the close-ups.
    dofPass.enabled = cam.dof > 0.002;
  });
  return null;
};

export const Scene: React.FC = () => {
  const {camera} = useThree();
  const [dof, dofPass] = useMemo(() => {
    const effect = new DepthOfFieldEffect(camera, {worldFocusRange: 60, bokehScale: 0, resolutionScale: 0.25});
    effect.target = new THREE.Vector3();
    return [effect, new EffectPass(camera, effect)] as const;
  }, [camera]);
  const bg = useMemo(() => new THREE.Color(BRAND.background), []);
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight('#FFF8EE', 1.55);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const cam = l.shadow.camera;
    cam.left = -R * 1.12;
    cam.right = R * 1.12;
    cam.top = R * 1.12;
    cam.bottom = -R * 1.12;
    cam.near = R * 2;
    cam.far = R * 6;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.05;
    l.shadow.radius = 4;
    return l;
  }, []);

  return (
    <>
      <color attach="background" args={[bg.r, bg.g, bg.b]} />
      <hemisphereLight args={['#FFFFFF', '#E4E0DA', 1.55]} />
      <primitive object={sun} />
      <primitive object={sun.target} />
      <Rig dof={dof} dofPass={dofPass} sun={sun} />
      <Globe />
      <RouteLine />
      <Pulses />
      <EffectComposer multisampling={0}>
        <primitive object={dofPass} />
        <SMAA />
      </EffectComposer>
    </>
  );
};
