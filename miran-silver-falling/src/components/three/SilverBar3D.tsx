import React, {useMemo} from 'react';
import * as THREE from 'three';
import {silverMaterial} from './Studio';

const CRACK_POINTS = (() => {
  const pts: THREE.Vector3[] = [];
  // An irregular fracture: uneven steps and offsets, like a real crack.
  const zs = [-1.0, -0.86, -0.64, -0.55, -0.32, -0.12, -0.04, 0.2, 0.38, 0.47, 0.7, 0.86, 1.0];
  const xs = [0.02, -0.05, 0.04, 0.13, 0.06, -0.08, -0.03, 0.09, 0.02, -0.1, -0.04, 0.05, 0.0];
  zs.forEach((z, i) => pts.push(new THREE.Vector3(xs[i], 0.215, z)));
  return pts;
})();

const ingotGeometry = () => {
  const s = new THREE.Shape();
  const bw = 0.62; // half base width
  const tw = 0.4; // half top width
  const h = 0.36;
  s.moveTo(-bw, 0);
  s.lineTo(bw, 0);
  s.lineTo(tw, h);
  s.lineTo(-tw, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 2.1, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 8, curveSegments: 4});
  g.center();
  g.computeVertexNormals();
  return g;
};

/** The ingot mesh plus an optional glowing red fracture across its top face. */
const Ingot: React.FC<{crack: number; material: THREE.Material}> = ({crack, material}) => {
  const geometry = useMemo(ingotGeometry, []);
  const shown = Math.max(2, Math.ceil(crack * (CRACK_POINTS.length - 1)) + 1);
  const crackCurve = useMemo(() => new THREE.CatmullRomCurve3(CRACK_POINTS.slice(0, shown), false, 'catmullrom', 0.05), [shown]);
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={geometry} material={material} />
      {crack > 0.001 ? (
        <>
          <mesh>
            <tubeGeometry args={[crackCurve, 96, 0.006, 6, false]} />
            <meshBasicMaterial color={new THREE.Color('#FFE6E3').multiplyScalar(1.6)} toneMapped={false} />
          </mesh>
          <mesh>
            <tubeGeometry args={[crackCurve, 96, 0.022, 8, false]} />
            <meshBasicMaterial color="#FF3B30" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

/**
 * A silver ingot (trapezoid cross-section, soft bevels) with a faded mirror reflection on
 * the floor at y = `floorY`. Units: about 2.3 long, 0.45 tall.
 */
export const SilverBar3D: React.FC<{
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: number;
  crack?: number; // 0–1: red fracture drawing across the top face
  floorY?: number; // world-space floor height for the reflection; omit for none
}> = ({rotation = [0, 0, 0], position = [0, 0, 0], scale = 1, crack = 0, floorY}) => {
  const material = useMemo(() => silverMaterial(0.2), []);
  const reflectMaterial = useMemo(() => {
    const m = silverMaterial(0.35);
    m.side = THREE.DoubleSide; // mirrored (negative scale) geometry flips winding
    m.transparent = true;
    m.depthWrite = false;
    // Fade the reflection out with distance below the floor (world-space y).
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uFloor = {value: floorY ?? 0};
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vWorldY;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWorldY = (modelMatrix * vec4(transformed, 1.0)).y;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vWorldY;\nuniform float uFloor;')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= 0.32 * smoothstep(uFloor - 0.5, uFloor, vWorldY);');
    };
    return m;
  }, [floorY]);
  const lift = floorY === undefined ? 0 : position[1] - floorY;
  return (
    <>
      <group position={position} rotation={rotation} scale={scale}>
        <Ingot crack={crack} material={material} />
      </group>
      {floorY !== undefined ? (
        <group position={[position[0], floorY - lift, position[2]]} rotation={[-rotation[0], rotation[1], -rotation[2]]} scale={[scale, -scale, scale]}>
          <Ingot crack={0} material={reflectMaterial} />
        </group>
      ) : null}
    </>
  );
};
