import React from 'react';
import {AbsoluteFill, interpolate, staticFile} from 'remotion';
import {BEATS, COLORS, FONT, LAYOUT, MOTION, SAFE, TEXT, VIDEO} from '../config';
import {Logo} from '../components/Chrome';
import {useSceneFrame} from '../components/SceneShell';
import {WordReveal} from '../components/WordReveal';
import {FONT_FAMILY} from '../fonts';
import {clamp, EASE, pulse, rgba, springAt} from '../lib/motion';

/** 30-33s (English outro): big logo reveal with a gold shimmer sweep, brand line, "Link in bio" pill, disclaimer. */
export const Scene6CTA: React.FC = () => {
  const frame = useSceneFrame();
  const b = BEATS.cta;
  const L = LAYOUT.cta;

  const logoSpring = springAt(frame, b.logoAt, {damping: 14, stiffness: 110, mass: 0.9});
  const logoOpacity = interpolate(frame, [b.logoAt - 6, b.logoAt + 10], [0, 1], clamp);
  const logoScale = interpolate(logoSpring, [0, 1], [0.72, 1]);
  const shimmer = interpolate(frame, [b.shimmerFrom, b.shimmerFrom + b.shimmerDur], [-0.6, 1.6], {...clamp, easing: EASE.inOut});
  const halo = 0.5 + pulse(frame, 40) * 0.5;

  const btn = springAt(frame, b.buttonAt, MOTION.punch);
  const btnScale = interpolate(btn, [0, 1], [0.6, 1]);
  const btnOpacity = interpolate(frame, [b.buttonAt, b.buttonAt + 8], [0, 1], clamp);
  const btnShine = interpolate(frame, [b.buttonAt + 14, b.buttonAt + 40], [-0.5, 1.5], {...clamp, easing: EASE.inOut});
  const footer = interpolate(frame, [b.footerAt, b.footerAt + 14], [0, 1], {...clamp, easing: EASE.out});

  const logoLeft = (VIDEO.width - L.logoSize) / 2;

  return (
    <AbsoluteFill>
      {/* halo behind the logo */}
      <div
        style={{
          position: 'absolute',
          left: VIDEO.width / 2 - L.logoSize,
          top: L.logoTop + L.logoSize / 2 - L.logoSize,
          width: L.logoSize * 2,
          height: L.logoSize * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rgba(COLORS.gold, 0.22 + halo * 0.1)} 0%, ${rgba(COLORS.gold, 0.06)} 40%, rgba(0,0,0,0) 68%)`,
          opacity: logoOpacity,
          transform: `scale(${0.8 + logoSpring * 0.2})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: logoLeft,
          top: L.logoTop,
          width: L.logoSize,
          height: L.logoSize,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <Logo size={L.logoSize} />
        {/* Shimmer: a light band clipped to the logo's own alpha; the logo file itself is untouched. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: `url(${staticFile('logo.png')})`,
            maskImage: `url(${staticFile('logo.png')})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            background: `linear-gradient(115deg, rgba(255,240,200,0) ${(shimmer - 0.14) * 100}%, rgba(255,240,200,0.5) ${shimmer * 100}%, rgba(255,240,200,0) ${(shimmer + 0.14) * 100}%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      <div style={{position: 'absolute', top: L.lineTop, left: SAFE.side, width: SAFE.contentWidth}}>
        <WordReveal
          lines={[TEXT.cta.line]}
          frame={frame}
          start={b.lineAt}
          stagger={b.stagger}
          fontSize={L.lineSize}
          fill="white"
          dir="ltr"
          wordFill={(_, word) => (TEXT.cta.brandWords.includes(word) ? 'gold' : undefined)}
          glow={0.5}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: L.buttonTop,
          left: 0,
          width: VIDEO.width,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          dir="ltr"
          style={{
            position: 'relative',
            overflow: 'hidden',
            fontFamily: FONT_FAMILY,
            fontWeight: FONT.extraBold,
            fontSize: L.buttonSize,
            lineHeight: 1.4,
            color: COLORS.bg,
            padding: '16px 64px 20px',
            borderRadius: 999,
            background: `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 55%, ${COLORS.goldDeep} 100%)`,
            boxShadow: `0 0 ${26 + halo * 24}px ${rgba(COLORS.gold, 0.35 + halo * 0.15)}, inset 0 2px 0 rgba(255,255,255,0.45)`,
            opacity: btnOpacity,
            transform: `scale(${btnScale})`,
            whiteSpace: 'nowrap',
          }}
        >
          {TEXT.cta.button}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(110deg, rgba(255,255,255,0) ${(btnShine - 0.15) * 100}%, rgba(255,255,255,0.55) ${btnShine * 100}%, rgba(255,255,255,0) ${(btnShine + 0.15) * 100}%)`,
            }}
          />
        </div>
      </div>

      <div
        dir="ltr"
        style={{
          position: 'absolute',
          top: L.footerTop,
          left: SAFE.side,
          width: SAFE.contentWidth,
          textAlign: 'center',
          fontFamily: FONT_FAMILY,
          fontWeight: FONT.bold,
          fontSize: L.footerSize,
          color: COLORS.gray,
          opacity: footer,
          transform: `translateY(${(1 - footer) * 10}px)`,
        }}
      >
        {TEXT.cta.footer}
      </div>
    </AbsoluteFill>
  );
};
