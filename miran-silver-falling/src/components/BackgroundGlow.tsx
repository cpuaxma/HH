import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, VIDEO} from '../theme';
import {hexA} from '../motion';

/** Navy gradient + a soft gold radial glow that never stops drifting (≈2–4%). */
export const BackgroundGlow: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  const dx = Math.sin(t * 0.33) * 3 + Math.sin(t * 0.71 + 1) * 1; // % of width
  const dy = Math.cos(t * 0.27) * 2.5 + Math.sin(t * 0.53) * 0.8; // % of height
  const scale = 1 + Math.sin(t * 0.41) * 0.035;
  const size = 1700;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgBottom} 100%)`}}>
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: VIDEO.width * (0.9 + dx / 100) - size / 2,
          top: VIDEO.height * (0.9 + dy / 100) - size / 2,
          borderRadius: '50%',
          transform: `scale(${scale})`,
          background: `radial-gradient(circle, ${hexA(COLORS.glow, COLORS.glowOpacity)} 0%, ${hexA(COLORS.glow, 0.1)} 32%, ${hexA(COLORS.glow, 0)} 68%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
);
