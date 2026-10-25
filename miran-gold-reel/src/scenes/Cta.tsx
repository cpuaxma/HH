import React from 'react';
import {AbsoluteFill, Img, getStaticFiles, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {BRAND, S7_BUTTON, S7_CTA, S7_DISCLAIMER} from '../strings';
import {COLORS, EASE, FONT, GOLD_GRADIENT, SAFE, VIDEO} from '../theme';
import {ease, hero, heroStyle, hexA} from '../motion';

const HAS_LOGO = getStaticFiles().some((f) => f.name === 'logo.png');

const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const streaks = [
    {delay: 0, h: 140, blur: 30, opacity: 0.55},
    {delay: 2, h: 34, blur: 10, opacity: 0.95},
    {delay: 4, h: 70, blur: 18, opacity: 0.7},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {streaks.map((s, i) => {
        const p = interpolate(frame, [s.delay, s.delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
        if (p <= 0 || p >= 1) return null;
        const travel = interpolate(p, [0, 1], [-1500, 1500]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: VIDEO.width / 2 - 1600,
              top: VIDEO.height / 2 - s.h / 2,
              width: 3200,
              height: s.h,
              transform: `rotate(-58deg) translateY(${travel}px)`,
              background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${hexA(COLORS.goldB, s.opacity)} 35%, rgba(255,255,255,${s.opacity}) 50%, ${hexA(COLORS.goldB, s.opacity)} 65%, rgba(255,255,255,0) 100%)`,
              filter: `blur(${s.blur}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Cta: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  const logo = hero(frame, 10);
  const button = hero(frame, 62);
  const shine = ease(frame, 104, 30);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 540 - 260,
          top: 560 - 260,
          width: 520,
          height: 520,
          borderRadius: '50%',
          opacity: Math.min(1, logo),
          background: `radial-gradient(circle, ${hexA(COLORS.glow, 0.3)} 0%, ${hexA(COLORS.glow, 0)} 65%)`,
        }}
      />
      {HAS_LOGO ? (
        <div style={{position: 'absolute', left: 540 - 190, top: 560 - 190, width: 380, height: 380, ...heroStyle(logo)}}>
          <Img src={staticFile('logo.png')} style={{width: 380, height: 380}} />
        </div>
      ) : (
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            left: SAFE.side,
            right: SAFE.side,
            top: 480,
            textAlign: 'center',
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 120,
            lineHeight: 1.5,
            ...heroStyle(logo),
          }}
        >
          <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BRAND}</span>
        </div>
      )}

      <ArabicText block={S7_CTA} size={58} start={26} style={{position: 'absolute', top: 810, left: SAFE.side, right: SAFE.side}} />

      <div style={{position: 'absolute', top: 1030, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          dir="rtl"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '20px 64px',
            borderRadius: 999,
            background: GOLD_GRADIENT,
            color: COLORS.ink,
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 42,
            lineHeight: 1.5,
            boxShadow: `0 18px 50px ${hexA(COLORS.glow, 0.35)}`,
            ...heroStyle(button),
          }}
        >
          {S7_BUTTON}
          <div
            style={{
              position: 'absolute',
              top: -20,
              bottom: -20,
              width: 90,
              left: `${-30 + shine * 130}%`,
              opacity: shine > 0 && shine < 1 ? 1 : 0,
              transform: 'skewX(-20deg)',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>
      </div>

      <ArabicText
        block={{lines: [{text: S7_DISCLAIMER}]}}
        size={22}
        start={84}
        color={hexA(COLORS.text, 0.5)}
        style={{position: 'absolute', top: VIDEO.height - SAFE.bottom - 60, left: SAFE.side, right: SAFE.side}}
      />
      <Wipe />
    </AbsoluteFill>
  );
};
