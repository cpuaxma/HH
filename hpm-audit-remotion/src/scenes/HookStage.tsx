import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Phone3D} from '../components/Phone3D';
import {Profile} from '../components/Profile';
import {RedLine, RedWander} from '../components/RedLine';
import {progress} from '../lib/anim';
import {hookPose} from '../lib/cameras';
import {smoothPath} from '../lib/path';
import {T} from '../timeline';
import {EASE_IN} from '../theme';

const WANDER = smoothPath([
  [-60, 1500],
  [180, 1380],
  [260, 1080],
  [120, 860],
  [420, 760],
  [820, 860],
  [960, 1200],
  [1140, 1320],
]);

// 1 · HOOK: the phone spins in (already moving on frame 0), lands with a kick, gets circled.
export const HookStage: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, T.diveStart, 12, EASE_IN);
  return (
    <AbsoluteFill>
      <RedWander d={WANDER} at={34} dur={100} width={6} length={0.4} />
      <Phone3D phones={[{id: 'a', pose: hookPose(frame), screen: <Profile state="before" />}]} />
      <AbsoluteFill style={{transformOrigin: '540px 1150px', transform: `scale(${1 + out * 1.4})`, opacity: 1 - out}}>
        <RedLine type="circle" cx={540} cy={1150} rx={340} ry={478} at={T.scribble} dur={18} width={9} seed="hook" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
