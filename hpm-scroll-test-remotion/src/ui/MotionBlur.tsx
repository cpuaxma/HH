// Real motion blur for the HTML layers, from @remotion/motion-blur's CameraMotionBlur:
// it stacks copies of the layer rendered at sub-frame times. CameraMotionBlur samples
// from (frame + 0.5) to (frame + 1) at a 180° shutter, so the layer is frozen 0.75 frame
// earlier to centre its shutter on the frame, like the 3D renderer's. It only runs while
// something on the layer is moving: still moments stay perfectly crisp.
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Freeze, useCurrentFrame} from 'remotion';

export const MotionBlurLayer: React.FC<{moving: (frame: number) => boolean; samples?: number; children: React.ReactNode}> = ({
  moving,
  samples = 10,
  children,
}) => {
  const frame = useCurrentFrame();
  if (!moving(frame)) return <>{children}</>;
  return (
    <Freeze frame={frame - 0.75}>
      <CameraMotionBlur shutterAngle={180} samples={samples}>
        {children}
      </CameraMotionBlur>
    </Freeze>
  );
};

/** True if the frame is inside any [start, end] window. */
export const inWindows = (windows: [number, number][]) => (f: number) => windows.some(([a, b]) => f >= a && f <= b);
