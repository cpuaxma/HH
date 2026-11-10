// Everything drawn in HTML over the 3D for the animals reel: the opening question, one short
// name label per animal, the note under the hawk and the dove, the «توضيحي» chip, the shared
// end card and the shared finish (grain, vignette). No caption blocks.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, COLUMN, GOLD_GRADIENT} from '../data';
import {FAMILY} from '../fonts';
import {clamp01, easeIn, easeOut, ramp, springAt} from '../lib/ease';
import {EndCard, EndCardCfg, Finish, SafeZones} from '../ui/Overlays';
import {AnimalsFormat, COPY, END, ILLUSTRATIVE, LAYOUT, SHOW_HOOK_TITLE, T} from './data';

type Shown = {text: string; inAt: number; outAt: number};

/** Which label is on screen when (one at a time). */
export const LABELS: Shown[] = [
  {text: COPY.labels.bull, inAt: T.bullLabel, outAt: T.bearAt - 22},
  {text: COPY.labels.bear, inAt: T.bearLabel, outAt: T.whaleAt - 22},
  {text: COPY.labels.whale, inAt: T.whaleLabel, outAt: T.hawkAt - 18},
  {text: COPY.labels.hawk, inAt: T.hawkLabel, outAt: T.doveAt - 22},
  {text: COPY.labels.dove, inAt: T.doveLabel, outAt: T.phoneAt + 6},
];

/** In: a soft spring up out of a blur. Out: lifts away and blurs. */
const show = (f: number, inAt: number, outAt: number) => {
  const a = clamp01(springAt(f - inAt, {freq: 1.6, damping: 0.78}));
  const b = ramp(f, outAt, outAt + 16, easeIn);
  return {a: a * (1 - b), dy: (1 - a) * 36 - b * 22, blur: (1 - a) * 14 + b * 10, s: 0.94 + 0.06 * a};
};

const Title: React.FC<{fmt: AnimalsFormat; f: number}> = ({fmt, f}) => {
  if (!SHOW_HOOK_TITLE || f > T.hookTitleOut + 20) return null;
  const L = LAYOUT[fmt];
  const k = show(f, T.hookTitleIn, T.hookTitleOut);
  if (k.a <= 0.001) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: COLUMN.x - 40,
        width: COLUMN.width + 80,
        top: L.titleTop,
        textAlign: 'center',
        fontFamily: FAMILY,
        fontWeight: 700,
        fontSize: L.titleSize,
        lineHeight: 1.45,
        color: BRAND.text,
        opacity: k.a,
        transform: `translateY(${k.dy}px) scale(${k.s})`,
        filter: k.blur > 0.05 ? `blur(${k.blur.toFixed(2)}px)` : undefined,
        textShadow: '0 4px 30px rgba(5,8,16,0.85), 0 1px 3px rgba(5,8,16,0.9)',
        whiteSpace: 'nowrap',
      }}
    >
      {COPY.hook}
    </div>
  );
};

/** One animal's name: big gold letters with a gold rule that draws in under them. */
const Label: React.FC<{fmt: AnimalsFormat; f: number; l: Shown}> = ({fmt, f, l}) => {
  if (f < l.inAt - 2 || f > l.outAt + 18) return null;
  const L = LAYOUT[fmt];
  const k = show(f, l.inAt, l.outAt);
  const rule = ramp(f, l.inAt + 6, l.inAt + 30, easeOut) * (1 - ramp(f, l.outAt, l.outAt + 12, easeIn));
  const shine = ramp(f, l.inAt + 10, l.inAt + 50, easeOut);
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        top: L.labelTop,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: FAMILY,
        opacity: k.a,
        transform: `translateY(${k.dy}px) scale(${k.s})`,
        filter: k.blur > 0.05 ? `blur(${k.blur.toFixed(2)}px)` : undefined,
      }}
    >
      <div style={{position: 'relative', fontSize: L.labelSize, fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap'}} dir="rtl">
        {/* A dark copy behind, for contrast on any background. */}
        <span style={{position: 'absolute', inset: 0, color: 'rgba(4,6,12,0.7)', filter: 'blur(16px)'}}>{l.text}</span>
        <span
          style={{
            position: 'relative',
            backgroundImage: `linear-gradient(100deg, ${BRAND.goldA} 0%, ${BRAND.goldB} ${20 + 50 * shine}%, #FFF4D6 ${28 + 50 * shine}%, ${BRAND.goldB} ${36 + 50 * shine}%, ${BRAND.goldA} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {l.text}
        </span>
      </div>
      <div style={{width: 220 * rule, height: 4, borderRadius: 2, marginTop: 2, background: GOLD_GRADIENT, boxShadow: '0 0 18px rgba(243,210,122,0.6)'}} />
    </div>
  );
};

const Note: React.FC<{fmt: AnimalsFormat; f: number}> = ({fmt, f}) => {
  if (f < T.noteIn - 2 || f > T.noteOut + 18) return null;
  const L = LAYOUT[fmt];
  const k = show(f, T.noteIn, T.noteOut);
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: COLUMN.x - 40,
        width: COLUMN.width + 80,
        top: L.labelTop + L.labelSize * 1.3 + 22,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: FAMILY,
        opacity: k.a,
        transform: `translateY(${k.dy * 0.6}px)`,
        filter: k.blur > 0.05 ? `blur(${(k.blur * 0.6).toFixed(2)}px)` : undefined,
      }}
    >
      <span
        style={{
          fontSize: L.noteSize,
          fontWeight: 600,
          lineHeight: 1.5,
          padding: '6px 26px 8px',
          borderRadius: 999,
          color: '#EDE7DA',
          background: 'rgba(12,16,28,0.62)',
          border: '1.5px solid rgba(243,210,122,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        {COPY.note}
      </span>
    </div>
  );
};

/** «توضيحي»: on screen from the first second to the end card. */
const Chip: React.FC<{fmt: AnimalsFormat; f: number}> = ({fmt, f}) => {
  const L = LAYOUT[fmt];
  const a = ramp(f, 6, 24, easeOut) * (1 - ramp(f, T.endCardStart, T.endCardStart + 20, easeIn));
  if (a <= 0.001) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: 0,
        width: L.width,
        top: L.labelTop + L.labelSize * 1.3 + 22 + L.noteSize * 1.5 + 34,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: FAMILY,
        opacity: a,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 600,
          lineHeight: '34px',
          padding: '0 16px',
          borderRadius: 17,
          color: '#C3C8D3',
          background: 'rgba(18,24,38,0.8)',
          border: '1px solid rgba(255,255,255,0.22)',
        }}
      >
        {ILLUSTRATIVE}
      </span>
    </div>
  );
};

export const ANIMALS_END: EndCardCfg = {
  timing: T,
  copy: () => END,
  layout: (fmt) => LAYOUT[fmt],
  disclaimerSize: (fmt) => LAYOUT[fmt].disclaimerSize,
};

export const AnimalsOverlays: React.FC<{fmt: AnimalsFormat; showSafeZones?: boolean}> = ({fmt, showSafeZones}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title fmt={fmt} f={f} />
      {LABELS.map((l, i) => (
        <Label key={i} fmt={fmt} f={f} l={l} />
      ))}
      <Note fmt={fmt} f={f} />
      <Chip fmt={fmt} f={f} />
      <EndCard fmt={fmt} lang="ar" cfg={ANIMALS_END} />
      <Finish holdFrom={T.holdFrom} />
      {showSafeZones ? <SafeZones fmt={fmt} /> : null}
    </>
  );
};
