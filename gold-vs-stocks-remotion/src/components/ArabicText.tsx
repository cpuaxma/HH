import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {BLUE_GRADIENT, COLORS, EASE, FONT, GOLD_GRADIENT, MOTION} from '../theme';
import type {TextBlock} from '../strings';
import {enter} from '../motion';

export type Tone = 'gold' | 'blue' | 'red' | 'key' | null;
const strip = (w: string) => w.replace(/[.,،؛؟?!…:"«»()]/g, '');
const LATIN = /[A-Za-z0-9]/;

const toneWords = (words: string[], block: TextBlock): Tone[] => {
  const out: Tone[] = words.map(() => null);
  const mark = (list: string[] = [], tone: Tone) =>
    list.forEach((phrase) => {
      const parts = phrase.split(' ');
      for (let i = 0; i + parts.length <= words.length; i++) {
        if (parts.every((p, j) => strip(words[i + j]) === p)) parts.forEach((_, j) => (out[i + j] = tone));
      }
    });
  mark(block.key, 'key');
  mark(block.red, 'red');
  mark(block.blue, 'blue');
  mark(block.gold, 'gold');
  return out;
};

const clipText = (image: string): React.CSSProperties => ({
  backgroundImage: image,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  fontWeight: FONT.key,
});

export const toneStyle = (tone: Tone, weight: number): React.CSSProperties =>
  tone === 'gold'
    ? clipText(GOLD_GRADIENT)
    : tone === 'blue'
      ? clipText(BLUE_GRADIENT)
      : tone === 'red'
        ? {color: COLORS.red, fontWeight: FONT.key}
        : tone === 'key'
          ? {fontWeight: FONT.key}
          : {fontWeight: weight};

/** Latin tokens (XAU/USD, S&P 500) are isolated with <bdi> so RTL bidi order stays correct. */
export const Bidi: React.FC<{text: string}> = ({text}) => (LATIN.test(text) ? <bdi>{text}</bdi> : <>{text}</>);

/**
 * RTL text animated per WORD (never per letter, so Arabic joining is intact).
 * Words enter right to left: opacity 0→1, blur 8→0, translateY 18→0, 4-frame stagger.
 * If `exitEnd` is set, words blur + fade out (40% faster) so the last one is gone at exitEnd.
 */
export const ArabicText: React.FC<{
  block: TextBlock;
  size: number;
  start?: number;
  exitEnd?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({block, size, start = 0, exitEnd, color = COLORS.text, weight = FONT.body, style}) => {
  const frame = useCurrentFrame();
  let cursor = 0;
  const lines = block.lines.map((line) => {
    if (line.delay !== undefined) cursor = line.delay;
    const words = line.text.split(' ');
    const tones = toneWords(words, block);
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
      {lines.map(({line, items}, li) => (
        <div key={li} style={{fontSize: line.size ?? size, whiteSpace: 'nowrap'}}>
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
                  <Bidi text={w} />
                </span>
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};
