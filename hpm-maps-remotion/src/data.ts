/**
 * Everything you are likely to change lives in this file:
 * the businesses, the copy, the brand colours, the city look and the timings.
 *
 * Map units are roughly metres. North is -z (the sea is to the north),
 * east is +x. The route is the outline of the pepper from the logo, laid over
 * the city as a curved boulevard: seen from above in the finale, it draws the
 * pepper. Each business sits on it at `along` (0–1 of the way round).
 */

export type Business = {
  emoji: string;
  name: string;
  category: string;
  /** Street shown in the turn-by-turn banner and on the place card. */
  street: string;
  /** Optional neighbourhood shown after the street on the place card. */
  area?: string;
  /**
   * Where the stop sits on the pepper route, 0–1 of the way round, clockwise
   * from the base of the stem (0.1 ≈ the right side, 0.4 ≈ the bottom,
   * 0.55 ≈ the tip, 0.75 ≈ the top edge). Keep them in order and leave the
   * last ~20% (the hump, calyx and stem) for the finale to draw.
   */
  along: number;
  rating: {before: number; after: number};
  reviews: {before: number; after: number};
  /** Extra stat in the red pill chip. */
  chip: string;
};

export const BUSINESSES: Business[] = [
  {
    emoji: '🍽️',
    name: 'Zaatar House',
    category: 'Restaurant',
    street: 'Hamra Street',
    area: 'Hamra',
    along: 0.075,
    rating: {before: 3.6, after: 4.8},
    reviews: {before: 142, after: 1380},
    chip: '+320% reservations',
  },
  {
    emoji: '💪',
    name: 'Cedar Iron Fitness',
    category: 'Gym',
    street: 'Bliss Street',
    area: 'Ras Beirut',
    along: 0.24,
    rating: {before: 3.9, after: 4.9},
    reviews: {before: 88, after: 910},
    chip: '+2.4x memberships',
  },
  {
    emoji: '🦷',
    name: 'Smile Lab Clinic',
    category: 'Dental clinic',
    street: 'Rue Gouraud',
    area: 'Gemmayze',
    along: 0.42,
    rating: {before: 4.0, after: 4.9},
    reviews: {before: 61, after: 640},
    chip: '+180% bookings',
  },
  {
    emoji: '💇',
    name: 'Maison Layla',
    category: 'Hair salon',
    street: 'Armenia Street',
    area: 'Mar Mikhael',
    along: 0.6,
    rating: {before: 3.7, after: 4.8},
    reviews: {before: 95, after: 1120},
    chip: '+5x DMs',
  },
  {
    emoji: '🏠',
    name: 'Sassine Keys Realty',
    category: 'Real estate',
    street: 'Sassine Square',
    area: 'Achrafieh',
    along: 0.77,
    rating: {before: 3.5, after: 4.7},
    reviews: {before: 40, after: 470},
    chip: '+260% leads',
  },
];

/** Where the pepper route sits on the map and how big it is (map units ≈ metres). */
export const PEPPER_ROUTE = {
  center: [40, -150] as [number, number],
  width: 560,
  /** Width of the pepper-shaped boulevard the route drives along. */
  boulevard: 13,
};

export const COPY = {
  hook: 'What happens when we run your marketing?',
  /** Words of the hook drawn in brand red. */
  hookHighlight: ['your', 'marketing?'],
  cardCaption: 'Before → After Hot Pepper Media',
  disclaimer: 'Example results',
  finaleLine1: 'Every type of business.',
  finaleLine2: 'One agency.',
  cta: 'DM US',
};

/**
 * Voiceover: three short lines, voiced by scripts/make-voiceover.py into public/vo/.
 * `at` is the frame each line starts. If you change a line's text, keep LINES in
 * the script in sync and run it again.
 */
export const VOICEOVER = {
  /** Supertonic 3 voice (0–4 female, 5–9 male). */
  voice: 3,
  volume: 1,
  /** Sound effects dip to this level while a line plays. */
  duckTo: 0.45,
  lines: [
    {file: 'start', text: 'Okay... watch this.', at: 18},
    {file: 'middle', text: 'And another one!', at: 684},
    {file: 'end', text: 'Your turn.', at: 1380},
  ],
};

export const BRAND = {
  red: '#E63922',
  orange: '#FF7A1A',
  glow: '#FF4D2E',
  ink: '#1D1A17',
  inkSoft: '#6E6A64',
  inkFaint: '#A19C94',
  white: '#FFFFFF',
  navGreen: '#1E6B45',
  navGreenLight: '#2C8A5C',
};

/**
 * Place-card colours: near-black numbers and name, charcoal and grey supporting
 * text, gold stars and growth bar. Brand red stays an accent: the stat chip and
 * the small up-arrows.
 */
export const CARD_COLORS = {
  heading: '#111111',
  text: '#333333',
  meta: '#777777',
  star: '#F5B800',
  starLight: '#FFC107',
  starEmpty: '#E6E6E6',
};

export const CITY_COLORS = {
  ground: '#F4F2EE',
  road: '#FBFAF8',
  roadEdge: '#E1DDD6',
  park: '#E2F1E6',
  water: '#BFE3F2',
  waterEdge: '#D6EEF7',
  buildings: ['#FFFFFF', '#FBFBFA', '#F6F6F4', '#F0F0EE', '#EBEBE9'],
  window: '#E2E6EA',
  treeLight: '#9FD8B0',
  treeDark: '#7CC79A',
  trunk: '#CFC5B8',
  /** Soft red frame on the roof edge of each featured business. */
  roofHighlight: '#EE6A52',
  sun: '#FFF3E2',
  sky: '#FFFFFF',
  hemiGround: '#E8E2D8',
};

export const CITY = {
  /** Change the seed for a different (but still deterministic) city. */
  seed: 20251027,
  bounds: {minX: -620, maxX: 780, minZ: -470, maxZ: 900},
  floorHeight: 3.2,
  maxFloors: 12,
};

/**
 * Timings in frames at 60fps. A stop is a 180-frame block: 60 frames of travel
 * into it, then 120 frames of dwell (push-in, orbit, place card).
 */
export const TIMING = {
  fps: 60,
  durationInFrames: 1500,
  /** Hook: pin drop + headline. */
  hookEnd: 120,
  /** Camera dive starts at hookEnd and lands in the chase view here. */
  diveEnd: 280,
  /** The route head leaves the start point. */
  routeStart: 190,
  /** Arrival frame of the first stop; later stops follow every stopSpacing. */
  firstArrival: 300,
  stopSpacing: 180,
  /** Frames of travel between two stops (the rest of the block is dwell). */
  travel: 60,
  finaleStart: 1140,
  /** Camera reaches the top-down view. */
  finaleSettled: 1265,
  /** The route head closes the pepper outline (then the route pulses once). */
  routeComplete: 1282,
  /** First of the finale pins pops. */
  finalePinsStart: 1200,
  endCardStart: 1320,
  /** Frame exported as the PNG cover. */
  coverFrame: 1305,
};

export const arrivalFrame = (i: number) => TIMING.firstArrival + i * TIMING.stopSpacing;
export const departFrame = (i: number) =>
  i === BUSINESSES.length - 1 ? TIMING.finaleStart : arrivalFrame(i + 1) - TIMING.travel;
export const travelStartFrame = (i: number) =>
  i === 0 ? TIMING.routeStart : arrivalFrame(i) - TIMING.travel;

/** Instagram Reels UI covers these edges. Keep text and cards out of them. */
export const SAFE = {top: 220, bottom: 400, right: 140, left: 60};

/**
 * Text and cards sit in one centred column, with equal margins that also keep
 * them clear of Instagram's buttons on the right.
 */
export const COLUMN = {x: SAFE.right, width: 1080 - 2 * SAFE.right};

/** Where the camera target sits on screen: centred, between the nav banner and the place card. */
export const FOCUS_SCREEN = {x: 540, y: 760};
