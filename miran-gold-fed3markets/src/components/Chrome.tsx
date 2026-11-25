// Persistent UI: Miran mark (top-right), topic pill (top-left), disclaimer, plus the small
// SourceLine / IllustrativeTag / GlassCard pieces used inside scenes.
import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, GOLD_GRADIENT, LAYOUT} from '../brand';
import {SCENES} from '../timeline';
import {clamp, hexA} from '../motion';

export const chromeOpacity = (frame: number) =>
  interpolate(frame, [6, 30, SCENES.outro[0], SCENES.outro[0] + 18], [0, 1, 1, 0], clamp);

export const Sheen: React.FC<{frame: number; period?: number; offset?: number}> = ({frame, period = 150, offset = 0}) => {
  const p = ((frame + offset) % period) / period;
  const x = interpolate(p, [0, 0.45], [-60, 160], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(105deg, rgba(255,255,255,0) ${x - 20}%, rgba(255,250,230,0.55) ${x}%, rgba(255,255,255,0) ${x + 20}%)`,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

export const MiranMark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div dir="rtl" style={{position: 'absolute', top: LAYOUT.chromeTop, right: 60, display: 'flex', alignItems: 'center', gap: 14, opacity: chromeOpacity(frame)}}>
      <div style={{position: 'relative', width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 24px ${hexA(C.gold2, 0.35)}`}}>
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
        <Sheen frame={frame} period={240} />
      </div>
      <span style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 28, backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        ميران جولد
      </span>
    </div>
  );
};

export const TopicPill: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = (frame % 60) / 60;
  return (
    <div
      style={{
        position: 'absolute',
        top: LAYOUT.chromeTop + 8,
        left: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderRadius: 999,
        background: hexA(C.bg1, 0.72),
        border: `1px solid ${hexA(C.gold2, 0.3)}`,
        fontFamily: FONT.en,
        fontWeight: FONT.enSemi,
        fontSize: 19,
        letterSpacing: 1.2,
        color: C.text,
        opacity: chromeOpacity(frame),
      }}
    >
      <div style={{position: 'relative', width: 10, height: 10}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.gold2}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${C.gold2}`, transform: `scale(${1 + pulse * 2})`, opacity: 1 - pulse}} />
      </div>
      <bdi dir="ltr">FED · NASDAQ · S&amp;P · GOLD</bdi>
    </div>
  );
};

export const Disclaimer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div dir="rtl" style={{position: 'absolute', top: LAYOUT.disclaimerTop, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 24, color: C.text, opacity: 0.6 * chromeOpacity(frame)}}>
      محتوى تعليمي فقط وليس نصيحة استثمارية
    </div>
  );
};

/** Tiny slate source line under a real stat. `text` is shown LTR-isolated after "المصدر:". */
export const SourceLine: React.FC<{text: string; style?: React.CSSProperties; opacity?: number}> = ({text, style, opacity = 1}) => (
  <div dir="rtl" style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 18, color: C.slate, opacity, whiteSpace: 'nowrap', ...style}}>
    المصدر: <bdi dir="ltr">{text}</bdi>
  </div>
);

export const IllustrativeTag: React.FC<{style?: React.CSSProperties; opacity?: number}> = ({style, opacity = 1}) => (
  <div
    dir="rtl"
    style={{
      position: 'absolute',
      padding: '4px 14px',
      borderRadius: 999,
      border: `1px solid ${hexA(C.slate, 0.5)}`,
      background: hexA(C.bg0, 0.5),
      fontFamily: FONT.ar,
      fontWeight: FONT.arMedium,
      fontSize: 18,
      color: C.slate,
      opacity,
      ...style,
    }}
  >
    توضيحي
  </div>
);

/** Glassmorphism card: navy 70%, gold-tinted 1px border, inner top highlight, 24px radius. */
export const GlassCard: React.FC<{style?: React.CSSProperties; children?: React.ReactNode; border?: string}> = ({style, children, border}) => (
  <div
    style={{
      position: 'absolute',
      background: C.glassFill,
      border: `1px solid ${border ?? C.glassBorder}`,
      borderRadius: 24,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), 0 40px 80px rgba(0,0,0,0.45)`,
      backdropFilter: 'blur(14px)',
      ...style,
    }}
  >
    <div style={{position: 'absolute', left: 24, right: 24, top: 0, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,255,255,0))'}} />
    {children}
  </div>
);
