import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame} from 'remotion';

// ── Grain: 3% paper grain, re-seeded every 2 frames ─────────────────────────
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.03}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${Math.floor(random(`gx${step}`) * 512)}px ${Math.floor(random(`gy${step}`) * 512)}px`,
        opacity,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
  );
};
