import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CAPTIONS} from '../captions';
import {CAPTION_BOTTOM, COLORS, EASE, FONT, s, SAFE} from '../constants';
import {clamp, springAt} from '../lib';
import {parseRich, WordView} from './RichText';

const WORD_STAGGER = 2; // frames between words popping in
const FADE = 6;

/** Large Arabic captions, word-by-word pop-in, gold key words. Rendered above every scene. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cap = CAPTIONS.find((c) => !c.onScreen && t >= c.start && t < c.end);
  if (!cap) return null;

  const start = s(cap.start);
  const end = s(cap.end);
  const local = frame - start;
  const out = interpolate(frame, [end - FADE, end], [0, 1], {...clamp, easing: EASE.in});
  const words = parseRich(cap.text);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.side,
          right: SAFE.side,
          bottom: CAPTION_BOTTOM,
          display: 'flex',
          justifyContent: 'center',
          opacity: (1 - out) * interpolate(local, [0, FADE], [0, 1], clamp),
          transform: `translateY(${out * -14}px)`,
        }}
      >
        <div
          dir="rtl"
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: 64,
            lineHeight: 1.45,
            color: COLORS.white,
            textAlign: 'center',
            padding: '18px 34px 22px',
            borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.55), rgba(10,10,10,0.78))',
            boxShadow: '0 0 0 1.5px rgba(212,175,55,0.18) inset',
            textShadow: '0 3px 12px rgba(0,0,0,0.8)',
          }}
        >
          {words.map((w, i) => {
            const p = springAt(local, i * WORD_STAGGER, {damping: 16, stiffness: 220});
            return (
              <React.Fragment key={i}>
                <WordView
                  word={w}
                  style={{
                    opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
                    transform: `translateY(${(1 - p) * 26}px) scale(${0.86 + 0.14 * p})`,
                  }}
                />
                {i < words.length - 1 ? ' ' : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
