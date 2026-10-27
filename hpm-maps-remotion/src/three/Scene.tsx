import {Bloom, EffectComposer, SMAA} from '@react-three/postprocessing';
import {useThree} from '@react-three/fiber';
import {DepthOfFieldEffect, EffectPass} from 'postprocessing';
import {useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {CITY_COLORS, FOCUS_SCREEN} from '../data';
import {computeCamera} from '../lib/camera';
import {City} from './City';
import {Markers} from './Markers';
import {RouteLine} from './Route';

/** Drives the default camera, the fog and the depth of field from the current frame. */
const CameraRig: React.FC<{dof: DepthOfFieldEffect; dofPass: EffectPass}> = ({dof, dofPass}) => {
  const frame = useCurrentFrame();
  const {camera, scene, size} = useThree();
  const cam = computeCamera(frame);

  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.fov = cam.fov;
    c.near = 2;
    c.far = 9000;
    c.position.set(...cam.position);
    c.rotation.order = 'YXZ';
    c.rotation.set(...cam.rotation);
    // Put the look-at target in the middle of the Instagram-safe area, not the frame centre.
    c.setViewOffset(
      size.width,
      size.height,
      size.width / 2 - FOCUS_SCREEN.x,
      size.height / 2 - FOCUS_SCREEN.y,
      size.width,
      size.height,
    );
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
    const fog = scene.fog as THREE.Fog;
    fog.near = cam.fogNear;
    fog.far = cam.fogFar;
    dof.target!.set(...cam.target);
    dof.bokehScale = 1.9 * cam.dof;
    // Depth of field only runs during close-ups.
    dofPass.enabled = cam.dof > 0.002;
  });
  return null;
};

/**
 * Nothing that casts a shadow ever moves and the shadow camera is fixed, so the
 * shadow map is drawn on the first few renders of each tab and then reused.
 * Identical on every frame: no shimmer, and much faster in software WebGL.
 */
const StaticShadows: React.FC = () => {
  const frame = useCurrentFrame();
  const {gl} = useThree();
  const renders = useRef(0);
  useLayoutEffect(() => {
    gl.shadowMap.autoUpdate = false;
    if (renders.current < 3) gl.shadowMap.needsUpdate = true;
    renders.current++;
  }, [frame, gl]);
  return null;
};

const SUN_DIR = new THREE.Vector3(-0.55, 1, 0.62).normalize();

export const Scene: React.FC = () => {
  const {camera} = useThree();
  const [dof, dofPass] = useMemo(() => {
    const effect = new DepthOfFieldEffect(camera, {worldFocusRange: 90, bokehScale: 0, resolutionScale: 0.25});
    effect.target = new THREE.Vector3();
    return [effect, new EffectPass(camera, effect)] as const;
  }, [camera]);
  const bg = useMemo(() => new THREE.Color(CITY_COLORS.ground), []);
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight(CITY_COLORS.sun, 1.0);
    l.position.copy(SUN_DIR).multiplyScalar(900);
    l.target.position.set(0, 0, 0);
    l.castShadow = true;
    l.shadow.mapSize.set(4096, 4096);
    const cam = l.shadow.camera;
    cam.left = -640;
    cam.right = 640;
    cam.top = 640;
    cam.bottom = -640;
    cam.near = 200;
    cam.far = 1800;
    l.shadow.bias = -0.0006;
    l.shadow.normalBias = 0.35;
    l.shadow.radius = 3;
    return l;
  }, []);

  return (
    <>
      <color attach="background" args={[bg.r, bg.g, bg.b]} />
      <fog attach="fog" args={[bg, 300, 900]} />
      <hemisphereLight args={[CITY_COLORS.sky, CITY_COLORS.hemiGround, 2.4]} />
      <primitive object={sun} />
      <primitive object={sun.target} />
      <StaticShadows />
      <CameraRig dof={dof} dofPass={dofPass} />
      <City />
      <RouteLine />
      <Markers />
      <EffectComposer multisampling={0}>
        <primitive object={dofPass} />
        <SMAA />
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.08} intensity={0.55} radius={0.55} />
      </EffectComposer>
    </>
  );
};
