import {Composition} from 'remotion';
import {TIMING} from './data';
import {Reel, ReelProps} from './Reel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AvantisDipIFR"
    component={Reel}
    durationInFrames={TIMING.durationInFrames}
    fps={TIMING.fps}
    width={1080}
    height={1920}
    defaultProps={{showSafeZones: false} satisfies ReelProps}
  />
);
