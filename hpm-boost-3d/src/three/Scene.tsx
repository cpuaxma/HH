import {Bloom, EffectComposer, SMAA, ToneMapping, Vignette} from '@react-three/postprocessing';
import {useThree} from '@react-three/fiber';
import {DepthOfFieldEffect, EffectPass, ToneMappingMode} from 'postprocessing';
import {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {cameraAt} from '../lib/camera';
import {useTime} from '../timeline';
import {Chili} from './Chili';
import {Coins} from './Coins';
import {EndEmbers} from './EndEmbers';
import {Funnel} from './Funnel';
import {Notes} from './Notes';
import {Phone} from './Phone';
import {Ring} from './Ring';
import {Stage} from './Stage';

/** Virtual 50mm on a full-frame sensor held vertically: 36mm tall → 39.6° vertical FOV. */
export const FOV = (2 * Math.atan(18 / 50) * 180) / Math.PI;

const CameraRig: React.FC<{dof: DepthOfFieldEffect}> = ({dof}) => {
  const t = useTime();
  const {camera} = useThree();
  const cam = cameraAt(t);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.fov = FOV;
    c.near = 0.1;
    c.far = 900;
    c.position.set(...cam.position);
    c.up.set(0, 1, 0);
    c.lookAt(...cam.look);
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
    dof.target!.set(...cam.focus);
    dof.bokehScale = cam.bokeh;
  });
  return null;
};

export const Scene: React.FC = () => {
  const {camera} = useThree();
  const [dof, dofPass] = useMemo(() => {
    const effect = new DepthOfFieldEffect(camera, {worldFocusRange: 9, bokehScale: 2.4, resolutionScale: 0.5});
    effect.target = new THREE.Vector3();
    return [effect, new EffectPass(camera, effect)] as const;
  }, [camera]);
  return (
    <>
      <CameraRig dof={dof} />
      <Stage />
      <Phone />
      <Notes />
      <Ring />
      <Chili />
      <Funnel />
      <Coins />
      <EndEmbers />
      <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
        <primitive object={dofPass} />
        <Bloom mipmapBlur luminanceThreshold={1.15} luminanceSmoothing={0.2} intensity={0.75} radius={0.62} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Vignette offset={0.32} darkness={0.62} />
        <SMAA />
      </EffectComposer>
    </>
  );
};
