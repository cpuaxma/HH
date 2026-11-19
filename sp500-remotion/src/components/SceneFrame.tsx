import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AMBIENCE} from '../config';
import {EASE, ease} from '../lib/motion';

type Props = {
  /** the scene's global start frame */
  from: number;
  /** global frames over which the camera pushes in. Scenes that share elements share a range, so nothing jumps at the handoff. */
  range: [number, number];
  children: React.ReactNode;
};

/** Slow camera push-in (scale 1 -> 1 + AMBIENCE.pushIn). */
export const SceneFrame: React.FC<Props> = ({from, range, children}) => {
  const frame = useCurrentFrame() + from;
  const push = ease(frame, range, [0, AMBIENCE.pushIn], EASE.inOut);
  return <AbsoluteFill style={{transform: `scale(${1 + push})`, transformOrigin: '50% 50%'}}>{children}</AbsoluteFill>;
};
