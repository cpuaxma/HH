import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CHROME_GRADIENT, COLORS, EASE, ERA_YEAR, FONT, LAYOUT, SceneKey, SCENES, TIMELINE, VIDEO} from '../theme';
import {arYear} from '../numbers';
import {headAt, MODERN_T} from '../modernChart';
import {enter, hexA} from '../motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = 560;
const H = 124;
const ROLL = {before: 14, after: 26};

const KEYS = Object.keys(SCENES) as SceneKey[];

/** The year at a frame: it rolls between eras at each scene start; in the modern scene it follows the chart. */
export const yearAt = (frame: number) => {
  const modernLocal = frame - SCENES.modern[0];
  if (modernLocal >= 0 && frame < SCENES.cube[0]) {
    return modernLocal < MODERN_T.draw ? 1971 : Math.min(2026, headAt(modernLocal).year);
  }
  let y = ERA_YEAR.hook as number;
  KEYS.forEach((k, i) => {
    const target = ERA_YEAR[k];
    if (target === undefined || i === 0) return;
    const prevYear = y;
    const s = SCENES[k][0];
    const t = interpolate(frame, [s - ROLL.before, s + ROLL.after], [0, 1], {...clamp, easing: EASE.inOut});
    y = prevYear + (target - prevYear) * t;
  });
  return y;
};

/** Position of the marker on the timeline (0 = first tick … 7 = last), eased between ticks. */
const markerAt = (year: number) => {
  for (let i = 0; i < TIMELINE.length - 1; i++) {
    const a = TIMELINE[i];
    const b = TIMELINE[i + 1];
    if (year <= b) return i + Math.max(0, (year - a) / (b - a));
  }
  return TIMELINE.length - 1;
};

/** Glass pill under the wordmark: a big chrome-gold year that rolls, and a timeline with a glowing marker. */
export const YearHud: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = enter(frame, 40, 36);
  const out = interpolate(frame, [SCENES.cta[0] + 2, SCENES.cta[0] + 18], [0, 1], {...clamp, easing: EASE.exit});
  if (appear <= 0.001 || out >= 0.999) return null;
  const year = yearAt(frame);
  const speed = Math.abs(yearAt(frame + 1) - yearAt(frame));
  const pos = markerAt(year);
  const line = {x0: W - 50, x1: 50, y: 92}; // RTL: earliest tick on the right
  const tickX = (i: number) => line.x0 + ((line.x1 - line.x0) * i) / (TIMELINE.length - 1);
  const mx = tickX(pos);
  const pull = interpolate(frame, [SCENES.today[0] + 30, SCENES.today[0] + 200], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: LAYOUT.hudTop,
        left: (VIDEO.width - W) / 2,
        width: W,
        height: H,
        borderRadius: 30,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))',
        border: `1px solid ${hexA(COLORS.goldB, 0.2)}`,
        boxShadow: `0 18px 50px rgba(0,0,0,0.35), 0 0 30px ${hexA(COLORS.goldA, 0.12)}`,
        backdropFilter: 'blur(14px)',
        opacity: appear * (1 - out),
        transform: `translateY(${(1 - appear) * -16}px) scale(${0.96 + 0.04 * appear})`,
        filter: appear < 0.99 || out > 0.01 ? `blur(${(1 - appear) * 8 + out * 10}px)` : undefined,
      }}
    >
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.key,
          fontSize: 50,
          lineHeight: 1.15,
          backgroundImage: CHROME_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: speed > 3 ? `blur(${Math.min(2.2, speed / 60)}px)` : undefined,
        }}
      >
        {arYear(year)}
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={line.x1} x2={line.x0} y1={line.y} y2={line.y} stroke="#FFFFFF" strokeOpacity={0.16} strokeWidth={2} />
        <line x1={mx} x2={line.x0} y1={line.y} y2={line.y} stroke={COLORS.goldB} strokeOpacity={0.8} strokeWidth={2} />
        {TIMELINE.map((_, i) => {
          const passed = i <= pos + 0.001;
          const lit = Math.max(passed ? 1 : 0, pull);
          return <circle key={i} cx={tickX(i)} cy={line.y} r={4} fill={lit ? COLORS.goldB : '#2A3346'} stroke={COLORS.goldB} strokeOpacity={0.6} />;
        })}
        <circle cx={mx} cy={line.y} r={11} fill={COLORS.goldB} opacity={0.35} style={{filter: 'blur(4px)'}} />
        <circle cx={mx} cy={line.y} r={6} fill="#FFF6DC" />
      </svg>
    </div>
  );
};
