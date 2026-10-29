import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {DottedMap} from '../components/DottedMap';
import {LightStreak} from '../components/LightStreak';
import {S1_HOOK} from '../strings';
import {COLORS, LAYOUT, SAFE} from '../theme';
import {ease, exitProgress, exitStyle, hexA} from '../motion';

const MAP = {left: 20, top: 790, width: 1040, height: 540};
// A rising gold line across the map (upward overall, small calm pullbacks on the way).
const RISE: [number, number][] = [
  [150, 1270], [260, 1205], [330, 1225], [440, 1120], [510, 1145], [620, 1020], [690, 1045], [800, 920], [900, 860],
];
const RISE_D = 'M' + RISE.map((p) => p.join(' ')).join(' L ');

export const Hook: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur, 26);
  const reveal = ease(frame, 20, 60);
  const spots = ease(frame, 40, 50);
  const line = ease(frame, 60, 70);
  const tip = RISE[RISE.length - 1];

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', ...MAP, ...exitStyle(out)}}>
        <DottedMap frame={frame} width={MAP.width} height={MAP.height} reveal={reveal} spots={spots} />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', ...exitStyle(out)}}>
        <LightStreak id="hook-rise" d={RISE_D} head={line} width={4} from={RISE[0]} to={tip} />
        <circle cx={tip[0]} cy={tip[1]} r={9} fill="#FFF6DA" opacity={ease(frame, 120, 16)} style={{filter: `drop-shadow(0 0 14px ${hexA(COLORS.goldB, 0.9)})`}} />
      </svg>
      <ArabicText
        block={S1_HOOK}
        size={LAYOUT.headlineSize + 6}
        start={0}
        exitEnd={dur}
        style={{position: 'absolute', top: LAYOUT.headlineTop - 10, left: SAFE.side, right: SAFE.side}}
      />
    </AbsoluteFill>
  );
};
