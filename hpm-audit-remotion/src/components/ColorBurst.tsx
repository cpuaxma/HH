import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {progress} from '../lib/anim';
import {C, EASE_OUT} from '../theme';

const COLORS = [C.cobalt, C.butter, C.pink, C.cobalt, C.butter, C.pink, C.white];

// A burst of the café's new palette (dots, squares, squiggles) flying out from a point.
// Marks the moment the rebrand lands, so the colour change reads as an event.
export const ColorBurst: React.FC<{at: number; x: number; y: number; radius?: number; count?: number; seed?: string}> = ({at, x, y, radius = 520, count = 22, seed = 'b'}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 50) return null;
  const out = progress(t, 0, 34, EASE_OUT);
  const fade = 1 - progress(t, 26, 24);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0}}>
      {/* expanding ring */}
      <div
        style={{
          position: 'absolute',
          left: x - radius * out,
          top: y - radius * out,
          width: 2 * radius * out,
          height: 2 * radius * out,
          borderRadius: '50%',
          border: `${18 * (1 - out) + 2}px solid ${C.butter}`,
          opacity: 0.9 * (1 - out),
        }}
      />
      {Array.from({length: count}, (_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`${seed}a${i}`) * 0.4;
        const d = radius * (0.55 + random(`${seed}d${i}`) * 0.6) * out;
        const size = 26 + random(`${seed}s${i}`) * 34;
        const kind = i % 3;
        const color = COLORS[i % COLORS.length];
        const rot = (random(`${seed}r${i}`) - 0.5) * 540 * out;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(a) * d - size / 2,
              top: y + Math.sin(a) * d - size / 2,
              width: size,
              height: kind === 2 ? size * 0.32 : size,
              borderRadius: kind === 0 ? '50%' : kind === 1 ? 6 : size,
              background: color,
              transform: `rotate(${rot}deg) scale(${0.4 + 0.6 * Math.min(1, t / 6)})`,
              opacity: fade,
              boxShadow: '0 6px 14px rgba(15,15,15,0.18)',
            }}
          />
        );
      })}
    </div>
  );
};
