import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Arena} from './arena/Arena';
import {VIDEO} from './config';
import {TradersArena, type TradersProps} from './Video';
import './fonts';

const ArenaOnly: React.FC<{post?: boolean; blur?: boolean}> = ({post = true, blur = true}) => (
  <AbsoluteFill style={{background: '#0A0A0A'}}>
    <Arena post={post} blur={blur} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TradersArena"
      component={TradersArena}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={VIDEO.durationInFrames}
      defaultProps={{showSafeZone: false, audit: false} satisfies TradersProps}
    />
    {/* 3D only, for look-dev. */}
    <Composition id="ArenaTest" component={ArenaOnly} width={VIDEO.width} height={VIDEO.height} fps={VIDEO.fps} durationInFrames={VIDEO.durationInFrames} defaultProps={{post: true}} />
  </>
);
