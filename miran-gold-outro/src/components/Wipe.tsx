import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EASE} from '../theme';
import {hexA} from '../motion';

const BANDS = [
  {delay: 0, w: 260, color: '#FFFFFF', o: 0.75},
  {delay: 2, w: 140, color: COLORS.goldB, o: 0.8},
  {delay: 3, w: 420, color: COLORS.goldA, o: 0.45},
  {delay: 5, w: 90, color: '#FFFFFF', o: 0.9},
];

/** Fast diagonal light sweep with a soft gold flash: hides the cut from the video into the outro. */
export const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const flash = interpolate(frame, [0, 6, 18], [0.5, 0.22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const span = Math.hypot(width, height);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: hexA(COLORS.goldB, flash)}} />
      {BANDS.map((b, i) => {
        const t = interpolate(frame, [b.delay, b.delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
        if (t <= 0 || t >= 1) return null;
        const x = interpolate(t, [0, 1], [width + 500, -900]); // right to left, like the RTL text
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: -span * 0.3,
              width: b.w,
              height: span * 1.6,
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
