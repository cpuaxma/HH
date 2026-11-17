import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, LAYOUT, SPRING} from '../brand';
import type {Edition} from '../edition';
import {PERSISTENT_OUT, STRIP} from '../timeline';
import {goldText} from './ArabicWordReveal';
import {Icon} from './Icons';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Top-right: logo mark + "MIRAN GOLD" (English wordmark). Top-left: date pill. Bottom: disclaimer. */
export const Persistent: React.FC<{edition: Edition; disclaimerOn?: boolean}> = ({edition, disclaimerOn}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [PERSISTENT_OUT - 14, PERSISTENT_OUT + 6], [0, 1], {...CLAMP, easing: EASE.exit});
  const markIn = interpolate(f, [0, 22], [0, 1], {...CLAMP, easing: EASE.enter});
  const pill = spring({frame: f - STRIP.inAt + 6, fps, config: SPRING.pill});
  const sheenCycle = (f % 240) / 50;
  const sheen = sheenCycle <= 1 ? sheenCycle : -1;
  const discIn = disclaimerOn ? 1 : interpolate(f, [8, 30], [0, 1], CLAMP);

  return (
    <>
      {/* wordmark, top-right */}
      <div
        style={{
          position: 'absolute',
          top: LAYOUT.topBarY,
          right: 140,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: markIn * (1 - out),
          transform: `translateY(${(1 - markIn) * -16}px)`,
        }}
      >
        <span style={{fontFamily: FONT.en, fontWeight: 600, fontSize: 26, letterSpacing: 4.5, ...goldText(sheen)}}>MIRAN GOLD</span>
        <div style={{width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 18px rgba(212,175,55,0.35)'}}>
          <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
        </div>
      </div>

      {/* date pill, top-left */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: LAYOUT.topBarY + 4,
          left: 88,
          height: 56,
          padding: '0 22px',
          borderRadius: 999,
          border: `1px solid ${C.glassBorder}`,
          background: C.glassFill,
          boxShadow: `inset 0 1px 0 ${C.glassHi}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: C.text,
          fontFamily: FONT.ar,
          fontWeight: 700,
          fontSize: 28,
          opacity: Math.min(1, pill * 1.3) * (1 - out),
          transform: `translateY(${(1 - pill) * -40}px) scale(${0.85 + 0.15 * pill})`,
          transformOrigin: 'left center',
        }}
      >
        <Icon name="calendar" size={30} color={C.gold1} t={f} />
        <span>{edition.datePill}</span>
      </div>

      {/* disclaimer, always visible */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: LAYOUT.disclaimerY,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.ar,
          fontWeight: 500,
          fontSize: 24,
          color: C.text,
          opacity: 0.6 * discIn * (1 - out),
        }}
      >
        {edition.disclaimer}
      </div>
    </>
  );
};

/** The disclaimer alone (used during the intro so it is on screen from frame 0). */
export const DisclaimerOnly: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: LAYOUT.disclaimerY,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT.ar,
        fontWeight: 500,
        fontSize: 24,
        color: C.text,
        opacity: 0.6 * interpolate(f, [0, 12], [0, 1], CLAMP),
      }}
    >
      {text}
    </div>
  );
};
