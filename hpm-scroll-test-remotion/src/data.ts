/**
 * Everything you are likely to change lives in this file:
 * the copy, the feed posts, the hero post, the brand colours, the timings and the shots.
 *
 * Timings are frames at 60fps (1500 frames = 25s). Every animation, camera move,
 * scroll position and sound cue is derived from these numbers, so retiming a beat
 * here moves its visuals and its sound together.
 */

export const FPS = 60;
export const DURATION = 1500;

/** Brand colours. Red/orange/glow are accents only. */
export const BRAND = {
  red: '#E63922',
  orange: '#FF7A1A',
  glow: '#FF4D2E',
  offWhite: '#F4F2EE',
  charcoal: '#1A1614',
  ink: '#111111',
  text: '#333333',
  meta: '#777777',
};

/* ------------------------------------------------------------------ copy */

export const COPY = {
  /** One word per beat while the feed races past. */
  scrollWords: ['Scroll.', 'Scroll.', 'Scroll.'],
  stop: '…wait.',
  contrast1: 'Bland gets scrolled.',
  contrast2: 'Bold gets stopped.',
  endLine1: 'Want posts that',
  endLine2: 'stop thumbs?',
  cta: 'DM US',
};

/**
 * The three breakdown callouts, in order. Each points at a part of the hero post:
 * 1 the headline, 2 the neon visual, 3 the promise pill (positions: HERO_LAYOUT in src/three/feedTextures.ts).
 */
export const CALLOUTS = [
  {
    title: 'Hook in the first second',
    body: 'Huge, bold words that land before the thumb can move on.',
  },
  {
    title: 'Pattern break',
    body: 'Colour and contrast nothing else in the feed has.',
  },
  {
    title: 'A reason to stay',
    body: 'A clear promise of a payoff, so they swipe instead of scroll.',
  },
];

/* ------------------------------------------------------------- the feed */

/** The generic, forgettable posts (all fictional). `scene` picks the grey stock-photo-like image. */
export type BlandPost = {handle: string; initials: string; caption: string; likes: string; scene: number};

export const BLAND_POSTS: BlandPost[] = [
  {handle: 'urban.goods.co', initials: 'UG', caption: 'Happy Monday! ☕', likes: '23 likes', scene: 0},
  {handle: 'the.daily.shop', initials: 'DS', caption: 'New arrivals ✨', likes: '41 likes', scene: 1},
  {handle: 'bestbites_official', initials: 'BB', caption: 'Link in bio', likes: '12 likes', scene: 2},
  {handle: 'corner.studio', initials: 'CS', caption: "We're open!", likes: '9 likes', scene: 3},
  {handle: 'prime.home.store', initials: 'PH', caption: 'Throwback Thursday 📸', likes: '17 likes', scene: 4},
  {handle: 'glow.salon.city', initials: 'GS', caption: 'Weekend vibes', likes: '30 likes', scene: 5},
  {handle: 'metro.fitness.hub', initials: 'MF', caption: 'Big news coming soon 👀', likes: '8 likes', scene: 6},
  {handle: 'northside.deli', initials: 'ND', caption: 'Thank you for 1k! 🙏', likes: '26 likes', scene: 7},
];

/** The hero post, made by Hot Pepper Media for a fictional client. */
export const HERO_POST = {
  handle: 'zaatar.house',
  initials: 'ZH',
  subtitle: 'Made with Hot Pepper Media',
  /** Headline lines: the first group in white, the second in the orange→red gradient. */
  headlineWhite: ['WE ALMOST', 'CLOSED.'],
  headlineHot: ['THEN THIS', 'HAPPENED.'],
  /** The neon sign. */
  neon: 'OPEN',
  neonSub: 'LATE',
  /** The promise (the reason to stay). */
  promise: 'Swipe for the 3 changes that saved us',
  likes: '48,210 likes',
  caption: 'Six months ago we nearly shut the doors. Here’s what changed 🔥',
  comments: 'View all 1,906 comments',
};

/** Colours of the generic feed app (fictional, unbranded). */
export const FEED_COLORS = {
  bg: '#FFFFFF',
  ink: '#262626',
  meta: '#8E8E8E',
  line: '#EFEFEF',
  /** Hero post colours. */
  heroBg: '#161210',
  heroBg2: '#2A1A14',
};

/* ------------------------------------------------------------- timeline */

export const T = {
  /** THE SCROLL: frames each "Scroll." word lands. */
  scrollWordAt: [-6, 152, 254],
  /** The brake starts on this frame (the hero has just entered the screen). */
  brake: 366,
  /** "…wait." lands. */
  waitAt: 384,
  /** THE BREAKDOWN: each callout pops on this frame. */
  calloutAt: [474, 680, 888],
  /** How long each callout stays (frames). */
  calloutHold: 168,
  /** THE CONTRAST. */
  pullBack: 1080,
  heroLift: 1104,
  feedResume: 1122,
  contrast1At: 1112,
  contrast2At: 1180,
  /** END CARD. */
  endStart: 1260,
  phoneOff: 1262,
  logoAt: 1300,
  endLineAt: 1338,
  ctaAt: 1382,
  /** Hold the last second. */
  holdFrom: 1440,
  /** Frame used for the cover PNG (the stop's hold, hero framed and "…wait." up). */
  coverFrame: 430,
};

/* ------------------------------------------------------------ the scroll */

export const SCROLL = {
  /** Feed speed (screen px per frame) at the start and just before the stop. Rises = the scroll speeds up. */
  speedFrom: 150,
  speedTo: 270,
  /** Frames of the thumb flicks during THE SCROLL (they get closer together = speeding up). */
  flicks: [-14, 14, 40, 64, 86, 106, 124, 141, 157, 172, 186, 199, 211, 223, 234, 245, 256, 266, 276, 286, 296, 305, 314, 323, 332, 341, 350, 358],
  /** The brake: a damped spring (angular frequency per frame and damping ratio). */
  brakeOmega: 0.42,
  brakeDamping: 0.6,
  /** How far past the resting place the hero overshoots (screen px) before settling. */
  overshoot: 140,
  /** Feed speed when it resumes in THE CONTRAST. */
  resumeSpeed: 240,
};

/* ----------------------------------------------------------------- shots */

/**
 * The camera, as orbit keyframes around a focus point on the phone.
 *  - focus: a point on the screen in screen px (0–1024 × 0–2224), or 'center' (the phone's centre).
 *  - yaw/pitch (degrees): where the camera sits around the focus (yaw 0 = straight in front,
 *    positive = to the phone's right; pitch positive = above, looking down).
 *  - dist: distance to the focus (phone units; the phone is 1.6 tall). fov: vertical, degrees.
 *  - roll: camera roll (degrees). frameY: where the focus lands on the 1920px frame.
 *  - phone: the phone's own pose (yaw/tilt/roll in degrees, y = height of its centre above the floor).
 * Each shot moves from `from` to `to` with `ease`. A shot whose `whipIn` is set starts with a fast
 * whip from the previous shot's end instead of a hard cut.
 */
export type CamKey = {
  focus: [number, number] | 'center';
  yaw: number;
  pitch: number;
  dist: number;
  fov: number;
  roll: number;
  frameY: number;
};
export type PhonePose = {yaw: number; tilt: number; roll: number; y: number; x: number};
export type Shot = {
  name: string;
  start: number;
  end: number;
  from: CamKey;
  to: CamKey;
  /** 'inOut' (cubic), 'out' (fast then settles: a speed ramp), 'in', 'inOutQuint'. */
  ease: 'inOut' | 'out' | 'in' | 'inOutQuint' | 'outQuint';
  phoneFrom: PhonePose;
  phoneTo: PhonePose;
  /** Frames of whip from the previous shot (0 = hard cut). */
  whipIn?: number;
};

const C = 'center' as const;

export const SHOTS: Shot[] = [
  {
    name: '1 wide hero',
    start: 0,
    end: 152,
    from: {focus: C, yaw: -30, pitch: 5, dist: 5.6, fov: 30, roll: -5, frameY: 1040},
    to: {focus: C, yaw: -14, pitch: 10, dist: 5.1, fov: 30, roll: 2, frameY: 1030},
    ease: 'inOut',
    phoneFrom: {yaw: 14, tilt: 6, roll: -4, y: 1.2, x: 0},
    phoneTo: {yaw: 8, tilt: 8, roll: -1, y: 1.25, x: 0},
  },
  {
    name: '2 macro on the screen',
    start: 152,
    end: 254,
    from: {focus: [360, 560], yaw: 34, pitch: 14, dist: 1.75, fov: 32, roll: 10, frameY: 1560},
    to: {focus: [380, 620], yaw: 26, pitch: 10, dist: 1.45, fov: 32, roll: 6, frameY: 1540},
    ease: 'out',
    phoneFrom: {yaw: -6, tilt: 4, roll: -2, y: 1.2, x: 0},
    phoneTo: {yaw: -4, tilt: 4, roll: -1, y: 1.2, x: 0},
  },
  {
    name: '3 overhead',
    start: 254,
    end: 342,
    from: {focus: C, yaw: -8, pitch: 76, dist: 5.2, fov: 30, roll: 16, frameY: 1060},
    to: {focus: C, yaw: 6, pitch: 70, dist: 4.6, fov: 30, roll: 8, frameY: 1050},
    ease: 'inOut',
    phoneFrom: {yaw: 0, tilt: 84, roll: 22, y: 0.5, x: 0},
    phoneTo: {yaw: 0, tilt: 82, roll: 16, y: 0.55, x: 0},
  },
  {
    name: '4 push-in to the stop',
    start: 342,
    end: 452,
    from: {focus: C, yaw: 9, pitch: 4, dist: 7.6, fov: 30, roll: 1.5, frameY: 1040},
    to: {focus: C, yaw: 2, pitch: 2, dist: 5.5, fov: 30, roll: 0, frameY: 1040},
    ease: 'out',
    phoneFrom: {yaw: -3, tilt: 2, roll: 0, y: 1.35, x: 0},
    phoneTo: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
  },
  {
    name: '5 low 3/4 (callout 1: the hook)',
    start: 452,
    end: 660,
    from: {focus: [512, 760], yaw: -34, pitch: -15, dist: 2.25, fov: 30, roll: -3, frameY: 760},
    to: {focus: [512, 740], yaw: -26, pitch: -12, dist: 1.95, fov: 30, roll: -1, frameY: 740},
    ease: 'out',
    phoneFrom: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
    phoneTo: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
  },
  {
    name: '6 high 3/4 (callout 2: pattern break)',
    start: 660,
    end: 868,
    whipIn: 16,
    from: {focus: [512, 1300], yaw: 36, pitch: 22, dist: 2.15, fov: 30, roll: 4, frameY: 760},
    to: {focus: [512, 1300], yaw: 28, pitch: 18, dist: 1.9, fov: 30, roll: 2, frameY: 770},
    ease: 'out',
    phoneFrom: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
    phoneTo: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
  },
  {
    name: '7 macro side (callout 3: a reason to stay)',
    start: 868,
    end: 1080,
    whipIn: 16,
    from: {focus: [512, 1640], yaw: -20, pitch: 4, dist: 1.45, fov: 30, roll: -7, frameY: 780},
    to: {focus: [512, 1620], yaw: -12, pitch: 2, dist: 1.3, fov: 30, roll: -4, frameY: 790},
    ease: 'out',
    phoneFrom: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
    phoneTo: {yaw: 0, tilt: 2, roll: 0, y: 1.35, x: 0},
  },
  {
    name: '8 pull-back wide (the contrast)',
    start: 1080,
    end: 1262,
    whipIn: 30,
    from: {focus: C, yaw: 4, pitch: 5, dist: 5.3, fov: 30, roll: 0, frameY: 1060},
    to: {focus: C, yaw: 12, pitch: 8, dist: 5.8, fov: 30, roll: 2, frameY: 1060},
    ease: 'out',
    phoneFrom: {yaw: -2, tilt: 3, roll: 0, y: 1.35, x: 0},
    phoneTo: {yaw: -8, tilt: 5, roll: -2, y: 1.4, x: 0},
  },
  {
    name: '9 end card',
    start: 1262,
    end: 1500,
    from: {focus: C, yaw: 12, pitch: 8, dist: 5.8, fov: 30, roll: 2, frameY: 1060},
    to: {focus: C, yaw: 15, pitch: 9, dist: 5.6, fov: 30, roll: 2.5, frameY: 1060},
    ease: 'inOut',
    phoneFrom: {yaw: -8, tilt: 5, roll: -2, y: 1.4, x: 0},
    phoneTo: {yaw: -8, tilt: 5, roll: -2, y: 1.4, x: 0},
  },
];

/* --------------------------------------------------------------- layout */

/** Instagram covers the top 220px, the bottom 400px and the right 140px. */
export const SAFE = {top: 220, bottom: 400, right: 140};
/** One centred column with equal 140px margins, clear of Instagram's buttons. */
export const COLUMN = {x: 140, width: 800};

/* ------------------------------------------------------------- the look */

export const LOOK = {
  /** Shutter as a fraction of a frame (0.5 = 180°). */
  shutter: 0.5,
  /** Film grain (opacity of the grain layer, 0–1) and vignette strength (0–1). */
  grain: 0.16,
  vignette: 0.14,
};
