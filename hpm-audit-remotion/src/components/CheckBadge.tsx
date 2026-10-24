import React from 'react';
import {useCurrentFrame} from 'remotion';
import {exitP, pop, progress} from '../lib/anim';
import {handCheck} from '../lib/path';
import {C, EASE_OUT} from '../theme';

// ── Red check badge (drawn stroke) ─────────────────────────────────────────
export const CheckBadge: React.FC<{at: number; x: number; y: number; size?: number; exitAt?: number}> = ({at, x, y, size = 96, exitAt}) => {
  const frame = useCurrentFrame();
  if (frame < at || (exitAt !== undefined && frame > exitAt + 8)) return null;
  const s = pop(frame, at);
  const d = progress(frame, at + 2, 8, EASE_OUT);
  const e = exitAt !== undefined ? exitP(frame, exitAt, 8) : 0;
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: x, top: y, transform: `scale(${s * (1 - e)})`, overflow: 'visible'}}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={C.red} />
      <path d={handCheck(size * 0.18, size * 0.16, size * 0.66)} stroke={C.cream} strokeWidth={size * 0.11} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} />
    </svg>
  );
};
