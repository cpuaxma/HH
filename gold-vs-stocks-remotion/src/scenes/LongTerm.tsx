import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {GlassCard} from '../components/GlassCard';
import {LightStreak} from '../components/LightStreak';
import {S5_CARD_BLUE, S5_CARD_GOLD, S5_LONG} from '../strings';
import {COLORS, LAYOUT, SAFE, VIDEO} from '../theme';
import {dash, ease, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const CARD_W = 330;
const CARD_H = 400;
const CARD_TOP = 820;
const GOLD_X = 735; // right card centre (right edge 900 stays clear of the right safe zone)
const BLUE_X = 345; // left card centre

const SHIELD_ICON = 'M0 -70 C 22 -56, 44 -52, 60 -55 L 60 -5 C 60 34, 32 58, 0 72 C -32 58, -60 34, -60 -5 L -60 -55 C -44 -52, -22 -56, 0 -70 Z M-24 0 L-6 18 L26 -18';
const ARROW_ICON = 'M-62 52 L-20 10 L8 34 L58 -24 M24 -26 L58 -24 L56 8';

const ARC_Y = CARD_TOP + CARD_H + 40;
const ARC = `M${GOLD_X} ${ARC_Y} Q 540 ${ARC_Y + 140} ${BLUE_X} ${ARC_Y}`;

const Card: React.FC<{x: number; tone: 'gold' | 'blue'; start: number; frame: number; icon: string; label: string}> = ({
  x,
  tone,
  start,
  frame,
  icon,
  label,
}) => {
  const p = hero(frame, start);
  const iconDraw = ease(frame, start + 30, 40);
  const [a, b] = tone === 'gold' ? [COLORS.goldA, COLORS.goldB] : [COLORS.blueA, COLORS.blueB];
  return (
    <div style={{position: 'absolute', left: x - CARD_W / 2, top: CARD_TOP, width: CARD_W, height: CARD_H, ...heroStyle(p)}}>
      <GlassCard style={{inset: 0, border: `1px solid ${hexA(a, 0.35)}`, background: `linear-gradient(180deg, ${hexA(a, 0.14)} 0%, ${COLORS.glassFill} 60%)`}}>
        <svg width={CARD_W} height={220} viewBox="-165 -110 330 220" style={{position: 'absolute', top: 40, left: 0}}>
          <circle cx={0} cy={0} r={92} fill={hexA(a, 0.12)} style={{filter: 'blur(18px)'}} />
          <path
            d={icon}
            pathLength={1}
            fill="none"
            stroke={b}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{...dash(iconDraw), filter: `drop-shadow(0 0 8px ${hexA(a, 0.8)})`}}
          />
        </svg>
        <ArabicText
          block={tone === 'gold' ? {lines: [{text: label}], gold: [label]} : {lines: [{text: label}], blue: [label]}}
          size={56}
          start={start + 50}
          style={{position: 'absolute', left: 0, right: 0, top: 268}}
        />
      </GlassCard>
    </div>
  );
};

export const LongTerm: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const arc = ease(frame, 85, 45);

  return (
    <AbsoluteFill>
      <ArabicText block={S5_LONG} size={64} start={12} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />

      <AbsoluteFill style={exitStyle(out)}>
        <Card x={GOLD_X} tone="gold" start={2} frame={frame} icon={SHIELD_ICON} label={S5_CARD_GOLD} />
        <Card x={BLUE_X} tone="blue" start={17} frame={frame} icon={ARROW_ICON} label={S5_CARD_BLUE} />
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <LightStreak id="long-arc" variant="goldToBlue" d={ARC} head={arc} width={3.4} bloom={9} from={[GOLD_X, ARC_Y]} to={[BLUE_X, ARC_Y]} />
          <circle cx={GOLD_X} cy={ARC_Y} r={6} fill={COLORS.goldB} opacity={Math.min(1, arc * 6)} style={{filter: `drop-shadow(0 0 8px ${COLORS.goldA})`}} />
          <circle cx={BLUE_X} cy={ARC_Y} r={6} fill={COLORS.blueB} opacity={Math.max(0, (arc - 0.85) / 0.15)} style={{filter: `drop-shadow(0 0 8px ${COLORS.blueA})`}} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
