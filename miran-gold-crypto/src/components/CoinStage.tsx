import React from 'react';
import {STAGE} from '../config';
import {Coin, coinAngle, coinTilt} from './Coin';

export const COIN_SIZE = 520;

/** The coin placed on the stage with its halo and the pool of light beneath it. */
export const CoinStage: React.FC<{
  t: number; // global seconds
  opacity?: number;
  scale?: number;
  float?: number;
  mask?: string;
  halo?: number;
}> = ({t, opacity = 1, scale = 1, float = 0, mask, halo = 1}) => {
  const bob = Math.sin(t * 1.3) * 10 * float;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: STAGE.cx - 420,
          top: STAGE.cy - 420,
          width: 840,
          height: 840,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.32) 0%, rgba(212,175,55,0.1) 38%, transparent 68%)',
          opacity: opacity * halo * (0.85 + 0.15 * Math.sin(t * 1.1)),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: STAGE.cx - 260,
          top: STAGE.cy + COIN_SIZE / 2 + 70,
          width: 520,
          height: 70,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(212,175,55,0.28), transparent 70%)`,
          opacity: opacity * halo,
          transform: `scaleX(${1 - bob / 120})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: STAGE.cx - COIN_SIZE / 2,
          top: STAGE.cy - COIN_SIZE / 2 + bob,
          width: COIN_SIZE,
          height: COIN_SIZE,
          opacity,
          transform: `scale(${scale})`,
          WebkitMaskImage: mask,
          maskImage: mask,
          filter: `drop-shadow(0 0 40px rgba(212,175,55,0.35))`,
        }}
      >
        <Coin size={COIN_SIZE} angle={coinAngle(t)} tilt={coinTilt(t)} t={t} glow={1} />
      </div>
    </>
  );
};
