import React from 'react';
import {Composition, cancelRender, continueRender, delayRender} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import {Reel} from './Reel';
import {VIDEO} from './brand';

// Fonts ship with the bundle (@fontsource): nothing is fetched at render time.
const fontHandle = delayRender('Loading fonts');
const AR = 'الذهب ميران ٩ XAU/USD $3,500 90%';
Promise.all([
  ...[500, 600, 700].map((w) => document.fonts.load(`${w} 40px "IBM Plex Sans Arabic"`, AR)),
  ...[600, 700].map((w) => document.fonts.load(`${w} 40px "Poppins"`, 'NASDAQ S&P 500 01 02 03')),
])
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Fed3Markets" component={Reel} width={VIDEO.width} height={VIDEO.height} fps={VIDEO.fps} durationInFrames={VIDEO.durationInFrames} defaultProps={{showBackground: true}} />
    <Composition id="Fed3MarketsOverlay" component={Reel} width={VIDEO.width} height={VIDEO.height} fps={VIDEO.fps} durationInFrames={VIDEO.durationInFrames} defaultProps={{showBackground: false}} />
  </>
);
