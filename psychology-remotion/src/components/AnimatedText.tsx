import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Accent, COLORS, FONT, GRADIENTS, SAFE} from '../config';
import {fontFamily} from '../fonts';
import {EASE, ease, springIn} from '../lib/motion';

export type TextSpec = {text: string; accent?: Record<string, Accent>};

type Props = TextSpec & {
  /** frame where the first word starts entering (relative to the current Sequence) */
  enter: number;
  /** frame where words start leaving (blur + fade); omit to stay */
  exit?: number;
  /** frame(s) of the shine sweep across accent words */
  shineAt?: number | number[];
  size: number;
  /** vertical position of the anchor edge, in px */
  y: number;
  anchor?: 'top' | 'center' | 'bottom';
  /** mask: words rise out of an invisible mask. rise: slide + fade + unblur */
  variant?: 'mask' | 'rise';
  weight?: number;
  opacity?: number;
  stagger?: number;
  lineHeight?: number;
  /** base color for non-accent words */
  base?: Accent;
  /** 'ltr' for English (the outro) */
  dir?: 'rtl' | 'ltr';
  font?: string;
};

const shineLayer = 'linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,252,236,0.95) 50%, rgba(255,255,255,0) 60%)';
const GLOW: Partial<Record<Accent, string>> = {
  gold: 'rgba(212,175,55,0.38)',
  red: 'rgba(255,59,59,0.42)',
  ice: 'rgba(169,184,204,0.35)',
  hot: 'rgba(255,240,200,0.5)',
  dawn: 'rgba(255,176,112,0.4)',
};

/**
 * RTL text line(s), reused from sp500-remotion. Words animate one by one (never letter by letter,
 * so Arabic letters stay joined). "\n" forces a line break; long lines wrap inside the 860 px column.
 */
export const AnimatedText: React.FC<Props> = ({
  text,
  accent = {},
  enter,
  exit,
  shineAt,
  size,
  y,
  anchor = 'center',
  variant = 'mask',
  weight = FONT.weightBold,
  opacity = 1,
  stagger = 4,
  lineHeight = 1.32,
  base = 'white',
  dir = 'rtl',
  font = fontFamily,
}) => {
  const frame = useCurrentFrame();
  const lines = text.split('\n').map((l) => l.trim().split(/\s+/));
  let wordIndex = 0;
  const translateY = anchor === 'center' ? '-50%' : anchor === 'bottom' ? '-100%' : '0';

  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - SAFE.textWidth) / 2,
        width: SAFE.textWidth,
        top: y,
        transform: `translateY(${translateY})`,
        direction: dir,
        textAlign: 'center',
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        opacity,
      }}
    >
      {lines.map((words, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.26em'}}>
          {words.map((word) => {
            const i = wordIndex++;
            const start = enter + i * stagger;
            const p = springIn(frame, start, {damping: 17, stiffness: 120, mass: 0.7});
            const fadeIn = ease(frame, [start, start + 7], [0, 1]);
            // exit in reading order with a short stagger
            const e = exit === undefined ? 0 : ease(frame, [exit + i * 2, exit + i * 2 + 13], [0, 1], EASE.in);

            const key = accent[word] ?? accent[word.replace(/[.!؟?،…]+$/u, '')] ?? accent[word.replace(/^[.…]+/u, '')];
            const color: Accent = key ?? base;
            const isAccent = key !== undefined;
            const starts = shineAt === undefined ? [] : Array.isArray(shineAt) ? shineAt : [shineAt];
            const current = starts.filter((s) => frame >= s + i * 3).pop();
            const shine = current === undefined || !isAccent ? 0 : ease(frame, [current + i * 3, current + i * 3 + 20], [0, 1], EASE.inOut);

            const enterBlur = variant === 'rise' ? (1 - p) * 12 : 0;
            const blur = enterBlur + e * 16;
            const glowColor = GLOW[color];
            const glow = glowColor ? `drop-shadow(0 0 ${size * 0.2}px ${glowColor}) ` : 'drop-shadow(0 4px 18px rgba(0,0,0,0.7)) ';

            const inner: React.CSSProperties = {
              display: 'inline-block',
              backgroundImage: `${shineLayer}, ${GRADIENTS[color]}`,
              backgroundSize: '250% 100%, 100% 100%',
              // the sweep follows the reading direction: right to left for Arabic, left to right for English
              backgroundPosition: `${(dir === "ltr" ? 1 - shine : shine) * 100}% 0, 0 0`,
              backgroundRepeat: 'no-repeat',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: COLORS.text,
              WebkitTextFillColor: 'transparent',
              transform:
                variant === 'mask'
                  ? `translateY(${(1 - p) * 105}%)`
                  : `translateY(${(1 - p) * 0.3}em) scale(${0.92 + 0.08 * p})`,
              // padding keeps the dots and tails of Arabic letters inside the mask
              padding: '0.2em 0.08em',
            };

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  overflow: variant === 'mask' ? 'hidden' : 'visible',
                  margin: '-0.2em -0.08em',
                  opacity: fadeIn * (1 - e),
                  filter: `${glow}blur(${blur.toFixed(2)}px)`,
                  transform: `translateY(${-e * 26}px) scale(${1 + e * 0.05})`,
                }}
              >
                <span style={inner}>{word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
