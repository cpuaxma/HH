import {loadFont as loadArchivoBlack} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadEmoji} from '@remotion/google-fonts/NotoColorEmoji';

const archivo = loadArchivoBlack('normal', {weights: ['400'], subsets: ['latin']});
const inter = loadInter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']});
const emoji = loadEmoji();

/** Display face for the kinetic headlines. */
export const DISPLAY = `"${archivo.fontFamily}", "${emoji.fontFamily}", sans-serif`;
/** UI face for labels, the app UI and the CTA. */
export const UI = `"${inter.fontFamily}", "${emoji.fontFamily}", sans-serif`;

/** Resolves once every face used on the canvas screens is ready. */
export const fontsReady = (): Promise<unknown> =>
  Promise.all([
    archivo.waitUntilDone(),
    inter.waitUntilDone(),
    emoji.waitUntilDone(),
  ]).then(() =>
    Promise.all([
      document.fonts.load(`400 40px "${archivo.fontFamily}"`),
      ...['400', '500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px "${inter.fontFamily}"`)),
      document.fonts.load(`40px "${emoji.fontFamily}"`, '☕🔥😍👍🍪'),
    ]),
  );
