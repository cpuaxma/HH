import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {ChartLine} from '../components/ChartLine';
import {GlassCard} from '../components/GlassCard';
import {ILLUSTRATIVE, S4_INFLATION, S4_LABEL_FIAT, S4_LABEL_GOLD} from '../strings';
import {COLORS, FONT, GOLD_GRADIENT, LAYOUT, SAFE} from '../theme';
import {ease, enter, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const CARD = {left: SAFE.side, top: 650, width: 800, height: 600};
const START: [number, number] = [70, 330];
const RED_END: [number, number] = [580, 470];
const GOLD_END: [number, number] = [580, 250];
const RED = `M${START.join(' ')} C 230 340, 390 400, ${RED_END.join(' ')}`;
const GOLD = `M${START.join(' ')} C 240 332, 420 315, ${GOLD_END.join(' ')}`;

const Basket: React.FC<{color: string; full: boolean}> = ({color, full}) => (
  <svg width={110} height={100} viewBox="0 0 110 100" style={{overflow: 'visible'}}>
    {full ? (
      <g fill={color}>
        <circle cx={34} cy={40} r={13} />
        <circle cx={58} cy={34} r={15} />
        <circle cx={80} cy={42} r={12} />
        <rect x={44} y={14} width={12} height={28} rx={6} transform="rotate(-18 50 28)" />
        <circle cx={46} cy={54} r={11} />
        <circle cx={68} cy={56} r={11} />
      </g>
    ) : (
      <g fill={color} opacity={0.75}>
        <circle cx={42} cy={74} r={10} />
        <circle cx={64} cy={76} r={9} />
      </g>
    )}
    <path d="M30 50 C 30 18, 80 18, 80 50" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M10 50 H100 L88 94 H22 Z" fill={hexA(COLORS.bgTop, 0.55)} stroke={color} strokeWidth={4} strokeLinejoin="round" />
    <line x1={38} y1={60} x2={41} y2={84} stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
    <line x1={55} y1={60} x2={55} y2={84} stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
    <line x1={72} y1={60} x2={69} y2={84} stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
  </svg>
);

export const Inflation: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const card = enter(frame, 0, 40);
  const lines = ease(frame, 40, 90);
  const labels = enter(frame, 124, 26);
  const redBasket = hero(frame, 138);
  const goldBasket = hero(frame, 148);
  const tag = ease(frame, 30, 30);

  const label = (text: string, y: number, gold: boolean): React.ReactNode => (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: 600,
        top: y - 30,
        width: 170,
        textAlign: 'center',
        fontFamily: FONT.family,
        fontWeight: FONT.key,
        fontSize: 34,
        lineHeight: 1.5,
        opacity: labels,
        filter: labels < 0.99 ? `blur(${(1 - labels) * 8}px)` : undefined,
        transform: `translateY(${(1 - labels) * 18}px)`,
        ...(gold ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {color: COLORS.fiat}),
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill>
      <ArabicText block={S4_INFLATION} size={58} start={15} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <GlassCard style={{...CARD, opacity: card, transform: `translateY(${(1 - card) * 60}px) scale(${0.96 + 0.04 * card})`}}>
          <div dir="rtl" style={{position: 'absolute', left: 32, top: 22, fontFamily: FONT.family, fontWeight: FONT.body, fontSize: 22, color: hexA(COLORS.text, 0.4), opacity: tag}}>
            {ILLUSTRATIVE}
          </div>
          <svg width={CARD.width} height={CARD.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <g opacity={tag}>
              <line x1={50} y1={540} x2={750} y2={540} stroke={COLORS.text} strokeOpacity={0.14} strokeWidth={1.5} />
              {Array.from({length: 8}, (_, i) => (
                <line key={i} x1={70 + i * 90} y1={534} x2={70 + i * 90} y2={546} stroke={COLORS.text} strokeOpacity={0.14} strokeWidth={1.5} />
              ))}
            </g>
            <ChartLine d={RED} progress={lines} color={COLORS.fiat} width={5} />
            <ChartLine d={GOLD} progress={lines} color={COLORS.goldB} width={5} glow={6} />
            <circle cx={RED_END[0]} cy={RED_END[1]} r={8 * labels} fill={COLORS.fiat} />
            <circle cx={GOLD_END[0]} cy={GOLD_END[1]} r={8 * labels} fill={COLORS.goldB} />
          </svg>
          {label(S4_LABEL_FIAT, RED_END[1], false)}
          {label(S4_LABEL_GOLD, GOLD_END[1], true)}
          <div style={{position: 'absolute', left: RED_END[0] - 55, top: RED_END[1] - 120, ...heroStyle(redBasket)}}>
            <Basket color={COLORS.fiat} full={false} />
          </div>
          <div style={{position: 'absolute', left: GOLD_END[0] - 55, top: GOLD_END[1] - 122, ...heroStyle(goldBasket)}}>
            <Basket color={COLORS.goldB} full />
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};
