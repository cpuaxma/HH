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
import {GoldChapter, NasdaqChapter, Recap, SpxChapter, TileToGold} from './scenes/Chapters';
import {Core} from './scenes/Core';
import {ExpectCard, Outro, OutroParticles, Tease} from './scenes/Ending';
import {FilterDefs, GlitchSlices, glitchAmount} from './components/MotionBlur';
import {noise} from './motion';

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

/** Everything that lives "in the world": a slow global camera drift keeps it alive between hits; the glitch splits RGB. */
const World: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = glitchAmount(frame);
  const dx = noise(3, frame / 120) * 6 + (g > 0 ? noise(9, frame * 3) * 26 * g : 0);
  const dy = noise(4, frame / 140) * 5;
  const rot = noise(5, frame / 160) * 0.25;
  return (
    <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, filter: g > 0.02 ? 'url(#rgbsplit)' : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({showBackground}) => (
  <AbsoluteFill style={{backgroundColor: showBackground ? C.bg0 : 'transparent'}}>
    <FilterDefs />
    {showBackground && <Background />}
    <World>
      <Window range={[0, HIT.nodeSlam + 20]}>
        <HookStreaks />
      </Window>
      <Window range={SCENES.context}>
        <Context />
      </Window>
      <Window range={SCENES.core}>
        <Core />
      </Window>
      <Window range={SCENES.nasdaq}>
        <NasdaqChapter />
      </Window>
      <Window range={SCENES.spx}>
        <SpxChapter />
      </Window>
      <Window range={[1440, 1500]}>
        <TileToGold />
      </Window>
      <Window range={SCENES.gold}>
        <GoldChapter />
      </Window>
      <Window range={[HIT.expectCard - 4, HIT.flipBack + 4]}>
        <ExpectCard />
      </Window>
      <Window range={SCENES.recap}>
        <Recap />
      </Window>
      <Window range={SCENES.tease}>
        <Tease />
      </Window>
      <LaneBoard />
      <LaneHeader />
      <FedPulseLayer />
      <FedNode />
      <Window range={[HIT.teasePulse, SCENES.outro[1]]}>
        <OutroParticles />
      </Window>
      <Window range={SCENES.outro}>
        <Outro />
      </Window>
      <CaptionTrack />
    </World>
    <GlitchSlices />
    <MiranMark />
    <TopicPill />
    <Disclaimer />
    {showBackground && <Grain />}
    <SfxTrack />
  </AbsoluteFill>
);
