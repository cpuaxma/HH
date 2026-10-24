import React from 'react';
import {AbsoluteFill, spring} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {NotificationCard} from '../components/NotificationCard';
import {enter, exit, mix} from '../lib/anim';
import {cardHeight} from '../lib/stack';
import {useSceneFrame} from '../lib/useSceneFrame';
import {MOM} from '../notifications';
import {CUE, SCENES} from '../timeline';
import {CARD_SPRING, FONT, FPS, HPM, WEIGHT} from '../theme';

export const CAPTION = {left: 80, top: 650, size: 60} as const;
export const MOM_TOP = 880;

// Scene 1 and 2 share the mom card: it drifts in here and is swiped away in Hire.
export const MomCard: React.FC<{frame: number; swipe?: number}> = ({frame, swipe = 0}) => {
  const e = spring({frame: frame - CUE.momIn, fps: FPS, config: CARD_SPRING, durationInFrames: 50});
  return (
    <NotificationCard
      notif={MOM}
      style={{
        top: MOM_TOP,
        transformOrigin: '50% 100%',
        transform: `translate(${-1250 * swipe}px, ${-80 * (1 - e)}px) rotate(${-6 * swipe}deg) scale(${mix(0.92, 1, e)})`,
        opacity: Math.min(1, e),
      }}
    />
  );
};

// 1 · The quiet phone: one sad notification.
export const Hook: React.FC = () => {
  const f = useSceneFrame(SCENES.hook.from);
  const sub = 0.4 * enter(f, CUE.momSub, 40) * (1 - exit(f, CUE.hookCaptionExit, 14));
  return (
    <AbsoluteFill>
      <MaskReveal
        frame={f}
        lines={['POV: your business page', 'before us…']}
        start={CUE.hookCaption}
        exitAt={CUE.hookCaptionExit}
        fontSize={CAPTION.size}
        pill={HPM.cream}
        style={{position: 'absolute', left: CAPTION.left, top: CAPTION.top}}
      />
      {f < CUE.momSwipe ? <MomCard frame={f} /> : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1020,
          top: MOM_TOP + cardHeight(MOM.body) + 30,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: WEIGHT.body,
          fontSize: 30,
          color: HPM.charcoal,
          opacity: sub,
        }}
      >
        that's it. that's all.
      </div>
    </AbsoluteFill>
  );
};
