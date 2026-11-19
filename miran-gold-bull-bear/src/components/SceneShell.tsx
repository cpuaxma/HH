import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EASE, TRANSITION} from '../constants';
import {clamp} from '../lib';

/**
 * Wraps a scene inside its <Sequence> and applies the 0.4s fade/slide:
 * in over the first TRANSITION frames, out over the last TRANSITION frames
 * (which overlap the next scene's entrance, so the two cross-fade).
 */
export const SceneShell: React.FC<{children: React.ReactNode; enter?: boolean; exit?: boolean}> = ({
  children,
  enter = true,
  exit = true,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  // Within the 0.4s window the outgoing scene clears first and the incoming one lands last,
  // so titles that share a position never sit on top of each other.
  const tIn = enter ? interpolate(frame, [TRANSITION * 0.35, TRANSITION], [0, 1], {...clamp, easing: EASE.out}) : 1;
  const tOut = exit
    ? interpolate(frame, [durationInFrames - TRANSITION, durationInFrames - TRANSITION * 0.4], [0, 1], {
        ...clamp,
        easing: EASE.in,
      })
    : 0;
  const opacity = tIn * (1 - tOut);
  const y = (1 - tIn) * 60 - tOut * 60;
  return (
    <AbsoluteFill style={{opacity, transform: `translateY(${y}px)`}}>
      {children}
    </AbsoluteFill>
  );
};
