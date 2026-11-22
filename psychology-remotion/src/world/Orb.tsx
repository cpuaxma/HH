import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {V3} from '../lib/track';
import {glowTexture} from './textures';

type Props = {pos: V3; color: THREE.Color; opacity: number; scale: number; pulse: number; heat?: number};

/** A glowing orb: HDR core (caught by bloom), an additive halo sprite and a wide faint aura. */
export const Orb: React.FC<Props> = ({pos, color, opacity, scale, pulse, heat = 1}) => {
  const parts = useMemo(() => {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 16),
      new THREE.MeshBasicMaterial({toneMapped: false, transparent: true, fog: false}),
    );
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false, fog: false}),
    );
    const aura = new THREE.Sprite(
      new THREE.SpriteMaterial({map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false, fog: false}),
    );
    const g = new THREE.Group();
    g.add(aura, halo, core);
    core.renderOrder = 5;
    halo.renderOrder = 4;
    aura.renderOrder = 3;
    return {g, core, halo, aura};
  }, []);

  useLayoutEffect(() => {
    const {g, core, halo, aura} = parts;
    g.position.set(...pos);
    g.visible = opacity > 0.005;
    const k = 1 + pulse * 0.22;
    core.scale.setScalar(scale * k);
    const white = new THREE.Color(1, 0.97, 0.9);
    const cm = core.material as THREE.MeshBasicMaterial;
    cm.color.copy(color).lerp(white, 0.55).multiplyScalar(3.2 * heat);
    cm.opacity = opacity;
    const hm = halo.material as THREE.SpriteMaterial;
    hm.color.copy(color).multiplyScalar(1.6 * heat * (0.85 + pulse * 0.25));
    hm.opacity = opacity;
    halo.scale.setScalar(1.7 * scale * k);
    const am = aura.material as THREE.SpriteMaterial;
    am.color.copy(color).multiplyScalar(0.28 * heat);
    am.opacity = opacity * (0.6 + pulse * 0.25);
    aura.scale.setScalar(3.6 * scale * (1 + pulse * 0.12));
  });

  return <primitive object={parts.g} />;
};
