import React, {forwardRef, useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Bloom, EffectComposer, SMAA, ToneMapping} from '@react-three/postprocessing';
import {BlendFunction, Effect, EffectAttribute, ToneMappingMode} from 'postprocessing';
import {useCurrentFrame} from 'remotion';
import {applyCamera} from './camera';

/**
 * Camera motion blur by depth reprojection: each pixel's world position is reconstructed from the
 * depth buffer, projected with the camera of half a frame earlier (a 180° shutter), and the image is
 * smeared along that screen-space velocity. Deterministic, one pass, and only visible on fast moves.
 */
class CameraMotionBlurEffect extends Effect {
  constructor() {
    super(
      'CameraMotionBlur',
      /* glsl */ `
      uniform mat4 uInvViewProj; uniform mat4 uPrevViewProj; uniform float uStrength;
      void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
        // Background (far plane) pixels reproject as if they were far away but finite.
        float dz = min(depth, 0.9990);
        vec4 ndc = vec4(uv * 2.0 - 1.0, dz * 2.0 - 1.0, 1.0);
        vec4 world = uInvViewProj * ndc; world /= world.w;
        vec4 prev = uPrevViewProj * world;
        vec2 prevUv = prev.xy / prev.w * 0.5 + 0.5;
        vec2 vel = (uv - prevUv) * uStrength;
        float len = length(vel);
        if (!(len < 10.0) || len < 0.0006) { outputColor = inputColor; return; }
        if (len > 0.045) vel *= 0.045 / len;
        vec4 acc = vec4(0.0);
        for (int i = 0; i < 12; i++) {
          float t = float(i) / 11.0 - 0.5;
          acc += texture2D(inputBuffer, clamp(uv + vel * t, 0.001, 0.999));
        }
        outputColor = acc / 12.0;
      }`,
      {
        blendFunction: BlendFunction.NORMAL,
        attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
        uniforms: new Map<string, THREE.Uniform>([
          ['uInvViewProj', new THREE.Uniform(new THREE.Matrix4())],
          ['uPrevViewProj', new THREE.Uniform(new THREE.Matrix4())],
          ['uStrength', new THREE.Uniform(1)],
        ]),
      },
    );
  }
}

const MotionBlur = forwardRef<CameraMotionBlurEffect, {frame: number}>(({frame}, ref) => {
  const effect = useMemo(() => new CameraMotionBlurEffect(), []);
  const {camera} = useThree();
  const prevCam = useMemo(() => new THREE.PerspectiveCamera(), []);
  useLayoutEffect(() => {
    applyCamera(camera as THREE.PerspectiveCamera, frame);
    applyCamera(prevCam, frame - 0.5);
    const vp = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    effect.uniforms.get('uInvViewProj')!.value.copy(vp).invert();
    effect.uniforms.get('uPrevViewProj')!.value.multiplyMatrices(prevCam.projectionMatrix, prevCam.matrixWorldInverse);
  }, [frame, camera, prevCam, effect]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});
MotionBlur.displayName = 'MotionBlur';

export const Post: React.FC<{blur?: boolean}> = ({blur = true}) => {
  const frame = useCurrentFrame();
  return (
    <EffectComposer multisampling={Number(process.env.REMOTION_MSAA ?? 0)} stencilBuffer frameBufferType={THREE.HalfFloatType}>
      {blur ? <MotionBlur frame={frame} /> : <></>}
      <Bloom intensity={0.95} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur radius={0.7} levels={7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {process.env.REMOTION_SMAA === '0' ? <></> : <SMAA />}
    </EffectComposer>
  );
};
