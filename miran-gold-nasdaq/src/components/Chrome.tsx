import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, FONT, LAYOUT, SCENES, TRANSITION, VIDEO} from '../config';
import {FONT_FAMILY} from '../fonts';
import {clamp, EASE, rgba} from '../lib/motion';

/** The supplied logo, untouched: only positioned, scaled and faded. */
export const Logo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img src={staticFile('logo.png')} style={{width: size, height: size, display: 'block', objectFit: 'contain', ...style}} />
);

/** Small persistent logo at top center from scene 2 until the CTA's big logo takes over. */
export const TopLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const inStart = SCENES.whatIs.from - TRANSITION / 2;
  const outStart = SCENES.cta.from - TRANSITION / 2;
  const opacity =
    interpolate(frame, [inStart, inStart + 20], [0, 1], {...clamp, easing: EASE.out}) *
    interpolate(frame, [outStart, outStart + 14], [1, 0], {...clamp, easing: EASE.inOut});
  if (opacity <= 0) return null;
  const y = interpolate(frame, [inStart, inStart + 24], [-16, 0], {...clamp, easing: EASE.out});
  const {size, top} = LAYOUT.topLogo;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: (VIDEO.width - size) / 2,
        opacity,
        transform: `translateY(${y}px)`,
        filter: 'drop-shadow(0 0 18px rgba(212,175,55,0.22))',
      }}
    >
      <Logo size={size} />
    </div>
  );
};

/** Thin gold progress bar sitting on the bottom safe-zone line. */
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {height, inset, bottom} = LAYOUT.progress;
  const width = VIDEO.width - inset * 2;
  const p = interpolate(frame, [0, VIDEO.durationInFrames - 1], [0, 1], clamp);
  const appear = interpolate(frame, [0, 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: inset,
        width,
        bottom,
        height,
        borderRadius: height,
        background: rgba(COLORS.white, 0.08),
        opacity: appear,
        overflow: 'hidden',
        direction: 'ltr',
      }}
    >
      {/* Arabic reading direction: fills right → left */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: width * p,
          borderRadius: height,
          background: `linear-gradient(270deg, ${COLORS.goldDeep}, ${COLORS.gold} 70%, ${COLORS.goldLight})`,
          boxShadow: `0 0 12px ${rgba(COLORS.gold, 0.6)}`,
        }}
      />
    </div>
  );
};

/** Small gray "illustrative example" tag. */
export const ExampleLabel: React.FC<{text: string; frame: number; at: number; style?: React.CSSProperties}> = ({
  text,
  frame,
  at,
  style,
}) => {
  const p = interpolate(frame, [at, at + 14], [0, 1], {...clamp, easing: EASE.out});
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        fontFamily: FONT_FAMILY,
        fontWeight: FONT.bold,
        fontSize: 26,
        lineHeight: 1.3,
        color: COLORS.gray,
        padding: '4px 16px 6px',
        borderRadius: 999,
        border: `1.5px solid ${rgba(COLORS.gray, 0.45)}`,
        background: rgba('#000000', 0.25),
        opacity: p,
        transform: `translateY(${(1 - p) * 8}px)`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

