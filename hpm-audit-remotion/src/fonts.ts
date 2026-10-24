import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/arimo/400.css';
import '@fontsource/arimo/700.css';
import '@fontsource/tinos/400.css';
import '@fontsource/tinos/700-italic.css';
import {measureText as measure} from '@remotion/layout-utils';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const FACES = [
  "600 40px 'Montserrat'",
  "800 40px 'Montserrat'",
  "900 40px 'Montserrat'",
  "400 40px 'Arimo'",
  "700 40px 'Arimo'",
  "400 40px 'Tinos'",
  "italic 700 40px 'Tinos'",
];

// Fonts are bundled locally from @fontsource; hold the render until every face is ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    Promise.all(FACES.map((f) => document.fonts.load(f, 'Aa0·–…é☕')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
};

const fontsReady = () => typeof document !== 'undefined' && FACES.every((f) => document.fonts.check(f));

// Width of a Montserrat run. Refuses to measure (and cache) before the fonts load.
export const textWidth = (text: string, fontSize: number, fontWeight: number, letterSpacing?: string) => {
  if (!fontsReady()) return text.length * fontSize * 0.62;
  return measure({text, fontFamily: 'Montserrat', fontSize, fontWeight, letterSpacing, validateFontIsLoaded: true}).width;
};
