import React from 'react';
import {CalculateMetadataFunction, Composition, Still} from 'remotion';
import {VIDEO} from './config';
import {FontSource, resolveFontSource} from './components/FontGate';
import {TOTAL_FRAMES} from './lib/timeline';
import {Reel} from './Reel';
import {Thumbnail} from './Thumbnail';

type ReelInput = {fontSource: FontSource | 'auto'; debugSafeZone: boolean};

const resolveFonts: CalculateMetadataFunction<ReelInput> = async ({props}) => ({
  props: {...props, fontSource: props.fontSource === 'auto' ? await resolveFontSource() : props.fontSource},
});

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={VIDEO.compositionId}
      component={Reel as unknown as React.FC<ReelInput>}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{fontSource: 'auto', debugSafeZone: false}}
      calculateMetadata={resolveFonts}
    />
    <Still
      id={VIDEO.thumbnailId}
      component={Thumbnail as unknown as React.FC<ReelInput>}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{fontSource: 'auto', debugSafeZone: false}}
      calculateMetadata={resolveFonts}
    />
  </>
);
