import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {hexA, rand} from '../motion';

const COUNT = 26;

/** Gold dust that bursts out from the logo as it lands, then drifts upward and fades. */
export const Dust: React.FC<{cx: number; cy: number; u: number; start: number}> = ({cx, cy, u, start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: COUNT}, (_, i) => {
        const delay = start + rand(i + 1) * 14;
        const t = (frame - delay) / fps; // seconds since this mote launched
        if (t <= 0) return null;
        const angle = rand(i + 40) * Math.PI * 2;
        const speed = (160 + rand(i + 80) * 260) * u;
        const out = 1 - Math.exp(-t * 3.2); // decelerating burst
        const r = 200 * u + speed * out;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r - t * 70 * u; // slow rise
        const size = (3 + rand(i + 120) * 6) * u;
        const life = interpolate(t, [0, 0.12, 1.4, 2.6], [0, 1, 0.7, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const twinkle = 0.65 + 0.35 * Math.sin(frame * 0.35 + i * 1.7);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#FFFFFF' : COLORS.goldB,
              boxShadow: `0 0 ${size * 3}px ${hexA(COLORS.goldA, 0.9)}`,
              opacity: life * twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
