import {AbsoluteFill, Composition} from 'remotion';
import {TIMING} from './data';
import {HpmMaps, HpmMapsProps} from './HpmMaps';
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
      id="HpmMaps"
      component={HpmMaps}
      durationInFrames={TIMING.durationInFrames}
      fps={TIMING.fps}
      width={1080}
      height={1920}
      defaultProps={{showSafeZones: false, sfx: true} satisfies HpmMapsProps}
    />
    <Composition
      id="HpmMapsSfx"
      component={SfxOnly}
      durationInFrames={TIMING.durationInFrames}
      fps={TIMING.fps}
      width={1080}
      height={1920}
    />
  </>
);
