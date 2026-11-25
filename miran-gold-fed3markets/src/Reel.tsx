import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, VIDEO} from './brand';
import {HIT, SCENES} from './timeline';
import {clamp, hexA, rand} from './motion';
import {Background, Grain} from './components/Background';
import {CaptionTrack} from './components/Caption2Line';
import {Disclaimer, MiranMark, TopicPill} from './components/Chrome';
import {FedNode} from './components/FedNode';
import {FedPulseLayer} from './components/FedPulse';
import {LaneBoard, LaneHeader} from './components/LaneBoard';
import {SfxTrack} from './components/SfxTrack';
import {Context} from './scenes/Context';
import {GoldChapter, NasdaqChapter, Recap, SpxChapter} from './scenes/Chapters';

/** S0 lead-in: light streaks converge on the centre, flash on the slam. */
const HookStreaks: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, HIT.nodeSlam], [0, 1], {...clamp, easing: (t) => t * t});
  const flash = interpolate(frame, [HIT.nodeSlam, HIT.nodeSlam + 2, HIT.nodeSlam + 16], [0, 0.55, 0], clamp);
  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height}>
        {Array.from({length: 14}, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + rand(i) * 0.3;
          const r0 = 1400 * (1 - p) + 60;
          const len = 260 * (0.4 + p);
          const x0 = 540 + Math.cos(a) * r0;
          const y0 = 530 + Math.sin(a) * r0;
          const x1 = 540 + Math.cos(a) * (r0 + len);
          const y1 = 530 + Math.sin(a) * (r0 + len);
          const o = frame < HIT.nodeSlam ? 0.25 + p * 0.6 : 0;
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.gold1} strokeOpacity={o} strokeWidth={2 + rand(i + 5) * 2} strokeLinecap="round" />;
        })}
      </svg>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 28%, ${hexA(C.gold1, flash)} 0%, ${hexA(C.gold1, 0)} 55%)`}} />
    </AbsoluteFill>
  );
};

const Window: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({range, children}) => {
  const frame = useCurrentFrame();
  return frame >= range[0] && frame < range[1] ? <>{children}</> : null;
};

export type ReelProps = {showBackground: boolean};

export const Reel: React.FC<ReelProps> = ({showBackground}) => (
  <AbsoluteFill style={{backgroundColor: showBackground ? C.bg0 : 'transparent'}}>
    {showBackground && <Background />}
    <Window range={[0, HIT.nodeSlam + 20]}>
      <HookStreaks />
    </Window>
    <Window range={SCENES.context}>
      <Context />
    </Window>
    <Window range={SCENES.nasdaq}>
      <NasdaqChapter />
    </Window>
    <Window range={SCENES.spx}>
      <SpxChapter />
    </Window>
    <Window range={SCENES.gold}>
      <GoldChapter />
    </Window>
    <Window range={SCENES.recap}>
      <Recap />
    </Window>
    <LaneBoard />
    <LaneHeader />
    <FedPulseLayer />
    <FedNode />
    <CaptionTrack />
    <MiranMark />
    <TopicPill />
    <Disclaimer />
    {showBackground && <Grain />}
    <SfxTrack />
  </AbsoluteFill>
);
