import {loadFont} from '@remotion/google-fonts/Cairo';
import {loadFont as loadPlex} from '@remotion/google-fonts/IBMPlexSansArabic';

// loadFont() blocks rendering until the font files are ready, so no frame renders in a fallback font.
const loaded = loadFont('normal', {weights: ['600', '700', '800', '900'], subsets: ['arabic', 'latin']});

export const fontFamily = `${loaded.fontFamily}, sans-serif`;

// The Miran Gold outro uses IBM Plex Sans Arabic, like the rest of the Miran Gold series.
const plex = loadPlex('normal', {weights: ['300', '600'], subsets: ['latin']});
export const outroFontFamily = `${plex.fontFamily}, sans-serif`;
