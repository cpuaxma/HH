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

const common = {durationInFrames: TIMING.durationInFrames, fps: TIMING.fps};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Main: Arabic, 9:16 for Reels. */}
    <Composition
      id="MiranSignals"
      component={Reel}
      {...common}
      width={LAYOUT.vertical.width}
      height={LAYOUT.vertical.height}
      defaultProps={{showSafeZones: false, sfx: true, lang: 'ar'} satisfies ReelProps}
    />
    {/* 4:5 for feed ads: re-framed (camera, type and layout per format), not cropped. */}
    <Composition
      id="MiranSignals4x5"
      component={Reel}
      {...common}
      width={LAYOUT.feed.width}
      height={LAYOUT.feed.height}
      defaultProps={{showSafeZones: false, sfx: true, lang: 'ar'} satisfies ReelProps}
    />
    {/* English: the same picture with the strings swapped. */}
    <Composition
      id="MiranSignalsEN"
      component={Reel}
      {...common}
      width={LAYOUT.vertical.width}
      height={LAYOUT.vertical.height}
      defaultProps={{showSafeZones: false, sfx: true, lang: 'en'} satisfies ReelProps}
    />
    <Composition id="MiranSignalsSfx" component={SfxOnly} {...common} width={1080} height={1920} />
    <Composition id="MiranSignalsAudio" component={AudioMix} {...common} width={1080} height={1920} />
  </>
);
