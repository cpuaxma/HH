import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from './config';
import {Main, MainProps} from './Main';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Psychology"
      component={Main}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={VIDEO.durationInFrames}
      defaultProps={{showSafeZone: false, textOnly: false} satisfies MainProps}
    />
    {/* Text-only variant used by `npm run check:safe` (no 3D, no scrims, no grade) */}
    <Composition
      id="Psychology-TextOnly"
      component={Main}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={VIDEO.durationInFrames}
      defaultProps={{showSafeZone: false, textOnly: true} satisfies MainProps}
    />
  </>
);
