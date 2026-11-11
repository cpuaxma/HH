import * as THREE from 'three';
import {makeRandom} from './math';

/** A 64×64 tileable value-noise texture, sampled identically on the GPU and in JS. */
export const NOISE_N = 64;
const data = (() => {
  const rnd = makeRandom(4242);
  const d = new Uint8Array(NOISE_N * NOISE_N * 4);
  for (let i = 0; i < NOISE_N * NOISE_N; i++) {
    const v = Math.floor(rnd.next() * 256);
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  return d;
})();

let tex: THREE.DataTexture | null = null;
export const noiseTexture = () => {
  if (tex) return tex;
  tex = new THREE.DataTexture(data, NOISE_N, NOISE_N, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
};

/** Bilinear sample matching texture2D with LinearFilter + RepeatWrapping. */
export const sampleNoise = (u: number, v: number) => {
  const x = u * NOISE_N - 0.5;
  const y = v * NOISE_N - 0.5;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const at = (i: number, j: number) => data[((((j % NOISE_N) + NOISE_N) % NOISE_N) * NOISE_N + (((i % NOISE_N) + NOISE_N) % NOISE_N)) * 4] / 255;
  const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * fx;
  const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * fx;
  return a + (b - a) * fy;
};
