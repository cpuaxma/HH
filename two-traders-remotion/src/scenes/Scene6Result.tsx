import React from 'react';
import {getStaticFiles, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {enterProgress, heroSpring} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {COPY, Lang} from '../i18n';
import {colors, fonts, layout} from '../theme';
import {BEAT, SCENES} from '../timeline';

const FROM = SCENES.result[0];
const l = (abs: number) => abs - FROM;

export const Scene6Result: React.FC<{lang: Lang}> = ({lang}) => {
  const c = COPY[lang];
  return (
    <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: lang === 'ar' ? 190 : 214}}>
      <AnimatedText lang={lang} lines={c.s6Caption} start={l(3010)} exit={l(3236)} fontSize={lang === 'ar' ? 40 : 38} />
    </div>
  );
};

// Hero entrance: scale 0.7 → 1, rotateY 25° → 0, soft overshoot
const hero = (frame: number, start: number) => {
  const s = heroSpring(frame, start);
  const fade = enterProgress(frame, start, 22);
  return {
    opacity: fade,
    filter: `blur(${((1 - fade) * 10).toFixed(2)}px)`,
    transform: `perspective(1400px) rotateY(${interpolate(s, [0, 1], [25, 0])}deg) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
  };
};

// Logo + large wordmark + tagline. Revealed out of the divider flare and held to the end.
export const EndLockup: React.FC<{lang: Lang; from: number}> = ({lang, from}) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];
  const L = (abs: number) => abs - from;
  const hasLogo = getStaticFiles().some((f) => f.name === 'logo.png');
  const logo = hero(frame, L(BEAT.logo));
  const word = hero(frame, L(BEAT.logo + 12));
  const glow = 0.55 + Math.sin(frame / 40) * 0.08;
  const glowIn = enterProgress(frame, L(BEAT.logo - 10), 40);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 540 - 520,
          top: 740 - 520,
          width: 1040,
          height: 1040,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,162,76,0.28) 0%, rgba(212,162,76,0.08) 40%, rgba(212,162,76,0) 66%)',
          opacity: glow * glowIn,
        }}
      />
      {hasLogo && (
        <div style={{position: 'absolute', left: 540 - 200, top: 540, width: 400, height: 400, ...logo}}>
          <Img src={staticFile('logo.png')} style={{width: 400, height: 400}} />
        </div>
      )}
      <div style={{position: 'absolute', left: 0, width: 1080, top: hasLogo ? 960 : 820, textAlign: 'center', ...word}}>
        <span
          style={{
            fontFamily: fonts.en,
            fontWeight: 600,
            fontSize: 104,
            letterSpacing: '0.01em',
            backgroundImage: `linear-gradient(180deg, ${colors.goldTo} 15%, ${colors.goldFrom} 85%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 24px rgba(212,162,76,0.35))',
          }}
        >
          Miran Gold
        </span>
      </div>
      <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: hasLogo ? 1112 : 970}}>
        <AnimatedText lang={lang} lines={c.s6Tagline} start={L(3262)} fontSize={lang === 'ar' ? 40 : 38} />
      </div>
    </>
  );
};

