import {Composition} from 'remotion';
import {TIMING} from './data';
import {HpmMaps, HpmMapsProps} from './HpmMaps';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HpmMaps"
    component={HpmMaps}
    durationInFrames={TIMING.durationInFrames}
    fps={TIMING.fps}
    width={1080}
    height={1920}
    defaultProps={{showSafeZones: false} satisfies HpmMapsProps}
  />
);
