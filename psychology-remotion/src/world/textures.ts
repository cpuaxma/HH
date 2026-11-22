import {random} from 'remotion';
import * as THREE from 'three';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

let glowTex: THREE.Texture | null = null;
/** Soft radial glow (for the orb halo and sparks). */
export const glowTexture = () => {
  if (glowTex) return glowTex;
  const [c, g] = canvas(256, 256);
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.12, 'rgba(255,255,255,0.75)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.22)');
  grd.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
};

const cloudTexs: THREE.Texture[] = [];
/** Soft cloud puff built from seeded gaussian blobs (fog banks). */
export const cloudTexture = (variant: number) => {
  if (cloudTexs[variant]) return cloudTexs[variant];
  const [c, g] = canvas(256, 256);
  for (let i = 0; i < 26; i++) {
    const a = random(`cloud-${variant}-a-${i}`) * Math.PI * 2;
    const r = Math.sqrt(random(`cloud-${variant}-r-${i}`)) * 70;
    const x = 128 + Math.cos(a) * r;
    const y = 128 + Math.sin(a) * r * 0.6;
    const s = 30 + random(`cloud-${variant}-s-${i}`) * 50;
    const grd = g.createRadialGradient(x, y, 0, x, y, s);
    grd.addColorStop(0, 'rgba(255,255,255,0.16)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
  }
  cloudTexs[variant] = new THREE.CanvasTexture(c);
  return cloudTexs[variant];
};

let beamTex: THREE.Texture | null = null;
/** A long light shaft: bright core, soft sides, fading out at the far end. */
export const beamTexture = () => {
  if (beamTex) return beamTex;
  const [c, g] = canvas(128, 512);
  const img = g.createImageData(128, 512);
  for (let y = 0; y < 512; y++) {
    const along = y / 511; // 0 top (source) .. 1 bottom (target)
    const fade = Math.min(1, along * 3) * (1 - Math.pow(Math.max(0, (along - 0.9) / 0.1), 2)) * (0.35 + 0.65 * along);
    for (let x = 0; x < 128; x++) {
      const across = (x - 63.5) / 64;
      const wdt = 0.35 + 0.45 * (1 - along);
      const v = Math.exp(-((across / wdt) ** 2) * 2.2) * fade;
      // faint streaks inside the beam
      const streak = 0.75 + 0.25 * Math.sin(x * 0.55 + Math.sin(x * 0.13) * 3);
      const a = Math.max(0, Math.min(1, v * streak));
      const j = (y * 128 + x) * 4;
      img.data[j] = 255;
      img.data[j + 1] = 255;
      img.data[j + 2] = 255;
      img.data[j + 3] = Math.round(a * 255);
    }
  }
  g.putImageData(img, 0, 0);
  beamTex = new THREE.CanvasTexture(c);
  return beamTex;
};
