import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {COLORS, EASE, FONT, LAYOUT} from '../theme';
import {S6_CASH, S6_PANIC} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {HeroLayer} from '../components/Hero';
import {ease, enter, exitProgress, exitStyle, hero, heroStyle, hexA, jitter} from '../motion';

const DUR = 310;
const STACK = {x: 790, base: 1350, rx: 74, ry: 19, thick: 21, count: 12};
const CASH = {x: 470, y: 1150, w: 310, h: 168};
const T = {text: 10, cards: 20, stack: 25, cash: 40, coins: [70, 96, 122, 148], travel: 40};
const CARDS = [
  {x: 250, y: 860, r: -6},
  {x: 410, y: 820, r: 4},
  {x: 560, y: 885, r: -3},
  {x: 330, y: 975, r: 7},
];

const stackTopY = (n: number) => STACK.base - n * STACK.thick;

const Coin: React.FC<{cx: number; cy: number; flip?: number}> = ({cx, cy, flip = 1}) => (
  <g transform={`translate(${cx}, ${cy}) scale(1, ${flip})`}>
    <path
      d={`M${-STACK.rx},0 L${-STACK.rx},${STACK.thick - 4} A${STACK.rx},${STACK.ry} 0 0 0 ${STACK.rx},${STACK.thick - 4} L${STACK.rx},0 Z`}
      fill="url(#coin-side)"
    />
    <ellipse cx={0} cy={0} rx={STACK.rx} ry={STACK.ry} fill="url(#coin-top)" stroke="#FFF0BE" strokeOpacity="0.55" strokeWidth={1.5} />
    <ellipse cx={0} cy={0} rx={STACK.rx * 0.68} ry={STACK.ry * 0.62} fill="none" stroke={COLORS.goldDeep} strokeOpacity="0.55" strokeWidth={1.5} />
  </g>
);

const CoinDefs: React.FC = () => (
  <defs>
    <linearGradient id="coin-top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FBE7A9" />
      <stop offset="0.5" stopColor={COLORS.goldB} />
      <stop offset="1" stopColor={COLORS.goldA} />
    </linearGradient>
    <linearGradient id="coin-side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={COLORS.goldDeep} />
      <stop offset="0.45" stopColor={COLORS.goldA} />
      <stop offset="1" stopColor={COLORS.goldShadow} />
    </linearGradient>
  </defs>
);

/** Coins sliding off the stack into the cash outline. */
const FlyingCoins: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <CoinDefs />
      {T.coins.map((s, i) => {
        const t = ease(frame, s, T.travel, EASE.inOut);
        if (t <= 0 || t >= 1) return null;
        const from = {x: STACK.x, y: stackTopY(STACK.count - i)};
        const to = {x: CASH.x, y: CASH.y};
        const c = {x: (from.x + to.x) / 2 + 40, y: Math.min(from.y, to.y) - 170};
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * c.x + t * t * to.x;
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * c.y + t * t * to.y;
        const scale = interpolate(t, [0, 0.8, 1], [1, 0.7, 0.35]);
        const o = interpolate(t, [0, 0.85, 1], [1, 1, 0]);
        return (
          <g key={i} opacity={o} transform={`translate(${x}, ${y}) scale(${scale}) translate(${-x}, ${-y})`}>
            <Coin cx={x} cy={y} flip={0.6 + 0.4 * Math.cos(t * Math.PI * 2)} />
          </g>
        );
      })}
    </svg>
  );
};

export const Panic: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const stackIn = hero(frame, T.stack);
  const cashIn = enter(frame, T.cash, 34);
  const left = T.coins.filter((s) => frame >= s).length;
  const remaining = STACK.count - left;
  const arrivals = T.coins.map((s) => s + T.travel);
  const hit = Math.max(
    0,
    ...arrivals.map((a) => interpolate(frame, [a - 4, a, a + 26], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})),
  );
  const filled = arrivals.filter((a) => frame >= a).length / arrivals.length;
  const cashGlow = 0.35 + filled * 0.35 + hit * 0.4;

  return (
    <AbsoluteFill>
      {/* loss cards */}
      <AbsoluteFill style={exitStyle(exit)}>
        {CARDS.map((c, i) => {
          const p = enter(frame, T.cards + i * 5, 26);
          const j = jitter(i + 3, frame * 1.6, 3.2 * p);
          const rot = c.r + j.x * 0.8;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.x - 72,
                top: c.y - 44,
                width: 144,
                height: 88,
                borderRadius: 16,
                border: `1.5px solid ${hexA(COLORS.red, 0.9)}`,
                background: `linear-gradient(180deg, ${hexA(COLORS.red, 0.12)}, ${hexA(COLORS.ink, 0.6)})`,
                boxShadow: `0 0 ${18 * j.flicker}px ${hexA(COLORS.red, 0.35)}`,
                opacity: p * j.flicker,
                transform: `translate(${j.x}px, ${j.y + (1 - p) * 20}px) rotate(${rot}deg) scale(${0.85 + 0.15 * p})`,
                filter: p < 0.99 ? `blur(${(1 - p) * 8}px)` : undefined,
              }}
            >
              <svg width={144} height={88} style={{position: 'absolute', left: 0, top: 0}}>
                <polyline
                  points="16,30 36,40 54,34 74,56 94,50 116,68"
                  fill="none"
                  stroke={COLORS.red}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path d="M118,18 L132,18 L125,30 Z" fill={COLORS.red} />
              </svg>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* cash outline */}
      <AbsoluteFill style={exitStyle(exit)}>
        <div
          style={{
            position: 'absolute',
            left: CASH.x - CASH.w / 2,
            top: CASH.y - CASH.h / 2,
            width: CASH.w,
            height: CASH.h,
            opacity: cashIn,
            transform: `scale(${0.9 + 0.1 * cashIn + hit * 0.03})`,
            filter: cashIn < 0.99 ? `blur(${(1 - cashIn) * 10}px)` : undefined,
          }}
        >
          <svg width={CASH.w} height={CASH.h} viewBox={`0 0 ${CASH.w} ${CASH.h}`} style={{overflow: 'visible'}}>
            <defs>
              <filter id="cash-glow" x="-30%" y="-50%" width="160%" height="200%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            <rect x={2} y={2} width={CASH.w - 4} height={CASH.h - 4} rx={20} fill="none" stroke="#FFFFFF" strokeWidth={8} opacity={cashGlow} filter="url(#cash-glow)" />
            <rect x={2} y={2} width={CASH.w - 4} height={CASH.h - 4} rx={20} fill={hexA('#FFFFFF', 0.04 + filled * 0.06)} stroke="#FFFFFF" strokeWidth={2.5} />
            <rect x={18} y={18} width={CASH.w - 36} height={CASH.h - 36} rx={12} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1.5} />
            <circle cx={CASH.w / 2} cy={CASH.h / 2} r={36} fill="none" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={2} />
            <circle cx={CASH.w / 2} cy={CASH.h / 2} r={36} fill={COLORS.goldB} opacity={filled * 0.35 + hit * 0.3} filter="url(#cash-glow)" />
            <circle cx={46} cy={CASH.h / 2} r={6} fill="#FFFFFF" opacity={0.5} />
            <circle cx={CASH.w - 46} cy={CASH.h / 2} r={6} fill="#FFFFFF" opacity={0.5} />
          </svg>
        </div>
        <At x={CASH.x} y={CASH.y + CASH.h / 2 + 40}>
          <Label text={S6_CASH} size={30} p={enter(frame, T.cash + 10)} weight={FONT.body} color="rgba(245,241,232,0.7)" />
        </At>
      </AbsoluteFill>

      {/* gold stack (hero) */}
      <HeroLayer from={T.stack} to={T.stack + 40}>
        <div style={{position: 'absolute', inset: 0, ...heroStyle(stackIn, '', exit), transformOrigin: `${STACK.x}px ${STACK.base - 120}px`}}>
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
            <CoinDefs />
            <defs>
              <filter id="stack-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>
            <ellipse cx={STACK.x} cy={STACK.base + 16} rx={STACK.rx * 1.5} ry={STACK.ry * 1.6} fill={COLORS.goldA} opacity={0.28} filter="url(#stack-glow)" />
            {new Array(remaining).fill(0).map((_, k) => (
              <Coin key={k} cx={STACK.x + (k % 2 === 0 ? 0 : 2.5)} cy={stackTopY(k + 1)} />
            ))}
          </svg>
        </div>
      </HeroLayer>

      <AbsoluteFill style={exitStyle(exit)}>
        <Trail layers={5} lagInFrames={1.2} trailOpacity={0.5}>
          <FlyingCoins />
        </Trail>
      </AbsoluteFill>

      <Headline>
        <ArabicText block={S6_PANIC} size={LAYOUT.headlineSize} start={T.text} exitEnd={DUR} />
      </Headline>
    </AbsoluteFill>
  );
};
