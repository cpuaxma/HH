import React from 'react';
import {Composition} from 'remotion';
import {GoldDollar, GoldDollarProps} from './GoldDollar';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GoldDollar"
    component={GoldDollar}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{lang: 'en'} as GoldDollarProps}
  />
);
