import React from 'react';
import {Composition} from 'remotion';
import {HpmPov} from './HpmPov';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="HpmPov" component={HpmPov} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
