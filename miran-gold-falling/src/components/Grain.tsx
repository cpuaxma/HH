import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Animated film grain (~4%). Re-seeded every 2 frames; drawn at half res for a filmic grain size. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.04}) => {
  const seed = Math.floor(useCurrentFrame() / 2) % 97;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.3" />
        </filter>
        <rect width="540" height="960" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
