import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE, FONT, GOLD_GRADIENT, WORD} from '../brand';
import {clamp, springAt} from '../motion';

/** Split on spaces, keeping an `[LTR run]` plus trailing punctuation together as one word. */
export const tokenize = (text: string) => text.match(/\[[^\]]+\][^\s]*|[^\s]+/g) ?? [];

/** Renders one token: `[x]y` → <bdi>x</bdi>y (LTR run isolated inside the RTL line). */
export const Token: React.FC<{t: string}> = ({t}) => {
  const m = t.match(/^\[([^\]]+)\](.*)$/);
  if (!m) return <>{t}</>;
  return (
    <>
      <bdi dir="ltr" style={{unicodeBidi: 'isolate', fontVariantNumeric: 'tabular-nums'}}>
        {m[1]}
      </bdi>
      {m[2]}
    </>
  );
};

export type Fill = {color?: string; gradient?: string};

export const fillStyle = ({color, gradient}: Fill): React.CSSProperties =>
  gradient
    ? {backgroundImage: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingBottom: '0.12em'}
    : {color: color ?? C.text};

/**
 * RTL text animated per WORD (never per letter: Arabic letters stay joined).
 * Each word: blur 8→0, y 24→0, opacity 0→1, 4-frame (~70ms) stagger. In an RTL line the first
 * logical word sits on the right, so the stagger runs right → left.
 */
export const ArabicWordReveal: React.FC<{
  text: string;
  start: number;
  end?: number;
  size: number;
  weight?: number;
  fill?: Fill;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({text, start, end, size, weight = FONT.arBold, fill = {}, stagger = WORD.stagger, style}) => {
  const frame = useCurrentFrame();
  const words = tokenize(text);
  const out = end === undefined ? 0 : interpolate(frame, [end - 12, end], [0, 1], {...clamp, easing: EASE.exit});
  return (
    <div dir="rtl" style={{fontFamily: FONT.ar, fontSize: size, fontWeight: weight, lineHeight: 1.45, whiteSpace: 'nowrap', ...style}}>
      {words.map((w, i) => {
        const p = springAt(frame, start + i * stagger, {damping: 200, stiffness: 170});
        const o = interpolate(p, [0, 0.6], [0, 1], clamp) * (1 - out);
        const blur = WORD.blur * (1 - p) + 10 * out;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginInlineEnd: i < words.length - 1 ? '0.26em' : 0,
              opacity: o,
              transform: `translateY(${(1 - p) * WORD.rise - out * 12}px)`,
              filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
              ...fillStyle(fill),
            }}
          >
            <Token t={w} />
          </span>
        );
      })}
    </div>
  );
};

export const GOLD_FILL: Fill = {gradient: GOLD_GRADIENT};
