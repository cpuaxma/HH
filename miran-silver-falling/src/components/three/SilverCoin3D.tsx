import React, {useMemo} from 'react';
import * as THREE from 'three';
import {silverMaterial} from './Studio';

/**
 * A polished silver coin standing upright, facing the camera: a lathed profile with a raised
 * rim and two engraved rings on each face. Radius 1, thickness ~0.16.
 */
export const SilverCoin3D: React.FC<{
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: number;
}> = ({rotation = [0, 0, 0], position = [0, 0, 0], scale = 1}) => {
  const geometry = useMemo(() => {
    // Half profile (radius, height), from the centre of the face out over the rim and back.
    const p: [number, number][] = [
      [0, 0.06],
      [0.56, 0.06],
      [0.58, 0.072],
      [0.6, 0.06],
      [0.8, 0.06],
      [0.82, 0.07],
      [0.84, 0.06],
      [0.88, 0.064],
      [0.9, 0.085],
      [0.97, 0.085],
      [1, 0.06],
      [1, -0.06],
      [0.97, -0.085],
      [0.9, -0.085],
      [0.88, -0.064],
      [0.84, -0.06],
      [0.82, -0.07],
      [0.8, -0.06],
      [0.6, -0.06],
      [0.58, -0.072],
      [0.56, -0.06],
      [0, -0.06],
    ];
    // Ordered bottom → top so the lathe's faces (and normals) point outwards.
    const g = new THREE.LatheGeometry(
      p.reverse().map(([r, y]) => new THREE.Vector2(r, y)),
      128,
    );
    g.computeVertexNormals();
    return g;
  }, []);
  const material = useMemo(() => {
    return silverMaterial(0.18);
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Lathe axis is Y; tip it so the face looks at the camera. */}
      <mesh geometry={geometry} material={material} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};
