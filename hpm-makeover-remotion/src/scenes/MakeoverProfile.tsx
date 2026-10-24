import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {SceneLabel} from '../components/SceneLabel';
import {HeaderSweepLine} from '../components/SweepLines';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {LABEL_POS} from './MakeoverGrid';

// 4c · Back to the full profile: the line sweeps the header (logo mark, new bio,
// highlights, odometer counters in ProfileHeader AFTER).
export const MakeoverProfile: React.FC = () => {
  const f = useSceneFrame(SCENES.profile.from);
  const l = COPY.makeover.labels[2];
  return (
    <AbsoluteFill>
      <SceneLabel frame={f} num={l.num} text={l.text} start={CUE.profileLabel} exitAt={CUE.profileLabelExit} style={LABEL_POS} />
      <HeaderSweepLine frame={f} />
    </AbsoluteFill>
  );
};
