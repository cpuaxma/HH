import {useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {FormatId, LAYOUT} from '../data';
import {computeCamera} from '../lib/camera';
import {SCREEN, V3} from '../lib/story';
import {DBG} from '../debug';

/** Screen canvas size: 400 × 890 design points at 3×, matching the screen's 0.702 × 1.562 aspect. */
export const TEX = {w: 1200, h: 2670, scale: 3};

export type ScreenTextures = {hi: THREE.CanvasTexture; lo: THREE.CanvasTexture; active: {current: THREE.Texture}};

/** How tall the screen is on the frame (px), from the camera distance to the phone. */
const screenPx = (t: number, fmt: FormatId, at: V3) => {
  const c = computeCamera(t, fmt);
  const d = Math.hypot(c.position[0] - at[0], c.position[1] - at[1], c.position[2] - at[2]);
  return (SCREEN.height / (2 * d * Math.tan((c.fov * Math.PI) / 360))) * LAYOUT[fmt].height;
};

/**
 * A phone screen as two CanvasTextures, redrawn per frame in a layout effect (so they are
 * ready before the pipeline renders):
 * - `hi`: 1200 × 2670, no mipmaps, used when the screen is big on frame (≈1:1, razor sharp);
 * - `lo`: 600 × 1335 with mipmaps, used in the wide shots (no shimmer when minified).
 * Only the one in use is uploaded, and only when `key(frame)` says the content changed.
 */
export const useScreenTexture = (
  draw: (ctx: CanvasRenderingContext2D, frame: number) => void,
  key: (frame: number) => string,
  at: V3,
): ScreenTextures => {
  const frame = useCurrentFrame();
  const fmt: FormatId = useVideoConfig().height > 1500 ? 'vertical' : 'feed';
  const {gl} = useThree();
  const last = useRef<{key: string; tier: string} | null>(null);
  const t = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TEX.w;
    canvas.height = TEX.h;
    const ctx = canvas.getContext('2d', {willReadFrequently: DBG.has('cpuCanvas')})!;
    const small = document.createElement('canvas');
    small.width = TEX.w / 2;
    small.height = TEX.h / 2;
    const sctx = small.getContext('2d', {willReadFrequently: DBG.has('cpuCanvas')})!;
    const hi = new THREE.CanvasTexture(canvas);
    hi.colorSpace = THREE.SRGBColorSpace;
    hi.generateMipmaps = false;
    hi.minFilter = THREE.LinearFilter;
    hi.magFilter = THREE.LinearFilter;
    hi.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    const lo = new THREE.CanvasTexture(small);
    lo.colorSpace = THREE.SRGBColorSpace;
    lo.generateMipmaps = true;
    lo.minFilter = THREE.LinearMipmapLinearFilter;
    lo.magFilter = THREE.LinearFilter;
    lo.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    return {ctx, sctx, hi, lo, active: {current: lo as THREE.Texture}};
  }, [gl]);

  useLayoutEffect(() => {
    const tier = screenPx(frame, fmt, at) > 1150 ? 'hi' : 'lo';
    const k = key(frame);
    const prev = last.current;
    if (prev && prev.key === k && prev.tier === tier) return;
    if (!prev || prev.key !== k) {
      t.ctx.save();
      t.ctx.setTransform(TEX.scale, 0, 0, TEX.scale, 0, 0);
      draw(t.ctx, frame);
      t.ctx.restore();
    }
    if (tier === 'hi') {
      t.hi.needsUpdate = true;
      t.active.current = t.hi;
    } else {
      t.sctx.imageSmoothingQuality = 'high';
      t.sctx.drawImage(t.ctx.canvas, 0, 0, TEX.w / 2, TEX.h / 2);
      t.lo.needsUpdate = true;
      t.active.current = t.lo;
    }
    last.current = {key: k, tier};
  }, [t, frame, draw, key, fmt, at]);
  return t;
};
