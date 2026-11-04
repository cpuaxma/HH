// Big kinetic type, Arabic first (RTL). Each WORD springs up through a line mask (never
// letter by letter, so Arabic letters stay joined; no letter-spacing), then the line leaves
// upwards. Key words get the gold gradient, losses get red. Numbers are wrapped in <bdi>.
// Lines over busy screen content get a dark glass backing block that wipes in behind them.
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

/** Tone of each word: phrases in `gold` / `red` are matched word by word (punctuation ignored). */
export const tonesFor = (words: string[], gold: string[] = [], red: string[] = []): Tone[] => {
  const out: Tone[] = words.map(() => null);
  const mark = (list: string[], tone: Tone) =>
    list.forEach((phrase) => {
      const parts = phrase.split(' ');
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
      ? {color: BRAND.red}
      : {color: BRAND.text};

/** A word, with any run of Western digits (and %, $, commas) isolated in <bdi>. */
export const Word: React.FC<{w: string}> = ({w}) => {
  const parts = w.split(/([$]?[0-9][0-9,.]*%?)/).filter(Boolean);
  return <>{parts.map((p, i) => (/[0-9]/.test(p) ? <bdi key={i}>{p}</bdi> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
};

export const fitSize = (lines: string[], maxSize: number, width: number) =>
  Math.min(maxSize, ...lines.map((l) => fitText({text: l, withinWidth: width, fontFamily: FAMILY, fontWeight: String(WEIGHT)}).fontSize));

/** True while any word of this block is moving (used to switch the DOM motion blur on). */
export const kineticMoving = (f: number, p: Pick<KineticProps, 'block' | 'inAt' | 'outAt' | 'stagger'>) => {
  const words = p.block.lines.join(' ').split(' ').length;
  const st = p.stagger ?? 4;
  return (f >= p.inAt - 1 && f <= p.inAt + words * st + 30) || (f >= p.outAt - 16 && f <= p.outAt + 12);
};

export const Kinetic: React.FC<KineticProps> = ({block, lang, inAt, outAt, top, maxSize, backing, stagger = 4, x = COLUMN.x, width = COLUMN.width}) => {
  const frame = useCurrentFrame();
  if (frame < inAt - 8 || frame > outAt + 16) return null;
  const rtl = lang === 'ar';
  const padX = backing ? 30 : 0;
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
        const words = line.split(' ');
        const tones = tonesFor(words, block.gold, block.red);
        const bIn = ramp(frame, inAt - 8 + li * 5, inAt + 10 + li * 5, easeOutQuint);
        const bOut = ramp(frame, outAt - 4 + li * 2, outAt + 10 + li * 2, easeIn);
        return (
          <div key={li} style={{position: 'relative', padding: backing ? `0 ${padX}px` : 0}}>
            {backing ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 24,
                  background: 'rgba(10,14,24,0.86)',
                  border: '1.5px solid rgba(212,162,76,0.28)',
                  boxShadow: '0 18px 44px rgba(0,0,0,0.45)',
                  transformOrigin: (bOut > 0) !== rtl ? 'right center' : 'left center',
                  transform: `scaleX(${bIn * (1 - bOut)})`,
                }}
              />
            ) : null}
            {/* The mask: generous above and below so Arabic marks are never clipped. */}
            <div style={{position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: `${size * 0.26}px`, overflow: 'hidden', whiteSpace: 'nowrap', padding: `${size * 0.1}px ${size * 0.08}px ${size * 0.16}px`, margin: `${-size * 0.1}px 0 ${-size * 0.16}px`}}>
              {words.map((w, wi) => {
                const i = wordIndex++;
                const start = inAt + i * stagger;
                const p = springAt(frame - start, {freq: 2.1, damping: 0.52});
                const q = ramp(frame, outAt - 10 + i * 1.5, outAt + 2 + i * 1.5, easeIn);
                return (
                  <span
                    key={wi}
                    style={{
                      display: 'inline-block',
                      opacity: clamp01(p * 2.5) * (1 - q),
                      transform: `translateY(${(1 - p) * lineH * 0.9 - q * lineH * 0.95}px) rotate(${(rtl ? -1 : 1) * (1 - p) * 6}deg)`,
                      transformOrigin: rtl ? 'right bottom' : 'left bottom',
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

/** The mirrored split for one pillar: the red "without" on the left phone's side, the gold "with" on the right. */
export const SplitPair: React.FC<{
  lang: Lang;
  index: number;
  name: string;
  word: string;
  without: string;
  withText: string;
  chipIn: number;
  redIn: number;
  goldIn: number;
  out: number;
  top: number;
  size: number;
}> = ({lang, index, name, word, without, withText, chipIn, redIn, goldIn, out, top, size}) => {
  const frame = useCurrentFrame();
  if (frame < chipIn - 8 || frame > out + 16) return null;
  const rtl = lang === 'ar';
  const gap = 20;
  const halfW = (COLUMN.width - gap) / 2;
  const fs = Math.min(fitSize([without], size, halfW - 64), fitSize([withText], size, halfW - 64));
  const lineH = fs * 1.5;
  const half = (s: string, at: number, tone: 'red' | 'gold', fromLeft: boolean) => {
    const words = s.split(' ');
    const bIn = ramp(frame, at - 6, at + 12, easeOutQuint);
    const bOut = ramp(frame, out - 4, out + 10, easeIn);
    return (
      <div style={{position: 'relative', width: halfW, height: lineH + 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 22,
            background: tone === 'red' ? 'linear-gradient(180deg, rgba(40,14,18,0.9), rgba(16,10,16,0.9))' : 'linear-gradient(180deg, rgba(36,28,14,0.9), rgba(12,14,22,0.9))',
            border: `1.5px solid ${tone === 'red' ? 'rgba(217,83,79,0.55)' : 'rgba(212,162,76,0.6)'}`,
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            transformOrigin: fromLeft ? 'left center' : 'right center',
            transform: `scaleX(${bIn * (1 - bOut)})`,
          }}
        />
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{position: 'relative', display: 'flex', flexDirection: 'row', gap: `${fs * 0.26}px`, overflow: 'hidden', whiteSpace: 'nowrap', padding: `${fs * 0.1}px ${fs * 0.08}px ${fs * 0.16}px`, fontSize: fs, lineHeight: `${lineH}px`}}
        >
          {words.map((w, i) => {
            const p = springAt(frame - (at + i * 4), {freq: 2.2, damping: 0.55});
            const q = ramp(frame, out - 10 + i * 1.5, out + 2 + i * 1.5, easeIn);
            const dx = (fromLeft ? -1 : 1) * (1 - p) * 16;
            const dy = (1 - p) * lineH * 0.85;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: clamp01(p * 2.5) * (1 - q),
                  transform: `translate(${dx}px, ${dy - q * lineH * 0.9}px)`,
                  ...toneStyle(tone),
                }}
              >
                <Word w={w} />
              </span>
            );
          })}
        </div>
      </div>
    );
  };
  const cIn = springAt(frame - chipIn, {freq: 2.2, damping: 0.6});
  const cOut = ramp(frame, out - 6, out + 8, easeIn);
  const divider = ramp(frame, redIn, goldIn + 10, easeOutQuint) * (1 - ramp(frame, out - 4, out + 8, easeIn));
  return (
    <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top, fontFamily: FAMILY, fontWeight: WEIGHT}}>
      {/* Pillar chip: "الركيزة 1/3 · الاستراتيجية". */}
      <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            opacity: clamp01(cIn * 2) * (1 - cOut),
            transform: `translateY(${(1 - cIn) * 24}px) scale(${0.9 + 0.1 * cIn})`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '6px 26px 8px',
            borderRadius: 999,
            background: 'rgba(10,14,24,0.88)',
            border: '1.5px solid rgba(212,162,76,0.45)',
            fontSize: 30,
            lineHeight: '46px',
            fontWeight: 600,
            color: BRAND.text,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{color: 'rgba(245,241,232,0.62)', fontWeight: 600}}>
            {word} <bdi>{index + 1}/3</bdi>
          </span>
          <span style={{width: 8, height: 8, borderRadius: 4, background: BRAND.goldA}} />
          <span style={{...toneStyle('gold'), fontWeight: 700}}>{name}</span>
        </div>
      </div>
      <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'ltr'}}>
        {half(without, redIn, 'red', true)}
        <div
          style={{
            position: 'absolute',
            left: COLUMN.width / 2 - 1.5,
            top: 6,
            bottom: 6,
            width: 3,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${BRAND.red}, ${BRAND.goldB})`,
            transform: `scaleY(${divider})`,
            opacity: divider,
          }}
        />
        {half(withText, goldIn, 'gold', false)}
      </div>
    </div>
  );
};
