import React from 'react';
import {Composition} from 'remotion';
import {HpmAudit} from './HpmAudit';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="HpmAudit" component={HpmAudit} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
