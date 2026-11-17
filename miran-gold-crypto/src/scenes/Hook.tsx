import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CoinStage} from '../components/CoinStage';
import {Headline} from '../components/Headline';
import {useGlobalSeconds, useSceneFrame} from '../components/SceneShell';
import {lerp, settle} from '../motion';

/** 0–4s: a gold coin with a glowing circuit face turns slowly in the light. */
export const Hook: React.FC = () => {
  const f = useSceneFrame();
  const t = useGlobalSeconds();
  const enter = settle(f, 0, 36);
  return (
    <AbsoluteFill>
      <CoinStage t={t} opacity={0.25 + 0.75 * enter} scale={lerp(enter, [0, 1], [0.9, 1])} float={1} />
      <Headline />
    </AbsoluteFill>
  );
};
