import React from 'react';
import {Easing} from 'remotion';
import {exit, kick, progress} from '../lib/anim';
import {FONT, HPM, TIMING, TYPE, WEIGHT} from '../theme';

const PAD_TOP = 0.3;
const PAD_BOTTOM = 0.26;
const HIDDEN_Y = 1 + PAD_BOTTOM + 0.14;
const SPRING_SETTLE = 36;

export type Run = {text: string; red: boolean};
// "plain *red* plain" → runs
export const parseRuns = (line: string): Run[] =>
  line
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith('*') ? {text: part.slice(1, -1), red: true} : {text: part, red: false}));

const visibleChars = (lines: readonly string[]) => lines.join('').replace(/[\s*]/g, '').length;
export const revealSettle = (lines: readonly string[], start: number) =>
  start + (visibleChars(lines) - 1) * TIMING.charStagger + SPRING_SETTLE;

type Props = {
  frame: number;
  lines: readonly string[];
  start: number;
  exitAt?: number;
  exitDistance?: number; // px; a larger lift for the "Clear all" burst
  exitDuration?: number;
  fontSize: number;
  color?: string;
  accent?: string;
  pill?: string; // caption mode: each line sits on its own pill of this colour
  align?: 'left' | 'center';
  style?: React.CSSProperties;
};

// Per-character mask reveal (translateY 100% → 0), 1.2-frame stagger, kick spring per char.
// In caption mode each line gets a Cream pill that wipes open just ahead of its letters.
export const MaskReveal: React.FC<Props> = ({
  frame,
  lines,
  start,
  exitAt,
  exitDistance,
  exitDuration = 14,
  fontSize,
  color = HPM.charcoal,
  accent = HPM.red,
  pill,
  align = 'left',
  style,
}) => {
  let charIndex = 0;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: WEIGHT.headline,
        fontSize,
        letterSpacing: TYPE.headlineTracking,
        lineHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'left' ? 'flex-start' : 'center',
        gap: pill ? 12 : 0.04 * fontSize,
        ...style,
      }}
    >
      {lines.map((line, li) => {
        const lineStart = start + charIndex * TIMING.charStagger;
        const out = exitAt === undefined ? 0 : exit(frame, exitAt + li * 2, exitDuration);
        const lift = exitDistance ?? fontSize * HIDDEN_Y;
        // The pill opens in step with its own letters, so it never shows as an empty bar.
        const lineChars = line.replace(/[\s*]/g, '').length;
        const open = pill ? progress(frame, lineStart + 4, lineChars * TIMING.charStagger + 4, Easing.out(Easing.quad)) : 1;
        const chars: React.ReactNode[] = [];
        for (const run of parseRuns(line)) {
          for (const ch of run.text) {
            if (ch === ' ') {
              chars.push(<span key={chars.length}>&nbsp;</span>);
              continue;
            }
            const p = kick(frame, start + charIndex * TIMING.charStagger);
            charIndex++;
            chars.push(
              <span key={chars.length} style={{display: 'inline-block', transform: `translateY(${(1 - p) * HIDDEN_Y}em)`, color: run.red ? accent : color}}>
                {ch}
              </span>,
            );
          }
        }
        return (
          <div
            key={li}
            style={{
              transform: `translateY(${-lift * out}px)`,
              opacity: exitDistance ? 1 : 1 - out,
              ...(pill
                ? {
                    background: pill,
                    borderRadius: 0.28 * fontSize,
                    padding: `${0.12 * fontSize}px ${0.32 * fontSize}px ${0.16 * fontSize}px`,
                    clipPath: `inset(0 ${(1 - open) * 100}% 0 0 round ${0.28 * fontSize}px)`,
                    boxShadow: '0 10px 30px rgba(15,15,15,0.16)',
                  }
                : {}),
            }}
          >
            <div
              style={{
                overflow: 'hidden',
                padding: `${PAD_TOP}em 0.12em ${PAD_BOTTOM}em`,
                margin: `-${PAD_TOP}em -0.12em -${PAD_BOTTOM}em`,
                whiteSpace: 'nowrap',
              }}
            >
              {chars}
            </div>
          </div>
        );
      })}
    </div>
  );
};
