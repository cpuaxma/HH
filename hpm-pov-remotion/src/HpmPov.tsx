import {CameraMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Grain} from './components/Grain';
import {Haptic} from './components/Haptic';
import {LockClock} from './components/LockClock';
import {HeatGlow, LockScreen} from './components/LockScreen';
import {NotificationStack} from './components/NotificationStack';
import {PepperLayer} from './components/PepperLayer';
import {StatusBar} from './components/StatusBar';
import {useFonts} from './fonts';
import {exit, progress} from './lib/anim';
import {Cta} from './scenes/Cta';
import {Hire} from './scenes/Hire';
import {Hook} from './scenes/Hook';
import {Overheat} from './scenes/Overheat';
import {TimeJump} from './scenes/TimeJump';
import {CUE, SCENES, storyTime} from './timeline';
import {EASE_IN_OUT, HPM} from './theme';
import {interpolateColors} from 'remotion';

const seq = (s: {from: number; to: number}) => ({from: s.from, durationInFrames: s.to - s.from});

// "POV: You Hired Hot Pepper Media": 30s, 1080×1920, 60fps. The full frame is the
// viewer's lock screen. Persistent layers (wallpaper, heat, clock, stack, status bar,
// pepper) sit under the overlapping scene sequences, so nothing ever doubles or blinks.
export const HpmPov: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = storyTime(frame);
  const blur = frame >= CUE.blurFrom && frame < CUE.freeze;
  const clockFade = 1 - exit(frame, CUE.flood, 15);
  const chrome = interpolateColors(progress(frame, CUE.flood, CUE.floodDuration, EASE_IN_OUT), [0, 1], [HPM.charcoal, HPM.cream]);

  return (
    <AbsoluteFill style={{background: HPM.cream}}>
      <LockScreen frame={frame} t={t} />
      <HeatGlow frame={frame} t={t} />
      <Haptic frame={frame} t={t}>
        {clockFade > 0 ? <LockClock frame={frame} opacity={clockFade} /> : null}
        {blur ? (
          <CameraMotionBlur shutterAngle={200} samples={8}>
            <NotificationStack />
          </CameraMotionBlur>
        ) : (
          <NotificationStack />
        )}
        <StatusBar frame={frame} color={chrome} />
        <PepperLayer frame={frame} />
        <Sequence {...seq(SCENES.hook)} name="1 · Hook">
          <Hook />
        </Sequence>
        <Sequence {...seq(SCENES.hire)} name="2 · The hire">
          <Hire />
        </Sequence>
        <Sequence {...seq(SCENES.week1)} name="3a · Week 1">
          <TimeJump from={SCENES.week1.from} jump={0} />
        </Sequence>
        <Sequence {...seq(SCENES.week4)} name="3b · Week 4">
          <TimeJump from={SCENES.week4.from} jump={1} />
        </Sequence>
        <Sequence {...seq(SCENES.month3)} name="3c · Month 3">
          <TimeJump from={SCENES.month3.from} jump={2} />
        </Sequence>
        <Sequence {...seq(SCENES.overheat)} name="4 · Overheat">
          <Overheat />
        </Sequence>
      </Haptic>
      <Sequence {...seq(SCENES.cta)} name="5 · CTA">
        <Cta />
      </Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
