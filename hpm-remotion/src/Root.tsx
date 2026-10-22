import React from 'react';
import {Composition} from 'remotion';
import {HpmServices} from './HpmServices';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="HpmServices" component={HpmServices} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
