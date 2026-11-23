import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {COLORS} from './config';
import {Ambient, Backdrop, GrainVignette} from './components/Ambient';
import {FontGate, FontSource} from './components/FontGate';
import {Clock, LogoMark} from './components/Hud';
import {SafeZoneAudit} from './components/SafeZoneAudit';
import {SceneShell} from './components/SceneShell';
import {Music, TransitionSfx} from './components/Sound';
import {SceneName, TIMELINE} from './lib/timeline';
import {Create} from './scenes/Create';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {Idea} from './scenes/Idea';
import {Launch} from './scenes/Launch';
import {Results} from './scenes/Results';
import {Strategy} from './scenes/Strategy';

const SCENE_COMPONENTS: Record<SceneName, React.FC> = {
  hook: Hook,
  idea: Idea,
  strategy: Strategy,
  create: Create,
  launch: Launch,
  results: Results,
  cta: Cta,
};

export type ReelProps = {fontSource: FontSource; debugSafeZone: boolean};

export const Reel: React.FC<ReelProps> = ({fontSource, debugSafeZone}) => (
  <AbsoluteFill style={{background: COLORS.bg}}>
    <FontGate source={fontSource}>
      <Backdrop />
      <Ambient />
      <Series>
        {TIMELINE.scenes.map((s, i) => {
          const Scene = SCENE_COMPONENTS[s.name];
          const prev = TIMELINE.scenes[i - 1];
          return (
            <Series.Sequence
              key={s.name}
              name={s.name}
              durationInFrames={s.head + s.duration + s.tail}
              offset={prev ? -(prev.tail + s.head) : 0}
            >
              <SceneShell timing={s} background={s.name !== 'hook' && s.name !== 'cta'}>
                <Scene />
              </SceneShell>
            </Series.Sequence>
          );
        })}
      </Series>
      <Clock />
      <LogoMark />
      <GrainVignette />
      {debugSafeZone ? <SafeZoneAudit /> : null}
    </FontGate>
    <Music />
    <TransitionSfx />
  </AbsoluteFill>
);
