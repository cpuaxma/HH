import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {COUNT} from './grid';
import {makePillarGeometry} from './geometry';
import {makePillarMaterial, makeReflectionMaterial} from './shaders/materials';
import {worldAt} from './world';

const m = new THREE.Matrix4();
const mirror = new THREE.Matrix4().makeScale(1, -1, 1);
const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const scl = new THREE.Vector3();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

/** The 100 pillars (one instanced draw) and their mirror images under the glass (one more). */
export const Pillars: React.FC = () => {
  const frame = useCurrentFrame();
  const main = useRef<THREE.InstancedMesh>(null);
  const refl = useRef<THREE.InstancedMesh>(null);
  const {geometry, fx, fx2, mat, reflMat} = useMemo(() => {
    const g = makePillarGeometry();
    const a = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 4), 4);
    const b = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 4), 4);
    a.setUsage(THREE.DynamicDrawUsage);
    b.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aFx', a);
    g.setAttribute('aFx2', b);
    return {geometry: g, fx: a, fx2: b, mat: makePillarMaterial(), reflMat: makeReflectionMaterial()};
  }, []);

  useLayoutEffect(() => {
    const {pillars} = worldAt(frame);
    pillars.forEach((p, i) => {
      const hidden = p.sy <= 0.0011 || p.dissolve >= 0.999;
      if (hidden) {
        main.current!.setMatrixAt(i, ZERO);
        refl.current!.setMatrixAt(i, ZERO);
      } else {
        pos.set(p.x, p.y, p.z);
        quat.set(p.qx, p.qy, p.qz, p.qw);
        scl.set(p.sx, p.sy, p.sz);
        m.compose(pos, quat, scl);
        main.current!.setMatrixAt(i, m);
        refl.current!.setMatrixAt(i, p.reflect > 0.01 && p.y > -0.2 ? m.premultiply(mirror) : ZERO);
      }
      fx.setXYZW(i, p.glow, p.red, p.crack, p.dissolve);
      fx2.setXYZW(i, p.grey, p.heat, (i * 0.6180339) % 1, p.reflect);
    });
    main.current!.instanceMatrix.needsUpdate = true;
    refl.current!.instanceMatrix.needsUpdate = true;
    fx.needsUpdate = true;
    fx2.needsUpdate = true;
  }, [frame, fx, fx2]);

  return (
    <>
      <instancedMesh visible={!(process.env.REMOTION_DEBUG_HIDE ?? '').includes('refl')} ref={refl} args={[geometry, reflMat, COUNT]} frustumCulled={false} renderOrder={-2} />
      <instancedMesh ref={main} args={[geometry, mat, COUNT]} frustumCulled={false} renderOrder={0} />
    </>
  );
};
