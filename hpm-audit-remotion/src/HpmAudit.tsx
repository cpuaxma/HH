import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Blur} from './components/MotionBlur';
import {Grain} from './components/Grain';
import {PunchZoom} from './components/PunchZoom';
import {useFonts} from './fonts';
import {CtaLayer} from './scenes/CtaLayer';
import {FlatStage} from './scenes/FlatStage';
import {HookStage} from './scenes/HookStage';
import {ResultStage} from './scenes/ResultStage';
import {TextLayer} from './scenes/TextLayer';
import {CTA_BLUR, STAGE_BLUR, T, TEXT_BLUR} from './timeline';
import {C} from './theme';

// Cream base with a soft peach glow that drifts.
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const x = 540 + 280 * Math.sin(f / 150);
  const y = 980 + 320 * Math.cos(f / 190);
  return (
    <AbsoluteFill style={{background: C.cream}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${x}px ${y}px, ${C.peach} 0%, rgba(255,215,201,0.55) 40%, rgba(255,215,201,0) 75%)`}} />
    </AbsoluteFill>
  );
};

const Stage: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.dive) return <HookStage />;
  if (f < T.pullOut) return <FlatStage />;
  return <ResultStage />;
};

export const HpmAudit: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      <PunchZoom>
        <Background />
        {frame <= T.flood[1] && (
          <Blur windows={STAGE_BLUR} samples={8} shutter={240}>
            <Stage />
          </Blur>
        )}
        <Blur windows={TEXT_BLUR} samples={8} shutter={180}>
          <TextLayer />
        </Blur>
        {frame >= T.ctaLine && (
          <Blur windows={CTA_BLUR} samples={8} shutter={180}>
            <CtaLayer />
          </Blur>
        )}
      </PunchZoom>
      <Grain />
    </AbsoluteFill>
  );
};
