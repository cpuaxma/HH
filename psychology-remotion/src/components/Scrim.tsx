import React from 'react';
import {useTextOnly} from './Debug';

/** Soft dark ellipse behind text so it reads over a busy 3D background. */
export const Scrim: React.FC<{y: number; h?: number; w?: number; opacity: number; strength?: number}> = ({y, h = 420, w = 1250, opacity, strength = 0.62}) => {
  if (useTextOnly() || opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        background: `radial-gradient(closest-side, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,${strength * 0.7}) 45%, rgba(0,0,0,0) 100%)`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
