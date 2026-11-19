import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {AMBIENCE, COLORS, IMPACTS, VIDEO} from '../config';
import {ease, impactAt} from '../lib/motion';
import {useTextOnly} from './Debug';

type Particle = {x: number; y: number; r: number; speed: number; sway: number; phase: number; depth: number; tw: number};

/** Matte black, breathing radial gold glow, drifting gold dust in two depth layers, vignette. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();

  const particles = useMemo<Particle[]>(
    () =>
      new Array(AMBIENCE.particles).fill(0).map((_, i) => ({
        x: random(`px${i}`) * VIDEO.width,
        y: random(`py${i}`) * VIDEO.height,
        r: 0.8 + random(`pr${i}`) ** 2 * 2.8,
        speed: 0.25 + random(`ps${i}`) * 0.9,
        sway: 6 + random(`pw${i}`) * 22,
        phase: random(`pp${i}`) * Math.PI * 2,
        depth: random(`pd${i}`) > 0.65 ? 1 : 0.45,
        tw: 0.04 + random(`pt${i}`) * 0.08,
      })),
    [],
  );

  if (textOnly) return <AbsoluteFill style={{background: '#000'}} />;

  // screen starts black, the room lights up over the first second
  const lightUp = ease(frame, [0, 26], [0, 1]);
  // breathing glow + a flare on every impact
  let flare = 0;
  for (const imp of IMPACTS) {
    const t = frame - imp.frame;
    if (t >= 0 && t < 40) flare += (imp.shake / 26) * Math.exp(-t / 9);
  }
  const breath = 0.5 + 0.5 * Math.sin(frame / 22);
  const glowA = AMBIENCE.glowOpacity * (0.8 + 0.25 * breath + 0.9 * flare) * lightUp;
  const gx = 540 + Math.sin(frame / 90) * 90;
  const gy = 900 + Math.cos(frame / 110) * 120;
  const cam = impactAt(frame);

  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at ${gx}px ${gy}px, rgba(212,175,55,${glowA}) 0%, rgba(140,109,31,${glowA * 0.45}) 38%, rgba(10,10,10,0) 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${1080 - gx * 0.6}px ${1500 - gy * 0.3}px, rgba(245,215,122,${glowA * 0.35}) 0%, rgba(10,10,10,0) 40%)`,
        }}
      />
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, opacity: lightUp}}>
        {particles.map((p, i) => {
          // parallax: near particles follow the camera shake more than far ones
          const y = ((p.y - frame * p.speed * p.depth * 1.6) % VIDEO.height + VIDEO.height) % VIDEO.height;
          const x = p.x + Math.sin(frame / 40 + p.phase) * p.sway * p.depth + cam.x * 0.4 * p.depth;
          const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * p.tw + p.phase));
          const o = twinkle * (p.depth === 1 ? 0.75 : 0.4);
          return (
            <g key={i}>
              <circle cx={x} cy={y + cam.y * 0.4 * p.depth} r={p.r * 3.2 * p.depth} fill={COLORS.gold} opacity={o * 0.12} />
              <circle cx={x} cy={y + cam.y * 0.4 * p.depth} r={p.r * p.depth} fill={COLORS.goldLight} opacity={o} />
            </g>
          );
        })}
      </svg>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)'}}
      />
    </AbsoluteFill>
  );
};
