import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {punchEnv, shake} from '../lib/anim';
import {PUNCHES, SHAKES} from '../timeline';
import {PUNCH} from '../theme';

// ── PunchZoom: whole-frame 1 → 1.08 punch on key hits, plus impact shakes ────
export const PunchZoom: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const env = Math.max(0, ...PUNCHES.map((f) => punchEnv(frame, f)));
  let x = 0;
  let y = 0;
  for (const [f, px] of SHAKES) {
    const s = shake(frame, f, px);
    x += s.x;
    y += s.y;
  }
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${1 + PUNCH.amount * env})`}}>{children}</AbsoluteFill>;
};
