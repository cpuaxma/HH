import {Trail} from '@remotion/motion-blur';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

type Props = {
  // Local frame window in which the object moves fast
  from: number;
  to: number;
  layers?: number;
  lag?: number;
  children: React.ReactNode;
};

// Motion blur only while something moves fast. The trail strength ramps in and
// out of the window so switching it on and off never pops. Children must be
// absolutely positioned (Trail stacks AbsoluteFill layers).
export const MotionTrail: React.FC<Props> = ({from, to, layers = 6, lag = 0.35, children}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return <>{children}</>;
  const strength = interpolate(frame, [from, from + 3, to - 8, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Trail layers={layers} lagInFrames={lag} trailOpacity={0.55 * strength}>
      {children}
    </Trail>
  );
};
