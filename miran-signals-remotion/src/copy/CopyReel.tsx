// «كيف يعمل النسخ التلقائي مع Miran Gold»: one gold phone, the same studio, pipeline,
// end card and sound kit as the signals reel. No captions (the phone UI and your
// voiceover explain it).
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../data';
import {useAssetsReady} from '../Reel';
import {setScreenLang} from '../screens/draw';
import {Pipeline} from '../three/Pipeline';
import {endFade} from '../ui/Overlays';
import {CopyOverlays} from './Overlays';
import {CopyScene} from './Scene';
import {computeCopyCamera} from './camera';
import {CopyFormat, T} from './data';
import {CopySoundTrack} from './sound';

export type CopyReelProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
  /** Include the sound effects (render with --muted for a silent file). */
  sfx?: boolean;
};

const noBloom = () => false;
const noImpact = () => 0;

export const CopyReel: React.FC<CopyReelProps> = ({showSafeZones, sfx = true}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const fmt: CopyFormat = height > 1500 ? 'vertical' : 'feed';
  setScreenLang('ar');
  const ready = useAssetsReady();
  const blur = 26 * endFade(frame, T.endCardStart);
  const show3d = frame < T.endCardStart + 60;
  return (
    <AbsoluteFill style={{background: BRAND.bgTop}}>
      {ready && show3d ? (
        <AbsoluteFill style={{filter: blur > 0.01 ? `blur(${blur}px)` : undefined}}>
          <ThreeCanvas
            width={width}
            height={height}
            flat
            dpr={typeof window === 'undefined' ? 1 : Math.min(1, window.devicePixelRatio || 1)}
            gl={{antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', stencil: false}}
          >
            <Pipeline fmt={fmt} camera={computeCopyCamera} bloom={noBloom} impactAt={noImpact}>
              <CopyScene />
            </Pipeline>
          </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {ready ? <CopyOverlays fmt={fmt} showSafeZones={showSafeZones} /> : null}
      {sfx ? <CopySoundTrack /> : null}
    </AbsoluteFill>
  );
};

export const CopySfxOnly: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <CopySoundTrack />
  </AbsoluteFill>
);
