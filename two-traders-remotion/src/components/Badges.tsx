import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {exitProgress, popSpring, smoothSpring, uiInOut} from '../anim';
import {Lang} from '../i18n';
import {colors, fonts} from '../theme';
import {CheckBadge, XBadge} from './Icons';

// "LOT ×N" badge. `punch` makes it land oversized and shake (Ray); otherwise a soft spring (Sam).
// `steps` lets the number jump (e.g. ×10 → ×20) at given frames.
export const LotBadge: React.FC<{
  steps: Array<{at: number; n: number}>;
  start: number;
  exit?: number;
  x: number;
  y: number;
  punch?: boolean;
  shakeUntil?: number;
  color: string;
  size?: number;
}> = ({steps, start, exit, x, y, punch, color, size = 44}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const q = exitProgress(frame, exit, 12);
  if (q >= 1) return null;
  const cur = [...steps].reverse().find((s) => s.at <= frame) ?? steps[0];
  const prev = steps[steps.indexOf(cur) - 1];
  const sinceStep = frame - cur.at;
  const landing = punch ? popSpring(frame, Math.max(start, cur.at)) : smoothSpring(frame, start, 20);
  const scale = punch ? interpolate(landing, [0, 1], [1.9, 1]) : 0.9 + 0.1 * landing;
  const shakeAmt = punch ? Math.max(0, 1 - sinceStep / 40) * 7 : 0;
  const sx = (random(`lot-x-${Math.floor(frame / 2)}`) * 2 - 1) * shakeAmt;
  const sy = (random(`lot-y-${Math.floor(frame / 2)}`) * 2 - 1) * shakeAmt;
  const flip = prev ? smoothSpring(frame, cur.at, 12) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translate(${sx}px, ${sy}px) scale(${scale * (1 - q * 0.2)})`,
        opacity: Math.min(1, (frame - start) / 6) * (1 - q),
        filter: q > 0 ? `blur(${q * 8}px)` : undefined,
      }}
    >
      <bdi
        dir="ltr"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: `${size * 0.18}px ${size * 0.42}px`,
          borderRadius: size * 0.4,
          background: `${color}26`,
          border: `2px solid ${color}`,
          boxShadow: `0 0 ${punch ? 30 : 12}px ${color}55`,
          fontFamily: fonts.en,
          fontWeight: 600,
          fontSize: size,
          color: '#fff',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{fontWeight: 300, fontSize: size * 0.62, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em'}}>LOT</span>
        <span style={{position: 'relative', display: 'inline-block'}}>
          {prev && flip < 1 && (
            <span style={{position: 'absolute', left: 0, top: 0, opacity: 1 - flip, transform: `translateY(${-flip * size * 0.7}px)`}}>×{prev.n}</span>
          )}
          <span style={{display: 'inline-block', opacity: flip, transform: `translateY(${(1 - flip) * size * 0.7}px)`}}>×{cur.n}</span>
        </span>
      </bdi>
    </div>
  );
};

// Small status chip ("SL hit", "TP hit")
export const Chip: React.FC<{lang: Lang; kind: 'x' | 'check'; text: string; start: number; exit?: number; x: number; y: number}> = ({
  lang,
  kind,
  text,
  start,
  exit,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const a = uiInOut(frame, start, exit, 16, 20);
  if (frame < start || a.q >= 1) return null;
  const pop = 0.85 + 0.15 * popSpring(frame, start);
  const c = kind === 'x' ? colors.red : colors.green;
  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) ${a.transform} scale(${pop})`,
        opacity: a.opacity,
        filter: a.filter,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingBlock: 8,
        paddingInlineStart: 10,
        paddingInlineEnd: 18,
        borderRadius: 999,
        background: 'rgba(10,12,18,0.72)',
        border: `1.5px solid ${c}`,
        boxShadow: `0 0 18px ${c}44`,
        whiteSpace: 'nowrap',
      }}
    >
      {kind === 'x' ? <XBadge size={30} /> : <CheckBadge size={30} />}
      <span style={{fontFamily: lang === 'ar' ? fonts.ar : fonts.en, fontWeight: 600, fontSize: lang === 'ar' ? 24 : 23, color: '#fff'}}>{text}</span>
    </div>
  );
};
