import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../brand';

/**
 * v3 background: deep blue that brightens toward the bottom-right, a faint 72px grid,
 * a soft glow behind the visual zone and slow grain. `outroAt` (global frame) lifts the
 * whole thing to the brighter outro blue.
 */
export const Background: React.FC<{outroAt?: number}> = ({outroAt}) => {
  const f = useCurrentFrame();
  const drift = (f * 0.12) % 72;
  const grainX = (f * 0.7) % 256;
  const grainY = (f * 0.45) % 256;
  const lift = outroAt === undefined ? 0 : interpolate(f, [outroAt - 10, outroAt + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: C.bg0, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.bg0} 0%, ${C.bg1} 45%, #0C1F66 78%, ${C.bg2} 100%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 85% 100%, rgba(40,90,255,0.26) 0%, rgba(40,90,255,0) 70%)'}} />
      {/* soft glow behind the visual zone */}
      <AbsoluteFill style={{background: 'radial-gradient(42% 22% at 50% 36%, rgba(60,110,255,0.17) 0%, rgba(60,110,255,0) 100%)'}} />
      {/* outro: brighter blue, as in the reference */}
      <AbsoluteFill style={{opacity: lift, background: 'linear-gradient(160deg, #08143F 0%, #0F2C8C 55%, #1446A8 100%)'}} />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          backgroundPosition: `${-drift}px ${-drift * 0.5}px`,
        }}
      />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 3) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x={-grainX} y={-grainY} width="1400" height="2300" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
