import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {CUES, OUTRO, SCENES, TEXT, VIDEO} from '../config';
import {outroFontFamily} from '../fonts';
import {AnimatedText} from '../components/AnimatedText';
import {useTextOnly} from '../components/Debug';
import {Scrim} from '../components/Scrim';
import {project} from '../lib/director';
import {hasPublicFile} from '../lib/files';
import {EASE, ease} from '../lib/motion';
import {RING_CENTER} from '../lib/track';

const from = SCENES.cta.from;
const c = CUES.cta;
const LOGO_SIZE = 280;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Hero spring with a soft overshoot (the Miran Gold outro's entrance). */
const hero = (frame: number, start: number) => spring({frame: frame - start, fps: VIDEO.fps, config: {damping: 14, stiffness: 120, mass: 1}});
/** Critically damped entrance (no overshoot). */
const enter = (frame: number, start: number) => spring({frame: frame - start, fps: VIDEO.fps, config: {damping: 200}, durationInFrames: 15});
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * 0:40-0:45 The Miran Gold outro, in English (rebuilt from miran-gold-history's Cta scene): the
 * track coils into a gold loop behind the logo, then the wordmark, the CTA, the Telegram button
 * with its shine and the disclaimer.
 */
export const S9CTA: React.FC = () => {
  const g = useCurrentFrame() + from;
  const textOnly = useTextOnly();
  const hasLogo = hasPublicFile('logo.png');
  const ring = project(g, RING_CENTER);
  const cy = ring.y - 22;

  const logoIn = hero(g, c.logo);
  const brand = enter(g, c.brand);
  const button = hero(g, c.button);
  const disclaimer = enter(g, c.disclaimer);
  const halo = 0.55 + 0.1 * Math.sin(g * 0.1);
  // the most recent button shine that has started
  const shineStart = c.buttonShine.filter((s) => g >= s).pop();
  const shine = shineStart === undefined ? 0 : ease(g, [shineStart, shineStart + 20], [0, 1], EASE.inOut);

  return (
    <AbsoluteFill>
      {/* logo with its halo, entering with the hero spring (scale + rotateY) */}
      {!textOnly && hasLogo ? (
        <div
          style={{
            position: 'absolute',
            left: 540 - LOGO_SIZE / 2,
            top: cy - LOGO_SIZE / 2,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            opacity: interpolate(logoIn, [0, 0.35], [0, 1], clamp),
            transform: `perspective(1400px) rotateY(${interpolate(logoIn, [0, 1], [25, 0])}deg) scale(${interpolate(logoIn, [0, 1], [0.7, 1])})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -60,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${rgba(OUTRO.goldA, 0.3 * halo)} 0%, ${rgba(OUTRO.goldA, 0)} 68%)`,
            }}
          />
          <Img src={staticFile('logo.png')} style={{position: 'relative', width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: '50%'}} />
        </div>
      ) : null}

      {/* MIRAN GOLD wordmark (large on its own when there is no logo file) */}
      <div
        dir="ltr"
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: hasLogo ? cy + LOGO_SIZE / 2 + 46 : cy,
          transform: `translateY(-50%) translateY(${(1 - brand) * 18}px)`,
          textAlign: 'center',
          opacity: brand,
          filter: `blur(${(1 - brand) * 8}px)`,
        }}
      >
        <span
          style={{
            fontFamily: outroFontFamily,
            fontWeight: OUTRO.weightKey,
            fontSize: hasLogo ? 42 : 96,
            letterSpacing: '0.24em',
            marginRight: '-0.24em',
            backgroundImage: OUTRO.gradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {TEXT.cta.brand}
        </span>
      </div>

      <Scrim y={1240} h={300} strength={0.5} opacity={ease(g, [c.text - 4, c.text + 8])} />
      <AnimatedText {...TEXT.cta.line1} dir="ltr" font={outroFontFamily} weight={OUTRO.weightKey} enter={c.text - from} size={52} y={1218} variant="rise" stagger={3} />
      <AnimatedText {...TEXT.cta.line2} dir="ltr" font={outroFontFamily} weight={OUTRO.weightBody} enter={c.text - from + 14} size={40} y={1284} variant="rise" />

      {/* the Telegram button with a skewed shine */}
      <div style={{position: 'absolute', left: 90, width: 900, top: 1404, display: 'flex', justifyContent: 'center'}}>
        <div
          dir="ltr"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '22px 60px 28px',
            borderRadius: 999,
            background: textOnly ? 'transparent' : `linear-gradient(180deg, ${OUTRO.goldB} 0%, ${OUTRO.goldA} 100%)`,
            boxShadow: textOnly ? 'none' : `0 18px 50px ${rgba(OUTRO.goldA, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.6)`,
            fontFamily: outroFontFamily,
            fontWeight: OUTRO.weightKey,
            fontSize: 40,
            lineHeight: 1.2,
            color: textOnly ? '#fff' : OUTRO.ink,
            whiteSpace: 'nowrap',
            opacity: Math.min(1, Math.max(0, button) * 1.5),
            transform: `translateY(-50%) translateY(${(1 - Math.min(1, button)) * 30}px) scale(${0.7 + 0.3 * button})`,
          }}
        >
          {TEXT.cta.button}
          {textOnly ? null : (
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
          )}
        </div>
      </div>

      <div
        dir="ltr"
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: 1516,
          textAlign: 'center',
          fontFamily: outroFontFamily,
          fontWeight: OUTRO.weightBody,
          fontSize: 24,
          color: 'rgba(245,241,232,0.5)',
          opacity: disclaimer,
          transform: `translateY(${(1 - disclaimer) * 10}px)`,
        }}
      >
        {TEXT.cta.disclaimer}
      </div>
    </AbsoluteFill>
  );
};
