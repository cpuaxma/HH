import {ThreeCanvas} from '@remotion/three';
import {useEffect, useState} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from 'remotion';
import {BRAND, FormatId, Lang, TIMING} from './data';
import {fontsReady} from './fonts';
import {setScreenLang} from './screens/draw';
import {setLogoImage} from './screens/kit';
import {SoundTrack} from './sound';
import {Pipeline} from './three/Pipeline';
import {Scene} from './three/Scene';
import {Overlays, endFade} from './ui/Overlays';

export type ReelProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
  /** Include the sound effects (render with --muted for a silent file). */
  sfx?: boolean;
  /** Language of every string (the picture is the same). */
  lang?: Lang;
};

export const useFormat = (): FormatId => (useVideoConfig().height > 1500 ? 'vertical' : 'feed');

/** Holds the render until every font weight and the logo (drawn on the canvas screens) are loaded. */
const useAssetsReady = () => {
  const {delayRender, continueRender} = useDelayRender();
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading fonts and the logo for the screens'));
  useEffect(() => {
    const logo = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
        resolve();
      };
      img.onerror = () => reject(new Error('logo.png failed to load'));
      img.src = staticFile('logo.png');
    });
    Promise.all([fontsReady(), logo]).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [continueRender, handle]);
  return ready;
};

export const Reel: React.FC<ReelProps> = ({showSafeZones, sfx = true, lang = 'ar'}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const fmt = useFormat();
  setScreenLang(lang);
  const ready = useAssetsReady();
  // End card: the 3D softly blurs out under the navy, then stops rendering once covered.
  const blur = 26 * endFade(frame);
  const show3d = frame < TIMING.endCardStart + 60;
  return (
    <AbsoluteFill style={{background: BRAND.bgTop}}>
      {ready && show3d ? (
        <AbsoluteFill style={{filter: blur > 0.01 ? `blur(${blur}px)` : undefined}}>
          <ThreeCanvas
            width={width}
            height={height}
            flat
            // Follow the render scale (a half-res preview renders the 3D at half res); never above 1.
            dpr={typeof window === 'undefined' ? 1 : Math.min(1, window.devicePixelRatio || 1)}
            gl={{antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', stencil: false}}
          >
            <Pipeline fmt={fmt}>
              <Scene />
            </Pipeline>
          </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {ready ? <Overlays showSafeZones={showSafeZones} lang={lang} /> : null}
      {sfx ? <SoundTrack /> : null}
    </AbsoluteFill>
  );
};
