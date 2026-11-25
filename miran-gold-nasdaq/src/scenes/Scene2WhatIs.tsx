import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {BEATS, FONT, GOLD_TEXT_GRADIENT, LAYOUT, MOTION, SAFE, TEXT} from '../config';
import {useSceneFrame} from '../components/SceneShell';
import {WordReveal} from '../components/WordReveal';
import {FONT_FAMILY} from '../fonts';
import {clamp, pulse, springAt} from '../lib/motion';
import {counterValue} from '../lib/timeline';

/** 3-9s: "Nasdaq-100" title with a 0 → 100 counter; the dot grid is drawn by CompanyField. */
export const Scene2WhatIs: React.FC = () => {
  const frame = useSceneFrame();
  const b = BEATS.whatIs;
  const L = LAYOUT.whatIs;
  const value = Math.round(counterValue(frame));
  const landed = springAt(frame, b.counterTo, MOTION.punch);
  const counterScale = value >= TEXT.whatIs.counterTo ? interpolate(landed, [0, 0.5, 1], [1, 1.14, 1]) : 1;
  const counterIn = interpolate(frame, [b.titleAt + 6, b.titleAt + 16], [0, 1], clamp);
  const glow = 0.35 + pulse(frame) * 0.35;

  return (
    <AbsoluteFill>
      {/* Title row: words + counter (in RTL the number sits at the left end, as in "مؤشر ناسداك 100") */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: L.titleTop,
          left: SAFE.side,
          width: SAFE.contentWidth,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: '0.26em',
          fontSize: L.titleSize,
        }}
      >
        <WordReveal lines={[TEXT.whatIs.titleWords.join(' ')]} frame={frame} start={b.titleAt} stagger={b.stagger} fontSize={L.titleSize} fill="gold" glow={glow} lineHeight={1.3} />
        <span
          style={{
            display: 'inline-block',
            width: '1.72em',
            textAlign: 'right',
            direction: 'ltr',
            unicodeBidi: 'isolate',
            fontFamily: FONT_FAMILY,
            fontWeight: FONT.extraBold,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.3,
            backgroundImage: GOLD_TEXT_GRADIENT,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            opacity: counterIn,
            transform: `scale(${counterScale})`,
            transformOrigin: 'right center',
            filter: `drop-shadow(0 0 ${18 + glow * 22}px rgba(212,175,55,${0.25 + glow * 0.3}))`,
          }}
        >
          {value}
        </span>
      </div>

      <div style={{position: 'absolute', top: L.bodyTop, left: SAFE.side, width: SAFE.contentWidth}}>
        <WordReveal lines={TEXT.whatIs.body} frame={frame} start={b.bodyAt} stagger={b.stagger} fontSize={L.bodySize} weight={FONT.bold} fill="white" />
      </div>
    </AbsoluteFill>
  );
};
