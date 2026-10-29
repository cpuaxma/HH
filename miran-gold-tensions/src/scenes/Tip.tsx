import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {ChartLine} from '../components/ChartLine';
import {GlassCard} from '../components/GlassCard';
import {LightStreak} from '../components/LightStreak';
import {ILLUSTRATIVE, S6_NEWS, S6_TICKER, S6_TIP, S6_TIP_PILL} from '../strings';
import {COLORS, FONT, GOLD_GRADIENT, SAFE} from '../theme';
import {ease, enter, exitProgress, exitStyle, hexA, jitter} from '../motion';

const CARD = {left: SAFE.side, top: 720, width: 800, height: 420};
// Calm rise → sharp news spike → partial retrace → calm again.
const BEFORE = 'M 40 330 C 110 318 170 306 240 300 C 300 295 330 290 360 284';
const SPIKE = 'M 360 284 L 392 210 L 418 110 L 444 196 L 470 232';
const AFTER = 'M 470 232 C 540 240 600 228 660 226 C 700 225 735 220 760 216';
const FULL = `${BEFORE} ${SPIKE.replace('M 360 284 ', '')} ${AFTER.replace('M 470 232 ', '')}`;
const PEAK: [number, number] = [418, 110];
// Where the peak sits along FULL (by arc length), and the frames the chart draws over.
export const SPIKE_PEAK_AT = 0.544;
export const LINE_DRAW = {start: 40, dur: 110};
export const NEWS_TAG_AT = 90;
export const SETTLE_AT = 140;
const SETTLE_Y = 228;

export const Tip: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur, 26);
  const pill = enter(frame, 0, 28);
  const card = enter(frame, 20, 40);
  const line = ease(frame, LINE_DRAW.start, LINE_DRAW.dur);
  const traceHead = ease(frame, 82, 34);
  const traceTail = ease(frame, 94, 34);
  const tag = enter(frame, NEWS_TAG_AT, 22);
  const settle = ease(frame, SETTLE_AT, 34);
  const j = jitter(61, frame, 2.2 * tag);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 384, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
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
      <ArabicText block={S6_TIP} size={66} start={5} exitEnd={dur} style={{position: 'absolute', top: 452, left: SAFE.side, right: SAFE.side}} />

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
            {/* where the price settles after the spike */}
            <line
              x1={430}
              y1={SETTLE_Y}
              x2={770}
              y2={SETTLE_Y}
              stroke={hexA(COLORS.text, 0.45)}
              strokeWidth={1.5}
              strokeDasharray="7 7"
              opacity={settle}
              style={{clipPath: `inset(0 ${(1 - settle) * 100}% 0 0)`}}
            />
            <ChartLine d={FULL} progress={line} color={COLORS.goldA} width={4} glow={4} />
            <LightStreak id="tip-spike" d={SPIKE} head={traceHead} tail={traceTail} width={4} from={[360, 284]} to={PEAK} />
            <circle cx={PEAK[0]} cy={PEAK[1]} r={6} fill={COLORS.red} opacity={tag * j.flicker} style={{filter: `drop-shadow(0 0 6px ${COLORS.red})`}} />
          </svg>
          {/* "news" tag: red, so it's restless */}
          <div
            dir="rtl"
            style={{
              position: 'absolute',
              left: PEAK[0] + 22,
              top: PEAK[1] - 52,
              padding: '0 16px',
              borderRadius: 999,
              border: `1.5px solid ${COLORS.red}`,
              background: hexA(COLORS.red, 0.16),
              color: COLORS.red,
              fontFamily: FONT.family,
              fontWeight: FONT.key,
              fontSize: 24,
              lineHeight: 1.5,
              opacity: tag * j.flicker,
              transform: `translate(${j.x}px, ${j.y + (1 - tag) * 12}px) scale(${0.8 + 0.2 * tag})`,
            }}
          >
            {S6_NEWS}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};
