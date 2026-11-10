// One gold Miran Gold phone in the same navy studio as the signals reel (same Phone,
// Studio, floor reflection, light pools and pipeline). The backdrop orbs start cool and
// warm to gold once automatic copy trading is switched on.
import {useCallback} from 'react';
import * as THREE from 'three';
import {Phone} from '../three/Phone';
import {GOLD, ORB_COOL, ORB_GOLD, OrbFn, PhoneGlow, Studio} from '../three/Studio';
import {useScreenTexture} from '../three/useScreenTexture';
import {COLORS} from './data';
import {copyScreenKey, drawCopyScreen} from './screens';
import {BASE, glow, phonePose, warmth} from './story';

const FINISH = {frame: new THREE.Color(COLORS.phoneFrame), back: new THREE.Color(COLORS.phoneBack)};
const finish = () => FINISH;

const orbs: OrbFn = (t, left, right) => {
  const w = warmth(t);
  left.copy(ORB_COOL).lerp(ORB_GOLD, w).multiplyScalar(0.07 + 0.03 * w);
  right.copy(ORB_COOL).lerp(ORB_GOLD, Math.min(1, w + 0.25)).multiplyScalar(0.07 + 0.03 * w);
};

export const CopyScene: React.FC = () => {
  const screen = useScreenTexture(useCallback(drawCopyScreen, []), copyScreenKey, BASE.pos);
  return (
    <>
      <Studio orbs={orbs} />
      <PhoneGlow pose={phonePose} glow={(t) => ({color: GOLD, strength: glow(t)})} />
      <Phone texture={screen} pose={phonePose} brightness={() => 1} finish={finish} />
    </>
  );
};
