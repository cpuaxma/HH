import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, HEIGHT, WIDTH} from '../theme';

// Navy gradient with a soft gold glow that drifts slowly from the bottom-right.
// Driven by layered sines so it never stops and never loops visibly.
export const BackgroundGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const driftX = Math.sin(t * 0.42) * 0.03 + Math.sin(t * 0.17 + 1.3) * 0.015;
  const driftY = Math.cos(t * 0.33) * 0.025 + Math.sin(t * 0.21 + 0.4) * 0.012;
  const breathe = 1 + Math.sin(t * 0.5) * 0.03;
  const size = 1500 * breathe;
  const cx = WIDTH * (0.88 + driftX) - size / 2;
  const cy = HEIGHT * (0.84 + driftY) - size / 2;

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgBottom} 100%)`}}>
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glow}40 0%, ${colors.glow}1A 35%, ${colors.glow}00 68%)`,
        }}
      />
      {/* A faint cool counter-light top-left for depth */}
      <div
        style={{
          position: 'absolute',
          left: -500 + Math.sin(t * 0.3) * 30,
          top: -600 + Math.cos(t * 0.25) * 30,
          width: 1300,
          height: 1300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(70,95,150,0.12) 0%, rgba(70,95,150,0) 65%)',
        }}
      />
    </AbsoluteFill>
  );
};
