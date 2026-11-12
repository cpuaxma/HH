import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural studio reflections for polished metal: a dark navy room with a few
 * softbox strips (white, plus a cool blue rim). Generated in code via PMREM, so
 * nothing is downloaded at render time.
 */
export const Studio: React.FC<{intensity?: number; warm?: boolean; frontFill?: number; wrap?: number}> = ({intensity = 1, warm = false, frontFill = 0, wrap = 0}) => {
  const {gl, scene} = useThree();
  const envMap = useMemo(() => {
    const room = new THREE.Scene();
    // Gradient dome: dark floor, cool mid-grey horizon, brighter sky. Flat faces of the metal
    // reflect this, so they read as silver rather than black.
    const dome = new THREE.SphereGeometry(20, 32, 16);
    const colors: number[] = [];
    const pos = dome.attributes.position;
    const sky = new THREE.Color('#A9B4C8').multiplyScalar(0.9 * intensity);
    const horizon = new THREE.Color('#2A3452');
    const floor = new THREE.Color('#070A12');
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 20;
      const c = y > 0 ? horizon.clone().lerp(sky, Math.pow(y, 0.7)) : horizon.clone().lerp(floor, Math.min(1, -y * 2.2));
      colors.push(c.r, c.g, c.b);
    }
    dome.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    room.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide})));
    const box = (w: number, h: number, color: string, power: number, pos: [number, number, number], rot: [number, number, number]) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide}),
      );
      m.position.set(...pos);
      m.rotation.set(...rot);
      room.add(m);
    };
    // Key softbox overhead, a tall strip on each side, a broad fill behind the camera.
    box(10, 3, '#FFFFFF', 3.5 * intensity, [0, 7, -2], [Math.PI / 2, 0, 0]);
    box(1.6, 9, '#FFFFFF', 3 * intensity, [-7, 1, 1], [0, Math.PI / 2, 0]);
    box(1.2, 9, warm ? '#FFD9A0' : '#9CC7FF', 2.2 * intensity, [7, 1, -1], [0, -Math.PI / 2, 0]);
    box(9, 4, '#DCE4F2', 0.9 * intensity, [0, 3, 9], [0, Math.PI, 0]);
    // A crisp horizontal strip: the bright band that runs along the front faces.
    box(14, 0.6, '#FFFFFF', 5 * intensity, [0, 0.2, 9], [0, Math.PI, 0]);
    // Optional broad soft panel behind the camera, for faces that look straight back at it (the coin).
    if (frontFill > 0) box(18, 9, '#C6D0E0', frontFill, [0, 1.5, 11], [0, Math.PI, 0]);
    // Optional broad side panels, so faces turned sideways (the cube's) still catch light.
    if (wrap > 0) {
      box(10, 8, '#FFF1D6', wrap, [-9, 1, 3], [0, Math.PI / 2, 0]);
      box(10, 8, '#FFF1D6', wrap * 0.8, [9, 1, 3], [0, -Math.PI / 2, 0]);
    }
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(room, 0.02);
    pmrem.dispose();
    return rt.texture;
  }, [gl, intensity, warm, frontFill, wrap]);

  // Attached during render (not in an effect) so the very first rendered frame already reflects it.
  scene.environment = envMap;
  return null;
};

/** Polished silver: fully metallic, low roughness, slightly cool. */
export const silverMaterial = (roughness = 0.24) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DDE3EC'),
    metalness: 1,
    roughness,
    clearcoat: 0.6,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
  });
