import React from 'react';
import {Composition} from 'remotion';
import {HpmMakeover} from './HpmMakeover';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="HpmMakeover" component={HpmMakeover} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
