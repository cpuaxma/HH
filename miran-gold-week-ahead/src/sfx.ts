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
  // 4 · Wednesday: inflation thermometer
  {frame: 480, sfx: 'swish_short', volume: 0.6, note: 'Wednesday card in'},
  {frame: 515, sfx: 'riser_1s', volume: 0.45, note: 'Thermometer column rises'},
  {frame: 520, sfx: 'counter_roll', volume: 0.4, note: 'Value counts to the latest reading', durationInFrames: 70},
  {frame: 590, sfx: 'pop', volume: 0.65, note: 'Latest reading lands'},
  {frame: 612, sfx: 'impact_soft', volume: 0.7, note: '"Above target" chip, column glows red'},
  {frame: 676, sfx: 'whoosh', volume: 0.45, note: 'Swap to next month "?"'},
  {frame: 700, sfx: 'tick', volume: 0.4, note: 'Column wobbles (unknown)'},
  {frame: 730, sfx: 'tick', volume: 0.4, note: 'Column wobbles (unknown)'},
  {frame: 750, sfx: 'click_ui', volume: 0.6, note: 'GDP chip'},
  // 5 · Seesaw
  {frame: 860, sfx: 'tick', volume: 0.5, note: 'Inflation chip (up)'},
  {frame: 890, sfx: 'tick', volume: 0.5, note: 'Rates chip (up)'},
  {frame: 930, sfx: 'whoosh', volume: 0.45, note: 'Seesaw tips: dollar up, gold down'},
  {frame: 950, sfx: 'impact_soft', volume: 0.75, note: 'Seesaw lands: pressure on gold'},
  {frame: 1020, sfx: 'whoosh', volume: 0.55, note: 'Chips flip to "lower inflation"'},
  {frame: 1030, sfx: 'tick', volume: 0.5, note: 'Inflation chip (down)'},
  {frame: 1048, sfx: 'tick', volume: 0.5, note: 'Rates chip (down)'},
  {frame: 1068, sfx: 'impact_soft', volume: 0.75, note: 'Seesaw lands: support for gold'},
  // 6 · 02
  {frame: 1140, sfx: 'whoosh', volume: 0.6, note: 'Whip-pan into chapter 02'},
  {frame: 1170, sfx: 'impact_soft', volume: 0.85, note: 'Chapter numeral 02'},
  {frame: 1200, sfx: 'click_ui', volume: 0.6, note: 'Thursday active'},
  // 7 · Holiday
  {frame: 1290, sfx: 'paper', volume: 0.8, note: '"US holiday" stamp on Thursday'},
  {frame: 1372, sfx: 'swish_short', volume: 0.55, note: 'Friday tile in, clock half-fills'},
  {frame: 1380, sfx: 'whoosh', volume: 0.35, note: 'Strip highlight slides to Friday'},
  {frame: 1400, sfx: 'click_ui', volume: 0.6, note: '"Early close" chip'},
  {frame: 1436, sfx: 'whoosh', volume: 0.5, note: 'Tiles out, liquidity tank in'},
  {frame: 1465, sfx: 'riser_1s', volume: 0.45, note: 'Tank drains'},
  {frame: 1522, sfx: 'impact_soft', volume: 0.65, note: 'Tank low → price line starts'},
  {frame: 1560, sfx: 'tick', volume: 0.45, note: 'Price line jumps'},
  {frame: 1590, sfx: 'tick', volume: 0.45, note: 'Price line jumps'},
  // 8 · 03
  {frame: 1620, sfx: 'whoosh', volume: 0.6, note: 'Whip-pan into chapter 03'},
  {frame: 1650, sfx: 'impact_soft', volume: 0.85, note: 'Chapter numeral 03'},
  {frame: 1680, sfx: 'whoosh', volume: 0.4, note: 'Strip peeks at the following week'},
  // 9 · Jobs report
  {frame: 1740, sfx: 'swish_short', volume: 0.6, note: 'Jobs report card in'},
  {frame: 1770, sfx: 'whoosh', volume: 0.4, note: 'Seesaw in, starts wobbling'},
  {frame: 1815, sfx: 'pop', volume: 0.7, note: 'Big "?" over the seesaw'},
  {frame: 1890, sfx: 'chime_gold', volume: 0.55, note: '"?" glows: gold waits'},
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
