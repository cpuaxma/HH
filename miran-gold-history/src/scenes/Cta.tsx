import React from 'react';
import {AbsoluteFill, getStaticFiles, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT} from '../theme';
import {BRAND, S12_BUTTON, S12_CTA, S12_DISCLAIMER} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {HeroLayer} from '../components/Hero';
import {ease, enter, hero, heroStyle, hexA} from '../motion';

// Uses public/logo.png when it exists; otherwise the gold text wordmark is shown large on its own.
const HAS_LOGO = getStaticFiles().some((f) => f.name === 'logo.png');
const LOGO = {y: 700, size: 340};
// After the light-sweep (local 0–14).
const T = {logo: 14, brand: 28, text: 32, button: 60, disclaimer: 70, shine: 96};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();

  const logoIn = hero(frame, T.logo);
  const brand = enter(frame, T.brand);
  const button = hero(frame, T.button);
  const disclaimer = enter(frame, T.disclaimer, 34);
  const shine = ease(frame, T.shine, 40, EASE.inOut);
  const halo = 0.55 + 0.1 * Math.sin(frame * 0.05);

  return (
    <AbsoluteFill>
      <HeroLayer from={T.logo} to={T.logo + 44}>
        <div
          style={{
            position: 'absolute',
            left: 540 - LOGO.size / 2,
            top: LOGO.y - LOGO.size / 2,
            width: LOGO.size,
            height: LOGO.size,
            ...heroStyle(logoIn),
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -70,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${hexA(COLORS.goldA, 0.3 * halo)} 0%, ${hexA(COLORS.goldA, 0)} 68%)`,
            }}
          />
          {HAS_LOGO ? (
            <Img src={staticFile('logo.png')} style={{width: LOGO.size, height: LOGO.size, borderRadius: '50%'}} />
          ) : null}
        </div>
      </HeroLayer>

      <At x={540} y={HAS_LOGO ? LOGO.y + LOGO.size / 2 + 62 : LOGO.y}>
        <Label
          text={BRAND}
          dir="ltr"
          size={HAS_LOGO ? 50 : 96}
          p={brand}
          weight={FONT.key}
          style={{letterSpacing: '0.24em', marginRight: '-0.24em', backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}
        />
      </At>

      <Headline top={1000}>
        <ArabicText block={S12_CTA} size={52} start={T.text} dir="ltr" />
      </Headline>

      <At x={540} y={1268}>
        <div
          dir="ltr"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '24px 64px 30px',
            borderRadius: 999,
            background: `linear-gradient(180deg, ${COLORS.goldB} 0%, ${COLORS.goldA} 100%)`,
            boxShadow: `0 18px 50px ${hexA(COLORS.goldA, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.6)`,
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 42,
            lineHeight: 1.2,
            color: COLORS.ink,
            whiteSpace: 'nowrap',
            opacity: Math.min(1, Math.max(0, button) * 1.5),
            transform: `translateY(${(1 - Math.min(1, button)) * 30}px) scale(${0.7 + 0.3 * button})`,
          }}
        >
          {S12_BUTTON}
          <div
            style={{
              position: 'absolute',
              top: -20,
              bottom: -20,
              width: 90,
              left: `${interpolate(shine, [0, 1], [-25, 115])}%`,
              transform: 'skewX(-22deg)',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
              opacity: shine > 0 && shine < 1 ? 1 : 0,
            }}
          />
        </div>
      </At>

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 1920 - LAYOUT.disclaimerBottom, textAlign: 'center'}}>
        <Label text={S12_DISCLAIMER} dir="ltr" size={22} p={disclaimer} weight={FONT.body} color="rgba(245,241,232,0.5)" />
      </div>
    </AbsoluteFill>
  );
};
