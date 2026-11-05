// Captions, Arabic first (RTL). Modern "blur reveal": each WORD rises a little, sharpens from a
// soft blur and settles with a critically damped spring (never letter by letter, so Arabic
// letters stay joined; no letter-spacing), then the line lifts away and blurs out.
// Key words get the gold gradient, losses get red. Numbers are wrapped in <bdi>.
// Captions over busy content sit on a frosted-glass pill (backdrop blur of the 3D behind it).
// Sizes are fitted to the column with @remotion/layout-utils, so nothing clips.
import {fitText} from '@remotion/layout-utils';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, Block, COLUMN, GOLD_GRADIENT, Lang} from '../data';
import {FAMILY} from '../fonts';
import {clamp01, easeIn, easeOutQuint, ramp, springAt} from '../lib/ease';

export type KineticProps = {
  block: Block;
  lang: Lang;
  inAt: number;
  outAt: number;
  top: number;
  maxSize: number;
  backing?: boolean;
  /** Frames between words. */
  stagger?: number;
  /** Override the column (left, width). */
  x?: number;
  width?: number;
};

export const WEIGHT = 700;

const strip = (w: string) => w.replace(/[.,،؛؟?!…:"«»()]/g, '');
export type Tone = 'gold' | 'red' | null;

const isLatin = (w: string) => /[A-Za-z]/.test(w) && !/[\u0600-\u06FF]/.test(w);

/**
 * Splits a line into the words that animate one by one. A run of Latin words ("Miran Gold")
 * stays ONE unit: laid out word by word in a right-to-left row, it would read "Gold Miran".
 */
export const tokenize = (line: string): string[] =>
  line.split(' ').reduce<string[]>((out, w) => {
    const last = out[out.length - 1];
    if (last !== undefined && isLatin(last) && isLatin(w)) out[out.length - 1] = `${last} ${w}`;
    else out.push(w);
    return out;
  }, []);

/** Tone of each word: phrases in `gold` / `red` are matched word by word (punctuation ignored). */
export const tonesFor = (words: string[], gold: string[] = [], red: string[] = []): Tone[] => {
  const out: Tone[] = words.map(() => null);
  const mark = (list: string[], tone: Tone) =>
    list.forEach((phrase) => {
      const parts = tokenize(phrase);
      for (let i = 0; i + parts.length <= words.length; i++) {
        if (parts.every((p, j) => strip(words[i + j]) === p)) parts.forEach((_, j) => (out[i + j] = tone));
      }
    });
  mark(red, 'red');
  mark(gold, 'gold');
  return out;
};

export const toneStyle = (tone: Tone): React.CSSProperties =>
  tone === 'gold'
    ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
    : tone === 'red'
      ? {color: '#FF6B6B'}
      : {color: BRAND.text};

/** A word, with any run of Western digits (and %, $, commas) isolated in <bdi>. */
export const Word: React.FC<{w: string}> = ({w}) => {
  if (isLatin(w)) {
    // Keep trailing punctuation OUTSIDE the LTR run, so it lands at the sentence end (left in Arabic).
    const [, core, tail] = w.match(/^(.*?[A-Za-z0-9])([^A-Za-z0-9]*)$/) ?? [w, w, ''];
    return (
      <>
        <bdi dir="ltr">{core}</bdi>
        {tail}
      </>
    );
  }
  const parts = w.split(/([$]?[0-9][0-9,.]*%?)/).filter(Boolean);
  return <>{parts.map((p, i) => (/[0-9]/.test(p) ? <bdi key={i}>{p}</bdi> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
};

export const fitSize = (lines: string[], maxSize: number, width: number) =>
  Math.min(maxSize, ...lines.map((l) => fitText({text: l, withinWidth: width, fontFamily: FAMILY, fontWeight: String(WEIGHT)}).fontSize));

/** Frosted glass used by captions, scoreboards and the end card. */
export const glass = (tint = 'rgba(14,18,30,0.5)', border = 'rgba(255,255,255,0.14)'): React.CSSProperties => ({
  background: `linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 42%), ${tint}`,
  backdropFilter: 'blur(22px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
  border: `1.5px solid ${border}`,
  boxShadow: '0 20px 50px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.12)',
});

export const Kinetic: React.FC<KineticProps> = ({block, lang, inAt, outAt, top, maxSize, backing, stagger = 4, x = COLUMN.x, width = COLUMN.width}) => {
  const frame = useCurrentFrame();
  if (frame < inAt - 10 || frame > outAt + 20) return null;
  const rtl = lang === 'ar';
  const padX = backing ? 34 : 0;
  const size = fitSize(block.lines, maxSize, width - 2 * padX - 40);
  const lineH = size * 1.5;
  let wordIndex = 0;
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        position: 'absolute',
        left: x,
        width,
        top,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: backing ? 12 : 0,
        fontFamily: FAMILY,
        fontWeight: WEIGHT,
        fontSize: size,
        lineHeight: `${lineH}px`,
        color: BRAND.text,
      }}
    >
      {block.lines.map((line, li) => {
        const words = tokenize(line);
        const tones = tonesFor(words, block.gold, block.red);
        // The glass pill grows from its centre, then shrinks away.
        const bIn = springAt(frame - (inAt - 8 + li * 4), {freq: 1.6, damping: 0.86});
        const bOut = ramp(frame, outAt - 2 + li * 2, outAt + 14 + li * 2, easeIn);
        const pill = clamp01(bIn) * (1 - bOut);
        return (
          <div key={li} style={{position: 'relative', padding: backing ? `4px ${padX}px` : 0}}>
            {backing ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  ...glass(),
                  opacity: clamp01(pill * 1.4),
                  transform: `scale(${0.86 + 0.14 * pill}, ${0.7 + 0.3 * pill})`,
                }}
              />
            ) : null}
            <div style={{position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: `${size * 0.26}px`, whiteSpace: 'nowrap', padding: `${size * 0.04}px ${size * 0.08}px ${size * 0.08}px`}}>
              {words.map((w, wi) => {
                const i = wordIndex++;
                const start = inAt + i * stagger;
                const p = springAt(frame - start, {freq: 1.7, damping: 0.88});
                const e = clamp01(p);
                const q = ramp(frame, outAt - 8 + i * 1.5, outAt + 8 + i * 1.5, easeIn);
                const blur = (1 - e) * 14 + q * 12;
                return (
                  <span
                    key={wi}
                    style={{
                      display: 'inline-block',
                      opacity: clamp01(e * 1.6) * (1 - q),
                      filter: blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : undefined,
                      transform: `translateY(${(1 - e) * size * 0.42 - q * size * 0.3}px) scale(${1.06 - 0.06 * e})`,
                      ...toneStyle(tones[wi]),
                    }}
                  >
                    <Word w={w} />
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

void easeOutQuint;
