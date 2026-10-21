import {fitText, measureText} from '@remotion/layout-utils';
import {COPY, plain} from './copy';
import {COLUMN, FONT, TYPE, WEIGHT} from './theme';

// One headline size for the whole reel: the largest that fits every headline
// line inside the safe column, capped at TYPE.headlineMax.
let cachedHeadline: number | null = null;
export const headlineSize = () => {
  if (cachedHeadline === null) {
    const lines = [...COPY.hook.headline, ...COPY.oneTeam.headline, ...COPY.cta.headline].map(plain);
    const fits = lines.map(
      (text) =>
        fitText({
          text,
          withinWidth: COLUMN - 20,
          fontFamily: FONT,
          fontWeight: WEIGHT.headline,
          letterSpacing: TYPE.headlineTracking,
        }).fontSize,
    );
    cachedHeadline = Math.floor(Math.min(TYPE.headlineMax, ...fits));
  }
  return cachedHeadline;
};

export const LAYOUT = {
  hook: {
    labelY: 210,
    pepper: {x: 120, y: 360, width: 780},
    headlineTop: 1000,
  },
  oneTeam: {
    headlineTop: 520,
    // Underline sits just under the last headline line.
    underlineY: () => LAYOUT.oneTeam.headlineTop + headlineSize() * 3.3 + 44,
    bodyTop: () => LAYOUT.oneTeam.headlineTop + headlineSize() * 3.3 + 100,
  },
  services: {
    counterY: 400,
    cardTop: 500,
    cardHeight: 360,
    cardGap: 120,
    dividerY: () => LAYOUT.services.cardTop + LAYOUT.services.cardHeight + LAYOUT.services.cardGap / 2,
  },
  process: {
    lineX: 140,
    wordsTop: 560,
    wordStep: 140,
    wordsCenterX: 590,
  },
} as const;

// Greedy word wrap for text that is revealed line by line (MaskReveal lines never wrap on their own).
export const wrapLines = (text: string, fontSize: number, fontWeight: number, maxWidth: number, letterSpacing: string = TYPE.headlineTracking) => {
  const fits = (t: string) =>
    measureText({text: t, fontFamily: FONT, fontSize, fontWeight, letterSpacing}).width <= maxWidth;
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const next = current ? `${current} ${word}` : word;
    if (current && !fits(next)) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
};
