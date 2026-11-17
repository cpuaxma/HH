import React, {useLayoutEffect, useRef} from 'react';
import {COLORS, FONT, SAFE, SAFE_BOTTOM_Y, VIDEO, WORDS, sec} from '../config';
import {ramp, settle} from '../motion';
import {useScene, useSceneFrame} from './SceneShell';

type Token = {text: string; gold: boolean};
const tokenize = (line: string): Token[] =>
  line
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const gold = w.startsWith('*') && w.endsWith('*') && w.length > 2;
      return {text: gold ? w.slice(1, -1) : w, gold};
    });

/**
 * The scene's headline, revealed word by word (right to left, in reading order).
 * Each word is its own span, so Arabic letters still join inside the word and the line order is
 * set by `direction: rtl`. Lines are broken in the config, never by the browser (nowrap).
 */
export const Headline: React.FC<{underline?: boolean}> = ({underline = true}) => {
  const {lines, fontSize, textTop, id} = useScene();
  const f = useSceneFrame();
  const ref = useRef<HTMLDivElement>(null);
  const tokens = lines.map(tokenize);
  const wordCount = tokens.flat().length;
  const first = sec(WORDS.delay);
  const step = WORDS.stagger * VIDEO.fps;
  const lastWordIn = first + (wordCount - 1) * step;
  const rule = ramp(f, lastWordIn + 6, lastWordIn + 30);

  // Guard: report any line wider than the safe box, or a block outside the vertical safe zone.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.offsetWidth === 0) return; // not laid out yet (e.g. a premounted sequence)
    const maxWidth = VIDEO.width - SAFE.side * 2;
    el.querySelectorAll<HTMLElement>('[data-line]').forEach((line) => {
      // measure the words themselves, not the (full-width) line box
      const words = Array.from(line.children) as HTMLElement[];
      const left = Math.min(...words.map((w) => w.offsetLeft));
      const right = Math.max(...words.map((w) => w.offsetLeft + w.offsetWidth));
      if (right - left > maxWidth || left < 0 || right > line.offsetWidth) {
        console.warn(`TEXT OVERFLOW [${id}] line "${line.textContent}" is ${right - left}px wide (max ${maxWidth}px)`);
      }
    });
    const top = textTop;
    const bottom = textTop + el.offsetHeight;
    if (top < SAFE.top || bottom > SAFE_BOTTOM_Y) {
      console.warn(`TEXT OUTSIDE SAFE ZONE [${id}] ${top}–${bottom}px`);
    }
  }, [id, textTop]);

  let index = 0;
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: textTop,
        left: SAFE.side,
        right: SAFE.side,
        direction: 'rtl',
        fontFamily: FONT.family,
        fontWeight: FONT.headlineWeight,
        fontSize,
        lineHeight: FONT.lineHeight,
        color: COLORS.text,
        textAlign: 'center',
      }}
    >
      {tokens.map((line, li) => (
        <div
          key={li}
          data-line
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            columnGap: '0.26em',
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}
        >
          {line.map((tok) => {
            const p = settle(f, first + index * step, sec(0.8));
            index++;
            return (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  opacity: p,
                  transform: `translateY(${(1 - p) * WORDS.rise}px)`,
                  filter: `blur(${(1 - p) * WORDS.blur}px)`,
                  color: tok.gold ? COLORS.gold : COLORS.text,
                  textShadow: tok.gold
                    ? '0 0 28px rgba(212,175,55,0.45), 0 2px 0 rgba(0,0,0,0.35)'
                    : '0 4px 22px rgba(0,0,0,0.65)',
                  // room for shadda and other marks above and below the line
                  paddingBlock: '0.06em',
                }}
              >
                {tok.text}
              </span>
            );
          })}
        </div>
      ))}
      {underline ? (
        <div
          style={{
            margin: '18px auto 0',
            height: 3,
            width: 220 * rule,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            opacity: 0.85 * rule,
            boxShadow: '0 0 18px rgba(212,175,55,0.5)',
          }}
        />
      ) : null}
    </div>
  );
};
