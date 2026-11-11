import {Composition} from 'remotion';
import {BoostAd} from './Ad';
import {DURATION_FRAMES, FPS} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition id="BoostAd" component={BoostAd} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1920} />
);
