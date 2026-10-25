import React from 'react';
import {Composition, cancelRender, continueRender, delayRender} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import {Reel} from './Reel';
import {VIDEO} from './theme';

// The font ships with the bundle (@fontsource), so nothing is fetched at render time.
// Hold rendering until both weights (Arabic + Latin subsets) are ready.
const fontHandle = delayRender('Loading IBM Plex Sans Arabic');
const SAMPLE = 'الذهب الأسهم XAU/USD S&P 500 VS';
Promise.all([
  document.fonts.load(`300 40px "IBM Plex Sans Arabic"`, SAMPLE),
  document.fonts.load(`600 40px "IBM Plex Sans Arabic"`, SAMPLE),
])
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GoldVsStocksAR"
    component={Reel}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={VIDEO.durationInFrames}
  />
);
