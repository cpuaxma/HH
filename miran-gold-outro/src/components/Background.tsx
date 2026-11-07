import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {hexA} from '../motion';

/** Navy gradient with the brand's drifting gold glow (bottom right), as in the reels. */
export const Background: React.FC = () => {
  const {width, height, fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const size = Math.max(width, height) * 0.9;
  const dx = Math.sin(t * 0.9) * 2;
  const dy = Math.cos(t * 0.7) * 1.5;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgBottom} 100%)`}}>
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: width * (0.9 + dx / 100) - size / 2,
          top: height * (0.9 + dy / 100) - size / 2,
          borderRadius: '50%',
          transform: `scale(${1 + Math.sin(t * 1.1) * 0.03})`,
          background: `radial-gradient(circle, ${hexA(COLORS.glow, COLORS.glowOpacity)} 0%, ${hexA(COLORS.glow, 0.1)} 32%, ${hexA(COLORS.glow, 0)} 68%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
);
