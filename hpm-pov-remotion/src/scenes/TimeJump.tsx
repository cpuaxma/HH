import React from 'react';
import {AbsoluteFill} from 'remotion';
import {progress} from '../lib/anim';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE} from '../timeline';
import {LOCK} from '../theme';

// A time jump (the rewind and Week 1 / Week 4 / Month 3): the clock, date and chip roll
// (LockClock) while two soft light streaks whoosh across the clock, backwards on the rewind. The notifications themselves are data
// (notifications.ts) played by the persistent NotificationStack.
export const TimeJump: React.FC<{from: number; jump: number}> = ({from, jump}) => {
  const f = useSceneFrame(from);
  const {at: start, reverse} = CUE.jumps[jump];
  const streaks = [0, 5].map((d, i) => {
    const p = progress(f, start + d, 26);
    return {p, y: LOCK.clockCenterY - 40 + i * 70, w: 520 - i * 140};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {streaks.map((s, i) =>
        s.p > 0 && s.p < 1 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: s.y,
              left: -s.w + (1080 + s.w * 2) * (reverse ? 1 - s.p : s.p),
              width: s.w,
              height: 10,
              borderRadius: 5,
              background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))',
              filter: 'blur(4px)',
              opacity: Math.sin(Math.PI * s.p),
            }}
          />
        ) : null,
      )}
    </AbsoluteFill>
  );
};
