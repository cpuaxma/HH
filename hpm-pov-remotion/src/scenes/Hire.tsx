import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {exit} from '../lib/anim';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {HPM} from '../theme';
import {CAPTION, MomCard} from './Quiet';

// 4 · The hire. The mom card swipes away; the pepper (PepperLayer) drops, draws, kicks
// and docks in the status bar; the wallpaper line glows (LockScreen).
export const Hire: React.FC = () => {
  const f = useSceneFrame(SCENES.hire.from);
  const swipe = exit(f, CUE.momSwipe, 20);
  return (
    <AbsoluteFill>
      {f >= CUE.momSwipe && swipe < 1 ? <MomCard frame={f} swipe={swipe} /> : null}
      <MaskReveal
        frame={f}
        lines={['it all started', '*with one call.*']}
        start={CUE.hireCaption}
        exitAt={CUE.hireCaptionExit}
        fontSize={CAPTION.size + 8}
        pill={HPM.cream}
        style={{position: 'absolute', left: CAPTION.left, top: CAPTION.top}}
      />
    </AbsoluteFill>
  );
};
