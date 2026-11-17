import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneConfig, VIDEO, sec} from '../config';
import {ramp} from '../motion';

type Ctx = {config: SceneConfig; lead: number};
const SceneContext = createContext<Ctx | null>(null);

/** The scene's own clock: 0 at the scene's nominal start (negative during the incoming crossfade). */
export const useSceneFrame = () => {
  const ctx = useContext(SceneContext);
  const frame = useCurrentFrame();
  if (!ctx) throw new Error('useSceneFrame outside SceneShell');
  return frame - ctx.lead;
};
export const useScene = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene outside SceneShell');
  return ctx.config;
};
/** Absolute time of the video in seconds (for motion that carries across scenes, like the coin). */
export const useGlobalSeconds = () => {
  const ctx = useContext(SceneContext);
  const f = useSceneFrame();
  return (sec(ctx!.config.from) + f) / VIDEO.fps;
};

/**
 * Wraps a scene inside its <Sequence>. `lead` is how many frames the sequence starts before the
 * scene's nominal start; the scene crossfades in over [-lead, +lead] and out over the same span at its end.
 */
export const SceneShell: React.FC<{
  config: SceneConfig;
  lead: number;
  tail: number;
  children: React.ReactNode;
}> = ({config, lead, tail, children}) => {
  const frame = useCurrentFrame();
  const length = sec(config.to) - sec(config.from);
  const local = frame - lead;
  const fadeIn = lead > 0 ? ramp(local, -lead, lead) : 1;
  const fadeOut = tail > 0 ? 1 - ramp(local, length - tail, length + tail) : 1;
  return (
    <SceneContext.Provider value={{config, lead}}>
      <AbsoluteFill style={{opacity: fadeIn * fadeOut}}>{children}</AbsoluteFill>
    </SceneContext.Provider>
  );
};
