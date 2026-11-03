import {loadFont as loadArchivo} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as loadEmoji} from '@remotion/google-fonts/NotoColorEmoji';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

const archivo = loadArchivo('normal', {weights: ['400'], subsets: ['latin']});
const inter = loadInter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']});
const emoji = loadEmoji();

/** Archivo Black: the display face for the kinetic type and the hero headline. */
export const DISPLAY = `${archivo.fontFamily}, ${emoji.fontFamily}, sans-serif`;
/** Inter: small text (cards, the feed UI). */
export const TEXT = `${inter.fontFamily}, ${emoji.fontFamily}, sans-serif`;

/** Resolves once every font is ready (the canvas textures must wait for this). */
export const fontsReady = () => Promise.all([archivo.waitUntilDone(), inter.waitUntilDone(), emoji.waitUntilDone()]);
