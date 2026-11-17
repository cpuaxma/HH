import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT} from '../brand';
import {ArText} from './ArabicWordReveal';

/**
 * Glassmorphism card: navy at 70%, 1px gold-tinted border (25%), 24px radius,
 * inner top highlight, soft drop shadow, and a sheen sweep that passes every few seconds.
 * `tilt` is the current rotateX in degrees (scenes settle it from 4–6° to 0).
 */
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  tilt?: number;
  sheenEvery?: number;
  sheenOffset?: number;
  glow?: string;
  radius?: number;
}> = ({children, style, tilt = 0, sheenEvery = 180, sheenOffset = 0, glow, radius = 24}) => {
  const f = useCurrentFrame();
  const cyc = ((f + sheenOffset) % sheenEvery) / 40; // sweep takes 40 frames
  const sheenX = cyc <= 1 ? -60 + cyc * 220 : -100;
  return (
    <div style={{perspective: 1400, ...style}}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: radius,
          background: C.glassFill,
          border: `1px solid ${C.glassBorder}`,
          boxShadow: `inset 0 1px 0 ${C.glassHi}, 0 30px 60px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.3)${glow ? `, 0 0 50px ${glow}` : ''}`,
          backdropFilter: 'blur(18px)',
          transform: `rotateX(${tilt}deg)`,
          transformOrigin: '50% 100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 30%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sheenX}%`,
            width: '35%',
            background: 'linear-gradient(105deg, rgba(247,222,140,0) 0%, rgba(247,222,140,0.10) 50%, rgba(247,222,140,0) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div>
      </div>
    </div>
  );
};

/** Small tag, e.g. "توضيحي" (illustrative) on any non-real chart. */
export const Tag: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <span
    dir="rtl"
    style={{
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: 999,
      border: `1px solid rgba(138,147,173,0.45)`,
      color: C.label,
      fontFamily: FONT.ar,
      fontSize: 22,
      fontWeight: 500,
      background: 'rgba(6,11,26,0.5)',
      ...style,
    }}
  >
    {text}
  </span>
);

/** Tiny source line under a stat. */
export const Source: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div dir="rtl" style={{fontFamily: FONT.ar, fontSize: 21, color: C.label, opacity: 0.85, fontWeight: 500, ...style}}>
    <ArText text={text} />
  </div>
);
