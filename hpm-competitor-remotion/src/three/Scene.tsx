import {useCallback} from 'react';
import {competitorGlow, competitorPose, yourDim, yourGlow, yourWarmth, youPose} from '../lib/story';
import {competitorScreenKey, drawCompetitorScreen, drawYourScreen, yourScreenKey} from '../screens/draw';
import {BASE} from '../lib/story';
import {Phone} from './Phone';
import {Streak} from './Streak';
import {COLD, PhoneGlow, Studio, WARM} from './Studio';
import {useScreenTexture} from './useScreenTexture';

const yourColor = (t: number) => COLD.clone().lerp(WARM, yourWarmth(t));

export const Scene: React.FC = () => {
  const yours = useScreenTexture(useCallback(drawYourScreen, []), yourScreenKey, BASE.you.pos);
  const theirs = useScreenTexture(useCallback(drawCompetitorScreen, []), competitorScreenKey, BASE.competitor.pos);
  return (
    <>
      <Studio />
      <PhoneGlow pose={youPose} glow={(t) => ({color: yourColor(t), strength: yourGlow(t) * (0.16 + 0.84 * yourWarmth(t))})} />
      <PhoneGlow pose={competitorPose} glow={(t) => ({color: WARM, strength: competitorGlow(t)})} />
      <Phone texture={yours} pose={youPose} brightness={(t) => 1.0 * (1 - 0.45 * yourDim(t))} />
      <Phone texture={theirs} pose={competitorPose} brightness={() => 1.0} />
      <Streak />
    </>
  );
};

