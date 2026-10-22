import React from 'react';
import {Composition} from 'remotion';
import {CharacterSheet, SHEET_H, SHEET_W, SheetProps} from './CharacterSheet';
import {FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
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
