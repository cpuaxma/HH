import React from 'react';
import {useCurrentFrame} from 'remotion';
import {uiInOut} from '../anim';
import {Lang} from '../i18n';
import {colors, layout} from '../theme';
import {AnimatedText} from './AnimatedText';
import {CheckBadge, CoinDot, XBadge} from './Icons';

// Bottom-of-panel tag: icon badge + short line. Slides up 24px.
// Ray's warnings read in red; Sam's lines are white with a green check.
export const SideTag: React.FC<{
  lang: Lang;
  kind: 'x' | 'check' | 'coin';
  lines: string[];
  start: number;
  exit?: number;
  // panel centre x
  x: number;
  color?: string;
  weight?: number;
  fontSize?: number;
}> = ({lang, kind, lines, start, exit, x, color = colors.text, weight = 300, fontSize}) => {
  const frame = useCurrentFrame();
  const a = uiInOut(frame, start, exit, 24);
  if (frame < start || a.q >= 1) return null;
  const size = fontSize ?? (lang === 'ar' ? 29 : 27);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: layout.tags.top,
        height: layout.tags.bottom - layout.tags.top,
        display: 'flex',
        alignItems: 'center',
        transform: `translateX(-50%) ${a.transform}`,
        opacity: a.opacity,
        filter: a.filter,
      }}
    >
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 20px',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${colors.glassBorder}`,
          whiteSpace: 'nowrap',
        }}
      >
        {kind === 'x' ? <XBadge size={34} /> : kind === 'check' ? <CheckBadge size={34} /> : <CoinDot size={20} />}
        <AnimatedText lang={lang} lines={lines} start={start + 4} fontSize={size} weight={weight} color={color} align="start" />
      </div>
    </div>
  );
};
