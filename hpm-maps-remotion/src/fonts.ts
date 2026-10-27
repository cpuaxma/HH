import {loadFont as loadEmoji} from '@remotion/google-fonts/NotoColorEmoji';
import {loadFont as loadJakarta} from '@remotion/google-fonts/PlusJakartaSans';

const jakarta = loadJakarta('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']});
const emoji = loadEmoji();

/** Plus Jakarta Sans for text, Noto Color Emoji for the emoji. */
export const FONT = `${jakarta.fontFamily}, ${emoji.fontFamily}, sans-serif`;
export const EMOJI_FONT = `${emoji.fontFamily}, sans-serif`;
