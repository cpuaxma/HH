import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, FONT, GOLD_GRADIENT, MOTION} from '../theme';
import type {TextBlock} from '../strings';
import {enter, jitter} from '../motion';

type Tone = 'gold' | 'red' | null;
const strip = (w: string) => w.replace(/[.,،؛؟?!…:"«»()]/g, '');

const toneWords = (words: string[], gold: string[] = [], red: string[] = []): Tone[] => {
  const out: Tone[] = words.map(() => null);
  const mark = (list: string[], tone: Tone) =>
    list.forEach((phrase) => {
      const parts = phrase.split(' ');
      for (let i = 0; i + parts.length <= words.length; i++) {
        if (parts.every((p, j) => strip(words[i + j]) === p)) parts.forEach((_, j) => (out[i + j] = tone));
      }
    });
  mark(red, 'red');
  mark(gold, 'gold');
  return out;
};

export const toneStyle = (tone: Tone, weight: number): React.CSSProperties =>
  tone === 'gold'
    ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: FONT.key}
    : tone === 'red'
      ? {color: COLORS.red, fontWeight: FONT.key}
      : {fontWeight: weight};

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
    const tones = toneWords(words, block.gold, block.red);
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
            // Red words stay restless once they land (tiny shake + flicker); gold stays calm.
            const j = tone === 'red' ? jitter(i + 1, frame, 1.6 * p) : {x: 0, y: 0, flicker: 1};
            return (
              <React.Fragment key={wi}>
                {wi > 0 ? ' ' : null}
                <span
                  style={{
                    display: 'inline-block',
                    opacity: p * (1 - q) * j.flicker,
                    filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
                    transform: `translate(${j.x}px, ${MOTION.wordRise * (1 - p) + j.y}px)`,
                    ...toneStyle(tone, weight),
                  }}
                >
                  {w}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};
