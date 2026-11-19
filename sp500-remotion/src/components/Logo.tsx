import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, FONT, GOLD_GRADIENT, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {hasPublicFile} from '../lib/files';

type Props = {
  /** center of the logo */
  y: number;
  size: number;
  /** 0..1 shine sweep */
  shine: number;
  opacity: number;
  scale: number;
};

/** /public/logo.png if present, otherwise the words "Miran Gold" in gold. */
export const Logo: React.FC<Props> = ({y, size, shine, opacity, scale}) => {
  const hasLogo = hasPublicFile('logo.png');
  const band = `linear-gradient(115deg, rgba(255,255,255,0) ${shine * 160 - 40}%, rgba(255,250,225,0.85) ${shine * 160 - 25}%, rgba(255,255,255,0) ${shine * 160 - 10}%)`;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
      }}
    >
      {hasLogo ? (
        <>
          <div style={{position: 'relative', width: size, height: size, filter: 'drop-shadow(0 0 28px rgba(212,175,55,0.35))'}}>
            <Img src={staticFile('logo.png')} style={{width: size, height: size, objectFit: 'contain'}} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: band,
                WebkitMaskImage: `url(${staticFile('logo.png')})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                mixBlendMode: 'screen',
              }}
            />
          </div>
          <div
            dir="ltr"
            style={{
              marginTop: size * 0.12,
              fontFamily,
              fontWeight: FONT.weightBold,
              fontSize: size * 0.16,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: COLORS.goldLight,
              paddingLeft: '0.28em',
              opacity: 0.85,
            }}
          >
            {TEXT.cta.brand}
          </div>
        </>
      ) : (
        <div
          dir="ltr"
          style={{
            fontFamily,
            fontWeight: FONT.weightBlack,
            fontSize: size * 0.36,
            lineHeight: 1.2,
            backgroundImage: `${band}, ${GOLD_GRADIENT}`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: COLORS.gold,
            filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.4))',
          }}
        >
          {TEXT.cta.brand}
        </div>
      )}
    </div>
  );
};
