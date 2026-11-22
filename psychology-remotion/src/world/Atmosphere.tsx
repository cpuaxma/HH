import React, {useLayoutEffect, useMemo} from 'react';
import {random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {getWorld} from '../lib/director';
import {STAGE_S, TRACK_LENGTH, V3, pointAtS} from '../lib/track';
import {beamTexture, cloudTexture, glowTexture} from './textures';

const BANKS = 56;
const BOTTOM_BANKS = 26;

/**
 * Volumetric feel on a budget: soft fog puffs lit by the emotion color (thick at the bottom), and
 * at «أمل» a warm shaft of light that cuts down through the fog onto the track.
 */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);

  const parts = useMemo(() => {
    const group = new THREE.Group();
    const sprites: {sp: THREE.Sprite; base: V3; size: number; opacity: number; bottom: boolean; seed: number}[] = [];
    for (let i = 0; i < BANKS + BOTTOM_BANKS; i++) {
      const bottom = i >= BANKS;
      const r = (k: string) => random(`fog-${i}-${k}`);
      const s = bottom
        ? STAGE_S.capitulation + r('s') * (STAGE_S.relief - STAGE_S.capitulation)
        : r('s') * TRACK_LENGTH;
      const p = pointAtS(s);
      const base: V3 = bottom
        ? [p[0] + (r('x') - 0.5) * 8, p[1] - 1.5 + r('y') * 4.5, p[2] + (r('z') - 0.5) * 16]
        : [p[0] + (r('x') - 0.5) * 14, p[1] - 4 + r('y') * 9, p[2] + (r('z') - 0.5) * 26];
      const mat = new THREE.SpriteMaterial({
        map: cloudTexture(i % 4),
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
        rotation: r('rot') * Math.PI * 2,
      });
      const sp = new THREE.Sprite(mat);
      sp.renderOrder = 0;
      group.add(sp);
      sprites.push({sp, base, size: bottom ? 9 + r('size') * 12 : 12 + r('size') * 20, opacity: bottom ? 0.2 : 0.13, bottom, seed: r('seed')});
    }

    // the hope ray: three crossed planes so it reads as a volume from any angle
    const hope = pointAtS(STAGE_S.hope + 9);
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTexture(),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
      color: new THREE.Color('#FFB878'),
    });
    const beam = new THREE.Group();
    const L = 60;
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(k === 0 ? 12 : 8, L), beamMat);
      m.rotation.y = (k * Math.PI) / 3;
      m.renderOrder = 7;
      beam.add(m);
    }
    // plane's +y end is the source (top of the texture); tilt it so the light comes from up-left-behind
    const dir = new THREE.Vector3(0.55, 1, 0.3).normalize();
    beam.position.set(hope[0] + dir.x * L * 0.5, hope[1] + dir.y * L * 0.5, hope[2] + dir.z * L * 0.5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(beam);
    // where the light lands: a warm pool on the track
    const pool = new THREE.Sprite(
      new THREE.SpriteMaterial({map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false, fog: false, color: new THREE.Color('#FFB878')}),
    );
    pool.position.set(hope[0], hope[1] + 0.3, hope[2]);
    pool.scale.set(10, 6, 1);
    pool.renderOrder = 7;
    group.add(pool);
    return {group, sprites, beam, beamMat, hope, pool};
  }, []);

  useLayoutEffect(() => {
    const cam = new THREE.Vector3(...w.cam.pos);
    const tint = w.stage.color.clone();
    const dawn = new THREE.Color('#FFB070');
    for (const s of parts.sprites) {
      const drift = Math.sin(frame * 0.008 + s.seed * 30) * 1.5;
      s.sp.position.set(s.base[0] + drift, s.base[1] + Math.sin(frame * 0.006 + s.seed * 11) * 0.6, s.base[2]);
      const size = s.size * (1 + 0.08 * Math.sin(frame * 0.01 + s.seed * 7));
      s.sp.scale.set(size, size * 0.62, 1);
      const d = cam.distanceTo(s.sp.position);
      const near = THREE.MathUtils.smoothstep(d, 3, size * 0.9);
      const far = Math.exp(-d * 0.018);
      const amount = s.bottom ? Math.max(0, (w.fogBanks - 0.4) / 0.6) : w.fogBanks;
      const m = s.sp.material as THREE.SpriteMaterial;
      // the hope ray lights the fog near it
      const lit = w.ray * Math.exp(-s.sp.position.distanceTo(new THREE.Vector3(...parts.hope)) / 10);
      m.color.copy(tint).lerp(dawn, Math.min(1, lit * 1.5)).multiplyScalar(0.55 + lit * 1.2);
      m.opacity = s.opacity * amount * near * far;
      s.sp.visible = m.opacity > 0.003;
    }
    // fade the shaft when the camera flies through it
    const a = new THREE.Vector3(...parts.hope);
    const dirN = new THREE.Vector3(0.55, 1, 0.3).normalize();
    const rel = cam.clone().sub(a);
    const along = THREE.MathUtils.clamp(rel.dot(dirN), 0, 46);
    const dAxis = rel.sub(dirN.multiplyScalar(along)).length();
    parts.beamMat.opacity = w.ray * 0.9 * THREE.MathUtils.smoothstep(dAxis, 1.5, 5);
    parts.beam.visible = w.ray > 0.003;
    (parts.pool.material as THREE.SpriteMaterial).opacity = w.ray * 0.55;
    parts.pool.visible = w.ray > 0.003;
  });

  return <primitive object={parts.group} />;
};
