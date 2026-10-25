import React from 'react';
import {useCurrentFrame} from 'remotion';
import {exitProgress, smoothSpring} from '../anim';
import {Lang} from '../i18n';
import {colors, HEIGHT} from '../theme';
import {AnimatedText} from './AnimatedText';

// Glass speech bubble near a character's head. Pops in (scale 0.85 → 1, spring),
// then its text animates inside. `tipX/tipY` is where the tail points (global px).
export const SpeechBubble: React.FC<{
  lang: Lang;
  lines: string[];
  start: number;
  exit: number;
  tipX: number;
  tipY: number;
  // bubble centre x (the tail is offset toward tipX)
  x: number;
  accent?: string;
  fontSize?: number;
}> = ({lang, lines, start, exit, tipX, tipY, x, accent, fontSize}) => {
  const frame = useCurrentFrame();
  const s = smoothSpring(frame, start, 22);
  const q = exitProgress(frame, exit, 14);
  if (frame < start || q >= 1) return null;
  const scale = (0.85 + 0.15 * s) * (1 - 0.06 * q);
  const size = fontSize ?? (lang === 'ar' ? 31 : 29);
  const tailOffset = Math.max(-120, Math.min(120, tipX - x));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        bottom: HEIGHT - tipY + 22,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: `calc(50% + ${tailOffset}px) calc(100% + 22px)`,
        opacity: Math.min(1, s * 1.6) * (1 - q),
        filter: q > 0 ? `blur(${(q * 8).toFixed(2)}px)` : undefined,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: lang === 'ar' ? '14px 28px 16px' : '20px 28px 22px',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${colors.glassBorder}`,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 18px 40px rgba(0,0,0,0.35)${accent ? `, inset 0 0 0 1px ${accent}22` : ''}`,
        }}
      >
        <AnimatedText lang={lang} lines={lines} start={start + 6} fontSize={size} />
        {/* tail */}
        <svg
          width={34}
          height={24}
          viewBox="0 0 34 24"
          style={{position: 'absolute', left: `calc(50% + ${tailOffset}px - 17px)`, bottom: -23, overflow: 'visible'}}
        >
          <path d="M 0 0 L 17 22 L 34 0" fill="rgba(255,255,255,0.06)" stroke={colors.glassBorder} strokeWidth={1} />
          <rect x={1} y={-2} width={32} height={3} fill="rgba(20,24,34,0.0)" />
        </svg>
      </div>
    </div>
  );
};
