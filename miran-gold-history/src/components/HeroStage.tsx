import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {COLORS, VIDEO} from '../theme';
import {CAMERA, HERO_CANVAS, heroState, PX, toScreen} from '../heroTrack';
import {hexA} from '../motion';
import {Studio} from './three/Studio';
import {GoldHero3D} from './three/GoldHero3D';

/** The persistent 3D canvas for the gold object (absolute frames; mount at the reel's root). */
export const HeroStage: React.FC = () => (
  <div style={{position: 'absolute', left: 0, top: HERO_CANVAS.top, width: VIDEO.width, height: HERO_CANVAS.h}}>
    <ThreeCanvas width={VIDEO.width} height={HERO_CANVAS.h} camera={{fov: CAMERA.fov, position: [0, 0, CAMERA.z]}} gl={{antialias: true}}>
      <Studio warm frontFill={2} wrap={1.3} />
      <directionalLight position={[3, 3, 5]} intensity={1.2} color="#FFE7B8" />
      <directionalLight position={[-3, 5, 4]} intensity={2.4} color="#FFF4DC" />
      <directionalLight position={[4, 1.5, -3]} intensity={1.3} color="#FFD9A0" />
      <GoldHero3D />
    </ThreeCanvas>
  </div>
);

/** 2D bloom for the molten moments: an orange glow and a white-hot flash at the hero's position. */
export const HeroGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const st = heroState(frame);
  const p = toScreen(st.pos[0], st.pos[1]);
  const r = Math.max(120, st.scale * PX * 1.6);
  const heat = Math.max(st.heat, st.drop * 0.8);
  if (heat < 0.01 && st.flash < 0.01) return null;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div
        style={{
          position: 'absolute',
          left: p.x - r,
          top: p.y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hexA(COLORS.molten, 0.55 * heat)} 0%, ${hexA(COLORS.molten, 0.18 * heat)} 40%, ${hexA(COLORS.molten, 0)} 70%)`,
        }}
      />
      {st.flash > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: p.x - r * 0.8,
            top: p.y - r * 0.8,
            width: r * 1.6,
            height: r * 1.6,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,250,235,${0.9 * st.flash}) 0%, rgba(255,220,150,${0.35 * st.flash}) 35%, rgba(255,200,120,0) 70%)`,
          }}
        />
      ) : null}
    </div>
  );
};
