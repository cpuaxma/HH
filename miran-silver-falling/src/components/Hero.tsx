import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';

/**
 * Full-frame layer for a hero object. While the object is moving fast (frames in
 * [from, to), local to the enclosing Sequence) it is rendered through <CameraMotionBlur>;
 * once settled it renders plainly, so still frames cost nothing extra.
 */
export const HeroLayer: React.FC<{from: number; to: number; children: React.ReactNode; samples?: number}> = ({
  from,
  to,
  children,
  samples = 6,
}) => {
  const frame = useCurrentFrame();
  if (frame >= from && frame < to) {
    return (
      <CameraMotionBlur shutterAngle={180} samples={samples}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </CameraMotionBlur>
    );
  }
  return <AbsoluteFill>{children}</AbsoluteFill>;
};
