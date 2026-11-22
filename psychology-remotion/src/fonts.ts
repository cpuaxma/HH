import {loadFont} from '@remotion/google-fonts/Cairo';

// loadFont() blocks rendering until the font files are ready, so no frame renders in a fallback font.
const loaded = loadFont('normal', {weights: ['600', '700', '800', '900'], subsets: ['arabic', 'latin']});

export const fontFamily = `${loaded.fontFamily}, sans-serif`;
