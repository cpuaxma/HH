import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, HEIGHT, WIDTH} from '../theme';

// Near-black base with deep navy gradients and a soft gold glow that never stops
// drifting (layered sines, so it never visibly loops).
export const BackgroundGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const dx = Math.sin(t * 0.37) * 0.06 + Math.sin(t * 0.13 + 1.3) * 0.03;
  const dy = Math.cos(t * 0.29) * 0.04 + Math.sin(t * 0.19 + 0.4) * 0.02;
  const size = 1400 * (1 + Math.sin(t * 0.45) * 0.04);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.base} 45%, ${colors.navy} 100%)`}}>
      <div
        style={{
          position: 'absolute',
          left: WIDTH * (0.5 + dx) - size / 2,
          top: HEIGHT * (0.16 + dy) - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,162,76,0.20) 0%, rgba(212,162,76,0.07) 38%, rgba(212,162,76,0) 68%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: WIDTH * (0.55 - dx * 0.7) - 700,
          top: HEIGHT * (0.92 - dy) - 700,
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,162,76,0.10) 0%, rgba(212,162,76,0) 62%)',
        }}
      />
    </AbsoluteFill>
  );
};
