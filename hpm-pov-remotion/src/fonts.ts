import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const FACES = ["500 40px 'Montserrat'", "600 40px 'Montserrat'", "700 40px 'Montserrat'", "800 40px 'Montserrat'"];

// Fonts are bundled locally from @fontsource; hold the render until every face is ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Montserrat'));
  useEffect(() => {
    Promise.all(FACES.map((f) => document.fonts.load(f, 'Aa0·–…')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
};

export const fontsReady = () => typeof document !== 'undefined' && FACES.every((f) => document.fonts.check(f));

// Canvas text measurement (only meaningful once fontsReady()).
let ctx: CanvasRenderingContext2D | null = null;
export const measureText = (text: string, font: string, letterSpacingPx = 0) => {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * 0.6 * parseFloat(font.split(' ')[1]);
  ctx.font = font;
  return ctx.measureText(text).width + letterSpacingPx * Array.from(text).length;
};
