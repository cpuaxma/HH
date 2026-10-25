import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../theme';

// Animated film grain (new seed every 2 frames) plus a gentle vignette.
// The noise is generated at half resolution and scaled up for a filmic grain size.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.04}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg
        viewBox={`0 0 ${WIDTH / 2} ${HEIGHT / 2}`}
        preserveAspectRatio="none"
        style={{position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT, opacity}}
      >
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,4,10,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
