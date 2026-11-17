import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SCENES, SceneId, TOTAL_FRAMES, TRANSITION, sec} from './config';
import {AudioSlots} from './components/AudioSlots';
import {Backdrop} from './components/Backdrop';
import {FilmFinish} from './components/FilmFinish';
import {SceneShell} from './components/SceneShell';
import {Blockchain} from './scenes/Blockchain';
import {Decentral} from './scenes/Decentral';
import {EndCard} from './scenes/EndCard';
import {Hook} from './scenes/Hook';
import {Trade} from './scenes/Trade';
import {Verify} from './scenes/Verify';

const COMPONENTS: Record<SceneId, React.FC> = {
  hook: Hook,
  decentral: Decentral,
  blockchain: Blockchain,
  verify: Verify,
  trade: Trade,
  endcard: EndCard,
};

export const CryptoExplainer: React.FC<{showSafeZones?: boolean}> = ({showSafeZones = false}) => {
  const half = Math.round(sec(TRANSITION) / 2);
  return (
    <AbsoluteFill style={{backgroundColor: '#0A0A0A'}}>
      <Backdrop />
      {SCENES.map((scene, i) => {
        const start = sec(scene.from);
        const end = sec(scene.to);
        const lead = i === 0 ? 0 : half;
        const tail = i === SCENES.length - 1 ? 0 : half;
        const Scene = COMPONENTS[scene.id];
        return (
          <Sequence
            key={scene.id}
            name={scene.id}
            from={start - lead}
            durationInFrames={Math.min(TOTAL_FRAMES, end + tail) - (start - lead)}
          >
            <SceneShell config={scene} lead={lead} tail={tail}>
              <Scene />
            </SceneShell>
          </Sequence>
        );
      })}
      <FilmFinish />
      <AudioSlots />
      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

/** Studio-only overlay: the top 250px and bottom 350px reserved for social UI. */
const SafeZones: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 250, background: 'rgba(255,0,0,0.22)'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 350, background: 'rgba(255,0,0,0.22)'}} />
  </AbsoluteFill>
);
