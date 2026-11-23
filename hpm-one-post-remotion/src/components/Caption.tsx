import React from 'react';
import {CAPTION, COLORS, FONT, MOTION, SIZES} from '../config';
import {clamp, spr} from '../lib/anim';
import {CX} from '../lib/layout';
import {fitSize, parseLine} from '../lib/text';
import {useSceneFrame} from './SceneShell';

type Props = {
  lines: readonly string[];
  at: number; // scene frame where the first word lands
  top?: number;
  size?: number;
  maxWidth?: number;
  accent?: string;
  stagger?: number;
  color?: string;
};

/** Burned-in caption: springs in word by word, then stays. Max 5 words/line, 2 lines. */
export const Caption: React.FC<Props> = ({
  lines,
  at,
  top = CAPTION.top,
  size = SIZES.caption,
  maxWidth = CAPTION.maxWidth,
  accent = CAPTION.accent,
  stagger = CAPTION.wordStagger,
  color = COLORS.ink,
}) => {
  const t = useSceneFrame();
  const fontSize = fitSize([...lines], size, maxWidth);
  let wi = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: CX - maxWidth / 2,
        width: maxWidth,
        top,
        textAlign: 'center',
        fontFamily: FONT.family,
        fontWeight: FONT.bold,
        fontSize,
        lineHeight: CAPTION.lineHeight,
        letterSpacing: '-0.02em',
        color,
      }}
    >
      {lines.slice(0, 2).map((line, li) => (
        <div key={li}>
          <span data-qa="text" style={{whiteSpace: 'nowrap', display: 'inline-flex', gap: '0.26em'}}>
          {parseLine(line)
            .slice(0, 5)
            .map((w, i) => {
              const s = spr(t, at + wi++ * stagger, MOTION.snap);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    color: w.accent ? accent : color,
                    opacity: clamp(s * 1.6),
                    transform: `translateY(${((1 - s) * 0.7 * fontSize).toFixed(1)}px) scale(${(0.8 + 0.2 * s).toFixed(4)})`,
                    filter: s < 0.98 ? `blur(${((1 - clamp(s)) * 10).toFixed(1)}px)` : undefined,
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </span>
        </div>
      ))}
    </div>
  );
};
