import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {COLORS, EASE, VIDEO} from '../theme';
import {jitter, noise, rand} from '../motion';

export type ParticleSpec = {
  start: [number, number];
  ctrl: [number, number];
  end: [number, number];
  r: number;
  flowAt: number;
};

/** Scattered start points, curved paths, and targets inside an ellipse around `target`. */
export const makeParticles = (
  count: number,
  target: {cx: number; cy: number; rx: number; ry: number},
  flowFrom: number,
  flowSpread: number,
): ParticleSpec[] =>
  new Array(count).fill(0).map((_, i) => {
    const sx = 50 + rand(i * 3 + 1) * (VIDEO.width - 100);
    const raw = 240 + rand(i * 3 + 2) * 1320;
    const sy = raw > 430 && raw < 700 ? raw + 290 : raw; // keep the headline band clear
    const a = rand(i * 5 + 7) * Math.PI * 2;
    const rr = Math.sqrt(rand(i * 5 + 8));
    const ex = target.cx + Math.cos(a) * target.rx * rr;
    const ey = target.cy + Math.sin(a) * target.ry * rr;
    // Control point pushed sideways off the straight line, so every path curves.
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    const len = Math.hypot(ex - sx, ey - sy) || 1;
    const bend = (rand(i * 7 + 4) - 0.5) * 0.9 * len;
    return {
      start: [sx, sy],
      ctrl: [mx + (-(ey - sy) / len) * bend, my + ((ex - sx) / len) * bend],
      end: [ex, ey],
      r: 2.5 + rand(i * 11 + 3) * 3,
      flowAt: flowFrom + rand(i * 13 + 6) * flowSpread,
    };
  });

const bez = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

/**
 * Red particles jitter in place, then flow along their curve into the target, turning gold
 * and calming down as they travel. Reads the frame itself so it works inside <Trail>.
 */
export const Particles: React.FC<{specs: ParticleSpec[]; flowDur: number; appear: number; opacity?: number}> = ({
  specs,
  flowDur,
  appear,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height}>
        {specs.map((p, i) => {
          const t = interpolate(frame, [p.flowAt, p.flowAt + flowDur], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: EASE.inOut,
          });
          const restless = 1 - Math.min(1, t * 1.6);
          const j = jitter(i + 100, frame, 5 * restless);
          // Settled particles drift slowly and smoothly inside the shield.
          const calm = t >= 1 ? 1 : 0;
          const dx = calm * noise(i + 300, frame * 0.02) * 6;
          const dy = calm * noise(i + 400, frame * 0.02) * 6;
          const x = bez(p.start[0], p.ctrl[0], p.end[0], t) + j.x + dx;
          const y = bez(p.start[1], p.ctrl[1], p.end[1], t) + j.y + dy;
          const color = interpolateColors(t, [0, 0.55, 1], [COLORS.red, COLORS.goldA, COLORS.goldB]);
          const flick = restless > 0 ? 1 - restless + restless * j.flicker : 1;
          const fadeIn = Math.min(1, Math.max(0, appear * 1.8 - rand(i + 77) * 0.8));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={p.r * (1 - 0.25 * t)}
              fill={color}
              opacity={fadeIn * flick * opacity}
              style={{filter: `drop-shadow(0 0 ${4 + t * 4}px ${color})`}}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
