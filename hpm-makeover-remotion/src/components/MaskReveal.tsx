import React from 'react';
import {useCurrentFrame} from 'remotion';
import {parseRuns} from '../copy';
import {exit, kick} from '../lib/anim';
import {FONT, HPM, TIMING, TYPE, WEIGHT} from '../theme';

// Mask padding: room above for the spring overshoot, below for descenders.
// Cancelled with negative margins so layout is unchanged.
const PAD_TOP = 0.3;
const PAD_BOTTOM = 0.26;
const PAD_X = 0.12;
const HIDDEN_Y = 1 + PAD_BOTTOM + 0.14;
// A kick-spring char has visibly settled about this many frames after it starts.
const SPRING_SETTLE = 36;

type Props = {
  lines: readonly string[];
  start: number; // absolute frame
  frame?: number; // absolute frame override
  exitAt?: number;
  fontSize: number;
  color?: string;
  accent?: string;
  align?: 'left' | 'center';
  lineGap?: number; // em
  style?: React.CSSProperties;
};

const visibleChars = (lines: readonly string[]) => lines.join('').replace(/[\s*]/g, '').length;

// Frame at which the last character has settled.
export const revealSettle = (lines: readonly string[], start: number) =>
  start + (visibleChars(lines) - 1) * TIMING.charStagger + SPRING_SETTLE;

// Hot Pepper headline: per-character mask reveal (translateY 100% → 0), 1.2-frame stagger,
// each char on the kick spring. Exit: words lift out with a cubic-in.
export const MaskReveal: React.FC<Props> = ({
  lines,
  start,
  frame: frameProp,
  exitAt,
  fontSize,
  color = HPM.charcoal,
  accent = HPM.red,
  align = 'left',
  lineGap = 0.04,
  style,
}) => {
  const local = useCurrentFrame();
  const frame = frameProp ?? local;
  let charIndex = 0;
  let wordIndex = 0;

  return (
    <div
      style={{
        fontFamily: FONT.brand,
        fontWeight: WEIGHT.headline,
        fontSize,
        letterSpacing: TYPE.headlineTracking,
        lineHeight: 1,
        textAlign: align,
        ...style,
      }}
    >
      {lines.map((line, li) => {
        const words: {char: string; red: boolean}[][] = [[]];
        for (const run of parseRuns(line)) {
          for (const char of run.text) {
            if (char === ' ') {
              if (words[words.length - 1].length) words.push([]);
            } else words[words.length - 1].push({char, red: run.red});
          }
        }
        return (
          <div
            key={li}
            style={{
              overflow: 'hidden',
              padding: `${PAD_TOP}em ${PAD_X}em ${PAD_BOTTOM}em`,
              margin: `-${PAD_TOP}em -${PAD_X}em -${PAD_BOTTOM}em`,
              marginTop: li ? `${lineGap - PAD_TOP}em` : `-${PAD_TOP}em`,
              whiteSpace: 'nowrap',
            }}
          >
            {words
              .filter((w) => w.length)
              .map((word, wi) => {
                const out = exitAt === undefined ? 0 : exit(frame, exitAt + wordIndex * 2, 13);
                wordIndex++;
                return (
                  <React.Fragment key={wi}>
                    {wi > 0 ? ' ' : null}
                    <span style={{display: 'inline-block', transform: `translateY(${-HIDDEN_Y * out}em)`}}>
                      {word.map(({char, red}, ci) => {
                        const p = kick(frame, start + charIndex * TIMING.charStagger);
                        charIndex++;
                        return (
                          <span
                            key={ci}
                            style={{
                              display: 'inline-block',
                              transform: `translateY(${(1 - p) * HIDDEN_Y}em)`,
                              color: red ? accent : color,
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  </React.Fragment>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};
