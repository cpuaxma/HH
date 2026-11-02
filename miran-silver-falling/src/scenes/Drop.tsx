import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {COLORS, EASE, FONT, LAYOUT, SCENES, SILVER_GRADIENT, VIDEO} from '../theme';
import {S2_DROP, S2_DROP_PCT, S2_MONTHS, S2_NOTE, S2_NOW, S2_PEAK, TICKER} from '../strings';
import {ArabicText} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {LightStreak} from '../components/LightStreak';
import {Pill} from '../components/Pill';
import {Station} from '../components/World';
import {ar} from '../numbers';
import {CHART, chartHead, CLIMB_D, CRASH_D, CRASH_PT, DROP_T as T, FULL_D, GRIND_D, monthX, NOW_PT, PEAK_PT, priceY} from '../silverChart';
import {ease, enter, hero, hexA, rand} from '../motion';

const START = SCENES.drop[0];
const TEXT_END = SCENES.drop[1] - START;
const BASE_Y = CHART.y + CHART.h + 18;
const BRACKET_X = CHART.x + CHART.w + 18;
const N_SPARKS = 22;

/** Sparks thrown off the crash segment as it is drawn. */
const Sparks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
      {new Array(N_SPARKS).fill(0).map((_, i) => {
        const birth = T.peak + 2 + i * ((T.crashEnd - T.peak) / N_SPARKS);
        const age = frame - birth;
        const life = 26 + rand(i + 3) * 18;
        if (age < 0 || age > life) return null;
        const o = chartHead(birth);
        const ang = -Math.PI * (0.15 + rand(i + 11) * 0.7); // up and outwards
        const v = 4 + rand(i + 21) * 7;
        const x = o.x + Math.cos(ang) * v * age * (rand(i) > 0.5 ? 1 : -1);
        const y = o.y + Math.sin(ang) * v * age + 0.22 * age * age;
        const fade = 1 - age / life;
        return (
          <g key={i} opacity={fade}>
            <circle cx={x} cy={y} r={3.2 * fade + 0.8} fill={i % 3 === 0 ? '#FFFFFF' : '#FF8A84'} />
          </g>
        );
      })}
    </svg>
  );
};

export const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const head = chartHead(frame);
  const axisIn = enter(frame, 8, 40);
  const peakPill = hero(frame, T.peak + 4);
  const nowPill = hero(frame, T.now);
  const bracket = ease(frame, T.bracket, 22);
  const pct = hero(frame, T.pct);
  const peakRing = (k: number) =>
    interpolate(frame, [T.peak + k * 20, T.peak + k * 20 + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});
  const revealX = head.climb <= 0 ? CHART.x : frame >= T.now ? CHART.x + CHART.w + 4 : head.x;
  const headOn = head.climb > 0 && frame < T.now + 24;
  const headFade = interpolate(frame, [T.now, T.now + 24], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const crashing = frame > T.peak && frame < T.crashEnd + 10;
  const area = `${FULL_D} L${NOW_PT[0]},${BASE_Y - 18} L${CHART.x},${BASE_Y - 18} Z`;

  return (
    <AbsoluteFill>
      <Station index={1} from={START}>
        {/* labels */}
        <div style={{opacity: axisIn}}>
          <div style={{position: 'absolute', left: CHART.x, top: CHART.y - 70, fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 26}}>
            <span style={{backgroundImage: SILVER_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
              <bdi>{TICKER}</bdi>
            </span>
          </div>
          <div
            dir="rtl"
            style={{position: 'absolute', right: VIDEO.width - (CHART.x + CHART.w), top: CHART.y - 66, fontFamily: FONT.family, fontSize: 22, color: 'rgba(245,241,232,0.4)'}}
          >
            {S2_NOTE}
          </div>
          {S2_MONTHS.map((m, i) => (
            <div
              key={m}
              dir="rtl"
              style={{
                position: 'absolute',
                left: monthX(i * 3) - 60,
                width: 120,
                top: BASE_Y + 14,
                textAlign: 'center',
                fontFamily: FONT.family,
                fontSize: 22,
                color: 'rgba(245,241,232,0.45)',
              }}
            >
              {m}
            </div>
          ))}
          {[50, 100].map((p) => (
            <div
              key={p}
              style={{position: 'absolute', left: CHART.x - 70, width: 56, top: priceY(p) - 16, textAlign: 'right', fontFamily: FONT.family, fontSize: 20, color: 'rgba(245,241,232,0.3)'}}
            >
              {ar(p)}
            </div>
          ))}
        </div>

        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="drop-area" x1="0" y1={CHART.y} x2="0" y2={BASE_Y} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#C9D3E2" stopOpacity="0.2" />
              <stop offset="1" stopColor="#C9D3E2" stopOpacity="0" />
            </linearGradient>
            <clipPath id="drop-reveal">
              <rect x={CHART.x - 10} y={CHART.y - 120} width={Math.max(0, revealX - CHART.x + 10)} height={CHART.h + 240} />
            </clipPath>
            <filter id="drop-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          {/* baseline, month ticks and price guides */}
          <g opacity={axisIn}>
            <line x1={CHART.x} x2={CHART.x + CHART.w} y1={BASE_Y} y2={BASE_Y} stroke="#FFFFFF" strokeOpacity={0.14} />
            {S2_MONTHS.map((_, i) => (
              <line key={i} x1={monthX(i * 3)} x2={monthX(i * 3)} y1={BASE_Y - 6} y2={BASE_Y + 6} stroke="#FFFFFF" strokeOpacity={0.3} />
            ))}
            {[50, 100].map((p) => (
              <line key={p} x1={CHART.x} x2={CHART.x + CHART.w} y1={priceY(p)} y2={priceY(p)} stroke="#FFFFFF" strokeOpacity={0.05} strokeDasharray="2 8" />
            ))}
          </g>
          <path d={area} fill="url(#drop-area)" clipPath="url(#drop-reveal)" />
          <LightStreak id="drop-climb" d={CLIMB_D} head={head.climb} width={3.6} from={[CHART.x, BASE_Y]} to={PEAK_PT} />
          <LightStreak id="drop-crash" d={CRASH_D} head={head.crash} color="red" width={3.8} bloom={12} from={PEAK_PT} to={CRASH_PT} />
          <LightStreak id="drop-grind" d={GRIND_D} head={head.grind} width={3.2} from={CRASH_PT} to={NOW_PT} />
          {headOn ? (
            <g transform={`translate(${head.x}, ${head.y})`} opacity={headFade}>
              <circle r={crashing ? 26 : 18} fill={crashing ? COLORS.red : '#DCE6F5'} opacity={0.6} filter="url(#drop-glow)" />
              <circle r={5.5} fill="#FFFFFF" />
            </g>
          ) : null}
          {[0, 1].map((k) => {
            const r = peakRing(k);
            return r > 0 && r < 1 ? (
              <circle key={k} cx={PEAK_PT[0]} cy={PEAK_PT[1]} r={8 + r * 50} fill="none" stroke="#F4F6FA" strokeWidth={2} opacity={(1 - r) * 0.9} />
            ) : null;
          })}
          {frame >= T.peak ? <circle cx={PEAK_PT[0]} cy={PEAK_PT[1]} r={6} fill="#F4F6FA" /> : null}
          {frame >= T.now ? <circle cx={NOW_PT[0]} cy={NOW_PT[1]} r={6} fill="#F4F6FA" /> : null}
          {/* bracket from the record to now */}
          <line x1={PEAK_PT[0] + 14} x2={BRACKET_X} y1={PEAK_PT[1]} y2={PEAK_PT[1]} stroke="#FFFFFF" strokeOpacity={0.28 * bracket} strokeWidth={1.5} strokeDasharray="5 7" />
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
        </svg>
        <Trail layers={4} lagInFrames={1} trailOpacity={0.5}>
          <Sparks />
        </Trail>
        <At x={PEAK_PT[0] + 60} y={PEAK_PT[1] - 50}>
          <Pill text={S2_PEAK} p={peakPill} size={28} />
        </At>
        <At x={NOW_PT[0] - 40} y={NOW_PT[1] + 54}>
          <Pill text={S2_NOW} p={nowPill} size={28} />
        </At>
        <At x={BRACKET_X - 100} y={(PEAK_PT[1] + NOW_PT[1]) / 2}>
          <Pill text={S2_DROP_PCT} p={pct} accent="red" size={34} style={{boxShadow: `0 0 34px ${hexA(COLORS.red, 0.55)}`}} />
        </At>
      </Station>

      <Headline>
        <ArabicText block={S2_DROP} size={LAYOUT.headlineSize - 4} start={8} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};
