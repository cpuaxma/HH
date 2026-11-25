import React from 'react';
import {interpolate} from 'remotion';
import {COLORS, FONT, GOLD_TEXT_GRADIENT, MOTION} from '../config';
import {FONT_FAMILY} from '../fonts';
import {clamp, springAt} from '../lib/motion';

export type TextFill = 'white' | 'gold' | 'red' | 'gray';

type Props = {
  lines: string[];
  frame: number; // scene-local frame
  start: number;
  stagger?: number;
  fontSize: number;
  weight?: number;
  fill?: TextFill;
  variant?: 'rise' | 'punch';
  lineHeight?: number;
  glow?: number; // 0..1 gold glow strength (gold fill only)
  style?: React.CSSProperties;
  /** Optional per-line decoration rendered behind a line (e.g. a highlight band). */
  renderBehindLine?: (lineIndex: number) => React.ReactNode;
  /** Optional per-word fill override (word index counts across all lines, in reading order). */
  wordFill?: (wordIndex: number, word: string) => TextFill | undefined;
};

/**
 * Right-to-left word-by-word reveal. Words are split on spaces only, so every Arabic word
 * keeps its letters joined; the flex row runs right → left (direction: rtl), so words appear
 * in reading order.
 */
export const WordReveal: React.FC<Props> = ({
  lines,
  frame,
  start,
  stagger = 4,
  fontSize,
  weight = FONT.extraBold,
  fill = 'white',
  variant = 'rise',
  lineHeight = FONT.lineHeight,
  glow = 0,
  style,
  renderBehindLine,
  wordFill,
}) => {
  let index = 0;
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        direction: 'rtl',
        fontFamily: FONT_FAMILY,
        fontWeight: weight,
        fontSize,
        lineHeight,
        textAlign: 'center',
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
          {renderBehindLine?.(li)}
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', columnGap: '0.26em', position: 'relative'}}>
            {line.split(' ').map((word, wi) => {
              const i = index++;
              return (
                <Word
                  key={wi}
                  word={word}
                  frame={frame}
                  at={start + i * stagger}
                  fill={wordFill?.(i, word) ?? fill}
                  variant={variant}
                  glow={glow}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const Word: React.FC<{word: string; frame: number; at: number; fill: TextFill; variant: 'rise' | 'punch'; glow: number}> = ({
  word,
  frame,
  at,
  fill,
  variant,
  glow,
}) => {
  const isPunch = variant === 'punch';
  const p = springAt(frame, at, isPunch ? MOTION.punch : MOTION.word);
  const appear = interpolate(frame - at, [0, isPunch ? 5 : 9], [0, 1], clamp);
  const blur = (1 - Math.min(1, p)) * MOTION.wordBlur;
  const transform = isPunch
    ? `scale(${interpolate(p, [0, 1], [1.9, 1])})`
    : `translateY(${(1 - p) * MOTION.wordRise}px)`;

  const color =
    fill === 'white' ? COLORS.white : fill === 'red' ? COLORS.red : fill === 'gray' ? COLORS.gray : undefined;

  const goldStyle: React.CSSProperties =
    fill === 'gold'
      ? {
          backgroundImage: GOLD_TEXT_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }
      : {};

  const shadow =
    fill === 'gold' && glow > 0
      ? `drop-shadow(0 0 ${18 + glow * 22}px rgba(212,175,55,${0.25 + glow * 0.3}))`
      : fill === 'red'
        ? 'drop-shadow(0 0 22px rgba(229,72,77,0.35))'
        : '';

  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'nowrap',
        // a little breathing room so the gradient clip never trims Arabic ascenders/descenders
        padding: '0 0.04em',
        opacity: appear,
        transform,
        filter: [blur > 0.05 ? `blur(${blur}px)` : '', shadow].filter(Boolean).join(' ') || undefined,
        color,
        ...goldStyle,
      }}
    >
      {word}
    </span>
  );
};
