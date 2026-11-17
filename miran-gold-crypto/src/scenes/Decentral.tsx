import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, STAGE, VIDEO} from '../config';
import {COIN_SIZE, CoinStage} from '../components/CoinStage';
import {Headline} from '../components/Headline';
import {BankIcon, GovernmentIcon} from '../components/icons';
import {useGlobalSeconds, useSceneFrame} from '../components/SceneShell';
import {lerp, rand, ramp, settle} from '../motion';

const R = COIN_SIZE / 2;
const DISSOLVE = [5.0, 6.4]; // global seconds
const FEATHER = 60;
const PALETTE = [COLORS.goldPale, COLORS.goldLight, COLORS.gold, COLORS.gold, '#B8912C'];

const PARTICLES = Array.from({length: 280}, (_, i) => {
  const r = R * Math.sqrt(rand(`pr${i}`)) * 0.98;
  const a = rand(`pa${i}`, 0, Math.PI * 2);
  const p = (R + FEATHER / 2 - r) / (R + FEATHER * 1.5);
  const glyph = rand(`pg${i}`) < 0.14;
  return {
    r,
    a,
    born: DISSOLVE[0] + p * (DISSOLVE[1] - DISSOLVE[0]),
    speed: rand(`pv${i}`, 60, 230),
    size: rand(`ps${i}`, 3, 10),
    rot: rand(`pt${i}`) < 0.5 ? 0 : 45,
    color: PALETTE[Math.floor(rand(`pc${i}`) * PALETTE.length)],
    glyph: glyph ? (rand(`pd${i}`) < 0.5 ? '0' : '1') : null,
    phase: rand(`pp${i}`, 0, Math.PI * 2),
    rest: rand(`po${i}`, 0.35, 0.8),
  };
});

/** The coin breaks into floating digital particles. */
const Particles: React.FC<{t: number}> = ({t}) => (
  <>
    {PARTICLES.map((p, i) => {
      const age = t - p.born;
      if (age < 0) return null;
      const bobAtBirth = Math.sin(p.born * 1.3) * 10;
      const travel = (p.speed * (1 - Math.exp(-age * 0.9))) / 0.9;
      const x = STAGE.cx + Math.cos(p.a) * (p.r + travel) + Math.sin(age * 0.8 + p.phase) * 10;
      const y = STAGE.cy + bobAtBirth + Math.sin(p.a) * (p.r + travel) * 0.72 - age * 14;
      const appear = Math.min(1, age / 0.18);
      const settleTo = 1 - (1 - p.rest) * Math.min(1, age / 1.6);
      const twinkle = 0.85 + 0.15 * Math.sin(age * 2.2 + p.phase);
      const opacity = appear * settleTo * twinkle;
      if (p.glyph) {
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontFamily: FONT.family,
              fontWeight: 700,
              fontSize: 15 + p.size * 1.4,
              lineHeight: 1,
              color: p.color,
              opacity: opacity * 0.85,
              textShadow: '0 0 10px rgba(243,220,133,0.7)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {p.glyph}
          </div>
        );
      }
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x - p.size / 2,
            top: y - p.size / 2,
            width: p.size,
            height: p.size,
            borderRadius: 1.5,
            background: p.color,
            opacity,
            transform: `rotate(${p.rot + age * 20}deg)`,
            boxShadow: `0 0 ${p.size * 1.8}px rgba(243,220,133,0.55)`,
          }}
        />
      );
    })}
  </>
);

const Institution: React.FC<{
  f: number;
  x: number;
  delay: number;
  label: string;
  icon: 'bank' | 'gov';
}> = ({f, x, delay, label, icon}) => {
  const SIZE = 210;
  const cy = 1190;
  const enter = settle(f, 66 + delay, 30);
  const strike = ramp(f, 100 + delay, 124 + delay);
  const leave = ramp(f, 140 + delay, 168 + delay);
  const dim = lerp(strike, [0, 1], [1, 0.5]);
  const Icon = icon === 'bank' ? BankIcon : GovernmentIcon;
  const len = Math.hypot(SIZE, SIZE) * 0.95;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - SIZE / 2,
        top: cy - SIZE / 2,
        width: SIZE,
        height: SIZE + 80,
        opacity: enter * (1 - leave),
        transform: `translateY(${(1 - enter) * 24 + leave * 26}px) scale(${1 - leave * 0.06})`,
        filter: `blur(${leave * 6}px)`,
      }}
    >
      <div style={{opacity: dim, filter: `saturate(${1 - strike * 0.7}) drop-shadow(0 0 18px rgba(212,175,55,0.35))`}}>
        <Icon size={SIZE} />
      </div>
      <svg width={SIZE} height={SIZE} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <line
          x1={SIZE * 0.08}
          y1={SIZE * 0.92}
          x2={SIZE * 0.92}
          y2={SIZE * 0.08}
          stroke={COLORS.strike}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - strike)}
          style={{filter: 'drop-shadow(0 0 10px rgba(196,81,63,0.7))'}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: SIZE + 14,
          left: -40,
          right: -40,
          textAlign: 'center',
          direction: 'rtl',
          fontFamily: FONT.family,
          fontWeight: FONT.bodyWeight,
          fontSize: 40,
          color: COLORS.textDim,
          opacity: dim,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** 4–10s: the coin dissolves into digital particles; bank and government fade out, struck through. */
export const Decentral: React.FC = () => {
  const f = useSceneFrame();
  const t = useGlobalSeconds();
  const d = Math.min(1, Math.max(0, (t - DISSOLVE[0]) / (DISSOLVE[1] - DISSOLVE[0])));
  const edge = R + FEATHER / 2 - (R + FEATHER * 1.5) * d; // radius of the dissolve front
  const mask =
    d <= 0
      ? undefined
      : `radial-gradient(circle at 50% 50%, #000 ${Math.max(0, edge - FEATHER / 2)}px, transparent ${Math.max(1, edge + FEATHER / 2)}px)`;
  return (
    <AbsoluteFill>
      {d < 1 ? <CoinStage t={t} mask={mask} float={1} halo={1 - d} /> : null}
      <Particles t={t} />
      {/* bank on the right (read first in Arabic), government on the left */}
      <Institution f={f} x={VIDEO.width - 290} delay={0} label="بنك" icon="bank" />
      <Institution f={f} x={290} delay={8} label="حكومة" icon="gov" />
      <Headline />
    </AbsoluteFill>
  );
};
