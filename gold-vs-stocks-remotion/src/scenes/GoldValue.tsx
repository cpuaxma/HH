import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {GoldBar} from '../components/GoldBar';
import {LightStreak} from '../components/LightStreak';
import {S3_GOLD} from '../strings';
import {COLORS, EASE, LAYOUT, SAFE, VIDEO} from '../theme';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const CY = 1090; // centre of the bar / shield
const BAR_W = 400;
const SHIELD =
  `M540 ${CY - 320} C 640 ${CY - 262}, 740 ${CY - 250}, 820 ${CY - 262} L 820 ${CY - 30} ` +
  `C 820 ${CY + 160}, 690 ${CY + 260}, 540 ${CY + 320} C 390 ${CY + 260}, 260 ${CY + 160}, 260 ${CY - 30} ` +
  `L 260 ${CY - 262} C 340 ${CY - 250}, 440 ${CY - 262}, 540 ${CY - 320} Z`;

export const GoldValue: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const bar = hero(frame, 0);
  const horizon = ease(frame, 10, 60);
  const shield = ease(frame, 90, 60);
  // after drawing, the shield glows once and keeps a soft residual glow
  const glow = interpolate(frame, [150, 168, 200], [0, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});

  return (
    <AbsoluteFill>
      <ArabicText block={S3_GOLD} size={76} start={12} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />

      <AbsoluteFill style={exitStyle(out)}>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="gold-horizon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={COLORS.goldA} stopOpacity="0" />
              <stop offset="0.5" stopColor={COLORS.goldB} stopOpacity="0.55" />
              <stop offset="1" stopColor={COLORS.goldA} stopOpacity="0" />
            </linearGradient>
            <filter id="gold-shield-glow" filterUnits="userSpaceOnUse" x={0} y={0} width={VIDEO.width} height={VIDEO.height}>
              <feGaussianBlur stdDeviation={18} />
            </filter>
          </defs>
          {/* faint flat line: stability. Grows outward from the centre. */}
          <line
            x1={540 - 540 * horizon}
            x2={540 + 540 * horizon}
            y1={CY + 40}
            y2={CY + 40}
            stroke="url(#gold-horizon)"
            strokeWidth={1.5}
            opacity={0.5 * Math.min(1, horizon * 4)}
          />
          <path d={SHIELD} fill={hexA(COLORS.goldA, 0.05 * glow)} stroke={COLORS.goldB} strokeWidth={14} opacity={0.55 * glow} filter="url(#gold-shield-glow)" />
          <LightStreak id="gold-shield" d={SHIELD} head={shield} width={2.6} bloom={9} from={[540, CY - 320]} to={[540, CY + 320]} />
        </svg>

        <div style={{position: 'absolute', left: 540 - BAR_W / 2, top: CY - (BAR_W * 170) / 300 / 2 - 10, width: BAR_W, ...heroStyle(bar)}}>
          <GoldBar id="gold-bar" width={BAR_W} frame={frame} sweepStart={70} sweepEvery={90} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
