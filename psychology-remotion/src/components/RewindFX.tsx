import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {useTextOnly} from './Debug';

/** Tape-rewind texture: scanlines and rolling tracking bands. Strength 0..1. */
export const RewindFX: React.FC<{strength: number}> = ({strength}) => {
  const frame = useCurrentFrame();
  if (useTextOnly() || strength <= 0.001) return null;
  const bands = [0, 1, 2].map((i) => {
    const y = ((frame * (38 + i * 17) + random(`rw-${i}`) * 1920) % 2100) - 90;
    const h = 30 + random(`rw-h-${i}-${Math.floor(frame / 3)}`) * 70;
    return {y, h};
  });
  return (
    <div style={{position: 'absolute', inset: 0, opacity: strength, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)',
          mixBlendMode: 'screen',
        }}
      />
      {bands.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: b.y,
            height: b.h,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 45%, rgba(200,220,255,0.18) 55%, rgba(255,255,255,0) 100%)',
            mixBlendMode: 'screen',
            transform: `translateX(${(random(`rw-x-${i}-${frame}`) - 0.5) * 30}px)`,
          }}
        />
      ))}
    </div>
  );
};
