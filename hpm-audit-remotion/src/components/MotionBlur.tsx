import {CameraMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {inWindow} from '../timeline';

// ── Motion blur, switched on only inside fast-move windows ────────────────────
// Always the same element tree (samples just changes), so 3D canvases stay mounted.
// Outside a window it runs at 1 sample with a 360° shutter, which renders exactly the current frame.
export const Blur: React.FC<{windows: [number, number][]; samples?: number; shutter?: number; children: React.ReactNode}> = ({windows, samples = 6, shutter = 360, children}) => {
  const frame = useCurrentFrame();
  const on = inWindow(frame, windows);
  return (
    <CameraMotionBlur shutterAngle={on ? shutter : 360} samples={on ? samples : 1}>
      {children}
    </CameraMotionBlur>
  );
};
