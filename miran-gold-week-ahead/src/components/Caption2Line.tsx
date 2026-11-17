import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, LAYOUT} from '../brand';
import type {Caption} from '../edition';
import {CAPTIONS} from '../timeline';
import {ArabicWordReveal, captionWordFrames} from './ArabicWordReveal';

/**
 * Bottom-third caption system: 2 lines max. Line 1 off-white, line 2 gold.
 * Captions swap on the beat, word by word. Chapter captions ("01 · التضخم") sit on one line.
 */
export const Captions: React.FC<{captions: Record<string, Caption>}> = ({captions}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top: LAYOUT.captionTop,
        left: 90,
        right: 150,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {CAPTIONS.filter((c) => f >= c.from - 2 && f <= c.to + 12).map((c) => {
        const cap = captions[c.key];
        if (!cap) return null;
        const {l2Start} = captionWordFrames(cap.l1, cap.l2, c.from, cap.oneLine);
        const exitAt = c.to;
        if (cap.oneLine) {
          return (
            <div key={c.key} dir="rtl" style={{position: 'absolute', display: 'flex', gap: 22, alignItems: 'baseline', justifyContent: 'center'}}>
              <ArabicWordReveal text={cap.l1} start={c.from} size={74} weight={FONT.arBold} color={C.label} exitAt={exitAt} />
              <ArabicWordReveal text={cap.l2} start={l2Start} size={74} weight={FONT.arBold} gold exitAt={exitAt} sheenAt={l2Start + 18} />
            </div>
          );
        }
        return (
          <div key={c.key} style={{position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0}}>
            {cap.l1 ? <ArabicWordReveal text={cap.l1} start={c.from} size={50} weight={FONT.arBody} color={C.text} exitAt={exitAt} /> : null}
            <ArabicWordReveal text={cap.l2} start={l2Start} size={cap.l1 ? 58 : 66} weight={FONT.arBold} gold exitAt={exitAt} sheenAt={l2Start + 20} />
          </div>
        );
      })}
    </div>
  );
};
