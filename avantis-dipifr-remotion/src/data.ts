/**
 * Everything you are likely to change lives in this file: the copy, the course
 * modules and format, the benefits, the finance hubs on the globe, the colours
 * and the timings.
 *
 * Text marked "PLACEHOLDER" stands in for details that weren't given in the
 * brief. Replace it with your own before publishing.
 */
import {LOGO_COLORS} from './lib/logoTrace';

// ─── Copy ────────────────────────────────────────────────────────────────────

export const COPY = {
  /** 0–3s, built word by word under the globe. */
  hook: 'One certificate. Recognised worldwide.',
  /** Hook words drawn in navy (match them exactly, punctuation included). */
  hookHighlight: ['worldwide.'],

  /** 3–9s, above the globe while the routes draw. */
  globalEyebrow: 'ACCA · DipIFR',
  globalTitle: 'Diploma in International Financial Reporting',

  /** The small tag that pops at each finance hub. */
  hubTag: 'IFRS',

  /** 9–21s, the banner over the course journey. */
  courseEyebrow: 'Our DipIFR course',

  /** 21–26s. */
  benefitsEyebrow: 'For accountants, auditors & finance professionals', // PLACEHOLDER: your audience
  benefitsTitle: 'Why DipIFR?',

  /** 26–30s, the end card. The tagline is part of the traced logo. */
  launch: 'DipIFR course — coming soon', // PLACEHOLDER: or "starts 12 January"
  cta: 'DM us to register', // PLACEHOLDER: "Link in bio", a website or a WhatsApp number
};

/**
 * Course modules: one stop (and one card) each on the journey. The journey runs
 * back along the route from the last hub, so module 1 stops at the second-to-last
 * hub, module 2 at the one before, and so on: HUBS needs one more entry than
 * MODULES. To add a module, add a hub too (and adjust TIMING.stopSpacing).
 *
 * PLACEHOLDER: these follow the four main areas of the ACCA DipIFR syllabus.
 * Replace them with your course's own modules.
 */
export const MODULES = [
  {
    title: 'The IFRS Framework',
    learn: 'How IFRS standards are set and the Conceptual Framework behind them.',
  },
  {
    title: 'Elements of Financial Statements',
    learn: 'Recognise and measure assets, liabilities, income and expenses under IFRS.',
  },
  {
    title: 'Presentation & Disclosure',
    learn: 'Present financial statements and disclosures the way IFRS requires.',
  },
  {
    title: 'Group Financial Statements',
    learn: 'Consolidate subsidiaries and account for associates and joint arrangements.',
  },
];

/** Course format, shown as chips in the banner over the journey. PLACEHOLDER. */
export const COURSE_FORMAT = ['Live online sessions', 'Recorded lectures', 'Mock exams'];

export type BenefitIcon = 'globe' | 'award' | 'briefcase' | 'chart' | 'book';

/** 21–26s: three quick cards. */
export const BENEFITS: {icon: BenefitIcon; title: string; text: string}[] = [
  {
    icon: 'globe',
    title: 'Career mobility across borders',
    text: 'One IFRS qualification, recognised internationally.',
  },
  {
    icon: 'award',
    title: 'An ACCA qualification',
    text: 'Awarded by ACCA, the global body for professional accountants.',
  },
  {
    icon: 'briefcase',
    title: 'Practical IFRS skills employers want',
    text: 'Apply IFRS confidently to real-world financial reporting.',
  },
];

// ─── The globe ───────────────────────────────────────────────────────────────

/**
 * Finance hubs, in route order (the routes draw from the first to the last).
 * `tag` is where the "IFRS" tag sits next to the pin, so close hubs don't overlap.
 */
export const HUBS: {name: string; lon: number; lat: number; tag: 'up' | 'left' | 'right'}[] = [
  {name: 'New York', lon: -74.0, lat: 40.7, tag: 'up'},
  {name: 'London', lon: -0.1, lat: 51.5, tag: 'up'},
  {name: 'Beirut', lon: 35.5, lat: 33.9, tag: 'left'},
  {name: 'Dubai', lon: 55.3, lat: 25.2, tag: 'right'},
  {name: 'Singapore', lon: 103.8, lat: 1.35, tag: 'up'},
];

// ─── Colours ─────────────────────────────────────────────────────────────────

export const BRAND = {
  /** Sampled from the logo (scripts/trace-logo.py). Accent: highlights and the CTA. */
  navy: LOGO_COLORS.navy, // #0B2351
  /** Laurel grey, sampled from the logo. */
  grey: LOGO_COLORS.grey, // #545454
  navySoft: '#E7EAF1',
  white: '#FFFFFF',
  /** Warm off-white background. */
  background: '#F5F3EF',
};

/** Card text hierarchy: navy is only a small accent. */
export const CARD_COLORS = {
  heading: '#111111',
  text: '#333333',
  meta: '#777777',
  divider: '#EAEAEA',
  card: '#FFFFFF',
};

export const GLOBE_COLORS = {
  ocean: '#FFFFFF',
  land: '#CFCFCB',
  graticule: '#EDEDEA',
  /** Soft haze toward the globe's edge and the halo around it. */
  haze: '#E9ECF2',
  /** The faded route once the journey starts retracing it. */
  routeFaded: '#AEB6C8',
};

// ─── Timings (frames at 60fps) ───────────────────────────────────────────────

export const TIMING = {
  fps: 60,
  durationInFrames: 1800,

  /** Hook: the pin drops at NY, then the headline builds word by word. */
  pinDrop: 6,
  hookWordsStart: 40,
  hookWordGap: 7,
  hookOut: 158,

  /** Global: title, then one route leg per `legLength` frames, hub to hub. */
  globalTitleIn: 205,
  routeStart: 215,
  legLength: 62,
  globalOut: 478,

  /** Course: the camera dives in, then the journey runs hub to hub. */
  diveStart: 470,
  diveEnd: 580,
  /** The journey leaves the last hub. */
  journeyStart: 560,
  /** Arrival at module 1's stop; later stops follow every stopSpacing. */
  firstArrival: 640,
  stopSpacing: 165,
  /**
   * Travel time between later stops grows with the distance between them
   * (base + perDegree × the angle in degrees), so long hops never whip past.
   */
  travel: {base: 25, perDegree: 1.3, minDwell: 72},

  /** Benefits. */
  pullOutStart: 1215,
  pullOutEnd: 1335,
  benefitsIn: 1275,
  benefitGap: 25,
  benefitsOut: 1532,

  /** End card: blur and fade, the logo, the launch line, the CTA, then a hold. */
  endCardStart: 1550,
  /** Frame exported as the PNG cover. */
  coverFrame: 1790,
};

export const legStart = (i: number) => TIMING.routeStart + i * TIMING.legLength;
export const arrivalFrame = (i: number) => TIMING.firstArrival + i * TIMING.stopSpacing;
/** Hub index where module i stops (the journey runs back from the last hub). */
export const moduleHub = (i: number) => HUBS.length - 2 - i;

// ─── Layout ──────────────────────────────────────────────────────────────────

/** Instagram Reels UI covers these edges. Keep text and cards out of them. */
export const SAFE = {top: 220, bottom: 400, right: 140, left: 60};

/** Text and cards sit in one centred column with equal 140px margins. */
export const COLUMN = {x: 140, width: 1080 - 2 * 140};

/** Where the globe (or the journey's focus point) sits on screen, per scene. */
export const FOCUS_Y = {hook: 790, global: 1000, course: 760, benefits: 690};
