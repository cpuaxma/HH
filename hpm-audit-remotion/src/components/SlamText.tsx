import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {HeadlineLine} from '../copy';
import {textWidth} from '../fonts';
import {clamp, exitP} from '../lib/anim';
import {C, FONT, HEADLINE_TOP, SAFE, SLAM, TEXT_MAX_X} from '../theme';

export type SlamVariant = 'plain' | 'boxed' | 'onRed';

const PAD_X = 22;
const TRACK = '-0.035em';

// Shared size for a headline: the largest size (≤ max) at which every line fits the safe width.
export const fitSize = (lines: HeadlineLine[], boxed: boolean) => {
  const avail = TEXT_MAX_X - SAFE.left - (boxed ? 2 * PAD_X : 0);
  const fits = lines.map((l) => (avail / textWidth(l.text, 100, 900, TRACK)) * 100);
  return Math.max(SLAM.minSize, Math.min(SLAM.maxSize, Math.floor(Math.min(...fits))));
};

const Words: React.FC<{line: HeadlineLine; base: string; key_: string}> = ({line, base, key_}) => (
  <>
    {line.text.split(' ').map((w, i, arr) => (
      <span key={i} style={{color: line.key?.includes(w) ? key_ : base}}>
        {w}
        {i < arr.length - 1 ? ' ' : ''}
      </span>
    ))}
  </>
);

// Kinetic headline: lines slam in on their beats (scale 1.4 → 1 in 6 frames) and stack;
// the whole block whips out left in 6 frames at `exitAt`. Motion blur comes from the text layer.
export const SlamText: React.FC<{
  lines: HeadlineLine[];
  at: number[];
  exitAt: number;
  variant?: SlamVariant;
  top?: number;
  size?: number;
}> = ({lines, at, exitAt, variant = 'plain', top = HEADLINE_TOP, size}) => {
  const frame = useCurrentFrame();
  if (frame < at[0] || frame >= exitAt + SLAM.exitFrames) return null;
  const boxed = variant === 'boxed';
  const fs = size ?? fitSize(lines, boxed);
  const lineH = fs * (boxed ? 1.06 : 0.98);
  const gap = boxed ? 14 : 0;
  const base = variant === 'onRed' ? C.cream : C.charcoal;
  const key = variant === 'onRed' ? C.charcoal : C.red;
  const e = exitP(frame, exitAt, SLAM.exitFrames);

  return (
    <div style={{position: 'absolute', left: SAFE.left, top, transform: `translateX(${-1350 * e}px) skewX(${12 * e}deg)`}}>
      {lines.map((line, i) => {
        const t = frame - at[i];
        if (t < 0) return null;
        const scale = interpolate(t, [0, SLAM.frames], [SLAM.from, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const opacity = interpolate(t, [0, 2], [0.5, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: i * (lineH + gap),
              transform: `scale(${scale})`,
              transformOrigin: '0% 60%',
              opacity,
              whiteSpace: 'nowrap',
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: fs,
              lineHeight: `${lineH}px`,
              letterSpacing: TRACK,
              ...(boxed ? {background: C.cream, padding: `0 ${PAD_X}px`, borderRadius: 10, boxShadow: '0 10px 30px rgba(15,15,15,0.18)'} : {}),
            }}
          >
            <Words line={line} base={base} key_={key} />
          </div>
        );
      })}
    </div>
  );
};
