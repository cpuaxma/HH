import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, EASE, FONT, LAYOUT} from '../brand';
import type {Edition} from '../edition';
import {PERSISTENT_OUT} from '../timeline';
import {Icon} from './Icons';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * v3 persistent UI, kept minimal (as in the reference):
 * top-right logo + "MIRAN GOLD", top-left one outlined pill, bottom-right disclaimer.
 * `introMode`: everything already on screen (used while the intro runs).
 */
export const Persistent: React.FC<{edition: Edition; outAt?: number; inAt?: number}> = ({edition, outAt = PERSISTENT_OUT, inAt = 0}) => {
  const f = useCurrentFrame();
  const inT = interpolate(f, [inAt, inAt + 18], [0, 1], {...CLAMP, easing: EASE.enter});
  const out = interpolate(f, [outAt - 14, outAt + 6], [0, 1], {...CLAMP, easing: EASE.exit});
  const op = inT * (1 - out);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: LAYOUT.topBarY,
          right: LAYOUT.marginX,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: op,
          transform: `translateY(${(1 - inT) * -12}px)`,
        }}
      >
        <span style={{fontFamily: FONT.en, fontWeight: 600, fontSize: 30, letterSpacing: 2.5, color: C.text}}>MIRAN GOLD</span>
        <div style={{width: 58, height: 58, borderRadius: '50%', overflow: 'hidden'}}>
          <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
        </div>
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: LAYOUT.topBarY + 2,
          left: LAYOUT.marginX,
          height: 56,
          padding: '0 24px',
          borderRadius: 999,
          border: `1.5px solid rgba(167,188,254,0.45)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: C.text,
          fontFamily: FONT.ar,
          fontWeight: 700,
          fontSize: 26,
          opacity: op,
          transform: `translateY(${(1 - inT) * -12}px)`,
        }}
      >
        <Icon name="calendar" size={28} color={C.peri} />
        <span>{edition.topPill}</span>
      </div>
      <Disclaimer text={edition.disclaimer} opacity={op} />
    </>
  );
};

export const Disclaimer: React.FC<{text: string; opacity?: number; dir?: 'rtl' | 'ltr'; font?: string}> = ({text, opacity = 1, dir = 'rtl', font = FONT.ar}) => (
  <div
    dir={dir}
    style={{
      position: 'absolute',
      top: LAYOUT.disclaimerY,
      left: LAYOUT.marginX,
      right: LAYOUT.marginX,
      fontFamily: font,
      fontWeight: 500,
      fontSize: 27,
      color: C.peri,
      opacity: 0.85 * opacity,
    }}
  >
    {text}
  </div>
);
