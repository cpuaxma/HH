/**
 * SFX cue list for the Week Ahead template (60fps, 120 BPM: 1 beat = 30 frames).
 * Files are expected in public/sfx/<name>.wav; missing files are skipped silently.
 * Kept free of imports so scripts/export-cues.mjs can turn it into sfx_cues.csv.
 */

export type SfxName =
  | 'whoosh'
  | 'swish_short'
  | 'pop'
  | 'click_ui'
  | 'tick'
  | 'riser_1s'
  | 'impact_soft'
  | 'chime_gold'
  | 'typing'
  | 'counter_roll'
  | 'paper'
  | 'bass_drop';

export type Cue = {frame: number; sfx: SfxName; volume: number; note: string; durationInFrames?: number};

export const SFX_FILES: SfxName[] = [
  'whoosh', 'swish_short', 'pop', 'click_ui', 'tick', 'riser_1s', 'impact_soft',
  'chime_gold', 'typing', 'counter_roll', 'paper', 'bass_drop',
];

export const CUES: Cue[] = [
  // 1 · Hook
  {frame: 0, sfx: 'riser_1s', volume: 0.7, note: 'Hook: riser under the price card slam'},
  {frame: 60, sfx: 'impact_soft', volume: 0.9, note: 'Hook: price card lands, chart starts drawing'},
  {frame: 60, sfx: 'counter_roll', volume: 0.45, note: 'Hook: price rolls from record to latest', durationInFrames: 60},
  {frame: 120, sfx: 'pop', volume: 0.7, note: 'Hook: price lands + −% chip'},
  {frame: 150, sfx: 'click_ui', volume: 0.6, note: 'Hook: day strip, Monday active'},
  // 2 · Card stack
  {frame: 195, sfx: 'swish_short', volume: 0.6, note: 'Stack: card 1 (Wednesday)'},
  {frame: 225, sfx: 'swish_short', volume: 0.6, note: 'Stack: card 2 (holiday)'},
  {frame: 255, sfx: 'swish_short', volume: 0.6, note: 'Stack: card 3 (jobs)'},
  {frame: 300, sfx: 'pop', volume: 0.7, note: 'Stack: "next week" pill'},
  // 3 · 01
  {frame: 360, sfx: 'whoosh', volume: 0.6, note: 'Whip-pan into chapter 01'},
  {frame: 390, sfx: 'impact_soft', volume: 0.85, note: 'Chapter numeral 01'},
  {frame: 405, sfx: 'whoosh', volume: 0.35, note: 'Strip highlight slides to Wednesday'},
  {frame: 420, sfx: 'click_ui', volume: 0.6, note: 'Wednesday active'},
  // 4 · Wednesday card
  {frame: 480, sfx: 'swish_short', volume: 0.6, note: 'Wednesday card in'},
  {frame: 540, sfx: 'counter_roll', volume: 0.4, note: 'GDP bars + values count', durationInFrames: 60},
  {frame: 600, sfx: 'pop', volume: 0.65, note: 'GDP Q3 value lands'},
  {frame: 630, sfx: 'riser_1s', volume: 0.5, note: 'Riser into the "?" bar'},
  {frame: 690, sfx: 'impact_soft', volume: 0.7, note: '"?" bar lands, PCE gauge settles'},
  {frame: 750, sfx: 'click_ui', volume: 0.6, note: 'Beige Book chip'},
  // 5 · Cause chain
  {frame: 870, sfx: 'tick', volume: 0.5, note: 'Chain step 1 (higher inflation)'},
  {frame: 900, sfx: 'tick', volume: 0.5, note: 'Chain step 2'},
  {frame: 930, sfx: 'tick', volume: 0.5, note: 'Chain step 3'},
  {frame: 960, sfx: 'tick', volume: 0.5, note: 'Chain step 4'},
  {frame: 990, sfx: 'impact_soft', volume: 0.7, note: 'Pressure on gold (coin dips)'},
  {frame: 1020, sfx: 'whoosh', volume: 0.55, note: 'Flip to the opposite outcome'},
  {frame: 1050, sfx: 'tick', volume: 0.5, note: 'Green chain steps'},
  {frame: 1080, sfx: 'tick', volume: 0.5, note: 'Green chain steps'},
  {frame: 1110, sfx: 'impact_soft', volume: 0.7, note: 'Support for gold'},
  // 6 · 02
  {frame: 1140, sfx: 'whoosh', volume: 0.6, note: 'Whip-pan into chapter 02'},
  {frame: 1170, sfx: 'impact_soft', volume: 0.85, note: 'Chapter numeral 02'},
  {frame: 1200, sfx: 'click_ui', volume: 0.6, note: 'Thursday active'},
  // 7 · Holiday
  {frame: 1290, sfx: 'paper', volume: 0.8, note: '"US holiday" stamp on Thursday'},
  {frame: 1380, sfx: 'whoosh', volume: 0.4, note: 'Highlight slides to Friday'},
  {frame: 1395, sfx: 'click_ui', volume: 0.6, note: 'Friday active, half clock'},
  {frame: 1440, sfx: 'tick', volume: 0.45, note: 'Liquidity bars thin out'},
  {frame: 1500, sfx: 'tick', volume: 0.45, note: 'Price line gets jumpier'},
  {frame: 1530, sfx: 'impact_soft', volume: 0.6, note: 'Caption line 2 lands'},
  // 8 · 03
  {frame: 1620, sfx: 'whoosh', volume: 0.6, note: 'Whip-pan into chapter 03'},
  {frame: 1650, sfx: 'impact_soft', volume: 0.85, note: 'Chapter numeral 03'},
  {frame: 1680, sfx: 'whoosh', volume: 0.4, note: 'Strip peeks at the following week'},
  // 9 · NFP
  {frame: 1755, sfx: 'riser_1s', volume: 0.5, note: 'Riser into the "?" bar'},
  {frame: 1815, sfx: 'pop', volume: 0.7, note: '"?" bar lands'},
  {frame: 1890, sfx: 'chime_gold', volume: 0.55, note: 'Constellation lights up to gold'},
  // 10 · Collapse
  {frame: 1980, sfx: 'whoosh', volume: 0.65, note: 'Everything collapses into one gold line'},
  {frame: 2070, sfx: 'bass_drop', volume: 0.9, note: 'Line closes into the logo ring'},
  // 11 · Outro
  {frame: 2100, sfx: 'chime_gold', volume: 0.8, note: 'Logo sheen'},
  {frame: 2160, sfx: 'pop', volume: 0.55, note: 'Outro line: Trade with a plan.'},
  {frame: 2190, sfx: 'pop', volume: 0.5, note: 'Outro line: brand'},
  {frame: 2220, sfx: 'pop', volume: 0.6, note: 'Outro: Telegram button'},
];

/** Soft caption ticks: every 2nd word max, low volume. Generated from caption word timings. */
export const CAPTION_TICK_VOLUME = 0.18;

/** Music: −6dB under the outro hold, 1.5s tail at the end. */
export const MUSIC = {volume: 0.5, duckFrom: 2100, duckDb: -6, tailFrames: 90};
