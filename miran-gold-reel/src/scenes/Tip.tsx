import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {ChartLine} from '../components/ChartLine';
import {GlassCard} from '../components/GlassCard';
import {LightStreak} from '../components/LightStreak';
import {ILLUSTRATIVE, S6_TICKER, S6_TIP, S6_TIP_PILL} from '../strings';
import {COLORS, FONT, GOLD_GRADIENT, SAFE} from '../theme';
import {ease, enter, exitProgress, exitStyle, hexA} from '../motion';

const CARD = {left: SAFE.side, top: 640, width: 800, height: 400};
const PTS: [number, number][] = [
  [50, 330], [115, 295], [160, 318], [225, 252], [270, 280], [335, 214], [385, 252],
  [450, 176], [500, 214], [565, 140], [615, 168], [700, 92], [750, 104],
];
const LINE = 'M' + PTS.map((p) => p.join(' ')).join(' L ');

const DONUT = {cx: 540, cy: 1250, r: 122, w: 34};
const SEGMENTS = [
  {value: 0.4, color: COLORS.goldB, gold: true},
  {value: 0.25, color: COLORS.navyGreyLight},
  {value: 0.2, color: COLORS.navyGrey},
  {value: 0.15, color: COLORS.navyGreyDark},
];
const GAP = 0.012;

export const Tip: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const pill = enter(frame, 6, 28);
  const card = enter(frame, 0, 40);
  const line = ease(frame, 35, 80);
  const traceHead = ease(frame, 72, 70);
  const traceTail = ease(frame, 84, 70);
  const pop = ease(frame, 172, 26);

  const C = 2 * Math.PI * DONUT.r;
  let acc = 0;

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          dir="rtl"
          style={{
            padding: '4px 26px',
            borderRadius: 999,
            border: `1.5px solid ${hexA(COLORS.goldA, 0.8)}`,
            background: hexA(COLORS.goldA, 0.1),
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 26,
            lineHeight: 1.5,
            color: COLORS.goldB,
            opacity: pill * (1 - out),
            filter: pill < 0.99 || out > 0 ? `blur(${(1 - pill) * 8 + out * 8}px)` : undefined,
            transform: `translateY(${(1 - pill) * 18}px)`,
          }}
        >
          {S6_TIP_PILL}
        </div>
      </div>
      <ArabicText block={S6_TIP} size={68} start={18} exitEnd={dur} style={{position: 'absolute', top: 372, left: SAFE.side, right: SAFE.side}} />

      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <GlassCard style={{...CARD, opacity: card, transform: `translateY(${(1 - card) * 60}px) scale(${0.96 + 0.04 * card})`}}>
          <div style={{position: 'absolute', right: 30, top: 22, fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 28, lineHeight: 1.5}}>
            <bdi style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{S6_TICKER}</bdi>
          </div>
          <div dir="rtl" style={{position: 'absolute', left: 30, top: 26, fontFamily: FONT.family, fontWeight: FONT.body, fontSize: 22, color: hexA(COLORS.text, 0.4)}}>
            {ILLUSTRATIVE}
          </div>
          <svg width={CARD.width} height={CARD.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={40} y1={110 + i * 75} x2={760} y2={110 + i * 75} stroke={COLORS.text} strokeOpacity={0.05} strokeWidth={1} />
            ))}
            <ChartLine d={LINE} progress={line} color={COLORS.goldA} width={4} glow={4} />
            <LightStreak id="tip-trace" d={LINE} head={traceHead} tail={traceTail} width={3.5} from={PTS[0]} to={PTS[PTS.length - 1]} />
          </svg>
        </GlassCard>

        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <g transform={`rotate(-90 ${DONUT.cx} ${DONUT.cy})`}>
            {SEGMENTS.map((seg, k) => {
              const p = ease(frame, 118 + k * 12, 22);
              const len = Math.max(0, seg.value - GAP) * p;
              const mid = (acc + seg.value / 2) * 2 * Math.PI;
              const nudge = seg.gold ? pop * 12 : 0;
              const el = (
                <circle
                  key={k}
                  cx={DONUT.cx + Math.cos(mid) * nudge}
                  cy={DONUT.cy + Math.sin(mid) * nudge}
                  r={DONUT.r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={seg.gold ? DONUT.w + pop * 6 : DONUT.w}
                  strokeDasharray={`${len * C} ${C}`}
                  strokeDashoffset={-acc * C}
                  opacity={len > 0 ? 1 : 0}
                  style={seg.gold ? {filter: `drop-shadow(0 0 ${4 + pop * 10}px ${hexA(COLORS.goldB, 0.6)})`} : undefined}
                />
              );
              acc += seg.value;
              return el;
            })}
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
