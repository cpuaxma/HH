import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE, FONT, LAYOUT} from '../brand';
import {ArText, splitWords} from './ArabicWordReveal';
import {Icon} from './Icons';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const NEEDS_ISOLATE = /[A-Za-z0-9$%]/;

export type HeadlineItem = {
  key: string;
  from: number;
  to: number;
  l1: string;
  l2: string;
  oneLine?: boolean;
  eyebrow?: string;
  source?: string;
};

const BASE = 104; // headline size; long lines are fitted down to the column width
const MIN = 66;

const fitSize = (text: string, base = BASE) => {
  if (!text) return base;
  const w = measureText({text, fontFamily: 'IBM Plex Sans Arabic', fontSize: base, fontWeight: '700'}).width;
  return Math.max(MIN, Math.min(base, (base * LAYOUT.contentW) / (w * 1.04)));
};

/** One masked line: words rise from below the line (no blur), right to left, 3-frame stagger. */
const MaskedLine: React.FC<{text: string; start: number; exitAt: number; size: number; color: string}> = ({text, start, exitAt, size, color}) => {
  const f = useCurrentFrame();
  const words = splitWords(text);
  return (
    <div dir="rtl" style={{display: 'flex', flexWrap: 'nowrap', columnGap: size * 0.26, overflow: 'hidden', paddingTop: size * 0.3, marginTop: -size * 0.3, paddingBottom: size * 0.2, marginBottom: -size * 0.16}}>
      {words.map((w, i) => {
        const t = interpolate(f, [start + i * 3, start + i * 3 + 20], [0, 1], {...CLAMP, easing: EASE.enter});
        const x = interpolate(f, [exitAt + i * 1, exitAt + i * 1 + 12], [0, 1], {...CLAMP, easing: EASE.exit});
        const y = (1 - t) * 140 - x * 150;
        return (
          <span key={i} style={{display: 'inline-block', transform: `translateY(${y}%)`, color, whiteSpace: 'nowrap'}}>
            {NEEDS_ISOLATE.test(w) ? (
              <bdi dir="ltr" style={{unicodeBidi: 'isolate'}}>
                {w}
              </bdi>
            ) : (
              w
            )}
          </span>
        );
      })}
    </div>
  );
};

/**
 * The hero of every shot (as in the reference): an eyebrow label, a 2-line headline
 * (line 2 in gold) on one right edge, and a small source line.
 */
export const Headline: React.FC<{items: HeadlineItem[]}> = ({items}) => {
  const f = useCurrentFrame();
  return (
    <>
      {items
        .filter((c) => f >= c.from - 2 && f <= c.to + 16)
        .map((c) => {
          const l2Start = c.from + (c.l1 ? splitWords(c.l1).length * 3 + 6 : 0);
          const oneLine = !!c.oneLine;
          const size1 = oneLine ? fitSize(`${c.l1} ${c.l2}`) : fitSize(c.l1);
          const size2 = oneLine ? size1 : fitSize(c.l2);
          const size = Math.min(size1, size2);
          const eIn = interpolate(f, [c.from - 6, c.from + 10], [0, 1], {...CLAMP, easing: EASE.enter});
          const eOut = interpolate(f, [c.to, c.to + 10], [0, 1], CLAMP);
          return (
            <div key={c.key} dir="rtl" style={{position: 'absolute', top: 0, left: 0, right: 0, fontFamily: FONT.ar, fontWeight: 700}}>
              {c.eyebrow ? (
                <div
                  style={{
                    position: 'absolute',
                    top: LAYOUT.eyebrowY,
                    right: LAYOUT.marginX,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: C.peri,
                    fontSize: 30,
                    fontWeight: 700,
                    opacity: eIn * (1 - eOut),
                    transform: `translateX(${(1 - eIn) * 24}px)`,
                  }}
                >
                  {/[0-9٠-٩]/.test(c.eyebrow) ? <Icon name="calendar" size={30} color={C.peri} /> : null}
                  <ArText text={c.eyebrow} />
                </div>
              ) : null}
              <div style={{position: 'absolute', top: LAYOUT.headlineY, right: LAYOUT.marginX, width: LAYOUT.contentW, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.22, fontSize: size}}>
                {oneLine ? (
                  <div style={{display: 'flex', columnGap: size * 0.26}}>
                    <MaskedLine text={c.l1} start={c.from} exitAt={c.to} size={size} color={C.text} />
                    <MaskedLine text={c.l2} start={l2Start} exitAt={c.to} size={size} color={C.gold1} />
                  </div>
                ) : (
                  <>
                    {c.l1 ? <MaskedLine text={c.l1} start={c.from} exitAt={c.to} size={size} color={C.text} /> : null}
                    <MaskedLine text={c.l2} start={l2Start} exitAt={c.to} size={size} color={C.gold1} />
                  </>
                )}
              </div>
              {c.source ? (
                <div
                  style={{
                    position: 'absolute',
                    top: LAYOUT.sourceY,
                    right: LAYOUT.marginX,
                    fontSize: 23,
                    fontWeight: 500,
                    color: C.periDim,
                    opacity: interpolate(f, [c.from + 14, c.from + 28], [0, 1], CLAMP) * (1 - eOut),
                  }}
                >
                  <ArText text={c.source} />
                </div>
              ) : null}
            </div>
          );
        })}
    </>
  );
};
