import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../brand';
import {clamp, hexA, rand} from '../motion';

type Pt = {x: number; y: number};

/** Gold particles streaming from source points into a target rect along curved paths. */
export const GoldParticles: React.FC<{
  frame: number;
  count: number;
  start: number;
  dur: number;
  sources: Pt[];
  target: {x: number; y: number; w: number; h: number};
  seed?: number;
  fadeOnArrive?: boolean;
  jitter?: number;
}> = ({frame, count, start, dur, sources, target, seed = 1, fadeOnArrive = true, jitter = 1}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
    {Array.from({length: count}, (_, i) => {
      const r = (k: number) => rand(seed * 97 + i * 13 + k);
      const src = sources[i % sources.length];
      const sx = src.x + (r(1) - 0.5) * 120 * jitter;
      const sy = src.y + (r(2) - 0.5) * 80 * jitter;
      const tx = target.x + (r(3) - 0.5) * target.w;
      const ty = target.y + (r(4) - 0.5) * target.h;
      const delay = r(5) * dur * 0.35;
      const p = interpolate(frame, [start + delay, start + delay + dur * 0.65], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
      if (frame < start || (p <= 0 && jitter !== 0)) return null;
      const cx = (sx + tx) / 2 + (r(6) - 0.5) * 380;
      const cy = Math.min(sy, ty) - 80 - r(7) * 220;
      const x = (1 - p) * (1 - p) * sx + 2 * (1 - p) * p * cx + p * p * tx;
      const y = (1 - p) * (1 - p) * sy + 2 * (1 - p) * p * cy + p * p * ty;
      const o = interpolate(p, [0, 0.1, 0.85, 1], [jitter === 0 ? 1 : 0, 1, 1, fadeOnArrive ? 0 : 1]);
      const size = 2.5 + r(8) * 4.5;
      return (
        <g key={i} opacity={o}>
          <circle cx={x} cy={y} r={size * 2.6} fill={hexA(C.gold2, 0.18)} />
          <circle cx={x} cy={y} r={size} fill={r(9) > 0.5 ? C.gold1 : C.gold2} />
        </g>
      );
    })}
  </svg>
);

/** The resting positions GoldParticles uses for `target` (so a second swarm can start exactly there). */
export const scatterTargets = (count: number, seed: number, target: {x: number; y: number; w: number; h: number}) =>
  Array.from({length: count}, (_, i) => {
    const r = (k: number) => rand(seed * 97 + i * 13 + k);
    return {x: target.x + (r(3) - 0.5) * target.w, y: target.y + (r(4) - 0.5) * target.h};
  });
