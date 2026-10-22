import React from 'react';
import {useCurrentFrame} from 'remotion';
import {parseRuns} from '../copy';
import {enterProgress, exitProgress, kick} from '../lib/anim';
import {COLORS, FONT, TIMING, TYPE, WEIGHT} from '../theme';

// Mask padding: room above for the spring overshoot and the word exit,
// below for descenders. Cancelled with negative margins so layout is unchanged.
const PAD_TOP = 0.32;
const PAD_BOTTOM = 0.24;
const PAD_X = 0.12;
// Chars start fully below the mask, i.e. a touch more than 100% of the line.
const HIDDEN_Y = 1 + PAD_BOTTOM + 0.04;
// A kick-spring char has visibly settled about this many frames after it starts.
const SPRING_SETTLE = 40;

type Props = {
  lines: readonly string[];
  start: number;
  exitAt?: number;
  fontSize: number;
  hero?: boolean;
  align?: 'left' | 'center';
  color?: string;
  accent?: string;
  style?: React.CSSProperties;
};

const visibleChars = (lines: readonly string[]) =>
  lines.join('').replace(/[\s*]/g, '').length;

// Frame at which the last character has settled.
export const revealSettle = (lines: readonly string[], start: number, hero = true) =>
  start + (visibleChars(lines) - 1) * TIMING.charStagger + (hero ? SPRING_SETTLE : TIMING.charEnter);

export const MaskReveal: React.FC<Props> = ({
  lines,
  start,
  exitAt,
  fontSize,
  hero = true,
  align = 'left',
  color = COLORS.charcoal,
  accent = COLORS.red,
  style,
}) => {
  const frame = useCurrentFrame();
  let charIndex = 0;
  let wordIndex = 0;

  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: WEIGHT.headline,
        fontSize,
        letterSpacing: TYPE.headlineTracking,
        lineHeight: 1,
        textAlign: align,
        ...style,
      }}
    >
      {lines.map((line, li) => {
        // Split into words while keeping which run (red or not) each char belongs to.
        const words: {char: string; red: boolean}[][] = [[]];
        for (const run of parseRuns(line)) {
          for (const char of run.text) {
            if (char === ' ') {
              if (words[words.length - 1].length) words.push([]);
            } else {
              words[words.length - 1].push({char, red: run.red});
            }
          }
        }
        return (
          <div
            key={li}
            style={{
              overflow: 'hidden',
              padding: `${PAD_TOP}em ${PAD_X}em ${PAD_BOTTOM}em`,
              margin: `-${PAD_TOP}em -${PAD_X}em -${PAD_BOTTOM}em`,
              whiteSpace: 'nowrap',
            }}
          >
            {words.filter((w) => w.length).map((word, wi) => {
              const out = exitProgress(frame, exitAt === undefined ? undefined : exitAt + wordIndex * TIMING.wordExitStagger);
              wordIndex++;
              return (
                <React.Fragment key={wi}>
                  {wi > 0 ? ' ' : null}
                  <span
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${-40 * out}px)`,
                      opacity: 1 - out,
                    }}
                  >
                    {word.map(({char, red}, ci) => {
                      const t0 = start + charIndex * TIMING.charStagger;
                      charIndex++;
                      const p = hero ? kick(frame, t0) : enterProgress(frame, t0, TIMING.charEnter);
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
