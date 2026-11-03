import {ThreeCanvas} from '@remotion/three';
import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
import {BRAND, FormatId, TIMING} from './data';
import {Overlays, endFade} from './ui/Overlays';
import {SoundTrack} from './sound';
import {fontsReady} from './fonts';
import {Pipeline} from './three/Pipeline';
import {DBG} from './debug';
import {Scene} from './three/Scene';

export type ReelProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
  /** Include the sound effects (render with --muted for a silent file). */
  sfx?: boolean;
};

export const useFormat = (): FormatId => (useVideoConfig().height > 1500 ? 'vertical' : 'feed');

/** Holds the render until every font the canvas screens use is loaded. */
const useFontsReady = () => {
  const {delayRender, continueRender} = useDelayRender();
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading fonts for the screens'));
  useEffect(() => {
    fontsReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [continueRender, handle]);
  return ready;
};

export const Reel: React.FC<ReelProps> = ({showSafeZones, sfx = true}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const fmt = useFormat();
  const ready = useFontsReady();
  // End card: the 3D softly blurs out under the off-white, then stops rendering once covered.
  const blur = 24 * endFade(frame);
  const show3d = frame < TIMING.endCardStart + 60;
  return (
    <AbsoluteFill style={{background: BRAND.offWhite}}>
      {ready && show3d ? (
        <AbsoluteFill style={{filter: blur > 0.01 ? `blur(${blur}px)` : undefined}}>
        <ThreeCanvas
          width={width}
          height={height}
          flat
          dpr={1}
          gl={{antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', stencil: false}}
        >
          <Pipeline fmt={fmt}>
            <Scene />
          </Pipeline>
        </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {ready && !DBG.has('noOverlay') ? <Overlays showSafeZones={showSafeZones} /> : null}
      {sfx ? <SoundTrack /> : null}
    </AbsoluteFill>
  );
};
