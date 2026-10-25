import {beat, FPS, SLAM} from './theme';

// Single source of truth for timing. Scenes, the SFX cue sheet (scripts/sfx-cues.ts) and the
// timeline checks (scripts/check-timeline.ts) all read from here.

export const SECTIONS = {
  hook: [0, beat(8)],
  bio: [beat(8), beat(23)],
  grid: [beat(23), beat(38)],
  reel: [beat(38), beat(52)],
  result: [beat(52), beat(67)],
  cta: [beat(67), beat(82)],
} as const;

// Pacing: each headline line still slams on a beat, but every idea gets room to land.
// Problem (headline) → fix (action) → result held ~1.5 s, before the next whip.
export const T = {
  // 1 · HOOK
  hookSlams: [beat(0), beat(1), beat(2)],
  hookLand: beat(1),
  hookExit: beat(5) - SLAM.exitFrames,
  scribble: beat(5),
  stamp: beat(6),
  stampExit: beat(8) - 10,
  chipIn: beat(6),
  diveStart: beat(8) - 20,
  dive: beat(8), // cut 3D -> flat

  // 2 · BIO
  bioWhipEnd: beat(8) + 20,
  bioLabel: beat(9),
  bioSlams: [beat(10), beat(11)],
  bioStrike: beat(12),
  bioExit: beat(14) - SLAM.exitFrames,
  bioCard: beat(14),
  bioType: [
    {text: 'Slow coffee for busy mornings ', from: beat(14) + 4, to: beat(16) - 4},
    {text: '☕', from: beat(16), to: beat(16)},
    {text: ' · Open 7am–7pm', from: beat(17), to: beat(18) - 6},
    {text: ' · Order ahead ↓', from: beat(18), to: beat(18) + 24},
  ],
  bioCheck: beat(19),
  bioMicro: beat(20),
  bioContext: beat(21),
  bioWander: beat(22),

  // 3 · GRID
  gridWhip: [beat(23) - 16, beat(23)],
  gridLabel: beat(24),
  gridSlams: [beat(25), beat(26)],
  gridMarks: [beat(27), beat(28), beat(29)],
  gridExit: beat(29) - SLAM.exitFrames,
  scatter: beat(30),
  snap: beat(32),
  swatches: beat(33),
  fontChip: beat(34),
  gridCheck: beat(35),
  zoomThrough: [beat(37), beat(38)],

  // 4 · HOOK (reel)
  reelLabel: beat(39),
  freeze: beat(40),
  countdown: [beat(41), beat(42), beat(43)],
  ringClose: beat(44),
  reelExit: beat(45) - SLAM.exitFrames,
  colorSnap: beat(45),
  underline: beat(46),
  hearts: beat(47),
  scrollChip: beat(48),
  reelWander: beat(49),
  reelShrink: [beat(50), beat(50) + 18],
  pullOut: beat(52), // cut flat -> 3D

  // 5 · BEFORE / AFTER
  landBack: beat(52) + 30,
  spin: [beat(53) + 10, beat(55)],
  swap: beat(54) + 5,
  odometer: [beat(55), beat(55) + 80],
  resultSlams: [beat(57), beat(58)],
  split: [beat(61), beat(61) + 30],
  statExit: beat(61),
  resultExit: beat(61) - SLAM.exitFrames,
  tags: beat(62),
  recap: beat(64),
  ctaLine: beat(66) + 15,

  // 6 · CTA
  flood: [beat(67), beat(67) + 15],
  logo: beat(68),
  ctaSlams: [beat(69), beat(70)],
  dm: beat(72),
  dmType: [beat(72) + 8, beat(73) + 20],
  dmSend: beat(74),
  arrow: beat(75),
  pill: beat(76),
  pulse: beat(78),
};

// Punch-zooms (whole frame 1 → 1.08 in 4 frames, settle over 12). All on the beat grid.
export const PUNCHES = [
  T.hookLand,
  T.stamp,
  T.dive,
  T.bioStrike,
  T.bioCheck,
  T.gridWhip[1],
  ...T.gridMarks,
  T.snap,
  T.zoomThrough[1],
  T.colorSnap,
  T.pullOut,
  T.spin[1],
  T.tags,
  T.flood[0],
  T.logo,
  T.pill,
];

// Impact shakes: [frame, px]. Slams shake as they land (6 frames after they start).
const slamLand = (f: number) => f + SLAM.frames - 1;
export const SHAKES: [number, number][] = [
  ...[...T.hookSlams, ...T.bioSlams, ...T.gridSlams, ...T.countdown, ...T.resultSlams, ...T.ctaSlams].map(
    (f) => [slamLand(f), SLAM.shakePx] as [number, number],
  ),
  [T.hookLand, 5],
  [T.stamp + 4, 7],
  ...T.gridMarks.map((f) => [f + 2, 4] as [number, number]),
  [T.snap, 4],
  [T.freeze, 4],
  [T.colorSnap + 4, 5],
  [T.spin[1], 4],
  [T.logo + 4, 5],
];

// Windows where the stage (3D phone / flat profile) moves fast enough to need motion blur.
export const STAGE_BLUR: [number, number][] = [
  [0, 36],
  [T.diveStart, T.bioWhipEnd + 4],
  [T.gridWhip[0] - 2, T.gridWhip[1] + 12],
  [T.scatter, T.scatter + 18],
  [T.snap - 16, T.snap + 4],
  [T.zoomThrough[0], T.zoomThrough[1] + 4],
  [T.reelShrink[0], T.landBack + 2],
  [T.spin[0], T.spin[1] + 4],
  [T.split[0], T.split[0] + 22],
];

// Every slam/exit gets blur on the text layer for its 6-frame move.
export const TEXT_SLAMS = [
  ...T.hookSlams,
  ...T.bioSlams,
  ...T.gridSlams,
  ...T.countdown,
  T.colorSnap,
  ...T.resultSlams,
];
export const TEXT_EXITS = [T.hookExit, T.bioExit, T.gridExit, T.reelExit, T.resultExit, T.stampExit];
export const TEXT_BLUR: [number, number][] = [
  ...TEXT_SLAMS.map((f) => [f, f + SLAM.frames + 1] as [number, number]),
  ...TEXT_EXITS.map((f) => [f, f + SLAM.exitFrames + 1] as [number, number]),
  [T.stamp, T.stamp + 7],
];
export const CTA_BLUR: [number, number][] = [
  [T.flood[0], T.flood[1] + 1],
  ...[T.logo, ...T.ctaSlams].map((f) => [f, f + SLAM.frames + 1] as [number, number]),
];

export const inWindow = (frame: number, windows: [number, number][]) =>
  windows.some(([a, b]) => frame >= a && frame < b);

// ── SFX cue sheet ────────────────────────────────────────────────────────────
export type SfxKind = 'whoosh' | 'impact' | 'stamp hit' | 'pop' | 'typing' | 'riser' | 'tick' | 'swipe' | 'ding' | 'scribble' | 'freeze' | 'odometer';
export type Cue = {frame: number; end?: number; kind: SfxKind; note: string};

export const SFX: Cue[] = [
  {frame: 0, kind: 'whoosh', note: 'phone spins in (already moving on frame 0)'},
  {frame: T.hookSlams[0], kind: 'impact', note: 'slam "this café"'},
  {frame: T.hookLand, kind: 'impact', note: 'phone lands + slam "is losing" (punch-zoom)'},
  {frame: T.hookSlams[2], kind: 'impact', note: 'slam "customers."'},
  {frame: T.scribble, kind: 'scribble', note: 'red circle draws around the phone'},
  {frame: T.hookExit, kind: 'whoosh', note: 'headline whips out'},
  {frame: T.stamp, kind: 'stamp hit', note: '"3 FIXES" stamp (punch-zoom)'},
  {frame: T.chipIn + 2, kind: 'pop', note: '0/3 counter chip'},
  {frame: T.diveStart - 4, end: T.dive, kind: 'riser', note: 'dive into the screen'},
  {frame: T.dive - 4, kind: 'whoosh', note: 'zoom-through into the glass'},
  {frame: T.dive, kind: 'impact', note: 'cut to flat profile (punch-zoom)'},
  {frame: T.bioLabel, kind: 'pop', note: 'chip 1/3 + "FIX 01 · BIO"'},
  {frame: T.bioSlams[0], kind: 'impact', note: 'slam "your bio"'},
  {frame: T.bioSlams[1], kind: 'impact', note: 'slam "says nothing."'},
  {frame: T.bioStrike, kind: 'swipe', note: 'red strike-through on old bio (punch-zoom)'},
  {frame: T.bioExit, kind: 'whoosh', note: 'headline whips out'},
  {frame: T.bioCard, kind: 'whoosh', note: 'cream card slides over the old bio'},
  {frame: T.bioType[0].from, end: T.bioType[3].to, kind: 'typing', note: 'new bio types on'},
  {frame: T.bioType[1].from, kind: 'pop', note: '☕ pops'},
  {frame: T.bioType[2].from, kind: 'pop', note: '"Open 7am–7pm"'},
  {frame: T.bioType[3].from, kind: 'pop', note: '"Order ahead ↓"'},
  {frame: T.bioCheck, kind: 'ding', note: 'red check pops (punch-zoom)'},
  {frame: T.bioMicro, kind: 'pop', note: '"who it\'s for + why come in" + underline'},
  {frame: T.bioContext, kind: 'pop', note: 'pull back, chip fills red'},
  {frame: T.bioWander, end: T.gridWhip[0], kind: 'riser', note: 'red line streaks across'},
  {frame: T.gridWhip[0], kind: 'whoosh', note: 'whip-pan down to the grid'},
  {frame: T.gridWhip[1], kind: 'impact', note: 'grid lands (punch-zoom)'},
  {frame: T.gridLabel, kind: 'pop', note: 'chip 2/3 + "FIX 02 · GRID"'},
  {frame: T.gridSlams[0], kind: 'impact', note: 'slam "zero"'},
  {frame: T.gridSlams[1], kind: 'impact', note: 'slam "brand."'},
  ...T.gridMarks.map((f, i) => ({frame: f, kind: 'impact' as const, note: `red ✗ on tile ${i + 1} (punch-zoom)`})),
  {frame: T.gridExit, kind: 'whoosh', note: 'headline whips out'},
  {frame: T.scatter, kind: 'whoosh', note: 'tiles explode outward in 3D'},
  {frame: T.scatter + 30, kind: 'whoosh', note: 'tiles flip edge-on to the new design mid-air'},
  {frame: T.snap - 14, kind: 'whoosh', note: 'tiles fly back (reverse whoosh)'},
  {frame: T.snap, kind: 'impact', note: 'tiles snap into the new grid + colour burst (punch-zoom)'},
  {frame: T.swatches, kind: 'pop', note: 'palette swatch 1'},
  {frame: T.swatches + 6, kind: 'pop', note: 'palette swatch 2'},
  {frame: T.fontChip, kind: 'pop', note: '"1 font" chip'},
  {frame: T.gridCheck, kind: 'ding', note: 'grid check'},
  {frame: T.gridCheck + 30, end: T.zoomThrough[1], kind: 'riser', note: 'push into the reel tile'},
  {frame: T.zoomThrough[1] - 4, kind: 'whoosh', note: 'zoom-through into the reel'},
  {frame: T.zoomThrough[1], kind: 'impact', note: 'reel full screen (punch-zoom)'},
  {frame: T.reelLabel, kind: 'pop', note: 'chip 3/3 + "FIX 03 · HOOK"'},
  {frame: T.freeze, kind: 'freeze', note: 'freeze + desaturate (record-scratch / tape stop)'},
  ...T.countdown.map((f, i) => ({frame: f, kind: 'tick' as const, note: `countdown ${3 - i} + slam`})),
  {frame: T.ringClose, end: T.colorSnap, kind: 'riser', note: 'ring closes'},
  {frame: T.reelExit, kind: 'whoosh', note: 'headline whips out'},
  {frame: T.colorSnap, kind: 'impact', note: 'full color + caption slam (punch-zoom)'},
  {frame: T.underline, kind: 'swipe', note: 'red underline under caption'},
  {frame: T.hearts, kind: 'pop', note: 'hearts burst'},
  {frame: T.scrollChip, kind: 'pop', note: '"stops the scroll" chip'},
  {frame: T.reelWander, end: T.pullOut, kind: 'riser', note: 'pull back out'},
  {frame: T.reelShrink[0], kind: 'whoosh', note: 'reel shrinks back into its grid tile'},
  {frame: T.pullOut - 6, kind: 'whoosh', note: 'flat -> 3D pull-out'},
  {frame: T.pullOut, kind: 'impact', note: 'back on the 3D phone (punch-zoom)'},
  {frame: T.spin[0], kind: 'whoosh', note: '360° spin, screen swaps to AFTER mid-spin'},
  {frame: T.spin[1], kind: 'impact', note: 'phone lands on the AFTER profile + colour burst (punch-zoom)'},
  {frame: T.odometer[0], end: T.odometer[1], kind: 'odometer', note: 'followers 212 -> 12.4K (ticking)'},
  {frame: T.resultSlams[0], kind: 'impact', note: 'slam "same café."'},
  {frame: T.resultSlams[1], kind: 'impact', note: 'slam "now it sells."'},
  {frame: T.split[0], kind: 'whoosh', note: 'BEFORE phone slides in'},
  {frame: T.resultExit, kind: 'whoosh', note: 'headline whips out'},
  {frame: T.tags, kind: 'pop', note: 'BEFORE / AFTER tags + red arrow (punch-zoom)'},
  {frame: T.recap, kind: 'pop', note: 'bio ✓ grid ✓ hook ✓ chips'},
  {frame: T.recap, end: T.flood[0], kind: 'riser', note: 'into the CTA'},
  {frame: T.ctaLine, kind: 'swipe', note: 'red line enters across the phones'},
  {frame: T.flood[0], kind: 'whoosh', note: 'red line sweeps and floods the frame'},
  {frame: T.flood[1], kind: 'impact', note: 'frame fully red'},
  {frame: T.logo, kind: 'stamp hit', note: 'logo slams in (punch-zoom)'},
  {frame: T.ctaSlams[0], kind: 'impact', note: 'slam "want us to"'},
  {frame: T.ctaSlams[1], kind: 'impact', note: 'slam "audit yours?"'},
  {frame: T.dm, kind: 'whoosh', note: 'DM bubble slides up'},
  {frame: T.dmType[0], end: T.dmType[1], kind: 'typing', note: 'types "free call? 🌶️"'},
  {frame: T.dmSend, kind: 'whoosh', note: 'message sends (paper plane flies off) + "Sent" pop'},
  {frame: T.arrow, kind: 'swipe', note: 'cream arrow draws toward the share / DM button'},
  {frame: T.pill, kind: 'pop', note: '"Hit us a DM / get a free call" pill (punch-zoom)'},
  {frame: T.pulse, kind: 'pop', note: 'pill pulses on each beat to the end (soft)'},
];

export const seconds = (frame: number) => frame / FPS;
