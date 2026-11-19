import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants';
import {noise} from '../lib';

/** Black base with a slow-breathing gold glow. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = noise(4, frame / 90) * 60;
  const breathe = 0.09 + 0.03 * (noise(8, frame / 70) * 0.5 + 0.5);
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 45% at ${50 + drift / 20}% ${42 + drift / 30}%, rgba(212, 175, 55, ${breathe}) 0%, rgba(212, 175, 55, 0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Edge darkening so the gold reads as premium. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)',
    }}
  />
);

/** Light animated film grain. Re-seeded every 2 frames, drawn at half resolution. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.04}) => {
  const seed = Math.floor(useCurrentFrame() / 2) % 97;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none', mixBlendMode: 'screen'}}>
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

/** Full-frame gold flash. `amount` 0..1. */
export const GoldFlash: React.FC<{amount: number}> = ({amount}) =>
  amount <= 0.001 ? null : (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: amount,
        background: `radial-gradient(circle at 50% 45%, #FFF6D6 0%, ${COLORS.goldLight} 30%, ${COLORS.gold} 60%, ${COLORS.goldDeep} 100%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
