import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Background, Grain, Vignette} from './components/Atmosphere';
import {Captions} from './components/Captions';
import {SceneShell} from './components/SceneShell';
import {ASSETS, AUDIO, s, SceneKey, SCENES, TRANSITION} from './constants';
import {clamp} from './lib';
import {BearMarket} from './scenes/BearMarket';
import {BullMarket} from './scenes/BullMarket';
import {Comparison} from './scenes/Comparison';
import {Hook} from './scenes/Hook';
import {Outro} from './scenes/Outro';
import {WhatToDo} from './scenes/WhatToDo';

export type BullVsBearProps = {
  /** Filled in by calculateMetadata (Root.tsx): which optional files exist in public/. */
  hasLogo: boolean;
  hasVoiceover: boolean;
  hasMusic: boolean;
};

const ORDER: SceneKey[] = ['hook', 'bull', 'bear', 'compare', 'todo', 'outro'];

export const BullVsBear: React.FC<BullVsBearProps> = ({hasLogo, hasVoiceover, hasMusic}) => {
  const {durationInFrames} = useVideoConfig();

  const scenes: Record<SceneKey, React.ReactNode> = {
    hook: <Hook />,
    bull: <BullMarket />,
    bear: <BearMarket />,
    compare: <Comparison />,
    todo: <WhatToDo />,
    outro: <Outro hasLogo={hasLogo} />,
  };

  const musicLevel = hasVoiceover ? AUDIO.music : AUDIO.musicNoVoiceover;

  return (
    <AbsoluteFill>
      <Background />

      {ORDER.map((key, i) => {
        const {start, end} = SCENES[key];
        const last = i === ORDER.length - 1;
        // Each scene runs TRANSITION frames past its end, so it cross-fades with the next scene's entrance.
        const duration = s(end - start) + (last ? 0 : TRANSITION);
        return (
          <Sequence key={key} name={key} from={s(start)} durationInFrames={duration}>
            <SceneShell enter={i > 0} exit={!last}>
              {scenes[key]}
            </SceneShell>
          </Sequence>
        );
      })}

      <Captions />
      <Vignette />
      <Grain />

      {hasVoiceover ? <Audio src={staticFile(ASSETS.voiceover)} volume={AUDIO.voiceover} /> : null}
      {hasMusic ? (
        <Audio
          src={staticFile(ASSETS.music)}
          loop
          volume={(f) =>
            musicLevel *
            interpolate(f, [0, s(1), durationInFrames - s(1.5), durationInFrames], [0, 1, 1, 0], clamp)
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
