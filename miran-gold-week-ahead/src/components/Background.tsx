import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../brand';

/**
 * Deep navy radial gradient + soft gold bloom near the bottom (~8%), a faint drifting grid,
 * and slow-moving grain. Never flat, never static.
 */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const gridShift = (f * 0.25) % 60;
  const bloomX = 50 + Math.sin(f / 240) * 6;
  const grainX = (f * 0.7) % 256;
  const grainY = (f * 0.45) % 256;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg0, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 75% at 50% 32%, ${C.bg2} 0%, ${C.bg1} 38%, ${C.bg0} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 28% at ${bloomX}% 104%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.06) 45%, rgba(212,175,55,0) 100%)`,
        }}
      />
      {/* faint grid, drifting up-left */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: `${-gridShift}px ${-gridShift}px`,
          maskImage: 'radial-gradient(85% 60% at 50% 45%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(85% 60% at 50% 45%, black 0%, transparent 100%)',
        }}
      />
      {/* grain */}
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 3) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x={-grainX} y={-grainY} width="1400" height="2300" filter="url(#grain)" />
      </svg>
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
