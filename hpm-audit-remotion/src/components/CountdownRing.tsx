import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop, progress} from '../lib/anim';
import {C, EASE_IN, EASE_OUT, FONT} from '../theme';

// ── CountdownRing: 3 → 2 → 1 on the beats ──────────────────────────────────
export const CountdownRing: React.FC<{at: number[]; closeAt: number; x: number; y: number; r?: number}> = ({at, closeAt, x, y, r = 190}) => {
  const frame = useCurrentFrame();
  if (frame < at[0] || frame > closeAt + 16) return null;
  const idx = at.reduce((acc, f, i) => (frame >= f ? i : acc), 0);
  const n = at.length - idx;
  const beatLen = (at[1] ?? at[0] + 30) - at[0];
  const remain = frame >= closeAt ? 0 : 1 - (frame - at[idx]) / beatLen;
  const s = pop(frame, at[0]);
  const close = progress(frame, closeAt, 14, EASE_IN);
  const numPop = interpolate(frame - at[idx], [0, 6], [1.5, 1], {...clamp, easing: EASE_OUT});
  const circ = 2 * Math.PI * r;
  return (
    <div style={{position: 'absolute', left: x - r - 30, top: y - r - 30, width: 2 * r + 60, height: 2 * r + 60, transform: `scale(${s * (1 - close)}) rotate(${close * 90}deg)`}}>
      <svg width={2 * r + 60} height={2 * r + 60}>
        <circle cx={r + 30} cy={r + 30} r={r} fill="rgba(15,15,15,0.55)" stroke={C.cream} strokeOpacity={0.35} strokeWidth={22} />
        <circle
          cx={r + 30}
          cy={r + 30}
          r={r}
          fill="none"
          stroke={C.red}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={`${circ * Math.max(0, remain)} ${circ}`}
          transform={`rotate(-90 ${r + 30} ${r + 30})`}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 230, color: C.cream, transform: `scale(${numPop})`, letterSpacing: '-0.04em'}}>
        {n}
      </div>
    </div>
  );
};
