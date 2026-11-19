import React from 'react';
import {COLORS, FONT, GOLD_GRADIENT} from '../config';
import {fontFamily} from '../fonts';

type Props = {
  text: string;
  /** center of the label */
  y: number;
  size: number;
  /** 0..1 reveal per character (LTR order) */
  charProgress: (i: number) => number;
  /** 0..1 gold underline */
  underline: number;
  /** 0..1 shine sweep position (left to right for Latin) */
  shine: number;
  opacity?: number;
  blur?: number;
};

/** "S&P 500" in Latin letters, always laid out left to right even inside the RTL video. */
export const IndexLabel: React.FC<Props> = ({text, y, size, charProgress, underline, shine, opacity = 1, blur = 0}) => {
  const chars = [...text];
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        filter: `drop-shadow(0 0 ${size * 0.25}px rgba(212,175,55,0.4)) blur(${blur}px)`,
      }}
    >
      <div dir="ltr" style={{direction: 'ltr', display: 'flex', fontFamily, fontWeight: FONT.weightBlack, fontSize: size, lineHeight: 1.1}}>
        {chars.map((c, i) => {
          const p = charProgress(i);
          // each letter gets its own band, staggered left to right, so it reads as one sweep
          const s = Math.min(1, Math.max(0, (shine * (chars.length + 3) - i) / 3));
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                opacity: Math.min(1, p * 1.4),
                transform: `translateY(${(1 - p) * 0.35}em) scale(${1.35 - 0.35 * p})`,
                filter: `blur(${(1 - Math.min(1, p)) * 14}px)`,
                backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,252,236,0.95) 50%, rgba(255,255,255,0) 60%), ${GOLD_GRADIENT}`,
                backgroundSize: '250% 100%, 100% 100%',
                backgroundPosition: `${(1 - s) * 100}% 0, 0 0`,
                backgroundRepeat: 'no-repeat',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: COLORS.gold,
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: size * 0.12,
          height: Math.max(3, size * 0.035),
          width: size * 3.6 * underline,
          borderRadius: 4,
          background: `linear-gradient(90deg, rgba(212,175,55,0), ${COLORS.goldLight}, rgba(212,175,55,0))`,
        }}
      />
    </div>
  );
};
