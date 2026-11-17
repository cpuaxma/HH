import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {VIDEO} from '../config';

/** Subtle film grain (re-seeded every other frame) and a light vignette. */
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 78% 62% at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
