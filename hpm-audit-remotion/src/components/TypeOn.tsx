import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix, pop, progress} from '../lib/anim';
import {C, EASE_OUT} from '../theme';

// ── TypeOn: per-letter pop with a cursor ───────────────────────────────────
// Every character is laid out from the start (unrevealed ones are transparent) and words never
// split, so the text wraps exactly like the final static copy and nothing jumps while typing.
// Grapheme clusters, so emoji with variation selectors (🌶️) stay whole.
const graphemes = (s: string) => Array.from(new Intl.Segmenter('en', {granularity: 'grapheme'}).segment(s), (g) => g.segment);

export type TypePart = {text: string; from: number; to: number};
export const TypeOn: React.FC<{parts: TypePart[]; style?: React.CSSProperties; cursorColor?: string; cursorUntil?: number}> = ({parts, style, cursorColor = C.red, cursorUntil}) => {
  const frame = useCurrentFrame();
  const chars: {ch: string; t: number}[] = [];
  for (const p of parts) {
    const cs = graphemes(p.text);
    cs.forEach((ch, i) => chars.push({ch, t: cs.length === 1 ? p.from : mix(p.from, p.to, i / (cs.length - 1))}));
  }
  const lastVisible = chars.reduce((acc, c, i) => (frame >= c.t ? i : acc), -1);
  const lastT = chars[chars.length - 1]?.t ?? 0;
  const showCursor = frame < (cursorUntil ?? lastT + 30) && Math.floor(frame / 15) % 2 === 0;
  const words: {ch: string; t: number; i: number}[][] = [[]];
  chars.forEach((c, i) => {
    if (c.ch === ' ') words.push([{...c, i}], []);
    else words[words.length - 1].push({...c, i});
  });
  const renderChar = (c: {ch: string; t: number; i: number}) => {
    const k = progress(frame, c.t, 5, EASE_OUT);
    const big = c.ch === '\u2615' || c.ch === '\u2193';
    return (
      <span
        key={c.i}
        style={{
          position: 'relative',
          display: 'inline-block',
          whiteSpace: 'pre',
          opacity: frame >= c.t ? 1 : 0,
          transform: `translateY(${(1 - k) * -10}px) scale(${mix(big ? 1.9 : 1.35, 1, k)})`,
          transformOrigin: '50% 80%',
        }}
      >
        {c.ch}
        {c.i === lastVisible && showCursor && (
          <span style={{position: 'absolute', right: -9, top: '0.08em', width: 5, height: '0.95em', background: cursorColor}} />
        )}
      </span>
    );
  };
  return (
    <div style={style}>
      {words.map((w, wi) =>
        w.length === 1 && w[0].ch === ' ' ? (
          <span key={wi}> </span>
        ) : (
          <span key={wi} style={{display: 'inline-block', whiteSpace: 'nowrap'}}>
            {w.map(renderChar)}
          </span>
        ),
      )}
    </div>
  );
};
