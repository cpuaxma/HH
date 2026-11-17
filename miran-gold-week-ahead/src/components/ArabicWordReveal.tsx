import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE, FONT, GOLD, MOTION, NUM} from '../brand';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Tokens with Latin letters, digits, $ or % are isolated so they never flip inside RTL text. */
const NEEDS_ISOLATE = /[A-Za-z0-9$%]/;

export const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

/** Isolated LTR run (numbers, $, %, tickers). */
export const Bdi: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <bdi dir="ltr" style={{unicodeBidi: 'isolate', direction: 'ltr', ...NUM, ...style}}>
    {children}
  </bdi>
);

/** Renders a plain string with any number/ticker tokens isolated. For static labels. */
export const ArText: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => {
  // consecutive Latin/number tokens ("FX Leaders") form one isolated LTR run
  const runs: {ltr: boolean; text: string}[] = [];
  for (const w of splitWords(text)) {
    const ltr = NEEDS_ISOLATE.test(w) && !/[\u0600-\u06FF]/.test(w);
    const last = runs[runs.length - 1];
    if (last && last.ltr && ltr) last.text += ` ${w}`;
    else runs.push({ltr, text: w});
  }
  return (
    <span dir="rtl" style={{unicodeBidi: 'isolate', ...style}}>
      {runs.map((r, i) => (
        <React.Fragment key={i}>
          {r.ltr ? <Bdi>{r.text}</Bdi> : r.text}
          {i < runs.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </span>
  );
};

export const goldText = (sheen = -1): React.CSSProperties => ({
  backgroundImage:
    sheen >= 0 && sheen <= 1
      ? `linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,250,230,0.95) 50%, rgba(255,255,255,0) 62%), ${GOLD}`
      : GOLD,
  backgroundSize: sheen >= 0 && sheen <= 1 ? '260% 100%, 100% 100%' : '100% 100%',
  backgroundPosition: sheen >= 0 && sheen <= 1 ? `${(1 - sheen) * 100}% 0, 0 0` : '0 0',
  backgroundRepeat: 'no-repeat',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

/**
 * Arabic text revealed WORD BY WORD (never per letter: letters are joined).
 * Each word: blur 8→0, y 24→0, opacity 0→1, 4-frame (~70ms) stagger, right-to-left order.
 * `exitAt`: words blur + fade out over 10 frames from that frame.
 */
export const ArabicWordReveal: React.FC<{
  text: string;
  start: number;
  size: number;
  weight?: number;
  gold?: boolean;
  color?: string;
  exitAt?: number;
  stagger?: number;
  style?: React.CSSProperties;
  sheenAt?: number;
}> = ({text, start, size, weight = FONT.arBold, gold = false, color = C.text, exitAt, stagger = MOTION.wordStagger, style, sheenAt}) => {
  const f = useCurrentFrame();
  const words = splitWords(text);
  const exit = exitAt === undefined ? 0 : interpolate(f, [exitAt, exitAt + 10], [0, 1], {...CLAMP, easing: EASE.exit});
  const sheen = sheenAt === undefined ? -1 : interpolate(f, [sheenAt, sheenAt + 30], [0, 1], CLAMP);
  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.26,
        fontFamily: FONT.ar,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.35,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const t = interpolate(f, [start + i * stagger, start + i * stagger + MOTION.wordEnter], [0, 1], {...CLAMP, easing: EASE.enter});
        const blur = MOTION.wordBlur * (1 - t) + exit * 8;
        const op = t * (1 - exit);
        const y = MOTION.wordRise * (1 - t) - exit * 14;
        const isolate = NEEDS_ISOLATE.test(w);
        const inner = isolate ? <Bdi>{w}</Bdi> : w;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: op,
              filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
              transform: `translateY(${y}px)`,
              paddingBottom: size * 0.08,
              ...(gold ? goldText(sheen) : {color}),
            }}
          >
            {inner}
          </span>
        );
      })}
    </div>
  );
};

/** Frames at which each word of a caption appears (shared with the SFX ticks). */
export const captionWordFrames = (l1: string, l2: string, from: number, oneLine?: boolean) => {
  const w1 = splitWords(l1).length;
  const w2 = splitWords(l2).length;
  const l2Start = from + (oneLine ? w1 * MOTION.wordStagger + 4 : w1 * MOTION.wordStagger + 10);
  const out: number[] = [];
  for (let i = 0; i < w1; i++) out.push(from + i * MOTION.wordStagger);
  for (let i = 0; i < w2; i++) out.push(l2Start + i * MOTION.wordStagger);
  return {frames: out, l2Start};
};
