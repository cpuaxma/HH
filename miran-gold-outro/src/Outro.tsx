import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE, FONT, GOLD_GRADIENT, MOTION, T} from './theme';
import {BRAND, BUTTON, DISCLAIMER} from './strings';
import {Background, Vignette} from './components/Background';
import {Grain} from './components/Grain';
import {HeroLayer} from './components/Hero';
import {LightStreak} from './components/LightStreak';
import {Dust} from './components/Dust';
import {Wipe} from './components/Wipe';
import {SoundTrack} from './sound';
import {ease, enter, hero, heroStyle, hexA} from './motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Where the stack sits for the current frame size. `u` scales everything.
 * Vertical keeps clear of the platform UI (bottom 320px); wide and square centre the card.
 */
const useLayout = () => {
  const {width, height} = useVideoConfig();
  const portrait = height > width * 1.3;
  const u = portrait ? width / 1080 : (height / 1080) * 0.85;
  const cx = width / 2;
  const cy = portrait ? 920 * (height / 1920) : height / 2 - 20 * u;
  return {
    u,
    cx,
    logoY: cy - 190 * u,
    logoSize: 380 * u,
    brandY: cy + 80 * u,
    buttonY: cy + 220 * u,
    disclaimerY: portrait ? height - 356 * (height / 1920) : height - 56 * u,
  };
};

const At: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)'}}>{children}</div>
);

/** A short RTL label that enters as one word group (fade, blur, rise). */
const Label: React.FC<{text: string; size: number; p: number; weight: number; style?: React.CSSProperties}> = ({text, size, p, weight, style}) => {
  const blur = MOTION.wordBlur * (1 - p);
  return (
    <span
      dir="rtl"
      style={{
        display: 'inline-block',
        fontFamily: FONT.family,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        color: COLORS.text,
        opacity: p,
        filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
        transform: `translateY(${MOTION.wordRise * 0.6 * (1 - p)}px)`,
        ...style,
      }}
    >
      {text}
    </span>
  );
};

/** Diagonal glint that crosses its (overflow-hidden) parent while 0 < p < 1. */
const Glint: React.FC<{p: number; width: number; opacity?: number}> = ({p, width, opacity = 0.75}) =>
  p > 0 && p < 1 ? (
    <div
      style={{
        position: 'absolute',
        top: '-20%',
        bottom: '-20%',
        width,
        left: `${interpolate(p, [0, 1], [-30, 120])}%`,
        transform: 'skewX(-22deg)',
        background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${opacity}) 50%, rgba(255,255,255,0) 100%)`,
        mixBlendMode: 'screen',
      }}
    />
  ) : null;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const L = useLayout();

  const logoIn = hero(frame, T.logo);
  const brand = enter(frame, T.brand);
  const button = hero(frame, T.button);
  const disclaimer = enter(frame, T.disclaimer, 34);
  const logoGlint = ease(frame, T.logo + 40, 36, EASE.inOut);
  const buttonGlint = ease(frame, T.shine, 40, EASE.inOut);
  const halo = 0.55 + 0.12 * Math.sin(frame * 0.06);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.035]); // slow push-in keeps the hold alive
  const fade = interpolate(frame, [T.fadeOut, durationInFrames - 1], [0, 1], {...clamp, easing: EASE.inOut});

  // Comet orbit around the logo, drawn counter-clockwise from the top (right → left, like the text).
  const R = L.logoSize / 2 + 34 * L.u;
  const orbit = `M ${L.cx} ${L.logoY - R} A ${R} ${R} 0 1 0 ${L.cx} ${L.logoY + R} A ${R} ${R} 0 1 0 ${L.cx} ${L.logoY - R}`;
  const head = ease(frame, T.orbit, 44, EASE.inOut);
  const tail = ease(frame, T.orbit + 16, 44, EASE.inOut);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bgTop}}>
      <Background />

      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${L.cx}px ${L.logoY}px`}}>
        <HeroLayer from={T.logo} to={T.logo + 44}>
          <div
            style={{
              position: 'absolute',
              left: L.cx - L.logoSize / 2,
              top: L.logoY - L.logoSize / 2,
              width: L.logoSize,
              height: L.logoSize,
              ...heroStyle(logoIn),
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -80 * L.u,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${hexA(COLORS.goldA, 0.32 * halo)} 0%, ${hexA(COLORS.goldA, 0)} 68%)`,
              }}
            />
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 20px 60px rgba(0,0,0,0.55)`}}>
              <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', display: 'block'}} />
              <Glint p={logoGlint} width={L.logoSize * 0.28} opacity={0.45} />
            </div>
          </div>
        </HeroLayer>

        <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <LightStreak
            id="orbit"
            d={orbit}
            head={head}
            tail={tail}
            width={4 * L.u}
            bloom={10 * L.u}
            from={[L.cx + R, L.logoY - R]}
            to={[L.cx - R, L.logoY + R]}
            opacity={interpolate(tail, [0.8, 1], [1, 0], clamp)}
          />
        </svg>

        <Dust cx={L.cx} cy={L.logoY} u={L.u} start={T.logo + 10} />

        <At x={L.cx} y={L.brandY}>
          <Label
            text={BRAND}
            size={66 * L.u}
            p={brand}
            weight={FONT.key}
            style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}
          />
        </At>

        <At x={L.cx} y={L.buttonY}>
          <div
            dir="rtl"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: `${24 * L.u}px ${64 * L.u}px ${30 * L.u}px`,
              borderRadius: 999,
              background: `linear-gradient(180deg, ${COLORS.goldB} 0%, ${COLORS.goldA} 100%)`,
              boxShadow: `0 ${18 * L.u}px ${50 * L.u}px ${hexA(COLORS.goldA, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.6)`,
              fontFamily: FONT.family,
              fontWeight: FONT.key,
              fontSize: 42 * L.u,
              lineHeight: 1.2,
              color: COLORS.ink,
              whiteSpace: 'nowrap',
              opacity: Math.min(1, Math.max(0, button) * 1.5),
              transform: `translateY(${(1 - Math.min(1, button)) * 30 * L.u}px) scale(${0.7 + 0.3 * button})`,
            }}
          >
            {BUTTON}
            <Glint p={buttonGlint} width={90 * L.u} />
          </div>
        </At>
      </AbsoluteFill>

      <div style={{position: 'absolute', left: 0, right: 0, top: L.disclaimerY, transform: 'translateY(-50%)', textAlign: 'center'}}>
        <Label text={DISCLAIMER} size={22 * L.u} p={disclaimer} weight={FONT.body} style={{color: 'rgba(245,241,232,0.5)'}} />
      </div>

      <Sequence from={T.wipe} durationInFrames={24} name="Light-sweep wipe">
        <Wipe />
      </Sequence>
      <Vignette />
      <Grain />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: fade}} />
      <SoundTrack />
    </AbsoluteFill>
  );
};
