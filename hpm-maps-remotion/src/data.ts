/**
 * Everything you are likely to change lives in this file:
 * the businesses, the copy, the brand colours, the city look and the timings.
 *
 * Map units are roughly metres. North is -z (the sea is to the north),
 * east is +x. `mapPosition` is snapped to the nearest street intersection,
 * and the route between stops is worked out automatically along the grid.
 */

export type Business = {
  emoji: string;
  name: string;
  category: string;
  /** Street shown in the turn-by-turn banner and on the place card. */
  street: string;
  /** Optional neighbourhood shown after the street on the place card. */
  area?: string;
  /** [x, z] on the stylised map. North (the sea) is negative z. */
  mapPosition: [number, number];
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
    mapPosition: [-180, -150],
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
    mapPosition: [-110, -360],
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
    mapPosition: [110, -300],
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
    mapPosition: [270, -250],
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
    mapPosition: [170, -20],
    rating: {before: 3.5, after: 4.7},
    reviews: {before: 40, after: 470},
    chip: '+260% leads',
  },
];

/** Where the route starts drawing (south of the first stop). */
export const ROUTE_START: [number, number] = [-170, 160];

export const COPY = {
  hook: 'What happens when we run your marketing?',
  /** Words of the hook drawn in brand red. */
  hookHighlight: ['your', 'marketing?'],
  cardCaption: 'Before → After Hot Pepper Media',
  disclaimer: 'Example results',
  finaleLine1: 'Every type of business.',
  finaleLine2: 'One agency.',
  wordmark: 'HOT PEPPER MEDIA',
  cta: "DM us 'MAP' 🌶️",
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
  /** Star colour (brand accents stay red/orange). */
  star: '#FF7A1A',
  starEmpty: '#E7E3DD',
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
  bounds: {minX: -560, maxX: 620, minZ: -470, maxZ: 640},
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

/** Where the camera target sits on screen: the centre of the safe area. */
export const FOCUS_SCREEN = {x: 490, y: 860};
