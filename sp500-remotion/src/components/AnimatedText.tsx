import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONT, GOLD_GRADIENT, SAFE, WHITE_GRADIENT} from '../config';
import {fontFamily} from '../fonts';
import {EASE, ease, springIn} from '../lib/motion';

export type TextSpec = {text: string; gold?: string[]};

type Props = TextSpec & {
  /** scene-local frame where the first word starts entering */
  enter: number;
  /** scene-local frame where words start leaving (blur + fade); omit to stay */
  exit?: number;
  /** scene-local frame of the shine sweep across gold words */
  shineAt?: number;
  size: number;
  /** vertical position of the anchor edge, in px */
  y: number;
  anchor?: 'top' | 'center' | 'bottom';
  /** mask: words rise out of an invisible mask. rise: slide + fade + unblur */
  variant?: 'mask' | 'rise';
  /** every word gold (default: only the words listed in `gold`) */
  allGold?: boolean;
  weight?: number;
  opacity?: number;
  stagger?: number;
  lineHeight?: number;
};

const shineLayer = 'linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,252,236,0.95) 50%, rgba(255,255,255,0) 60%)';

/**
 * RTL text line(s). Words animate one by one (never letter by letter, so Arabic letters stay joined).
 * A "\n" in the text forces a line break; long lines also wrap inside the 860 px text column.
 */
export const AnimatedText: React.FC<Props> = ({
  text,
  gold = [],
  enter,
  exit,
  shineAt,
  size,
  y,
  anchor = 'center',
  variant = 'mask',
  allGold = false,
  weight = FONT.weightBold,
  opacity = 1,
  stagger = 4,
  lineHeight = 1.3,
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
        direction: 'rtl',
        textAlign: 'center',
        fontFamily,
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

            // exit in reading order (right to left) with a short stagger
            const e = exit === undefined ? 0 : ease(frame, [exit + i * 2, exit + i * 2 + 13], [0, 1], EASE.in);

            const isGold = allGold || gold.includes(word.replace(/[.!؟?،…]+$/u, '')) || gold.includes(word);
            const shine = shineAt === undefined ? 0 : ease(frame, [shineAt + i * 3, shineAt + i * 3 + 20], [0, 1], EASE.inOut);

            const enterBlur = variant === 'rise' ? (1 - p) * 12 : 0;
            const blur = enterBlur + e * 16;
            const glow = isGold ? `drop-shadow(0 0 ${size * 0.22}px rgba(212,175,55,0.35)) ` : 'drop-shadow(0 4px 18px rgba(0,0,0,0.65)) ';

            const inner: React.CSSProperties = {
              display: 'inline-block',
              backgroundImage: `${shineLayer}, ${isGold ? GOLD_GRADIENT : WHITE_GRADIENT}`,
              backgroundSize: '250% 100%, 100% 100%',
              backgroundPosition: `${shine * 100}% 0, 0 0`,
              backgroundRepeat: 'no-repeat',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: isGold ? COLORS.gold : COLORS.text,
              WebkitTextFillColor: 'transparent',
              transform:
                variant === 'mask'
                  ? `translateY(${(1 - p) * 105}%)`
                  : `translateY(${(1 - p) * 0.3}em) scale(${0.92 + 0.08 * p})`,
              // padding keeps the dots and tails of Arabic letters inside the mask
              padding: '0.18em 0.06em',
            };

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  overflow: variant === 'mask' ? 'hidden' : 'visible',
                  margin: '-0.18em -0.06em',
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
