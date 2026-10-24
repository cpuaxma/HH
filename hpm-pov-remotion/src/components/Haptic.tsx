import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {exit, progress} from '../lib/anim';
import {NOTIFICATIONS} from '../notifications';
import {CUE} from '../timeline';

const BUZZ = 6; // frames
const AMP = 3; // px
const ARRIVALS = [CUE.momIn, ...NOTIFICATIONS.map((n) => n.frame)];

// Haptic buzz: every arrival nudges the whole screen ±3px over 6 frames, decaying.
// In the overheat it builds into a steady shake. t is story time (frozen in the stillness).
export const hapticOffset = (frame: number, t: number) => {
  let x = 0;
  for (const a of ARRIVALS) {
    const n = t - a;
    if (n >= 0 && n < BUZZ) x += AMP * (1 - n / BUZZ) * Math.cos(Math.PI * Math.floor(n));
  }
  const shake = 6 * progress(t, CUE.shakeRamp[0], CUE.shakeRamp[1] - CUE.shakeRamp[0]) * (1 - exit(frame, CUE.clearAll, 20));
  const step = Math.floor(t);
  x += shake * (random(`sx${step}`) * 2 - 1);
  const y = (shake / 3) * (random(`sy${step}`) * 2 - 1);
  // Cap so overlapping buzzes in the flood never exceed the steady shake.
  const cap = Math.max(AMP, shake);
  return {x: Math.max(-cap, Math.min(cap, x)), y};
};

export const Haptic: React.FC<{frame: number; t: number; children: React.ReactNode}> = ({frame, t, children}) => {
  const {x, y} = hapticOffset(frame, t);
  return <AbsoluteFill style={{transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`}}>{children}</AbsoluteFill>;
};
