import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BEAR_CANDLES, BULL_CANDLES, Candles} from '../components/Candles';
import {BearSilhouette, BullSilhouette} from '../components/Silhouettes';
import {COLORS, EASE, FONT, s, SPRING} from '../constants';
import {clamp, ease, hexA, springAt} from '../lib';

const ROW_STAGGER = s(0.18);
const DIVIDER_X = 540;

type Side = {
  side: 'left' | 'right';
  color: string;
  name: string;
  line1: string;
  line2: string;
  start: number; // seconds from scene start
};

// Left = bull (green), right = bear (red). The right side enters as the voice-over reaches «وفي الهابط».
const LEFT: Side = {side: 'left', color: COLORS.green, name: 'السوق الصاعد', line1: 'ثقة', line2: 'وطلب قوي', start: 0.35};
const RIGHT: Side = {side: 'right', color: COLORS.red, name: 'السوق الهابط', line1: 'خوف', line2: 'وبيع كثير', start: 4.0};

const MINI_BULL = BULL_CANDLES.filter((_, i) => i % 2 === 0);
const MINI_BEAR = BEAR_CANDLES.filter((_, i) => i % 2 === 0);

const Half: React.FC<{cfg: Side}> = ({cfg}) => {
  const frame = useCurrentFrame();
  const left = cfg.side === 'left';
  const x0 = left ? 0 : DIVIDER_X;
  const start = s(cfg.start);

  const row = (i: number) => {
    const p = springAt(frame, start + i * ROW_STAGGER, SPRING.soft);
    return {
      opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
      transform: `translateX(${(1 - p) * (left ? -80 : 80)}px)`,
    } as React.CSSProperties;
  };

  const text = (size: number, color: string, weight: number = FONT.heavy): React.CSSProperties => ({
    fontFamily: FONT.family,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1.3,
    color,
    textAlign: 'center',
  });

  const miniStart = start + 4 * ROW_STAGGER;
  const miniBox = {x: x0 + 90, y: 1060, w: 360, h: 200};
  const data = left ? MINI_BULL : MINI_BEAR;
  const progress = data.map((_, i) => ease(frame, miniStart + i * 4, s(0.35)));

  return (
    <>
      <AbsoluteFill
        style={{
          left: x0,
          width: 540,
          background: `radial-gradient(ellipse 90% 55% at 50% 50%, ${hexA(cfg.color, 0.16)} 0%, transparent 75%)`,
          opacity: ease(frame, start, s(0.6)),
        }}
      />
      <div dir="rtl" style={{position: 'absolute', left: x0 + 30, width: 480, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...row(0), height: 200, display: 'flex', alignItems: 'flex-end'}}>
          {left ? <BullSilhouette width={300} glow={0.7} /> : <BearSilhouette width={300} glow={0.7} />}
        </div>
        <div style={{...row(1), ...text(54, cfg.color, FONT.bold), marginTop: 26, textShadow: `0 0 20px ${hexA(cfg.color, 0.45)}`}}>
          {cfg.name}
        </div>
        <div
          style={{
            ...row(1),
            width: 220,
            height: 4,
            marginTop: 14,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
          }}
        />
        <div style={{...row(2), ...text(120, COLORS.white), marginTop: 26}}>{cfg.line1}</div>
        <div style={{...row(3), ...text(82, cfg.color), marginTop: -4, textShadow: `0 0 26px ${hexA(cfg.color, 0.4)}`}}>
          {cfg.line2}
        </div>
      </div>
      <Candles data={data} box={miniBox} progress={progress} color={cfg.color} drop={left ? 0 : 40} />
    </>
  );
};

/** 4) Comparison — gold divider draws down the middle; green (bull) left, red (bear) right, rows stagger in. */
export const Comparison: React.FC = () => {
  const frame = useCurrentFrame();
  const line = ease(frame, 0, s(0.8), EASE.inOut);
  const top = 280;
  const bottom = 1290;
  const head = top + (bottom - top) * line;
  return (
    <AbsoluteFill>
      <Half cfg={LEFT} />
      <Half cfg={RIGHT} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="divider" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLORS.gold} stopOpacity={0} />
            <stop offset="0.12" stopColor={COLORS.gold} />
            <stop offset="0.88" stopColor={COLORS.gold} />
            <stop offset="1" stopColor={COLORS.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect
          x={DIVIDER_X - 2}
          y={top}
          width={4}
          height={head - top}
          fill="url(#divider)"
          style={{filter: `drop-shadow(0 0 10px ${COLORS.gold}) drop-shadow(0 0 26px rgba(212,175,55,0.5))`}}
        />
        {line > 0 && line < 1 ? <circle cx={DIVIDER_X} cy={head} r={9} fill={COLORS.goldLight} style={{filter: `drop-shadow(0 0 16px ${COLORS.gold})`}} /> : null}
        {/* Gold diamond at the centre */}
        <g transform={`translate(${DIVIDER_X} 790) rotate(45) scale(${springAt(frame, s(0.7), SPRING.pop)})`}>
          <rect x={-16} y={-16} width={32} height={32} fill={COLORS.bg} stroke={COLORS.gold} strokeWidth={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
