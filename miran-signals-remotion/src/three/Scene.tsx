import {useCallback} from 'react';
import * as THREE from 'three';
import {STUDIO, TIMING} from '../data';
import {easeInOut, ramp} from '../lib/ease';
import {BASE, focus, leftGlow, leftPose, leftWarmth, rightGlow, rightPose} from '../lib/story';
import {drawLeftScreen, drawRightScreen, leftScreenKey, rightScreenKey} from '../screens/draw';
import {Phone} from './Phone';
import {Streak} from './Streak';
import {GOLD, PhoneGlow, RED, Studio} from './Studio';
import {useScreenTexture} from './useScreenTexture';

/** Left pool: cold red, pulsing with each loss; gold once it has switched to Miran Gold. */
const leftColor = (t: number) => RED.clone().lerp(GOLD, leftWarmth(t));

const FIN = {
  left: {frame: new THREE.Color(STUDIO.finish.left.frame), back: new THREE.Color(STUDIO.finish.left.back)},
  right: {frame: new THREE.Color(STUDIO.finish.right.frame), back: new THREE.Color(STUDIO.finish.right.back)},
};
const rightFinish = () => FIN.right;
const tmp = {frame: new THREE.Color(), back: new THREE.Color()};
/** Silver until its flip; it turns gold in the second half of the spin (it has joined Miran Gold). */
const leftFinish = (t: number) => {
  const k = ramp(t, (TIMING.flipStart + TIMING.flipEnd) / 2, TIMING.flipEnd, easeInOut);
  tmp.frame.copy(FIN.left.frame).lerp(FIN.right.frame, k);
  tmp.back.copy(FIN.left.back).lerp(FIN.right.back, k);
  return tmp;
};

export const Scene: React.FC = () => {
  const left = useScreenTexture(useCallback(drawLeftScreen, []), leftScreenKey, BASE.left.pos);
  const right = useScreenTexture(useCallback(drawRightScreen, []), rightScreenKey, BASE.right.pos);
  return (
    <>
      <Studio />
      <PhoneGlow pose={leftPose} glow={(t) => ({color: leftColor(t), strength: leftGlow(t) * (0.4 + 0.6 * focus('left', t))})} />
      <PhoneGlow pose={rightPose} glow={(t) => ({color: GOLD, strength: rightGlow(t)})} />
      <Phone texture={left} pose={leftPose} brightness={(t) => 0.25 + 0.75 * focus('left', t)} finish={leftFinish} />
      <Phone texture={right} pose={rightPose} brightness={(t) => 0.25 + 0.75 * focus('right', t)} finish={rightFinish} />
      <Streak />
    </>
  );
};
