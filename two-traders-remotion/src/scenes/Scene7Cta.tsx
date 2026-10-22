import React from 'react';
import {getStaticFiles, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {smoothSpring} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {COPY, Lang} from '../i18n';
import {colors, ease, fonts, layout} from '../theme';
import {SCENES} from '../timeline';

const FROM = SCENES.cta[0];
const l = (abs: number) => abs - FROM;

// Gold pill with dark text and a single shine sweep
export const Scene7Cta: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];
  const ar = lang === 'ar';
  const s = smoothSpring(frame, l(3446), 30);
  const shine = interpolate(frame, [l(3478), l(3506)], [-0.3, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
  const hasIcon = getStaticFiles().some((f) => f.name === 'telegram.svg');
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1238,
          transform: `translate(-50%, 0) translateY(${(1 - s) * 30}px) scale(${0.9 + 0.1 * s})`,
          opacity: Math.min(1, s * 1.5),
          filter: `blur(${(1 - s) * 8}px)`,
        }}
      >
        <div
          dir={ar ? 'rtl' : 'ltr'}
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: ar ? '14px 46px 18px' : '20px 48px',
            borderRadius: 999,
            background: `linear-gradient(100deg, ${colors.goldFrom} 0%, ${colors.goldTo} 55%, ${colors.goldFrom} 100%)`,
            boxShadow: '0 16px 40px rgba(212,162,76,0.35), inset 0 1px 0 rgba(255,255,255,0.45)',
            whiteSpace: 'nowrap',
          }}
        >
          {hasIcon && <Img src={staticFile('telegram.svg')} style={{width: 40, height: 40}} />}
          <span style={{fontFamily: ar ? fonts.ar : fonts.en, fontWeight: 600, fontSize: ar ? 36 : 34, color: colors.ink}}>{c.ctaButton}</span>
          <div
            style={{
              position: 'absolute',
              top: -20,
              bottom: -20,
              width: 120,
              left: `${shine * 100}%`,
              transform: 'translateX(-50%) skewX(-20deg)',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>
      </div>
      <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: ar ? 1350 : 1362}}>
        <AnimatedText lang={lang} lines={[c.ctaLink]} start={l(3462)} fontSize={ar ? 32 : 30} color="rgba(245,241,232,0.85)" />
      </div>
    </>
  );
};
