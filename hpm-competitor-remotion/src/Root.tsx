import {AbsoluteFill, Composition} from 'remotion';
import {LAYOUT, TIMING} from './data';
import {Reel, ReelProps} from './Reel';
import {SoundTrack} from './sound';

/** The sound effects on their own, for exporting a WAV to mix elsewhere. */
const SfxOnly: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <SoundTrack voice={false} />
  </AbsoluteFill>
);

/** Effects and voiceover together, for muxing onto a silent render. */
const AudioMix: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <SoundTrack voice />
  </AbsoluteFill>
);

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
    <Composition
      id="HpmCompetitorSfx"
      component={SfxOnly}
      durationInFrames={TIMING.durationInFrames}
      fps={TIMING.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="HpmCompetitorAudio"
      component={AudioMix}
      durationInFrames={TIMING.durationInFrames}
      fps={TIMING.fps}
      width={1080}
      height={1920}
    />
  </>
);
