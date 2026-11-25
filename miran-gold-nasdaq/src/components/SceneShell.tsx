import React, {createContext, useContext} from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {SceneKey, SCENES, TRANSITION, VIDEO} from '../config';
import {clamp, EASE} from '../lib/motion';

const HALF = TRANSITION / 2;
const OffsetContext = createContext(0);

/** Frame relative to the start of the enclosing scene (0 = the scene's nominal start). */
export const useSceneFrame = () => useCurrentFrame() - useContext(OffsetContext);

/**
 * Mounts a scene for its window plus half a transition on each side, and cross-fades it
 * (opacity + gentle blur + drift) so neighbouring scenes dissolve into each other: no hard cuts.
 */
export const SceneShell: React.FC<{scene: SceneKey; children: React.ReactNode}> = ({scene, children}) => {
  const {from, to} = SCENES[scene];
  const isFirst = from === 0;
  const isLast = to >= VIDEO.durationInFrames;
  const start = isFirst ? 0 : from - HALF;
  const end = isLast ? VIDEO.durationInFrames : to + HALF;

  return (
    <Sequence from={start} durationInFrames={end - start} name={scene}>
      <OffsetContext.Provider value={from - start}>
        <ShellFade from={from} to={to} isFirst={isFirst} isLast={isLast} startOffset={from - start}>
          {children}
        </ShellFade>
      </OffsetContext.Provider>
    </Sequence>
  );
};

const ShellFade: React.FC<{
  from: number;
  to: number;
  isFirst: boolean;
  isLast: boolean;
  startOffset: number;
  children: React.ReactNode;
}> = ({from, to, isFirst, isLast, startOffset, children}) => {
  const f = useCurrentFrame() - startOffset + from; // absolute frame
  const fadeIn = isFirst ? 1 : interpolate(f, [from - HALF, from + HALF], [0, 1], {...clamp, easing: EASE.inOut});
  const fadeOut = isLast ? 1 : interpolate(f, [to - HALF, to + HALF], [1, 0], {...clamp, easing: EASE.inOut});
  const blur = (1 - fadeIn) * 8 + (1 - fadeOut) * 10;
  const y = (1 - fadeIn) * 24 - (1 - fadeOut) * 30;
  const scale = 1 + (1 - fadeIn) * 0.02 - (1 - fadeOut) * 0.015;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(fadeIn, fadeOut),
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        transform: `translateY(${y}px) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
