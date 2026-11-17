import React from 'react';
import {Composition, cancelRender, continueRender, delayRender} from 'remotion';
import '@fontsource/cairo/arabic-600.css';
import '@fontsource/cairo/arabic-700.css';
import '@fontsource/cairo/arabic-800.css';
import '@fontsource/cairo/latin-700.css';
import '@fontsource/cairo/latin-800.css';
import {CryptoExplainer} from './Video';
import {TOTAL_FRAMES, VIDEO} from './config';

// Cairo (Google Fonts) ships inside the bundle via @fontsource, so nothing is fetched at render time.
// Hold the render until every weight is ready.
const fontHandle = delayRender('Loading Cairo');
const SAMPLE = 'ما هي العملات الرقمية؟ يسجّل ٢٤ ساعة 01 Follow Miran Gold';
Promise.all(['600', '700', '800'].map((w) => document.fonts.load(`${w} 40px "Cairo"`, SAMPLE)))
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={VIDEO.id}
      component={CryptoExplainer}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={TOTAL_FRAMES}
      defaultProps={{showSafeZones: false}}
    />
    <Composition
      id={`${VIDEO.id}-SafeZones`}
      component={CryptoExplainer}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={TOTAL_FRAMES}
      defaultProps={{showSafeZones: true}}
    />
  </>
);
