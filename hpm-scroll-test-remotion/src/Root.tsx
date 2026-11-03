import {AbsoluteFill, Composition} from 'remotion';
import {DURATION, FPS} from './data';
import {ScrollTest, ScrollTestProps} from './ScrollTest';
import {SoundTrack} from './sound';

/** The sound effects on their own, for exporting a WAV to mix elsewhere. */
const SfxOnly: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <SoundTrack />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ScrollTest"
      component={ScrollTest}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{showSafeZones: false, sfx: true, overlays: true} satisfies ScrollTestProps}
    />
    <Composition id="ScrollTestSfx" component={SfxOnly} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
