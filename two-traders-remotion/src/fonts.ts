import '@fontsource/ibm-plex-sans-arabic/arabic-300.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/latin-300.css';
import '@fontsource/ibm-plex-sans-arabic/latin-600.css';
import '@fontsource/sora/300.css';
import '@fontsource/sora/600.css';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

// Fonts are bundled from @fontsource; hold the render until they are ready
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading local fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("300 40px 'Sora'"),
      document.fonts.load("600 40px 'Sora'"),
      document.fonts.load("300 40px 'IBM Plex Sans Arabic'", 'الذهب'),
      document.fonts.load("600 40px 'IBM Plex Sans Arabic'", 'الذهب'),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
};
