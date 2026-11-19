import {loadFont as loadCairo} from '@remotion/google-fonts/Cairo';
import {loadFont as loadTajawal} from '@remotion/google-fonts/Tajawal';
import {FONT} from './config';

const options = {weights: ['500', '700', '800', '900'], subsets: ['arabic', 'latin']} as const;

// loadFont() blocks rendering until the font files are ready, so no frame renders in a fallback font.
const loaded =
  FONT.arabic === 'Tajawal'
    ? loadTajawal('normal', {weights: [...options.weights], subsets: [...options.subsets]})
    : loadCairo('normal', {weights: [...options.weights], subsets: [...options.subsets]});

export const fontFamily = `${loaded.fontFamily}, sans-serif`;
