import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {COUNT, TILE} from './grid';
import {makeHalfTileGeometry} from './geometry';
import {makeTileDepthMaterial, makeTileMaterial} from './shaders/materials';
import {worldAt} from './world';

const tmp = new THREE.Matrix4();
const a = new THREE.Matrix4();
const b = new THREE.Matrix4();

/** Black-glass tiles: two instanced half-tiles each (trapdoors), plus a depth-only pass. */
export const Tiles: React.FC = () => {
  const frame = useCurrentFrame();
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const depthRefs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const halves = useMemo(
    () =>
      ([-1, 1] as const).map((side) => {
        const g = makeHalfTileGeometry(side);
        const t1 = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 4), 4);
        const t2 = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 4), 4);
        g.setAttribute('aT1', t1);
        g.setAttribute('aT2', t2);
        return {side, g, t1, t2, mat: makeTileMaterial(side), depth: makeTileDepthMaterial()};
      }),
    [],
  );

  useLayoutEffect(() => {
    const {tiles} = worldAt(frame);
    tiles.forEach((t, i) => {
      // Whole-tile transform: lever tilt about its pivot, then position.
      const jx = t.shake ? Math.sin(frame * 2.3 + i) * 0.02 * t.shake : 0;
      const jy = t.shake ? Math.cos(frame * 3.1 + i) * 0.012 * t.shake : 0;
      tmp.makeTranslation(t.pivotX, t.pivotY, 0);
      tmp.multiply(a.makeRotationZ(t.rz));
      tmp.multiply(a.makeTranslation(-t.pivotX, -t.pivotY, 0));
      tmp.multiply(a.makeTranslation(t.x + jx, t.y + jy, t.z));
      halves.forEach((h, hi) => {
        // Hinge each half about its outer edge.
        const edge = (h.side * TILE) / 2;
        b.copy(tmp)
          .multiply(a.makeTranslation(edge, 0, 0))
          .multiply(a.makeRotationZ(h.side * t.hinge))
          .multiply(a.makeTranslation(-edge + (h.side * TILE) / 4, 0, 0));
        refs[hi].current!.setMatrixAt(i, b);
        depthRefs[hi].current!.setMatrixAt(i, b);
        h.t1.setXYZW(i, t.glow, t.dead, t.flash, t.opacity);
        h.t2.setXYZW(i, h.side, (i * 0.7548776) % 1, t.ripple, t.shake);
      });
    });
    halves.forEach((h, hi) => {
      refs[hi].current!.instanceMatrix.needsUpdate = true;
      depthRefs[hi].current!.instanceMatrix.needsUpdate = true;
      h.t1.needsUpdate = true;
      h.t2.needsUpdate = true;
    });
  }, [frame, halves]);

  return (
    <>
      {halves.map((h, hi) => (
        <React.Fragment key={hi}>
          <instancedMesh ref={refs[hi]} args={[h.g, h.mat, COUNT]} frustumCulled={false} renderOrder={-3} />
          <instancedMesh ref={depthRefs[hi]} args={[h.g, h.depth, COUNT]} frustumCulled={false} renderOrder={-1} />
        </React.Fragment>
      ))}
    </>
  );
};
