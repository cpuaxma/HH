import {loadFont as loadSerif} from '@remotion/google-fonts/DMSerifDisplay';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

const serif = loadSerif('normal', {weights: ['400'], subsets: ['latin']});
const inter = loadInter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']});

/** Font family names, for drawing text onto canvas textures. */
export const SERIF_FAMILY = serif.fontFamily;
export const SANS_FAMILY = inter.fontFamily;

/** DM Serif Display for headlines (echoes the logo's lettering), Inter for everything else. */
export const SERIF = `${serif.fontFamily}, Georgia, serif`;
export const SANS = `${inter.fontFamily}, sans-serif`;
