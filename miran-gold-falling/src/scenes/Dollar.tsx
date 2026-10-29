import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {COLORS, EASE, FONT, LAYOUT, sceneLength} from '../theme';
import {S5_DOLLAR} from '../strings';
import {ArabicText} from '../components/ArabicText';
import {Headline} from '../components/Layout';
import {BalanceScale, scaleGeometry, SCALE_BOX} from '../components/BalanceScale';
import {DollarCoin} from '../components/DollarCoin';
import {GoldBar} from '../components/GoldBar';
import {HeroLayer} from '../components/Hero';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA, rand} from '../motion';

const DUR = sceneLength('dollar');
const ORIGIN = {x: 140, y: 820}; // scale box top-left on screen
const COIN = 132;
const BAR_W = 176;
const TILT = -11;
const T = {text: 8, scale: 14, coin: 40, bar: 50, tip: 80, particles: 92};
const N_PARTICLES = 16;

const quad = (a: {x: number; y: number}, c: {x: number; y: number}, b: {x: number; y: number}, t: number) => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

/** Gold particles streaming from the gold pan to the dollar pan (screen coords). */
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const tilt = TILT * Math.min(1.08, Math.max(0, hero(frame, T.tip)));
  const g = scaleGeometry(tilt);
  const a = {x: ORIGIN.x + g.rightPan.x, y: ORIGIN.y + g.rightPan.y - 120};
  const b = {x: ORIGIN.x + g.leftPan.x + 10, y: ORIGIN.y + g.leftPan.y - 110};
  const c = {x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 190};
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {new Array(N_PARTICLES).fill(0).map((_, i) => {
        const s = T.particles + i * 6.5;
        const t = ease(frame, s, 44, EASE.inOut);
        if (t <= 0 || t >= 1) return null;
        const jitter = (rand(i + 4) - 0.5) * 36;
        const p = quad(a, {x: c.x + jitter, y: c.y + jitter * 0.6}, b, t);
        const r = 5 + rand(i) * 4;
        const o = interpolate(t, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);
        return (
          <g key={i} opacity={o}>
            <circle cx={p.x} cy={p.y} r={r * 2.4} fill={COLORS.goldA} opacity={0.3} />
            <circle cx={p.x} cy={p.y} r={r} fill={COLORS.goldB} />
            <circle cx={p.x - r * 0.3} cy={p.y - r * 0.3} r={r * 0.4} fill="#FFFFFF" opacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
};

export const Dollar: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const draw = ease(frame, T.scale, 34);
  const tip = hero(frame, T.tip);
  const tilt = TILT * Math.max(0, tip);
  const g = scaleGeometry(tilt);
  const coinIn = hero(frame, T.coin);
  const barIn = hero(frame, T.bar);
  const badge = hero(frame, T.coin + 26);
  // Each arriving particle feeds the coin's glow.
  const arrivals = interpolate(frame, [T.particles + 44, T.particles + 44 + N_PARTICLES * 6.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const coinGlow = 0.7 + arrivals * 0.5 + 0.12 * Math.sin(frame * 0.15);

  const leftPan = {x: ORIGIN.x + g.leftPan.x, y: ORIGIN.y + g.leftPan.y};
  const rightPan = {x: ORIGIN.x + g.rightPan.x, y: ORIGIN.y + g.rightPan.y};

  return (
    <AbsoluteFill>
      <AbsoluteFill style={exitStyle(exit)}>
        <div style={{position: 'absolute', left: ORIGIN.x, top: ORIGIN.y, width: SCALE_BOX.w, height: SCALE_BOX.h}}>
          <BalanceScale tilt={tilt} draw={draw} />
        </div>
      </AbsoluteFill>

      <HeroLayer from={T.coin} to={T.tip + 40}>
        <div style={{position: 'absolute', inset: 0, ...exitStyle(exit)}}>
          <div style={{position: 'absolute', left: leftPan.x - COIN / 2, top: leftPan.y - COIN - 6, ...heroStyle(coinIn, `translateY(${(1 - Math.min(1, coinIn)) * -80}px)`)}}>
            <DollarCoin id="dollar-coin" size={COIN} glow={coinGlow} />
            <div
              dir="ltr"
              style={{
                position: 'absolute',
                right: -26,
                top: -14,
                padding: '2px 14px 6px',
                borderRadius: 999,
                background: hexA(COLORS.ink, 0.8),
                border: `1.5px solid ${COLORS.green}`,
                color: COLORS.green,
                fontFamily: FONT.family,
                fontWeight: FONT.key,
                fontSize: 28,
                lineHeight: 1.2,
                boxShadow: `0 0 18px ${hexA(COLORS.green, 0.5)}`,
                opacity: Math.min(1, Math.max(0, badge) * 1.5),
                transform: `scale(${0.6 + 0.4 * badge})`,
              }}
            >
              +٪
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: rightPan.x - BAR_W / 2,
              top: rightPan.y - (BAR_W * 170) / 300 - 2,
              ...heroStyle(barIn, `translateY(${(1 - Math.min(1, barIn)) * -80}px)`),
            }}
          >
            <GoldBar id="dollar-bar" width={BAR_W} frame={frame} sweepStart={70} sweepEvery={240} />
          </div>
        </div>
      </HeroLayer>

      <AbsoluteFill style={exitStyle(exit)}>
        <Trail layers={5} lagInFrames={1.2} trailOpacity={0.55}>
          <Particles />
        </Trail>
      </AbsoluteFill>

      <Headline>
        <ArabicText block={S5_DOLLAR} size={LAYOUT.headlineSize - 4} start={T.text} exitEnd={DUR} />
      </Headline>
    </AbsoluteFill>
  );
};

