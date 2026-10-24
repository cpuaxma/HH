import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {HPM} from '../theme';
import {CAPTION} from './Quiet';

// 1 · Cold open: frame 0 is already Month 3, mid-flood (the OPEN stack in HpmPov).
// Charcoal pills so the hook reads instantly over a wall of white cards.
export const ColdOpen: React.FC = () => {
  const f = useSceneFrame(SCENES.coldOpen.from);
  return (
    <AbsoluteFill>
      <MaskReveal
        frame={f}
        lines={['POV: you hired', '*hot pepper media.*']}
        start={CUE.openCaption}
        exitAt={CUE.openCaptionExit}
        fontSize={CAPTION.size + 8}
        pill={HPM.charcoal}
        color={HPM.cream}
        style={{position: 'absolute', left: CAPTION.left, top: 980, zIndex: 3000}}
      />
    </AbsoluteFill>
  );
};
