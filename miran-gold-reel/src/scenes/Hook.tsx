import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {ChartLine} from '../components/ChartLine';
import {LightStreak} from '../components/LightStreak';
import {S1_HOOK} from '../strings';
import {COLORS, EASE, LAYOUT, SAFE} from '../theme';
import {ease, exitProgress, exitStyle, hexA} from '../motion';

const W = 800;
const H = 520;
const RED_PTS: [number, number][] = [
  [0, 210], [55, 185], [100, 225], [160, 175], [215, 215], [270, 165], [330, 205], [385, 158],
  [440, 196], [490, 172], [535, 330], [570, 300], [610, 440], [645, 410], [700, 485],
];
const RED = 'M' + RED_PTS.map((p) => p.join(' ')).join(' L ');
const GOLD = 'M0 330 C 180 318, 310 270, 440 210 S 640 80, 720 50';
const TIP: [number, number] = [720, 50]; // ring stays clear of the right safe zone
const CRASH = RED_PTS[RED_PTS.length - 1];

const RED_START = 20;
const RED_DUR = 50;
const GOLD_START = 20;
const GOLD_DUR = 65;

export const Hook: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const grid = ease(frame, 20, 30);
  const red = ease(frame, RED_START, RED_DUR);
  const gold = ease(frame, GOLD_START, GOLD_DUR);
  const crashAt = RED_START + RED_DUR - 4;
  const flash = interpolate(frame, [crashAt, crashAt + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});
  const tipOn = frame >= GOLD_START + GOLD_DUR - 4;
  const out = exitProgress(frame, dur);

  return (
    <AbsoluteFill>
      <ArabicText block={S1_HOOK} size={74} start={0} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />
      <div style={{position: 'absolute', left: SAFE.side, top: 760, width: W, height: H, ...exitStyle(out)}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
          <g opacity={grid}>
            {Array.from({length: 9}, (_, i) => (
              <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={H} stroke={COLORS.text} strokeOpacity={0.05} strokeWidth={1} />
            ))}
            {Array.from({length: 6}, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 104} x2={W} y2={i * 104} stroke={COLORS.text} strokeOpacity={0.05} strokeWidth={1} />
            ))}
          </g>
          <ChartLine d={RED} progress={red} color={COLORS.fiat} width={4} opacity={0.9} />
          {frame >= crashAt ? (
            <g>
              <circle cx={CRASH[0]} cy={CRASH[1]} r={10 + flash * 70} fill={hexA(COLORS.fiat, 0.35 * (1 - flash))} />
              <circle cx={CRASH[0]} cy={CRASH[1]} r={6 + flash * 36} fill="none" stroke={COLORS.fiat} strokeWidth={3} opacity={1 - flash} />
            </g>
          ) : null}
          <LightStreak id="hook-gold" d={GOLD} head={gold} width={4.5} from={[0, 330]} to={TIP} />
          {tipOn ? <TipPulse frame={frame - (GOLD_START + GOLD_DUR - 4)} /> : null}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const TipPulse: React.FC<{frame: number}> = ({frame}) => {
  const rings = [0, 1, 2].map((k) => {
    const local = frame - k * 22;
    if (local < 0) return null;
    const p = ease(local % 66, 0, 66);
    return <circle key={k} cx={TIP[0]} cy={TIP[1]} r={8 + p * 40} fill="none" stroke={COLORS.goldB} strokeWidth={2.5} opacity={(1 - p) * 0.9} />;
  });
  const dot = ease(frame, 0, 20);
  return (
    <g>
      {rings}
      <circle cx={TIP[0]} cy={TIP[1]} r={16 * dot} fill={hexA(COLORS.goldB, 0.35)} style={{filter: 'blur(6px)'}} />
      <circle cx={TIP[0]} cy={TIP[1]} r={7 * dot} fill="#FFF6DA" />
    </g>
  );
};
