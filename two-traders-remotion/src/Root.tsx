import React from 'react';
import {Composition} from 'remotion';
import {CharacterSheet, SHEET_H, SHEET_W, SheetProps} from './CharacterSheet';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';
import {TwoTraders, TwoTradersProps} from './TwoTraders';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TwoTraders"
      component={TwoTraders}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{lang: 'en'} as TwoTradersProps}
    />
    <Composition
      id="CharacterSheet"
      component={CharacterSheet}
      durationInFrames={600}
      fps={FPS}
      width={SHEET_W}
      height={SHEET_H}
      defaultProps={{who: 'ray'} as SheetProps}
    />
  </>
);
