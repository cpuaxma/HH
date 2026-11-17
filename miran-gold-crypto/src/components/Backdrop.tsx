import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, STAGE, VIDEO} from '../config';
import {rand} from '../motion';

const MOTES = Array.from({length: 46}, (_, i) => ({
  x: rand(`mx${i}`, 0, VIDEO.width),
  y: rand(`my${i}`, 0, VIDEO.height),
  size: rand(`ms${i}`, 1.5, 4.5),
  speed: rand(`mv${i}`, 6, 22), // px per second, upward
  sway: rand(`mw${i}`, 8, 26),
  phase: rand(`mp${i}`, 0, Math.PI * 2),
  alpha: rand(`ma${i}`, 0.12, 0.42),
}));

/** Charcoal gradient, a slow breathing gold glow behind the stage, and drifting gold dust. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  const breathe = 0.5 + 0.5 * Math.sin((t / 9) * Math.PI * 2);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 85% 60% at 50% 48%, ${COLORS.bgLift} 0%, ${COLORS.bgDeep} 78%), ${COLORS.bgDeep}`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 620px at ${STAGE.cx}px ${STAGE.cy}px, rgba(212,175,55,${0.1 + 0.05 * breathe}) 0%, rgba(212,175,55,0.03) 55%, transparent 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 520px at ${180 + 60 * Math.sin(t / 5)}px 300px, rgba(212,175,55,0.05), transparent 70%)`,
        }}
      />
      {MOTES.map((m, i) => {
        const y = (((m.y - m.speed * t) % VIDEO.height) + VIDEO.height) % VIDEO.height;
        const x = m.x + Math.sin(t * 0.6 + m.phase) * m.sway;
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.9 + m.phase);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: m.size,
              height: m.size,
              borderRadius: '50%',
              background: COLORS.goldLight,
              opacity: m.alpha * twinkle,
              boxShadow: `0 0 ${m.size * 3}px rgba(243,220,133,0.6)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
