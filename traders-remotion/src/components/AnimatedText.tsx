import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import {COLORS, FONT, GOLD_TEXT, SAFE} from '../config';
import {CAIRO} from '../fonts';
import {EASE, clamp, prog} from '../lib/anim';

export type Accents = {gold?: readonly string[]; red?: readonly string[]};
type Tone = 'gold' | 'red' | null;

const strip = (w: string) => w.replace(/[.,،؛؟?!…:"«»()]/g, '');
const toneOf = (w: string, a: Accents): Tone => {
  if (a.red?.some((x) => strip(x) === strip(w))) return 'red';
  if (a.gold?.some((x) => strip(x) === strip(w))) return 'gold';
  return null;
};

const SHEEN = 'linear-gradient(100deg, rgba(255,255,255,0) 38%, rgba(255,250,235,0.95) 50%, rgba(255,255,255,0) 62%)';
const RED_FILL = `linear-gradient(180deg, #E2554A 0%, ${COLORS.red} 60%, #8E231C 100%)`;

/** Fill (and optional sheen sweep, 0→1) for one word, clipped to the glyphs so the joining is untouched. */
const fill = (tone: Tone, color: string, sheen: number): React.CSSProperties => {
  const base = tone === 'gold' ? GOLD_TEXT : tone === 'red' ? RED_FILL : `linear-gradient(${color}, ${color})`;
  const on = sheen > 0 && sheen < 1;
  return {
    backgroundImage: on ? `${SHEEN}, ${base}` : base,
    backgroundSize: on ? '300% 100%, 100% 100%' : '100% 100%',
    backgroundPosition: on ? `${100 - sheen * 100}% 0, 0 0` : '0 0',
    backgroundRepeat: 'no-repeat',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };
};

/**
 * Arabic text that enters WORD BY WORD (never letter by letter, so letters stay joined):
 * each word slides up out of its own mask with a little blur, right to left. Accent words get
 * colour + a shine sweep. The block exits with blur + fade. Lines that would be wider than the
 * safe column are scaled down to fit (measured once the font is ready).
 */
export const AnimatedText: React.FC<{
  text: string;
  size: number;
  start: number;
  exit?: number;
  accents?: Accents;
  weight?: number;
  color?: string;
  stagger?: number;
  maxWidth?: number;
  shineAll?: boolean;
  /** Repeat the accent shine every n frames after the first one. */
  shineEvery?: number;
  style?: React.CSSProperties;
  lineHeight?: number;
}> = ({text, size, start, exit, accents = {}, weight = FONT.weights.black, color = COLORS.white, stagger = 4, maxWidth = (SAFE.right - SAFE.left) * 0.96, shineAll = false, shineEvery, style, lineHeight = FONT.lineHeight}) => {
  const frame = useCurrentFrame();
  const lines = text.split('\n').map((l) => l.split(' ').filter(Boolean));
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [fit, setFit] = useState<number[] | null>(null);
  const [handle] = useState(() => delayRender('fit text'));
  useLayoutEffect(() => {
    let dead = false;
    document.fonts.ready.then(() => {
      if (dead) return;
      setFit(refs.current.map((el) => (el ? Math.min(1, maxWidth / Math.max(1, el.scrollWidth)) : 1)));
      continueRender(handle);
    });
    return () => {
      dead = true;
    };
  }, [handle, maxWidth, text, size]);

  const exitP = exit === undefined ? 0 : EASE.exit(prog(frame, exit, exit + 12));
  if (exitP >= 1) return null;
  let wi = 0;
  return (
    <div
      dir="rtl"
      style={{
        fontFamily: CAIRO,
        fontWeight: weight,
        textAlign: 'center',
        lineHeight,
        color,
        opacity: 1 - exitP,
        filter: `blur(${exitP * 16}px) drop-shadow(0 6px 26px rgba(0,0,0,0.9))`,
        transform: `scale(${1 + exitP * 0.05})`,
        visibility: fit ? 'visible' : 'hidden',
        ...style,
      }}
    >
      {lines.map((words, li) => (
        <div key={li} style={{fontSize: size * (fit?.[li] ?? 1), whiteSpace: 'nowrap'}}>
          <div ref={(el) => (refs.current[li] = el)} style={{display: 'inline-block'}}>
            {words.map((w, j) => {
              const i = wi++;
              const s = start + i * stagger;
              const p = EASE.out(prog(frame, s, s + 14));
              const tone = toneOf(w, accents);
              const shineStart = s + 12;
              let sh = prog(frame, shineStart, shineStart + 22);
              if (shineEvery && frame > shineStart + 22) sh = prog((frame - shineStart) % shineEvery, 0, 22);
              const sheen = tone || shineAll ? EASE.inOut(sh) : 0;
              return (
                <React.Fragment key={j}>
                  {j > 0 ? ' ' : null}
                  {/* Mask: padded so tall ascenders and deep descenders are not clipped. */}
                  <span style={{display: 'inline-block', overflow: 'hidden', padding: '0.3em 0.1em 0.7em', margin: '-0.3em -0.1em -0.7em', verticalAlign: 'bottom'}}>
                    <span
                      style={{
                        display: 'inline-block',
                        // Padded so the gradient fill (background-clip: text) also covers the dots and
                        // descenders below the line (e.g. the two dots of a final ي), not just the line box.
                        padding: '0.25em 0.06em 0.5em',
                        margin: '-0.25em -0.06em -0.5em',
                        transform: `translateY(${(1 - p) * 105}%)`,
                        opacity: clamp(p * 1.6),
                        filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
                        ...fill(tone, color, sheen),
                      }}
                    >
                      {w}
                    </span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
