import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/arimo/400.css';
import '@fontsource/arimo/700.css';
import '@fontsource/tinos/400.css';
import '@fontsource/tinos/700.css';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

// Fonts are bundled locally from @fontsource; hold the render until every face is ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading local fonts'));
  useEffect(() => {
    Promise.all(
      [
        "500 40px 'Montserrat'",
        "600 40px 'Montserrat'",
        "800 40px 'Montserrat'",
        "400 40px 'Arimo'",
        "700 40px 'Arimo'",
        "400 40px 'Tinos'",
        "700 40px 'Tinos'",
      ].map((f) => document.fonts.load(f, 'Aa…·–')),
    )
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
};

// Canvas text measurement (fonts must be loaded, see useFonts).
let ctx: CanvasRenderingContext2D | null = null;
export const measureText = (text: string, font: string) => {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
};
