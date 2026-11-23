import {measureText} from '@remotion/layout-utils';
import {FONT} from '../config';

export type Word = {text: string; accent: boolean};

/** "*ONE*" → {text: 'ONE', accent: true} */
export const parseWord = (w: string): Word =>
  w.startsWith('*') && w.endsWith('*') ? {text: w.slice(1, -1), accent: true} : {text: w, accent: false};

/** Splits a line into words; *several words* in one pair of asterisks are all accented. */
export const parseLine = (line: string): Word[] => {
  let inAccent = false;
  return line
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const opens = raw.startsWith('*');
      const closes = raw.endsWith('*') && raw.length > 1;
      const accent = inAccent || opens;
      if (opens && !closes) inAccent = true;
      if (closes) inAccent = false;
      return {text: raw.replace(/^\*|\*$/g, ''), accent};
    });
};

export const textWidth = (text: string, fontSize: number, weight: number = FONT.bold, letterSpacing = 0) =>
  measureText({text, fontFamily: FONT.family, fontWeight: weight, fontSize, letterSpacing: `${letterSpacing}em`}).width;

/** Largest size ≤ desired at which every line fits maxWidth. */
export const fitSize = (lines: string[], desired: number, maxWidth: number, weight: number = FONT.bold, letterSpacing = 0) => {
  const widest = Math.max(...lines.map((l) => textWidth(l.replace(/\*/g, ''), desired, weight, letterSpacing)));
  return widest > maxWidth ? Math.floor((desired * maxWidth) / widest) : desired;
};

export const formatStat = (v: number, format: string) => {
  if (format === 'compact') {
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return `${Math.round(v)}`;
  }
  return Math.round(v).toLocaleString('en-US');
};
