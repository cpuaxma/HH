import {loadFont} from '@remotion/google-fonts/Cairo';
import {FONT} from './config';

// Cairo Bold + ExtraBold, Arabic and Latin subsets (Latin covers the Western digits and %).
// @remotion/google-fonts holds rendering until the font files are ready.
const {fontFamily} = loadFont('normal', {
  weights: ['700', '800'],
  subsets: ['arabic', 'latin'],
});

export const FONT_FAMILY = `${fontFamily}, ${FONT.fallback}`;
