import {AbsoluteFill, Composition} from 'remotion';
import {Captions, LAYOUT, TIMING} from './data';
import {Reel, ReelProps} from './Reel';
import {SoundTrack} from './sound';
import {CopyReel, CopyReelProps, CopySfxOnly} from './copy/CopyReel';
import {LAYOUT as COPY_LAYOUT, T as COPY_T} from './copy/data';

/** The sound effects on their own, for exporting a WAV to mix elsewhere. */
const SfxOnly: React.FC<{captions?: Captions}> = ({captions = 'full'}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <SoundTrack captions={captions} />
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
    {/* Voiceover cut: the same video with only the opening hook and the closing line on top. */}
    <Composition
      id="MiranSignalsClean"
      component={Reel}
      {...common}
      width={LAYOUT.vertical.width}
      height={LAYOUT.vertical.height}
      defaultProps={{showSafeZones: false, sfx: true, lang: 'ar', captions: 'minimal'} satisfies ReelProps}
    />
    <Composition
      id="MiranSignalsClean4x5"
      component={Reel}
      {...common}
      width={LAYOUT.feed.width}
      height={LAYOUT.feed.height}
      defaultProps={{showSafeZones: false, sfx: true, lang: 'ar', captions: 'minimal'} satisfies ReelProps}
    />
    <Composition id="MiranSignalsSfx" component={SfxOnly} {...common} width={1080} height={1920} />
    <Composition id="MiranSignalsCleanSfx" component={SfxOnly} {...common} width={1080} height={1920} defaultProps={{captions: 'minimal'}} />

    {/* «كيف يعمل النسخ التلقائي مع Miran Gold»: the automatic copy trading explainer (src/copy). */}
    <Composition
      id="MiranCopyTrading"
      component={CopyReel}
      durationInFrames={COPY_T.durationInFrames}
      fps={COPY_T.fps}
      width={COPY_LAYOUT.vertical.width}
      height={COPY_LAYOUT.vertical.height}
      defaultProps={{showSafeZones: false, sfx: true} satisfies CopyReelProps}
    />
    <Composition
      id="MiranCopyTrading4x5"
      component={CopyReel}
      durationInFrames={COPY_T.durationInFrames}
      fps={COPY_T.fps}
      width={COPY_LAYOUT.feed.width}
      height={COPY_LAYOUT.feed.height}
      defaultProps={{showSafeZones: false, sfx: true} satisfies CopyReelProps}
    />
    <Composition id="MiranCopyTradingSfx" component={CopySfxOnly} durationInFrames={COPY_T.durationInFrames} fps={COPY_T.fps} width={1080} height={1920} />
  </>
);
