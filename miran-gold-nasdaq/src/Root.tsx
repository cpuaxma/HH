import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {VIDEO} from './config';
import './fonts';

export const RemotionRoot: React.FC = () => (
  <Composition
    id={VIDEO.id}
    component={Reel}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={VIDEO.durationInFrames}
  />
);
