import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import {Accent, COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT, MOTION} from '../theme';
import type {TextBlock} from '../strings';
import {enter} from '../motion';

type Tone = Accent | null;
const strip = (w: string) => w.replace(/[.,،؛؟?!…:"«»()]/g, '');

const toneWords = (words: string[], accents: TextBlock['accents'] = {}): Tone[] => {
  const out: Tone[] = words.map(() => null);
  (Object.keys(accents) as Accent[]).forEach((tone) =>
    (accents[tone] ?? []).forEach((phrase) => {
      const parts = phrase.split(' ');
      for (let i = 0; i + parts.length <= words.length; i++) {
        if (parts.every((p, j) => strip(words[i + j]) === p)) parts.forEach((_, j) => (out[i + j] = tone));
      }
    }),
  );
  return out;
};

export const toneStyle = (tone: Tone, weight: number): React.CSSProperties => {
  if (tone === 'gold') {
    return {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: FONT.key};
  }
  if (tone === null) return {fontWeight: weight};
  const color = {red: COLORS.red, green: COLORS.green, amber: COLORS.amber, white: COLORS.text}[tone];
  return {color, fontWeight: FONT.key};
};

/**
 * RTL text animated per WORD (never per letter, so Arabic joining is intact).
 * Words enter right to left: opacity 0→1, blur 8→0, translateY 18→0, 4-frame stagger.
 * Each line is kept on one line: if it is wider than `maxWidth` it is scaled down to fit
 * (measured once the font is ready). If `exitEnd` is set, words blur + fade out (40% faster)
 * so the last one is gone at exitEnd.
 */
export const ArabicText: React.FC<{
  block: TextBlock;
  size: number;
  start?: number;
  exitEnd?: number;
  maxWidth?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({block, size, start = 0, exitEnd, maxWidth = LAYOUT.contentWidth, color = COLORS.text, weight = FONT.body, style}) => {
  const frame = useCurrentFrame();
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [fit, setFit] = useState<number[] | null>(null);
  const [handle] = useState(() => delayRender('Fitting Arabic lines'));

  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      setFit(refs.current.map((el) => (el ? Math.min(1, (maxWidth * 0.95) / Math.max(1, el.getBoundingClientRect().width)) : 1)));
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [handle, maxWidth]);

  let cursor = 0;
  const lines = block.lines.map((line) => {
    if (line.delay !== undefined) cursor = line.delay;
    const words = line.text.split(' ');
    const tones = toneWords(words, block.accents);
    const items = words.map((w, i) => {
      const s = cursor;
      cursor += MOTION.wordStagger;
      return {w, tone: tones[i], s};
    });
    return {line, items};
  });

  const total = lines.reduce((n, l) => n + l.items.length, 0);
  const exitDur = MOTION.wordEnter * MOTION.exitFactor;
  const exitStagger = MOTION.wordStagger * MOTION.exitFactor;
  const exitStart = exitEnd === undefined ? null : exitEnd - exitDur - (total - 1) * exitStagger;

  let idx = 0;
  return (
    <div dir="rtl" style={{fontFamily: FONT.family, textAlign: 'center', lineHeight: FONT.lineHeight, color, ...style}}>
      {lines.map(({line, items}, li) => {
        const nominal = line.size ?? size;
        const fontSize = Math.max(LAYOUT.minSize, nominal * (fit?.[li] ?? 1));
        return (
          <div key={li} style={{fontSize, whiteSpace: 'nowrap', visibility: fit ? 'visible' : 'hidden'}}>
            <span ref={(el) => (refs.current[li] = el)} style={{display: 'inline-block'}}>
              {items.map(({w, tone, s}, wi) => {
                const i = idx++;
                const p = enter(frame, start + s);
                const q =
                  exitStart === null
                    ? 0
                    : interpolate(frame, [exitStart + i * exitStagger, exitStart + i * exitStagger + exitDur], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                        easing: EASE.exit,
                      });
                const blur = MOTION.wordBlur * (1 - p) + MOTION.wordBlur * q;
                return (
                  <React.Fragment key={wi}>
                    {wi > 0 ? ' ' : null}
                    <span
                      style={{
                        display: 'inline-block',
                        opacity: p * (1 - q),
                        filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
                        transform: `translateY(${MOTION.wordRise * (1 - p)}px)`,
                        ...toneStyle(tone, weight),
                      }}
                    >
                      {w}
                    </span>
                  </React.Fragment>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** A short label (pill, card caption) that enters and exits as one word group. */
export const Label: React.FC<{
  text: string;
  size: number;
  p: number;
  q?: number;
  tone?: Tone;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({text, size, p, q = 0, tone = null, weight = FONT.key, color = COLORS.text, style}) => {
  const blur = MOTION.wordBlur * (1 - p) + MOTION.wordBlur * q;
  return (
    <span
      dir="rtl"
      style={{
        display: 'inline-block',
        fontFamily: FONT.family,
        fontSize: size,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        color,
        opacity: p * (1 - q),
        filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
        transform: `translateY(${MOTION.wordRise * 0.6 * (1 - p)}px)`,
        ...toneStyle(tone, weight),
        fontWeight: weight,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
