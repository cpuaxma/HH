import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {enterProgress, heroEntrance, smoothSpring} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {BRAND, Lang, strings} from '../i18n';
import {colors, ease, fonts, layout, WIDTH} from '../theme';

const LOGO = {size: 360, y: 560};

const T = {logo: 3, wordmark: 26, lines: 45, button: 80, shine: 115, disclaimer: 90};

const Button: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = smoothSpring(frame, T.button);
  const shine = interpolate(frame, [T.shine, T.shine + 32], [-160, 560], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  const isAr = lang === 'ar';
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: WIDTH,
        top: 1150,
        display: 'flex',
        justifyContent: 'center',
        opacity: s,
        filter: `blur(${(1 - s) * 8}px)`,
        transform: `translateY(${(1 - s) * 24}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
      }}
    >
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: 100,
          padding: '0 64px',
          borderRadius: 50,
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(180deg, ${colors.goldTo} 0%, ${colors.goldFrom} 100%)`,
          boxShadow: '0 18px 50px rgba(200,150,62,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
          fontFamily: isAr ? fonts.ar : fonts.en,
          fontWeight: 600,
          fontSize: 36,
          color: colors.ink,
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        {/* Telegram paper plane */}
        <svg width={34} height={34} viewBox="0 0 24 24" style={{[isAr ? 'marginLeft' : 'marginRight']: 18}}>
          <path d="M21.5 3.5 2.8 10.7c-1 .4-1 1.8.1 2.1l4.7 1.5 1.8 5.6c.3.9 1.4 1.1 2 .5l2.6-2.5 4.9 3.6c.8.6 1.9.1 2.1-.9L23.9 5c.2-1.1-.9-2-2.4-1.5Zm-3.3 4.1-8.3 7.6-.3 3.2-1.4-4.3 10-6.5Z" fill={colors.ink} />
        </svg>
        <span>{strings[lang].ctaButton}</span>
        <div
          style={{
            position: 'absolute',
            top: -20,
            bottom: -20,
            left: shine,
            width: 90,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
            transform: 'skewX(-22deg)',
          }}
        />
      </div>
    </div>
  );
};

export const Scene7Cta: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = strings[lang];
  const isAr = lang === 'ar';
  const logo = heroEntrance(frame, T.logo);
  const halo = enterProgress(frame, T.logo + 10, 60);
  const disc = enterProgress(frame, T.disclaimer, 26);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: WIDTH / 2 - LOGO.size,
          top: LOGO.y - LOGO.size,
          width: LOGO.size * 2,
          height: LOGO.size * 2,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,162,76,0.28) 0%, rgba(212,162,76,0) 60%)',
          opacity: halo,
        }}
      />
      <Img
        src={staticFile('logo.png')}
        style={{
          position: 'absolute',
          left: WIDTH / 2 - LOGO.size / 2,
          top: LOGO.y - LOGO.size / 2,
          width: LOGO.size,
          height: LOGO.size,
          transform: logo.transform,
          opacity: logo.opacity,
          filter: `blur(${logo.blur}px) drop-shadow(0 20px 40px rgba(0,0,0,0.5))`,
        }}
      />

      {/* The brand name stays Latin in both languages */}
      <AnimatedText lang="en" lines={[`*${BRAND}*`]} start={T.wordmark} fontSize={88} style={{top: 770}} />

      <AnimatedText
        lang={lang}
        lines={s.ctaLines}
        start={T.lines}
        fontSize={isAr ? 46 : 42}
        style={{top: isAr ? 900 : 916}}
      />

      <Button lang={lang} />

      <div
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          left: layout.safeLeft,
          width: layout.safeWidth,
          top: 1536,
          textAlign: 'center',
          fontFamily: isAr ? fonts.ar : fonts.en,
          fontWeight: 300,
          fontSize: 22,
          lineHeight: 1.4,
          color: colors.disclaimer,
          opacity: disc,
          filter: `blur(${(1 - disc) * 6}px)`,
        }}
      >
        {s.disclaimer}
      </div>
    </AbsoluteFill>
  );
};
