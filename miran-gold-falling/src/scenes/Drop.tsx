import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {COLORS, EASE, FONT, LAYOUT, sceneLength} from '../theme';
import {S2_DROP, S2_DROP_PCT, S2_NOTE, S2_NOW, S2_PEAK, S2_TICKER} from '../strings';
import {ArabicText} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {GlassCard} from '../components/GlassCard';
import {LightStreak} from '../components/LightStreak';
import {Pill} from '../components/Pill';
import {Pt, smoothPath} from '../components/ChartLine';
import {ease, enter, exitProgress, exitStyle, hero, hexA} from '../motion';

const DUR = sceneLength('drop');
const CARD = {x: 140, y: 800, w: 800, h: 560};
const CHART = {x: 200, y: 900, w: 680, h: 380};
const P_MAX = 5900;
const P_MIN = 3700;
const PRICES = [3900, 4050, 4000, 4300, 4450, 4400, 4750, 5050, 5300, 5600, 5250, 4950, 4800, 4500, 4350, 4150, 4000];
const PEAK = 9;
const py = (p: number) => CHART.y + ((P_MAX - p) / (P_MAX - P_MIN)) * CHART.h;
const PTS: Pt[] = PRICES.map((p, i) => [CHART.x + (i / (PRICES.length - 1)) * CHART.w, py(p)]);
const CLIMB = smoothPath(PTS.slice(0, PEAK + 1), 0.35);
const DESCENT = smoothPath(PTS.slice(PEAK), 0.35);
const CLIMB_LEN = getLength(CLIMB);
const DESCENT_LEN = getLength(DESCENT);
const PEAK_PT = PTS[PEAK];
const NOW_PT = PTS[PTS.length - 1];
const BRACKET_X = CHART.x + CHART.w + 28;

// Beats (local frames)
// Synced to the voiceover: peak as it says «خمسة آلاف وستّمئة», now at «أربعة آلاف», −٢٨٪ at «ثمانية وعشرين».
const T = {card: 2, climb: 40, peak: 170, descent: 250, now: 350, bracket: 362, pct: 470};

export const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const cardIn = enter(frame, T.card, 36);
  const climb = ease(frame, T.climb, T.peak - T.climb, EASE.inOut);
  const descent = ease(frame, T.descent, T.now - T.descent, EASE.inOut);
  const peakPill = hero(frame, T.peak + 4);
  const nowPill = hero(frame, T.now);
  const bracket = ease(frame, T.bracket, 22);
  const pct = hero(frame, T.pct);
  const labels = enter(frame, T.card + 16, 30);

  // Head of the line and the area reveal.
  const head =
    (frame < T.descent || descent <= 0
      ? getPointAtLength(CLIMB, CLIMB_LEN * Math.max(0.0001, climb))
      : getPointAtLength(DESCENT, DESCENT_LEN * Math.max(0.0001, descent))) ?? {x: PTS[0][0], y: PTS[0][1]};
  const revealX = climb <= 0 ? CHART.x : head.x;
  const peakRing = (k: number) => interpolate(frame, [T.peak + k * 22, T.peak + k * 22 + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});
  const area = `${smoothPath(PTS, 0.35)} L${NOW_PT[0]},${CHART.y + CHART.h} L${CHART.x},${CHART.y + CHART.h} Z`;
  const headVisible = climb > 0 && (frame < T.now + 20);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={exitStyle(exit)}>
        <GlassCard
          style={{
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 40}px) scale(${0.94 + 0.06 * cardIn})`,
            filter: cardIn < 0.99 ? `blur(${(1 - cardIn) * 10}px)` : undefined,
          }}
        />
        <div style={{opacity: labels}}>
          <div style={{position: 'absolute', left: CARD.x + 36, top: CARD.y + 30, fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 26, color: COLORS.goldB}}>
            <bdi>{S2_TICKER}</bdi>
          </div>
          <div
            dir="rtl"
            style={{
              position: 'absolute',
              right: 1080 - (CARD.x + CARD.w) + 36,
              top: CARD.y + 32,
              fontFamily: FONT.family,
              fontWeight: FONT.body,
              fontSize: 22,
              color: 'rgba(245,241,232,0.4)',
            }}
          >
            {S2_NOTE}
          </div>
        </div>
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <linearGradient id="drop-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COLORS.goldA} stopOpacity="0.22" />
              <stop offset="1" stopColor={COLORS.goldA} stopOpacity="0" />
            </linearGradient>
            <clipPath id="drop-reveal">
              <rect x={CHART.x - 10} y={CHART.y - 100} width={Math.max(0, revealX - CHART.x + 10)} height={CHART.h + 200} />
            </clipPath>
            <filter id="drop-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          {/* grid */}
          {[0.15, 0.5, 0.85].map((g) => (
            <line
              key={g}
              x1={CHART.x}
              x2={CHART.x + CHART.w}
              y1={CHART.y + g * CHART.h}
              y2={CHART.y + g * CHART.h}
              stroke="#FFFFFF"
              strokeOpacity={0.06 * cardIn}
              strokeWidth={1}
            />
          ))}
          <path d={area} fill="url(#drop-area)" clipPath="url(#drop-reveal)" />
          <LightStreak id="drop-climb" d={CLIMB} head={climb} width={3.4} from={[CHART.x, CHART.y + CHART.h]} to={PEAK_PT} />
          <LightStreak id="drop-descent" d={DESCENT} head={descent} width={3.4} from={PEAK_PT} to={NOW_PT} />
          {headVisible ? (
            <g transform={`translate(${head.x}, ${head.y})`} opacity={interpolate(frame, [T.now, T.now + 20], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
              <circle r={18} fill={COLORS.goldB} opacity={0.6} filter="url(#drop-glow)" />
              <circle r={5} fill="#FFFFFF" />
            </g>
          ) : null}
          {/* peak pulse rings */}
          {[0, 1].map((k) => {
            const r = peakRing(k);
            return r > 0 && r < 1 ? (
              <circle key={k} cx={PEAK_PT[0]} cy={PEAK_PT[1]} r={8 + r * 46} fill="none" stroke={COLORS.goldB} strokeWidth={2} opacity={(1 - r) * 0.9} />
            ) : null;
          })}
          {frame >= T.peak ? <circle cx={PEAK_PT[0]} cy={PEAK_PT[1]} r={6} fill={COLORS.goldB} /> : null}
          {frame >= T.now ? <circle cx={NOW_PT[0]} cy={NOW_PT[1]} r={6} fill={COLORS.goldB} /> : null}
          {/* bracket: dashed guide at the peak level + vertical bracket from peak to now */}
          <line
            x1={PEAK_PT[0] + 14}
            x2={BRACKET_X}
            y1={PEAK_PT[1]}
            y2={PEAK_PT[1]}
            stroke="#FFFFFF"
            strokeOpacity={0.3 * bracket}
            strokeWidth={1.5}
            strokeDasharray="5 7"
          />
          <line
            x1={BRACKET_X}
            x2={BRACKET_X}
            y1={PEAK_PT[1]}
            y2={PEAK_PT[1] + (NOW_PT[1] - PEAK_PT[1]) * bracket}
            stroke="#FFFFFF"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            strokeDasharray="6 6"
          />
          <g stroke="#FFFFFF" strokeOpacity={0.55 * bracket} strokeWidth={1.5}>
            <line x1={BRACKET_X - 9} x2={BRACKET_X + 9} y1={PEAK_PT[1]} y2={PEAK_PT[1]} />
            <line x1={BRACKET_X - 9} x2={BRACKET_X + 9} y1={NOW_PT[1]} y2={NOW_PT[1]} />
          </g>
          <line
            x1={NOW_PT[0] + 10}
            x2={BRACKET_X}
            y1={NOW_PT[1]}
            y2={NOW_PT[1]}
            stroke="#FFFFFF"
            strokeOpacity={0.3 * bracket}
            strokeWidth={1.5}
            strokeDasharray="5 7"
          />
        </svg>
        <At x={PEAK_PT[0]} y={PEAK_PT[1] - 58}>
          <Pill text={S2_PEAK} p={peakPill} accent="gold" size={28} />
        </At>
        <At x={NOW_PT[0] - 30} y={NOW_PT[1] + 56}>
          <Pill text={S2_NOW} p={nowPill} accent="gold" size={28} />
        </At>
        <At x={BRACKET_X - 92} y={(PEAK_PT[1] + NOW_PT[1]) / 2}>
          <Pill text={S2_DROP_PCT} p={pct} accent="red" size={30} style={{boxShadow: `0 0 30px ${hexA(COLORS.red, 0.5)}`}} />
        </At>
      </AbsoluteFill>

      <Headline>
        <ArabicText block={S2_DROP} size={LAYOUT.headlineSize - 4} start={8} exitEnd={DUR} />
      </Headline>
    </AbsoluteFill>
  );
};
