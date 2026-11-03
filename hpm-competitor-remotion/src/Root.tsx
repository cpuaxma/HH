import {Composition} from 'remotion';
import {LAYOUT, TIMING} from './data';
import {Reel, ReelProps} from './Reel';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HpmCompetitor"
      component={Reel}
      durationInFrames={TIMING.durationInFrames}
      fps={TIMING.fps}
      width={LAYOUT.vertical.width}
      height={LAYOUT.vertical.height}
      defaultProps={{showSafeZones: false, sfx: true} satisfies ReelProps}
    />
    <Composition
      id="HpmCompetitor4x5"
      component={Reel}
      durationInFrames={TIMING.durationInFrames}
      fps={TIMING.fps}
      width={LAYOUT.feed.width}
      height={LAYOUT.feed.height}
      defaultProps={{showSafeZones: false, sfx: true} satisfies ReelProps}
    />
  </>
);
