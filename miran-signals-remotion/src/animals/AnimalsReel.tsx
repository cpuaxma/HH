// «ما علاقة الحيوانات بالتداول؟»: the market animals, sculpted in gold and silver metal, in
// the same studio, pipeline, end card and sound kit as the other Miran Gold reels. One short
// name label per animal; no captions (your voiceover explains it).
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../data';
import {useAssetsReady} from '../Reel';
import {setScreenLang} from '../screens/draw';
import {Pipeline} from '../three/Pipeline';
import {endFade} from '../ui/Overlays';
import {AnimalsOverlays} from './Overlays';
import {AnimalsScene} from './Scene';
import {FigureMeshes} from './Figure';
import {computeAnimalsCamera} from './camera';
import {AnimalsFormat, T} from './data';
import {AnimalsSoundTrack} from './sound';

export type AnimalsReelProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
  /** Include the sound effects (render with --muted for a silent file). */
  sfx?: boolean;
};

const noBloom = () => false;
const noImpact = () => 0;

export const AnimalsReel: React.FC<AnimalsReelProps> = ({showSafeZones, sfx = true}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const fmt: AnimalsFormat = height > 1500 ? 'vertical' : 'feed';
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
            {/* The pipeline starts once the animals' meshes are loaded. */}
            <FigureMeshes>
              <Pipeline fmt={fmt} camera={computeAnimalsCamera} bloom={noBloom} impactAt={noImpact}>
                <AnimalsScene />
              </Pipeline>
            </FigureMeshes>
          </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {ready ? <AnimalsOverlays fmt={fmt} showSafeZones={showSafeZones} /> : null}
      {sfx ? <AnimalsSoundTrack /> : null}
    </AbsoluteFill>
  );
};

export const AnimalsSfxOnly: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <AnimalsSoundTrack />
  </AbsoluteFill>
);
