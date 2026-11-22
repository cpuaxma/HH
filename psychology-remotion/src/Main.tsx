import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {AudioLayer} from './components/AudioLayer';
import {DebugContext, SafeZoneOverlay} from './components/Debug';
import {HUD} from './components/HUD';
import {SCENES} from './config';
import {S1ColdOpen} from './scenes/S1ColdOpen';
import {S2Rewind} from './scenes/S2Rewind';
import {S3Question} from './scenes/S3Question';
import {S4Ride} from './scenes/S4Ride';
import {S5Reveal} from './scenes/S5Reveal';
import {S6Crowd} from './scenes/S6Crowd';
import {S7Quote} from './scenes/S7Quote';
import {S8Lesson} from './scenes/S8Lesson';
import {S9CTA} from './scenes/S9CTA';
import {World} from './world/World';

export type MainProps = {
  /** draw the safe-zone guides (Studio only) */
  showSafeZone: boolean;
  /** hide everything except text, for the automated safe-zone check */
  textOnly: boolean;
};

const SCENE_LIST = [
  {key: 'coldOpen', name: '1 Cold open', C: S1ColdOpen},
  {key: 'rewind', name: '2 Rewind', C: S2Rewind},
  {key: 'question', name: '3 The question', C: S3Question},
  {key: 'ride', name: '4 The ride', C: S4Ride},
  {key: 'reveal', name: '5 The reveal', C: S5Reveal},
  {key: 'crowd', name: '6 Crowd vs wise', C: S6Crowd},
  {key: 'quote', name: '7 The quote', C: S7Quote},
  {key: 'lesson', name: '8 The lesson', C: S8Lesson},
  {key: 'cta', name: '9 CTA', C: S9CTA},
] as const;

/**
 * One continuous 3D world (src/world, directed by src/lib/director.ts) under nine DOM scene
 * overlays (src/scenes) that hold all the Arabic text.
 */
export const Main: React.FC<MainProps> = ({showSafeZone, textOnly}) => (
  <DebugContext.Provider value={{textOnly}}>
    <AbsoluteFill style={{background: '#000'}}>
      {textOnly ? null : <World />}
      {SCENE_LIST.map(({key, name, C}) => (
        <Sequence key={key} name={name} from={SCENES[key].from} durationInFrames={SCENES[key].duration}>
          <C />
        </Sequence>
      ))}
      <HUD />
      {textOnly ? null : <AudioLayer />}
      {showSafeZone ? <SafeZoneOverlay /> : null}
    </AbsoluteFill>
  </DebugContext.Provider>
);
