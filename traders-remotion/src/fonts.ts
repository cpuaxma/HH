import {loadFont as loadGoogleFont} from '@remotion/google-fonts/Cairo';
import {loadFont as loadLocalFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Cairo (Arabic + Latin). By default it comes from Google Fonts via @remotion/google-fonts.
// On machines where the headless browser has no internet access, run `node scripts/fetch-fonts.mjs`
// once and render with REMOTION_LOCAL_FONTS=1: the same Cairo files are then served from /public/fonts.
// Either way rendering waits until the font is ready.
const LOCAL = process.env.REMOTION_LOCAL_FONTS === '1';

const ARABIC_RANGE =
  'U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';
const LATIN_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const loadLocal = () => {
  const family = 'Cairo Local';
  // Cairo is a variable font: one file per script covers every weight.
  loadLocalFont({family, url: staticFile('fonts/cairo-arabic.woff2'), weight: '200 1000', unicodeRange: ARABIC_RANGE, format: 'woff2'});
  loadLocalFont({family, url: staticFile('fonts/cairo-latin.woff2'), weight: '200 1000', unicodeRange: LATIN_RANGE, format: 'woff2'});
  return family;
};

export const CAIRO = LOCAL ? loadLocal() : loadGoogleFont('normal', {weights: ['600', '700', '800', '900'], subsets: ['arabic', 'latin']}).fontFamily;
