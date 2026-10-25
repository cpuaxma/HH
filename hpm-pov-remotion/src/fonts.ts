import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import {measureText as measure} from '@remotion/layout-utils';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const FACES = [
  "500 40px 'Montserrat'",
  "600 40px 'Montserrat'",
  "700 40px 'Montserrat'",
  "800 40px 'Montserrat'",
  "400 40px 'Inter'",
  "600 40px 'Inter'",
];

// Fonts are bundled locally from @fontsource; hold the render until every face is ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Montserrat and Inter'));
  useEffect(() => {
    Promise.all(FACES.map((f) => document.fonts.load(f, 'Aa0·–…')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
};

export const fontsReady = () => typeof document !== 'undefined' && FACES.every((f) => document.fonts.check(f));

// Text width via @remotion/layout-utils, with the same family, size, weight and tracking
// the text renders with. It refuses to measure (or cache) before the fonts are loaded,
// because layout-utils caches results and a fallback-font width would stick.
export type TextSpec = {text: string; fontSize: number; fontWeight: number; letterSpacing?: string; fontFamily?: string};
export const measureText = ({text, fontSize, fontWeight, letterSpacing, fontFamily = 'Montserrat'}: TextSpec) => {
  if (!fontsReady()) return text.length * fontSize * 0.6;
  return measure({text, fontFamily, fontSize, fontWeight, letterSpacing, validateFontIsLoaded: true}).width;
};
