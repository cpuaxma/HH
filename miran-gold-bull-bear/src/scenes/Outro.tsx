import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ASSETS, COLORS, EASE, FONT, s, SAFE, SPRING} from '../constants';
import {clamp, ease, goldGlow, hexA, springAt} from '../lib';

const LOGO_SIZE = 500;
const LOGO_TOP = 320;

const TelegramIcon = () => (
  <svg viewBox="0 0 48 48" width={56} height={56}>
    <circle cx={24} cy={24} r={23} fill={COLORS.gold} />
    <path d="M11 23.5 L35 14 L31 35 L23.5 29 L19.5 33 L19.8 27.2 L31 17.5 L17 25.8 Z" fill={COLORS.bg} />
  </svg>
);

/** 6) Outro — logo reveal with a gold shine sweep, Telegram link, educational footer. */
export const Outro: React.FC<{hasLogo: boolean}> = ({hasLogo}) => {
  const frame = useCurrentFrame();
  const logoIn = springAt(frame, s(0.1), {damping: 15, stiffness: 110});
  const sweep = ease(frame, s(0.8), s(0.9), EASE.inOut);
  const halo = ease(frame, s(0.1), s(1.2));
  const link = ease(frame, s(1.7), s(0.6));
  const footer = ease(frame, s(2.3), s(0.6));

  const logoSrc = staticFile(ASSETS.logo);

  return (
    <AbsoluteFill>
      {/* Halo ring behind the logo */}
      <div
        style={{
          position: 'absolute',
          top: LOGO_TOP - 60,
          left: 540 - LOGO_SIZE / 2 - 60,
          width: LOGO_SIZE + 120,
          height: LOGO_SIZE + 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hexA(COLORS.gold, 0.28)} 0%, ${hexA(COLORS.gold, 0.08)} 45%, transparent 70%)`,
          opacity: halo,
          transform: `scale(${0.7 + 0.3 * halo})`,
        }}
      />

      {/* Logo (unaltered) + a shine pass masked to its own shape */}
      <div
        style={{
          position: 'absolute',
          top: LOGO_TOP,
          left: 540 - LOGO_SIZE / 2,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          opacity: interpolate(logoIn, [0, 0.4], [0, 1], clamp),
          transform: `scale(${0.82 + 0.18 * logoIn})`,
        }}
      >
        {hasLogo ? (
          <>
            <Img src={logoSrc} style={{width: '100%', height: '100%', display: 'block'}} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                WebkitMaskImage: `url(${logoSrc})`,
                WebkitMaskSize: '100% 100%',
                maskImage: `url(${logoSrc})`,
                maskSize: '100% 100%',
                background: `linear-gradient(115deg, transparent ${sweep * 160 - 40}%, rgba(255,246,214,0.75) ${sweep * 160 - 25}%, transparent ${sweep * 160 - 10}%)`,
                mixBlendMode: 'screen',
                opacity: sweep > 0 && sweep < 1 ? 1 : 0,
              }}
            />
          </>
        ) : (
          // Placeholder until public/logo.png is added.
          <div style={{width: '100%', height: '100%', borderRadius: '50%', border: `6px solid ${COLORS.gold}`, boxShadow: `0 0 40px ${hexA(COLORS.gold, 0.4)}`}} />
        )}
      </div>

      {/* Telegram link */}
      <div
        style={{
          position: 'absolute',
          top: LOGO_TOP + LOGO_SIZE + 70,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: link,
          transform: `translateY(${(1 - link) * 30}px)`,
        }}
      >
        <div
          dir="ltr"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '18px 40px 20px 26px',
            borderRadius: 999,
            border: `2.5px solid ${COLORS.gold}`,
            background: 'rgba(212,175,55,0.08)',
            boxShadow: `0 0 34px ${hexA(COLORS.gold, 0.25)}`,
          }}
        >
          <TelegramIcon />
          <span
            style={{
              fontFamily: FONT.family,
              fontWeight: FONT.bold,
              fontSize: 64,
              lineHeight: 1.2,
              color: COLORS.white,
              textShadow: goldGlow(0.6),
            }}
          >
            t.me/<span style={{color: COLORS.gold}}>Mirangold1</span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: 1920 - SAFE.bottom,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.semibold,
          fontSize: 32,
          lineHeight: 1.4,
          color: COLORS.muted,
          opacity: footer,
        }}
      >
        للأغراض التعليمية فقط
      </div>
    </AbsoluteFill>
  );
};
