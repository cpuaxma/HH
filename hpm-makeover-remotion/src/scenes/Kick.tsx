import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {MaskReveal} from '../components/MaskReveal';
import {GridSweepLine} from '../components/SweepLines';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';

// 3 · The pepper (PepperLayer) lands and kicks, the background warms (Background),
// the headline lands, and the red line springs out of the pepper's tip.
export const Kick: React.FC = () => {
  const f = useSceneFrame(SCENES.kick.from);
  return (
    <AbsoluteFill>
      <MaskReveal
        frame={f}
        lines={COPY.kick.headline}
        start={CUE.kickHeadline}
        exitAt={CUE.kickHeadlineExit}
        fontSize={92}
        style={{position: 'absolute', left: 80, top: 196}}
      />
      {/* Hands the line over to scene 4a at its first frame. */}
      {f < SCENES.grid.from ? <GridSweepLine frame={f} /> : null}
    </AbsoluteFill>
  );
};
