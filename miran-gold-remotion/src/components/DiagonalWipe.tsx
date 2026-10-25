import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ease, HEIGHT, WIDTH} from '../theme';

export const WIPE_DURATION = 12;

// Position of the wipe edge: the line y = x + HEIGHT - d sweeps from the
// bottom-left corner to the top-right corner as d goes 0 → WIDTH + HEIGHT.
export const wipeEdge = (frame: number, start: number) =>
  interpolate(frame, [start, start + WIPE_DURATION], [-250, WIDTH + HEIGHT + 250], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.sweep,
  });

// clip-path for the part of the frame the wipe has (or has not yet) passed
export const wipeClip = (d: number, swept: boolean) => {
  const c = HEIGHT - d;
  const far = swept ? 40000 : -40000;
  return `polygon(-3000px ${-3000 + c}px, 6000px ${6000 + c}px, 6000px ${far}px, -3000px ${far}px)`;
};

const STREAKS = [
  {offset: 0, thickness: 26, opacity: 1, blur: 6},
  {offset: -70, thickness: 60, opacity: 0.45, blur: 22},
  {offset: 60, thickness: 12, opacity: 0.6, blur: 3},
  {offset: -160, thickness: 120, opacity: 0.2, blur: 40},
];

// Blurred bright streaks riding the wipe edge
export const DiagonalWipe: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > start + WIPE_DURATION) return null;
  const d = wipeEdge(frame, start);
  // Point on the edge at the horizontal centre of the frame
  const px = WIDTH / 2;
  const py = WIDTH / 2 + HEIGHT - d;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {STREAKS.map((s, i) => {
        // Offset along the edge normal (1,-1)/√2: positive = ahead of the wipe
        const nx = (s.offset * Math.SQRT1_2);
        const ny = -(s.offset * Math.SQRT1_2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px + nx - 2200,
              top: py + ny - s.thickness / 2,
              width: 4400,
              height: s.thickness,
              transform: 'rotate(45deg)',
              background:
                'linear-gradient(90deg, rgba(243,210,122,0) 0%, rgba(243,210,122,0.9) 30%, rgba(255,250,235,1) 50%, rgba(243,210,122,0.9) 70%, rgba(243,210,122,0) 100%)',
              opacity: s.opacity,
              filter: `blur(${s.blur}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
