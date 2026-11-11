import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {makeRandom, prog, smooth, wobble} from '../lib/math';
import {makeEmberMaterial, makeParticleBuffers, pointScale} from '../lib/particles';
import {CHILI_END, useTime} from '../timeline';

const N = 150;

/** Slow embers drifting up around and behind the resting chili. */
export const EndEmbers: React.FC = () => {
  const t = useTime();
  const {size, camera} = useThree();
  const r = useMemo(() => {
    const rnd = makeRandom(66);
    const defs = Array.from({length: N}, () => {
      const behind = rnd.next() < 0.7;
      return {
        x: rnd.range(-11, 11),
        z: behind ? rnd.range(-22, -4) : rnd.range(-3, 6),
        y0: rnd.range(-10, -4),
        rise: rnd.range(15, 24),
        speed: rnd.range(0.8, 1.7),
        phase: rnd.next(),
        size: rnd.range(0.05, 0.12),
        seed: rnd.range(0, 50),
        heat: rnd.next(),
      };
    });
    return {defs, buf: makeParticleBuffers(N), mat: makeEmberMaterial()};
  }, []);
  useLayoutEffect(() => {
    r.mat.uniforms.uScale.value = pointScale(size.height, (camera as THREE.PerspectiveCamera).fov);
    const on = smooth(prog(8.9, 9.8, t));
    r.defs.forEach((d, i) => {
      const period = d.rise / d.speed;
      const f = ((t / period + d.phase) % 1 + 1) % 1;
      const y = CHILI_END[1] + d.y0 + f * d.rise;
      const x = CHILI_END[0] + d.x + 0.8 * wobble(t * 0.5 + d.seed, d.seed);
      const z = CHILI_END[2] + d.z + 0.6 * wobble(t * 0.4 + d.seed * 2, d.seed + 3);
      r.buf.pos.set([x, y, z], i * 3);
      const life = Math.sin(Math.PI * f);
      const h = 0.4 + 0.6 * d.heat;
      r.buf.color.set([1.2 + 3.2 * h, 0.18 + 1.1 * h * h, 0.03 + 0.25 * h * h * h], i * 3);
      r.buf.alpha[i] = on * Math.pow(life, 1.4) * (0.55 + 0.45 * Math.sin(t * 1.3 + d.seed) * 0.3);
      r.buf.size[i] = d.size;
    });
    r.buf.commit();
  });
  return <points geometry={r.buf.geometry} material={r.mat} frustumCulled={false} visible={t > 8.9} renderOrder={3} />;
};
