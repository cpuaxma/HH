import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONT, MOTION, SAFE, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {BEAT_FRAMES, HUD_SCENES, TIMELINE} from '../lib/timeline';
import {ChiliMark} from './ChiliMark';

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (mins: number) => {
  const m = Math.floor(mins);
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** 0..1 visibility of the HUD (spring in after the first HUD cut, out before the CTA). */
const useHudVisibility = () => {
  const f = useCurrentFrame();
  const first = HUD_SCENES[0];
  const last = HUD_SCENES[HUD_SCENES.length - 1];
  const inS = spr(f, first.cut + 2, MOTION.snap);
  const outAt = last.cut + last.duration - Math.ceil(last.outFrames / 2) - 2;
  const outS = spr(f, outAt, MOTION.smooth, 8);
  return clamp(inS) * (1 - outS);
};

/** The "day" thread: ticks to each scene's time at its cut. */
export const Clock: React.FC = () => {
  const f = useCurrentFrame();
  const vis = useHudVisibility();
  if (vis <= 0.001) return null;

  const stops = HUD_SCENES.map((s) => ({cut: s.cut, clock: (SCENES[s.name] as {clock?: string | null}).clock ?? null}));
  // Minutes value: springs from the previous stop's time to the next at each cut.
  let mins = toMin(stops.find((s) => s.clock)?.clock ?? '08:00') - 60;
  let shown = true;
  for (const s of stops) {
    if (f < s.cut - 6) break;
    if (!s.clock) {
      shown = false;
      continue;
    }
    shown = true;
    const target = toMin(s.clock);
    mins = mix(mins, target, clamp(spr(f, s.cut - 6, MOTION.soft, 22)));
  }
  if (!shown) return null;

  // Second hand steps once per beat with a springy overshoot.
  const beat = Math.floor(f / BEAT_FRAMES);
  const sinceBeat = f - beat * BEAT_FRAMES;
  const step = spr(sinceBeat, 0, MOTION.bouncy);
  const secAngle = (beat + step) * 30;
  const minAngle = (mins % 60) * 6;
  const hourAngle = ((mins / 60) % 12) * 30;
  const colon = 0.45 + 0.55 * (0.5 + 0.5 * Math.cos((f / BEAT_FRAMES) * Math.PI));
  const [hh, mm] = fmt(mins).split(':');
  const s = 56;

  return (
    <div
      data-qa="text"
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: SAFE.top,
        height: 76,
        padding: '0 26px 0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderRadius: 38,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: `0 6px 18px ${COLORS.shadow}`,
        border: `2px solid ${COLORS.line}`,
        opacity: vis,
        transform: `scale(${(0.9 + 0.1 * vis).toFixed(3)})`,
        transformOrigin: 'left center',
        fontFamily: FONT.family,
        fontWeight: FONT.bold,
        fontSize: SIZES.clock,
        color: COLORS.ink,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
      }}
    >
      <svg width={s} height={s} viewBox="-24 -24 48 48">
        <circle r={21} fill="none" stroke={COLORS.ink} strokeWidth={3} />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={0} y1={-17} x2={0} y2={i % 3 === 0 ? -14 : -15.5} stroke={COLORS.inkSoft} strokeWidth={2} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={2} x2={0} y2={-10} stroke={COLORS.ink} strokeWidth={3.4} strokeLinecap="round" transform={`rotate(${hourAngle})`} />
        <line x1={0} y1={2} x2={0} y2={-15} stroke={COLORS.ink} strokeWidth={2.6} strokeLinecap="round" transform={`rotate(${minAngle})`} />
        <line x1={0} y1={4} x2={0} y2={-17} stroke={COLORS.orange} strokeWidth={1.8} strokeLinecap="round" transform={`rotate(${secAngle})`} />
        <circle r={2.6} fill={COLORS.orange} />
      </svg>
      <span>
        {hh}
        <span style={{opacity: colon}}>:</span>
        {mm}
      </span>
    </div>
  );
};

/** Small chili logo mark, top-right, whole video except hook and CTA. */
export const LogoMark: React.FC = () => {
  const f = useCurrentFrame();
  const vis = useHudVisibility();
  if (vis <= 0.001) return null;
  const size = 80;
  const sway = Math.sin(f * 0.07) * 6;
  const glow = 0.35 + 0.25 * Math.sin(f * 0.11);
  return (
    <div
      data-qa="text"
      style={{
        position: 'absolute',
        left: SAFE.right - size,
        top: SAFE.top,
        boxSizing: 'border-box',
        width: size,
        height: size,
        borderRadius: size / 2,
        background: 'rgba(255,255,255,0.92)',
        border: `2px solid ${COLORS.line}`,
        boxShadow: `0 6px 18px ${COLORS.shadow}, 0 0 ${18 + glow * 16}px rgba(230,57,70,${(glow * 0.22).toFixed(3)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: vis,
        transform: `scale(${(0.6 + 0.4 * vis).toFixed(3)})`,
      }}
    >
      <ChiliMark width={54} color={COLORS.red} stroke={38} style={{transform: `rotate(${sway.toFixed(2)}deg)`}} />
    </div>
  );
};

// Silence unused import warnings in strict mode for TIMELINE (kept for debugging).
void TIMELINE;
