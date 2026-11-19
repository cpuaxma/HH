import React from 'react';
import {COLORS} from '../constants';
import {goldGlow} from '../lib';

export type Segment = {text: string; gold: boolean};
export type Word = {segments: Segment[]; latin: boolean};

/** Splits "plain *gold* plain" into words; each word keeps its gold/plain segments. Parenthesised Latin stays one word. */
export const parseRich = (input: string): Word[] => {
  const tokens: string[] = [];
  const re = /\([^)]*\)|\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) tokens.push(m[0]);

  // Track *gold* state across words.
  let gold = false;
  return tokens.map((tok) => {
    const segments: Segment[] = [];
    let buf = '';
    for (const ch of tok) {
      if (ch === '*') {
        if (buf) segments.push({text: buf, gold});
        buf = '';
        gold = !gold;
      } else buf += ch;
    }
    if (buf) segments.push({text: buf, gold});
    return {segments, latin: /[A-Za-z]/.test(tok)};
  });
};

export const WordView: React.FC<{word: Word; style?: React.CSSProperties; glow?: number}> = ({word, style, glow = 0.8}) => (
  <span
    dir={word.latin ? 'ltr' : undefined}
    style={{display: 'inline-block', unicodeBidi: 'isolate', ...style}}
  >
    {word.segments.map((seg, i) => (
      <span
        key={i}
        style={
          seg.gold
            ? {color: COLORS.gold, textShadow: goldGlow(glow)}
            : undefined
        }
      >
        {seg.text}
      </span>
    ))}
  </span>
);
