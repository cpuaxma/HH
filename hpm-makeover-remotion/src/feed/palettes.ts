import {CLIENT, FONT} from '../theme';
import {Palette} from './Illustrations';

// AFTER: three cohesive Bean & Bloom grounds in a checker-like rhythm.
const E: Palette = {bg: CLIENT.espresso, a: CLIENT.oat, b: '#4A3427', c: CLIENT.sage, d: '#C9A27E', accent: CLIENT.accent, font: FONT.brand};
const O: Palette = {bg: CLIENT.oat, a: CLIENT.espresso, b: CLIENT.oatDeep, c: CLIENT.sage, d: '#B4875F', accent: CLIENT.accent, font: FONT.brand};
const S: Palette = {bg: CLIENT.sage, a: CLIENT.espresso, b: '#A7BAA2', c: CLIENT.oat, d: '#7A5A43', accent: CLIENT.accent, font: FONT.brand};
export const AFTER_PALETTES: Palette[] = [E, O, S, O, E, O, S, O, E];

// BEFORE: random, clashing stock-ish colours (shown desaturated).
const b = (bg: string, a: string, bb: string, c: string, d: string, font: string = FONT.times): Palette => ({bg, a, b: bb, c, d, accent: d, font});
export const BEFORE_PALETTES: Palette[] = [
  b('#9BB7D4', '#FFFFFF', '#5C7FA6', '#E0E0E0', '#6B3E1F'),
  b('#F7F7F7', '#D39B48', '#BDBDBD', '#FFF0C8', '#9A5B12'),
  b('#3B3B3B', '#EDEDED', '#777777', '#FFFFFF', '#8C6239'),
  b('#E9D9A6', '#A23B2A', '#FFFFFF', '#2D6A9F', '#4A90D9'),
  b('#FFFFFF', '#5A3A22', '#DDDDDD', '#999999', '#7B4B2A'),
  b('#B9C7B0', '#FFFFFF', '#6E6E6E', '#E7F0FA', '#C6763A'),
  b('#1F1F1F', '#7A4A2A', '#5A5A5A', '#F5F5F5', '#E04F9A'),
  b('#F2C9C9', '#C98E6E', '#FFFFFF', '#FFFFFF', '#7A7A7A'),
  b('#6F6F6F', '#2A2A2A', '#BBBBBB', '#FFFFFF', '#A0522D', FONT.arial),
];
