import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {COLORS, FONT, LAYOUT, SCENES, VIDEO} from '../theme';
import {S6_GOLD, S6_MARKET, S6_SELL, S6_SILVER} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {Station} from '../components/World';
import {enter, hero, heroStyle, hexA, rand} from '../motion';

const START = SCENES.market[0];
const TEXT_END = SCENES.market[1] - START;
const GOLD = {x: 712, y: 1060, rx: 196, ry: 54};
const SILVER = {x: 318, y: 1084, rx: 98, ry: 28};
const T = {pools: 12, drop: 62, fall: 22, dominoes: 150};
const IMPACT = T.drop + T.fall;
const DOM = {n: 8, w: 52, h: 108, base: 1398, x0: 846, gap: 78, stagger: 7, fallDur: 15};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Pool: React.FC<{id: string; p: typeof GOLD; metal: 'gold' | 'silver'; frame: number; amp: number; slosh: number}> = ({id, p, metal, frame, amp, slosh}) => {
  const c = metal === 'gold' ? [COLORS.goldShadow, COLORS.goldA, COLORS.goldB] : ['#4A5262', '#B9C2CF', '#F2F5F9'];
  const t = frame - IMPACT;
  const ripples = t >= 0 ? [0, 1, 2, 3].map((k) => (t - k * 9) / 46).filter((r) => r > 0 && r < 1) : [];
  const ry = p.ry * (1 + slosh * Math.sin(t * 0.5) * Math.exp(-Math.max(0, t) / 30) * (t > 0 ? 1 : 0));
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-liq`} cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor={c[2]} />
          <stop offset="0.55" stopColor={c[1]} />
          <stop offset="1" stopColor={c[0]} />
        </radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <ellipse cx={p.x} cy={p.y + 8} rx={p.rx * 1.08} ry={ry * 1.4} fill={metal === 'gold' ? COLORS.goldA : '#C9D3E2'} opacity={0.22} filter={`url(#${id}-glow)`} />
      {/* rim */}
      <ellipse cx={p.x} cy={p.y + 10} rx={p.rx + 10} ry={ry + 10} fill="#0B0F19" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={2} />
      <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={ry} fill={`url(#${id}-liq)`} />
      {ripples.map((r, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx * (0.08 + r * 0.9)} ry={ry * (0.08 + r * 0.9)} fill="none" stroke="#FFFFFF" strokeWidth={2.2 * amp} opacity={(1 - r) * 0.8 * Math.min(1, amp)} />
      ))}
      <ellipse cx={p.x - p.rx * 0.3} cy={p.y - ry * 0.35} rx={p.rx * 0.35} ry={ry * 0.18} fill="#FFFFFF" opacity={0.3} />
    </svg>
  );
};

/** Red sell orders falling into both pools, and the splash they throw up from the silver one. */
const Drops: React.FC = () => {
  const frame = useCurrentFrame();
  const fall = interpolate(frame, [T.drop, IMPACT], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const dropAt = (p: typeof GOLD) => ({x: p.x, y: interpolate(fall, [0, 1], [760, p.y])});
  const t = frame - IMPACT;
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
      {frame >= T.drop && frame < IMPACT
        ? [GOLD, SILVER].map((p, i) => {
            const d = dropAt(p);
            return (
              <g key={i} transform={`translate(${d.x}, ${d.y})`} opacity={interpolate(frame, [T.drop, T.drop + 5], [0, 1], clamp)}>
                <path d="M0,-26 C10,-10 14,0 14,6 A14,14 0 0 1 -14,6 C-14,0 -10,-10 0,-26 Z" fill={COLORS.red} />
                <path d="M0,-26 C10,-10 14,0 14,6 A14,14 0 0 1 -14,6 C-14,0 -10,-10 0,-26 Z" fill={COLORS.red} opacity={0.5} transform="scale(1.6)" style={{filter: 'blur(6px)'}} />
              </g>
            );
          })
        : null}
      {/* silver splash: a crown of droplets */}
      {t >= 0 && t < 44
        ? new Array(16).fill(0).map((_, i) => {
            const ang = Math.PI * (0.08 + (i / 15) * 0.84);
            const v = 5 + rand(i + 3) * 6;
            const x = SILVER.x + Math.cos(ang) * v * t * 1.2;
            const y = SILVER.y - Math.sin(ang) * v * t * 1.4 + 0.42 * t * t;
            if (y > SILVER.y + 6) return null;
            return <circle key={i} cx={x} cy={y} r={4 + rand(i) * 3} fill={i % 3 ? '#E6EBF2' : COLORS.red} opacity={1 - t / 44} />;
          })
        : null}
      {/* gold barely reacts: a few small droplets */}
      {t >= 0 && t < 24
        ? new Array(4).fill(0).map((_, i) => {
            const x = GOLD.x + (i - 1.5) * 10 * t * 0.3;
            const y = GOLD.y - 3 * t + 0.25 * t * t;
            return y < GOLD.y + 2 ? <circle key={i} cx={x} cy={y} r={3} fill={COLORS.goldB} opacity={1 - t / 24} /> : null;
          })
        : null}
    </svg>
  );
};

/** A row of red «بيع» tiles that topple right → left. */
const Dominoes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(DOM.n).fill(0).map((_, i) => {
        const x = DOM.x0 - i * DOM.gap;
        const appear = enter(frame, T.dominoes - 40 + i * 3, 24);
        const s = T.dominoes + i * DOM.stagger;
        const last = i === DOM.n - 1;
        const rot = interpolate(frame, [s, s + DOM.fallDur], [0, last ? -90 : -62], {...clamp, easing: Easing.in(Easing.quad)});
        const bounce = frame > s + DOM.fallDur && frame < s + DOM.fallDur + 10 ? Math.sin((frame - s - DOM.fallDur) * 0.9) * 2.5 * (1 - (frame - s - DOM.fallDur) / 10) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - DOM.w,
              top: DOM.base - DOM.h,
              width: DOM.w,
              height: DOM.h,
              borderRadius: 10,
              border: `1.5px solid ${hexA(COLORS.red, 0.9)}`,
              background: `linear-gradient(180deg, ${hexA(COLORS.red, 0.22)}, ${hexA(COLORS.ink, 0.85)})`,
              boxShadow: `0 0 16px ${hexA(COLORS.red, 0.35)}`,
              transformOrigin: '0% 100%',
              transform: `rotate(${rot + bounce}deg)`,
              opacity: appear,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span dir="rtl" style={{fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 22, color: COLORS.red, transform: 'rotate(-90deg)', whiteSpace: 'nowrap'}}>
              {S6_SELL} ▼
            </span>
          </div>
        );
      })}
    </>
  );
};

export const Market: React.FC = () => {
  const frame = useCurrentFrame();
  const goldIn = Math.max(0, hero(frame, T.pools));
  const silverIn = Math.max(0, hero(frame, T.pools + 8));
  const labels = enter(frame, T.pools + 20);
  return (
    <AbsoluteFill>
      <Station index={5} from={START}>
        <div style={{position: 'absolute', inset: 0, ...heroStyle(goldIn), transformOrigin: `${GOLD.x}px ${GOLD.y}px`}}>
          <Pool id="pool-gold" p={GOLD} metal="gold" frame={frame} amp={0.45} slosh={0.04} />
        </div>
        <div style={{position: 'absolute', inset: 0, ...heroStyle(silverIn), transformOrigin: `${SILVER.x}px ${SILVER.y}px`}}>
          <Pool id="pool-silver" p={SILVER} metal="silver" frame={frame} amp={1.3} slosh={0.45} />
        </div>
        <Trail layers={4} lagInFrames={1} trailOpacity={0.5}>
          <Drops />
        </Trail>
        <At x={GOLD.x} y={GOLD.y + GOLD.ry + 58}>
          <Label text={S6_GOLD} size={30} p={labels} tone="gold" />
        </At>
        <At x={SILVER.x} y={SILVER.y + SILVER.ry + 58}>
          <Label text={S6_SILVER} size={30} p={labels} tone="silver" />
        </At>
        <Trail layers={3} lagInFrames={1} trailOpacity={0.45}>
          <Dominoes />
        </Trail>
      </Station>

      <Headline>
        <ArabicText block={S6_MARKET} size={LAYOUT.headlineSize - 4} start={8} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};
