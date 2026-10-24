import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, exitP, kick} from '../lib/anim';
import {C, EASE_OUT, FONT} from '../theme';

// ── Stamp: red box, -6°, slams with an impact ───────────────────────────────
export const Stamp: React.FC<{text: string; at: number; exitAt: number; x: number; y: number; size?: number}> = ({text, at, exitAt, x, y, size = 118}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > exitAt + 8) return null;
  const t = frame - at;
  const scale = interpolate(t, [0, 6], [1.9, 1], {...clamp, easing: EASE_OUT}) * (1 + 0.04 * kick(frame, at + 6, 5));
  const e = exitP(frame, exitAt, 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${-6 + 2 * kick(frame, at + 5, 6)}deg) scale(${scale * (1 + e * 1.6)})`,
        opacity: interpolate(t, [0, 2], [0.4, 1], clamp) * (1 - e),
        background: C.red,
        color: C.cream,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        padding: '26px 44px 30px',
        borderRadius: 10,
        boxShadow: `inset 0 0 0 7px ${C.red}, inset 0 0 0 12px ${C.cream}, 0 18px 40px rgba(15,15,15,0.25)`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};
