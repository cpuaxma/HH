import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EASE} from '../theme';
import {hexA} from '../motion';

const BANDS = [
  {delay: 0, w: 260, color: '#FFF6DC', o: 0.8},
  {delay: 2, w: 140, color: '#F3D27A', o: 0.85},
  {delay: 3, w: 420, color: '#C8963E', o: 0.45},
  {delay: 5, w: 90, color: '#FFFFFF', o: 0.9},
];

/** Fast diagonal light-sweep in gold: blurred bright streaks cross the frame in ~12 frames. */
export const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [4, 9, 18], [0, 0.2, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: hexA('#F3D27A', flash)}} />
      {BANDS.map((b, i) => {
        const t = interpolate(frame, [b.delay, b.delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
        if (t <= 0 || t >= 1) return null;
        const x = interpolate(t, [0, 1], [1500, -900]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: -600,
              width: b.w,
              height: 3200,
              transform: 'rotate(28deg)',
              background: `linear-gradient(90deg, ${hexA(b.color, 0)} 0%, ${hexA(b.color, b.o)} 50%, ${hexA(b.color, 0)} 100%)`,
              filter: `blur(${18 + i * 6}px)`,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
