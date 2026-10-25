import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Grain} from './components/Grain';
import {useFonts} from './fonts';
import {Before} from './scenes/Before';
import {BeforeAfter} from './scenes/BeforeAfter';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {Kick} from './scenes/Kick';
import {MakeoverCaption} from './scenes/MakeoverCaption';
import {MakeoverGrid} from './scenes/MakeoverGrid';
import {MakeoverProfile} from './scenes/MakeoverProfile';
import {Background} from './stage/Background';
import {PepperLayer} from './stage/PepperLayer';
import {ProfileStage} from './stage/ProfileStage';
import {CUE, SCENES} from './timeline';

const seq = (s: {from: number; to: number}) => ({from: s.from, durationInFrames: s.to - s.from});

// "The Bland Brand Makeover": 30s, 1080×1920, 60fps.
// Persistent layers (background, phone, pepper) sit between the overlapping scene
// sequences, so scene hand-offs never show doubles or empty frames.
export const HpmMakeover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Background />
      <Sequence {...seq(SCENES.hook)} name="1 · Hook">
        <Hook />
      </Sequence>
      <ProfileStage from={SCENES.before.from} to={CUE.flood + CUE.floodDuration} />
      <PepperLayer />
      <Sequence {...seq(SCENES.before)} name="2 · The Before">
        <Before />
      </Sequence>
      <Sequence {...seq(SCENES.kick)} name="3 · The Kick">
        <Kick />
      </Sequence>
      <Sequence {...seq(SCENES.grid)} name="4a · Grid">
        <MakeoverGrid />
      </Sequence>
      <Sequence {...seq(SCENES.caption)} name="4b · Caption">
        <MakeoverCaption />
      </Sequence>
      <Sequence {...seq(SCENES.profile)} name="4c · Profile">
        <MakeoverProfile />
      </Sequence>
      <Sequence {...seq(SCENES.compare)} name="5 · Before / After">
        <BeforeAfter />
      </Sequence>
      <Sequence {...seq(SCENES.cta)} name="6 · CTA">
        <Cta />
      </Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
