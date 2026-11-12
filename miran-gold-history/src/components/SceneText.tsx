import React from 'react';
import {LAYOUT, SceneKey, sceneLength} from '../theme';
import type {TextBlock} from '../strings';
import {ArabicText} from './ArabicText';
import {Headline} from './Layout';

export type Layer = 'back' | 'front';

/** A scene's headline in the upper-middle third; its words exit by the end of the scene. */
export const SceneText: React.FC<{k: SceneKey; block: TextBlock; size?: number; start?: number; top?: number}> = ({
  k,
  block,
  size = LAYOUT.headlineSize - 4,
  start = 8,
  top,
}) => (
  <Headline top={top}>
    <ArabicText block={block} size={size} start={start} exitEnd={sceneLength(k)} />
  </Headline>
);
