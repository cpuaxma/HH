import {useCallback} from 'react';
import {BASE, leftGlow, leftPose, leftWarmth, rightGlow, rightPose} from '../lib/story';
import {drawLeftScreen, drawRightScreen, leftScreenKey, rightScreenKey} from '../screens/draw';
import {Phone} from './Phone';
import {Streak} from './Streak';
import {GOLD, PhoneGlow, RED, Studio} from './Studio';
import {useScreenTexture} from './useScreenTexture';

/** Left pool: cold red, pulsing with each loss; gold once it has switched to Miran Gold. */
const leftColor = (t: number) => RED.clone().lerp(GOLD, leftWarmth(t));

export const Scene: React.FC = () => {
  const left = useScreenTexture(useCallback(drawLeftScreen, []), leftScreenKey, BASE.left.pos);
  const right = useScreenTexture(useCallback(drawRightScreen, []), rightScreenKey, BASE.right.pos);
  return (
    <>
      <Studio />
      <PhoneGlow pose={leftPose} glow={(t) => ({color: leftColor(t), strength: leftGlow(t)})} />
      <PhoneGlow pose={rightPose} glow={(t) => ({color: GOLD, strength: rightGlow(t)})} />
      <Phone texture={left} pose={leftPose} brightness={() => 1.0} />
      <Phone texture={right} pose={rightPose} brightness={() => 1.0} />
      <Streak />
    </>
  );
};
