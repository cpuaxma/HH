import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, interpolate, staticFile, useVideoConfig} from 'remotion';
import {AUDIO} from './config';
import {Background} from './components/Background';
import {ProgressBar, TopLogo} from './components/Chrome';
import {CompanyField} from './components/CompanyField';
import {SceneShell} from './components/SceneShell';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2WhatIs} from './scenes/Scene2WhatIs';
import {Scene3NotEqual} from './scenes/Scene3NotEqual';
import {Scene4Domino} from './scenes/Scene4Domino';
import {Scene5Takeaway} from './scenes/Scene5Takeaway';
import {Scene6CTA} from './scenes/Scene6CTA';

export const Reel: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background />
      <CompanyField />
      <SceneShell scene="hook">
        <Scene1Hook />
      </SceneShell>
      <SceneShell scene="whatIs">
        <Scene2WhatIs />
      </SceneShell>
      <SceneShell scene="notEqual">
        <Scene3NotEqual />
      </SceneShell>
      <SceneShell scene="domino">
        <Scene4Domino />
      </SceneShell>
      <SceneShell scene="takeaway">
        <Scene5Takeaway />
      </SceneShell>
      <SceneShell scene="cta">
        <Scene6CTA />
      </SceneShell>
      <TopLogo />
      <ProgressBar />
      {/* Audio slot: set AUDIO.src in config.ts to drop in a track. The reel is designed to work muted. */}
      {AUDIO.src ? (
        <Audio
          src={staticFile(AUDIO.src)}
          volume={(f) => AUDIO.volume * interpolate(f, [durationInFrames - AUDIO.fadeOutFrames, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      ) : null}
    </AbsoluteFill>
  );
};
