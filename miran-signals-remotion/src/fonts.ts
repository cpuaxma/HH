// IBM Plex Sans Arabic, bundled with @fontsource (never fetched at render time).
// It carries Latin glyphs too, so the whole reel (Arabic type, the app UI, the numbers)
// uses one family. Its heaviest weight is Bold (700).
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';

export const FAMILY = '"IBM Plex Sans Arabic", sans-serif';
const NAME = 'IBM Plex Sans Arabic';
const WEIGHTS = ['400', '500', '600', '700'];
/** Samples covering every unicode-range subset we use (Arabic, Latin, Latin-ext). */
const SAMPLE = 'Aa0$%—−… ميران جولد توضيحي ١٢';

/** Resolves once every weight (and every subset) is loaded, so canvas text never falls back. */
export const fontsReady = (): Promise<unknown> =>
  Promise.all(WEIGHTS.map((w) => document.fonts.load(`${w} 40px "${NAME}"`, SAMPLE))).then(() => document.fonts.ready);
