import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {SceneLabel} from '../components/SceneLabel';
import {GridSweepLine} from '../components/SweepLines';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';

export const LABEL_POS = {left: 190, top: 146} as const;

// 4a · The line sweeps the grid diagonally; tiles straighten, snap and regain colour
// wherever it has passed (FeedGrid AFTER, revealed in ProfileStage).
export const MakeoverGrid: React.FC = () => {
  const f = useSceneFrame(SCENES.grid.from);
  const l = COPY.makeover.labels[0];
  return (
    <AbsoluteFill>
      <SceneLabel frame={f} num={l.num} text={l.text} start={CUE.gridLabel} exitAt={CUE.gridLabelExit} style={LABEL_POS} />
      <GridSweepLine frame={f} />
    </AbsoluteFill>
  );
};
