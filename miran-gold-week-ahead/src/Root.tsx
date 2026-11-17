import React from 'react';
import {Composition, cancelRender, continueRender, delayRender} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import {VIDEO} from './brand';
import {WeekAhead} from './compositions/WeekAhead';
import {DEFAULT_EDITION} from './edition';

// Fonts ship with the bundle (@fontsource): nothing is fetched at render time.
const fontHandle = delayRender('Loading fonts');
const AR = 'الذهب الأربعاء ٢٣ – ٢٧ نوفمبر $3,855 3.1%';
Promise.all([
  document.fonts.load(`500 40px "IBM Plex Sans Arabic"`, AR),
  document.fonts.load(`700 40px "IBM Plex Sans Arabic"`, AR),
  document.fonts.load(`500 40px "Poppins"`, 'Miran 01'),
  document.fonts.load(`600 40px "Poppins"`, 'Miran 01'),
  document.fonts.load(`700 40px "Poppins"`, "Miran 01"),
  document.fonts.load(`800 40px "Poppins"`, "$3,855 -31%"),
])
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="WeekAhead"
      component={WeekAhead}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={VIDEO.durationInFrames}
      defaultProps={{edition: DEFAULT_EDITION, showBackground: true, withAudio: true}}
    />
    <Composition
      id="WeekAheadOverlay"
      component={WeekAhead}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={VIDEO.durationInFrames}
      defaultProps={{edition: DEFAULT_EDITION, showBackground: false, withAudio: false}}
    />
  </>
);
