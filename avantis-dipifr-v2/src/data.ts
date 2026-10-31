/**
 * Everything you are likely to change lives in this file: the hook, the copy,
 * the modules, the course format, the benefits, the colours and the timings.
 *
 * Text marked "PLACEHOLDER" stands in for details that weren't given in the
 * brief. Replace it with your own before publishing.
 */

// ─── Hook (0–2s) ─────────────────────────────────────────────────────────────

/**
 * The scroll-stopper, one word or short phrase per slam. Each entry lands on its
 * own frame (`at`, frames from the start; 30 frames = one beat at 120 BPM).
 * `br` starts a new line after the word. `accent` draws it in gold with an
 * underline swipe. The first word is already on screen at frame 0.
 *
 * Alternatives from the brief, ready to swap in:
 *   "One qualification." / "Every border."
 *   "Your skills are local." / "Your career doesn't have to be."
 */
export const HOOK: {text: string; at: number; br?: boolean; accent?: boolean}[] = [
  {text: 'Does', at: 0},
  {text: 'your', at: 10, br: true},
  {text: 'CV', at: 20},
  {text: 'speak', at: 30, br: true},
  {text: 'IFRS?', at: 60, accent: true},
];

// ─── Copy ────────────────────────────────────────────────────────────────────

export const COPY = {
  /** 2–6s: the answer, around the certificate. The second word is drawn in gold. */
  answerTitle: ['Meet', 'DipIFR'],
  answerLine: "ACCA's Diploma in International Financial Reporting",
  answerSub: 'IFRS-focused. Internationally recognised.',

  /** On the 3D certificate itself. */
  certificate: {
    eyebrow: 'DIPLOMA',
    title: 'DipIFR',
    lines: ['Diploma in International', 'Financial Reporting'],
    footer: 'IFRS',
  },

  /** 6–18s: above the stack. */
  courseEyebrow: 'Course structure',
  /** Shown under the certificate once all four modules lock in. */
  coursePayoff: ['Four modules.', 'One global qualification.'],

  /** 24–30s: the end card. The tagline is part of the logo. */
  launch: 'DipIFR course — coming soon', // PLACEHOLDER: e.g. "DipIFR course — starts 12 January"
  cta: 'DM “IFRS” to reserve your seat', // PLACEHOLDER: or "Link in bio", or a WhatsApp number
  /** Optional urgency line under the CTA. Leave empty unless it is true. */
  urgency: '', // PLACEHOLDER: e.g. "Limited seats"
};

/**
 * Course modules: one 3D tile and one card each.
 * `short` is engraved on the tile; `title` and `learn` go on the white card.
 *
 * PLACEHOLDER: these follow the four main areas of the ACCA DipIFR syllabus.
 * Replace them with your course's own modules. The tiles build a certificate,
 * so keep it to four.
 */
export const MODULES = [
  {
    short: 'The IFRS Framework',
    title: 'The IFRS Framework',
    learn: 'How IFRS standards are set and the Conceptual Framework behind them.',
  },
  {
    short: 'Financial Statements',
    title: 'Elements of Financial Statements',
    learn: 'Recognise and measure assets, liabilities, income and expenses.',
  },
  {
    short: 'Presentation & Disclosure',
    title: 'Presentation & Disclosure',
    learn: 'Present statements and disclosures the way IFRS requires.',
  },
  {
    short: 'Group Accounts',
    title: 'Group Financial Statements',
    learn: 'Consolidate subsidiaries; account for associates and joint arrangements.',
  },
];

/** Course format, as gold-outlined chips above the stack. PLACEHOLDER. */
export const COURSE_FORMAT = ['Live online', 'Recorded lectures', 'Mock exams'];

export type BenefitIcon = 'globe' | 'award' | 'briefcase' | 'chart' | 'book';

/**
 * 18–24s: three fast near-fullscreen beats. `words` is the big line (3–5 words;
 * `|` breaks the line), `line` the small supporting line.
 */
export const BENEFITS: {icon: BenefitIcon; words: string; line: string}[] = [
  {icon: 'globe', words: 'Work across | borders', line: 'One IFRS qualification, recognised internationally.'},
  {icon: 'award', words: 'An ACCA | qualification', line: 'Awarded by ACCA, the global body for professional accountants.'},
  {icon: 'briefcase', words: 'IFRS skills | employers want', line: 'Practical, applied financial reporting.'},
];

// ─── Colours ─────────────────────────────────────────────────────────────────

export const COLORS = {
  /** From the logo. */
  navy: '#0B2351',
  logoGrey: '#545454',
  /** Background gradient, top → bottom. */
  bgTop: '#0B2351',
  bgBottom: '#061537',
  /** Warm champagne gold: highlights, progress, the seal and the CTA. */
  gold: '#D9B26A',
  goldLight: '#F1D9A0',
  /** Light blue, used very sparingly. */
  blue: '#8FB3FF',
  /** Text on dark. */
  headline: '#FFFFFF',
  body: '#C9D3E8',
  /** Certificate paper. */
  paper: '#FBF7EE',
};

/** Cards: white, with a clear text hierarchy. */
export const CARD_COLORS = {
  card: '#FFFFFF',
  heading: '#111111',
  text: '#333333',
  meta: '#777777',
  divider: '#EAEAEA',
};

// ─── Timings (frames at 60fps; one beat = 30 frames at 120 BPM) ─────────────

export const BEAT = 30;

export const TIMING = {
  fps: 60,
  durationInFrames: 1800,
  /** Hook: the pattern interrupt (a snap zoom) runs into the answer. */
  hookInterrupt: 96,
  /** Answer: the certificate rotates in, then breaks into four tiles. */
  answerStart: 120,
  breakStart: 300,
  /** Course: module i's tile flies in at courseStart + i × moduleLength and locks LOCK.lock frames (two beats) later. */
  courseStart: 360,
  moduleLength: 150,
  /** All four locked: the stack flips back into the certificate and the seal stamps. */
  morphStart: 990,
  sealStamp: 1050,
  /** Benefits: one every benefitLength frames. */
  benefitsStart: 1080,
  benefitLength: 120,
  /** End card: the light sweep wipes in. */
  endStart: 1440,
};

/** Within a module's block: when its tile reaches the hero spot, leaves it, and locks into the stack. */
export const LOCK = {hero: 28, leave: 44, lock: 60};

export const moduleStart = (i: number) => TIMING.courseStart + i * TIMING.moduleLength;
export const lockFrame = (i: number) => moduleStart(i) + LOCK.lock;

// ─── Layout ──────────────────────────────────────────────────────────────────

/** Instagram Reels UI covers these edges. Keep text and cards out of them. */
export const SAFE = {top: 220, bottom: 400, right: 140, left: 60};

/** Text and cards sit in one centred column with equal 140px margins. */
export const COLUMN = {x: 140, width: 1080 - 2 * 140};
