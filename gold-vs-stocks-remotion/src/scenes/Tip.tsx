import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {Donut} from '../components/Donut';
import {S6_TIP, S6_TIP_PILL} from '../strings';
import {COLORS, FONT, GOLD_GRADIENT, LAYOUT, SAFE, SPRING_TEXT, VIDEO} from '../theme';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const GOLD_SPLIT = 0.4; // illustrative, never labelled
const DONUT = 300;
const DONUT_CY = 960;
const PIVOT: [number, number] = [540, 1200]; // top of the scale's post
const BEAM = 190; // half-length
const STRING = 80;

const Pan: React.FC<{x: number; y: number; color: string}> = ({x, y, color}) => (
  <g>
    <line x1={x} y1={y} x2={x - 52} y2={y + STRING} stroke={COLORS.text} strokeOpacity={0.55} strokeWidth={1.6} />
    <line x1={x} y1={y} x2={x + 52} y2={y + STRING} stroke={COLORS.text} strokeOpacity={0.55} strokeWidth={1.6} />
    <path d={`M${x - 62} ${y + STRING} Q ${x} ${y + STRING + 46} ${x + 62} ${y + STRING} Z`} fill={hexA(color, 0.22)} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
    <circle cx={x} cy={y} r={4} fill={COLORS.text} opacity={0.8} />
  </g>
);

export const Tip: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const pill = ease(frame, 2, 30);
  const pillOut = exitProgress(frame, dur, 22);

  const ring = ease(frame, 20, 50);
  const gold = spring({frame: frame - 80, fps: VIDEO.fps, config: SPRING_TEXT, durationInFrames: 60}) * GOLD_SPLIT;
  const donutIn = hero(frame, 12);

  // Scale: enters, then a soft damped wobble that settles level by ~frame 190.
  const scaleIn = hero(frame, 40);
  const t = Math.max(0, frame - 100);
  const angle = frame < 100 ? 6 * ease(frame, 40, 50) : 6 * Math.exp(-t / 22) * Math.cos(t / 7.5);
  const rad = (angle * Math.PI) / 180;
  const left: [number, number] = [PIVOT[0] - BEAM * Math.cos(rad), PIVOT[1] - BEAM * Math.sin(rad)];
  const right: [number, number] = [PIVOT[0] + BEAM * Math.cos(rad), PIVOT[1] + BEAM * Math.sin(rad)];

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: LAYOUT.headlineTop - 30, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          dir="rtl"
          style={{
            padding: '4px 30px',
            borderRadius: 999,
            border: `1px solid ${hexA(COLORS.goldA, 0.6)}`,
            background: hexA(COLORS.goldA, 0.12),
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 30,
            lineHeight: 1.5,
            opacity: pill * (1 - pillOut),
            transform: `translateY(${(1 - pill) * 14}px)`,
            filter: pillOut > 0.01 ? `blur(${pillOut * 8}px)` : undefined,
          }}
        >
          <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{S6_TIP_PILL}</span>
        </div>
      </div>

      <ArabicText block={S6_TIP} size={44} start={10} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop + 50, left: SAFE.side, right: SAFE.side}} />

      <AbsoluteFill style={exitStyle(out)}>
        <div style={{position: 'absolute', left: 540 - DONUT / 2, top: DONUT_CY - DONUT / 2, width: DONUT, height: DONUT, ...heroStyle(donutIn)}}>
          <Donut id="tip-donut" size={DONUT} ring={ring} gold={gold} thickness={30} />
        </div>

        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, transformOrigin: `${PIVOT[0]}px ${PIVOT[1] + 100}px`, ...heroStyle(scaleIn)}}>
          {/* post and base */}
          <line x1={PIVOT[0]} y1={PIVOT[1]} x2={PIVOT[0]} y2={PIVOT[1] + 190} stroke={COLORS.text} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
          <line x1={PIVOT[0] - 70} y1={PIVOT[1] + 190} x2={PIVOT[0] + 70} y2={PIVOT[1] + 190} stroke={COLORS.text} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
          {/* beam */}
          <line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={COLORS.text} strokeOpacity={0.85} strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={PIVOT[0]} cy={PIVOT[1]} r={7} fill="none" stroke={COLORS.text} strokeOpacity={0.85} strokeWidth={2} />
          <Pan x={left[0]} y={left[1]} color={COLORS.blueB} />
          <Pan x={right[0]} y={right[1]} color={COLORS.goldB} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
