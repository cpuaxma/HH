import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, FONT, s, SPRING} from '../constants';
import {arPercent, clamp, draw, ease, goldGlow, hexA, springAt} from '../lib';
import {Candle, Candles, ChartBox, ChartGrid, levelY} from './Candles';
import {BearSilhouette, BullSilhouette} from './Silhouettes';

export type MarketConfig = {
  kind: 'bull' | 'bear';
  titleLead: string; // "السوق"
  titleKey: string; // "الصاعد" / "الهابط"
  latin: string; // "Bull Market"
  color: string;
  candles: Candle[];
  /** Counter end value (±20). */
  target: number;
  /** Reference line: the low (bull) or the high (bear). */
  refLabel: string;
  moods: string[];
};

// Timeline inside the scene (seconds from the scene start).
const T = {
  title: 0.05,
  counter: 0.35,
  candles: 0.5,
  candleStagger: 0.27,
  candleGrow: 0.45,
  animal: 0.6,
  ref: 1.0,
  moods: 5.3,
  strike: 8.2,
};

const BOX: ChartBox = {x: 80, y: 700, w: 920, h: 540};
const ANIMAL_W = 470;
const ANIMAL_TOP = 1300 - (ANIMAL_W * 260) / 400;

export const MarketScene: React.FC<{cfg: MarketConfig}> = ({cfg}) => {
  const frame = useCurrentFrame();
  const bull = cfg.kind === 'bull';
  const n = cfg.candles.length;

  // Candles grow one by one (ease-out); red candles also drop into place.
  const progress = cfg.candles.map((_, i) => ease(frame, s(T.candles + i * T.candleStagger), s(T.candleGrow)));
  const candlesEnd = T.candles + (n - 1) * T.candleStagger + T.candleGrow;

  // Counter follows the chart and lands on ±20.
  const count = ease(frame, s(T.candles), s(candlesEnd - T.candles), EASE.inOut) * cfg.target;
  const landed = springAt(frame, s(candlesEnd), SPRING.pop);
  const counterPulse = 1 + 0.14 * Math.sin(Math.min(1, landed) * Math.PI);

  const titleIn = springAt(frame, s(T.title), SPRING.soft);
  const counterIn = springAt(frame, s(T.counter), SPRING.soft);

  // Reference line (lowest low / highest high).
  const refLevel = bull ? Math.min(...cfg.candles.map((k) => k.l)) : Math.max(...cfg.candles.map((k) => k.h));
  const refY = levelY(BOX, refLevel);
  const refP = ease(frame, s(T.ref), s(0.8));

  // The strike: bull tosses its horns up, bear swipes its claws down.
  const st = s(T.strike);
  const tilt = interpolate(frame, [st, st + 6, st + 22], [0, 9, 0], {...clamp, easing: EASE.out});
  const strikeP = ease(frame, st + 2, s(0.5));
  const strikeFade = 1 - ease(frame, st + s(0.9), s(0.6));
  const chartKick = interpolate(frame, [st + 2, st + 7, st + 24], [0, bull ? -16 : 16, 0], clamp);

  // Animal entrance: bull rises on the right, bear slides in from the left.
  const animalIn = springAt(frame, s(T.animal), {damping: 16, stiffness: 90});
  const drawn = ease(frame, s(T.animal), s(1.3), EASE.inOut);
  const animalStyle: React.CSSProperties = bull
    ? {right: 20, transform: `translateY(${(1 - animalIn) * 420}px) rotate(${tilt}deg)`, transformOrigin: '92% 95%'}
    : {left: 20, transform: `translateX(${(1 - animalIn) * -620}px) rotate(${tilt}deg)`, transformOrigin: '12% 95%'};

  return (
    <AbsoluteFill>
      {/* Market-coloured glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 40% at ${bull ? 70 : 30}% 62%, ${hexA(cfg.color, 0.13)} 0%, transparent 70%)`,
          opacity: ease(frame, 0, s(1)),
        }}
      />

      {/* Title */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 262,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.heavy,
          fontSize: 112,
          lineHeight: 1.25,
          color: COLORS.white,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        {cfg.titleLead}{' '}
        <span style={{color: COLORS.gold, textShadow: goldGlow(0.9)}}>{cfg.titleKey}</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 410,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: 38,
          letterSpacing: 8,
          textTransform: 'uppercase',
          color: COLORS.gold,
          opacity: titleIn * 0.85,
        }}
      >
        {cfg.latin}
      </div>

      {/* Counter */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 462,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          opacity: counterIn,
          transform: `scale(${(0.8 + 0.2 * counterIn) * counterPulse})`,
        }}
      >
        <span
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.heavy,
            fontSize: 150,
            lineHeight: 1.2,
            color: cfg.color,
            textShadow: `0 0 26px ${hexA(cfg.color, 0.55)}, 0 0 70px ${hexA(cfg.color, 0.25)}`,
            minWidth: 360,
            textAlign: 'center',
          }}
        >
          {arPercent(count)}
        </span>
        <svg width={70} height={70} viewBox="0 0 70 70" style={{transform: bull ? undefined : 'scaleY(-1)'}}>
          <path d="M35 6 L64 46 L45 46 L45 64 L25 64 L25 46 L6 46 Z" fill={cfg.color} style={{filter: `drop-shadow(0 0 12px ${hexA(cfg.color, 0.6)})`}} />
        </svg>
      </div>

      {/* Chart */}
      <AbsoluteFill style={{transform: `translateY(${chartKick}px)`}}>
        <ChartGrid box={BOX} opacity={ease(frame, s(0.2), s(0.8))} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <line
            x1={BOX.x}
            x2={BOX.x + BOX.w}
            y1={refY}
            y2={refY}
            stroke={COLORS.gold}
            strokeWidth={3}
            strokeDasharray="14 12"
            opacity={0.85}
            style={{clipPath: `inset(0 ${(1 - refP) * 100}% 0 0)`}}
          />
        </svg>
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            ...(bull ? {left: BOX.x, top: refY + 8} : {right: 1080 - BOX.x - BOX.w, top: refY - 52}),
            fontFamily: FONT.family,
            fontWeight: FONT.semibold,
            fontSize: 32,
            color: COLORS.gold,
            opacity: refP,
          }}
        >
          {cfg.refLabel}
        </div>
        <Candles data={cfg.candles} box={BOX} progress={progress} color={cfg.color} drop={bull ? 0 : 70} />
      </AbsoluteFill>

      {/* Mood chips in the empty corner of the chart */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: bull ? 740 : 880,
          ...(bull ? {left: BOX.x + 10} : {right: 1080 - BOX.x - BOX.w + 10}),
          display: 'flex',
          gap: 18,
        }}
      >
        {cfg.moods.map((m, i) => {
          const p = springAt(frame, s(T.moods + i * 0.35), SPRING.pop);
          return (
            <div
              key={m}
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: 46,
                lineHeight: 1.3,
                color: COLORS.white,
                padding: '8px 30px 12px',
                borderRadius: 999,
                border: `3px solid ${cfg.color}`,
                background: hexA(cfg.color, 0.14),
                boxShadow: `0 0 24px ${hexA(cfg.color, 0.35)}`,
                opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
                transform: `scale(${0.5 + 0.5 * p})`,
              }}
            >
              {m}
            </div>
          );
        })}
      </div>

      {/* Strike effect */}
      {strikeP > 0 && strikeFade > 0 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: strikeFade, overflow: 'visible'}}>
          {bull ? (
            <g style={{filter: `drop-shadow(0 0 14px ${COLORS.gold})`}}>
              {[-60, 0, 60].map((dx, i) => (
                <path
                  key={dx}
                  d={`M${660 + dx} ${1010 - i * 10} L${640 + dx * 1.6} ${700 - i * 20}`}
                  stroke={i === 1 ? COLORS.goldLight : COLORS.gold}
                  strokeWidth={i === 1 ? 10 : 6}
                  strokeLinecap="round"
                  fill="none"
                  pathLength={1}
                  style={draw(strikeP)}
                />
              ))}
              <path
                d="M640 640 L680 700 L600 700 Z"
                fill={COLORS.goldLight}
                opacity={interpolate(strikeP, [0.7, 1], [0, 1], clamp)}
                transform={`translate(${-20 * 0} ${(1 - strikeP) * 60})`}
              />
            </g>
          ) : (
            <g style={{filter: `drop-shadow(0 0 14px ${COLORS.red})`}}>
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M${470 + i * 70} ${760 + i * 10} C ${520 + i * 70} ${900} ${560 + i * 70} ${1000} ${600 + i * 70} ${1170 - i * 20}`}
                  stroke={i === 1 ? '#FF8A8A' : COLORS.red}
                  strokeWidth={14 - i * 2}
                  strokeLinecap="round"
                  fill="none"
                  pathLength={1}
                  style={draw(ease(frame, st + 2 + i * 2, s(0.35)))}
                />
              ))}
            </g>
          )}
        </svg>
      ) : null}

      {/* The animal */}
      <div style={{position: 'absolute', top: ANIMAL_TOP, ...animalStyle}}>
        {bull ? (
          <BullSilhouette width={ANIMAL_W} drawn={drawn} fill={drawn} />
        ) : (
          <BearSilhouette width={ANIMAL_W} drawn={drawn} fill={drawn} claws={strikeP > 0 && strikeFade > 0.5 ? COLORS.red : undefined} />
        )}
      </div>
    </AbsoluteFill>
  );
};
