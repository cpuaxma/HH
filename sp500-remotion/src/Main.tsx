import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AudioLayer} from './components/AudioLayer';
import {Background} from './components/Background';
import {DebugContext, SafeZoneOverlay} from './components/Debug';
import {SCENES} from './config';
import {impactAt} from './lib/motion';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2SP500} from './scenes/Scene2SP500';
import {Scene3Heartbeat} from './scenes/Scene3Heartbeat';
import {Scene4History} from './scenes/Scene4History';
import {Scene5World} from './scenes/Scene5World';
import {Scene6CTA} from './scenes/Scene6CTA';

export type MainProps = {
  /** draw the Instagram safe-zone guides (Studio only) */
  showSafeZone: boolean;
  /** hide everything except text, for the automated safe-zone check */
  textOnly: boolean;
};

const SCENE_LIST = [
  {key: 'hook', name: '1 Hook', C: Scene1Hook},
  {key: 'sp500', name: '2 S&P 500', C: Scene2SP500},
  {key: 'heartbeat', name: '3 Heartbeat', C: Scene3Heartbeat},
  {key: 'history', name: '4 History', C: Scene4History},
  {key: 'world', name: '5 World', C: Scene5World},
  {key: 'cta', name: '6 CTA', C: Scene6CTA},
] as const;

export const Main: React.FC<MainProps> = ({showSafeZone, textOnly}) => {
  const frame = useCurrentFrame();
  const cam = impactAt(frame);

  return (
    <DebugContext.Provider value={{textOnly}}>
      <AbsoluteFill style={{background: '#000'}}>
        <Background />
        {/* camera: shake + zoom punch on impacts */}
        <AbsoluteFill style={{transform: `translate(${cam.x}px, ${cam.y}px) scale(${1 + cam.zoom})`}}>
          {SCENE_LIST.map(({key, name, C}) => (
            <Sequence key={key} name={name} from={SCENES[key].from} durationInFrames={SCENES[key].duration}>
              <C />
            </Sequence>
          ))}
        </AbsoluteFill>
        {textOnly ? null : <AudioLayer />}
        {showSafeZone ? <SafeZoneOverlay /> : null}
      </AbsoluteFill>
    </DebugContext.Provider>
  );
};
