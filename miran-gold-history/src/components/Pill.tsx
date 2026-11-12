import React from 'react';
import {Accent, ACCENT_GLOW, COLORS, FONT} from '../theme';
import {hexA} from '../motion';
import {toneStyle} from './ArabicText';

/** Small rounded label (price tags, "نصيحة", "الفيدرالي"). `p` drives a scale/fade pop. */
export const Pill: React.FC<{
  text: string;
  accent?: Accent;
  p: number;
  size?: number;
  solid?: boolean;
  textTone?: Accent | null;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({text, accent = 'gold', p, size = 28, solid = false, textTone, style, children}) => {
  const glow = ACCENT_GLOW[accent];
  const tone = textTone === undefined ? accent : textTone;
  return (
    <div
      dir="rtl"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: `${size * 0.22}px ${size * 0.7}px ${size * 0.32}px`,
        borderRadius: 999,
        fontFamily: FONT.family,
        fontSize: size,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hexA(glow, solid ? 0 : 0.8)}`,
        background: solid ? glow : `linear-gradient(180deg, ${hexA(glow, 0.2)}, ${hexA(COLORS.ink, 0.75)})`,
        boxShadow: `0 0 22px ${hexA(glow, 0.35)}`,
        opacity: Math.min(1, Math.max(0, p * 1.6)),
        transform: `scale(${0.7 + 0.3 * p})`,
        filter: p < 0.98 ? `blur(${(1 - Math.min(1, p)) * 6}px)` : undefined,
        ...style,
      }}
    >
      {children}
      <span style={tone === 'white' || tone === null ? {color: COLORS.text, fontWeight: FONT.key} : toneStyle(tone, FONT.key)}>{text}</span>
    </div>
  );
};
