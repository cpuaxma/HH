/**
 * Everything you are likely to change lives in this file:
 * the two businesses, every line of copy, the numbers, the colours and the timings.
 *
 * Frames are at 60fps (60 frames = 1 second). The reel is 1200 frames (20s).
 * Both businesses are fictional examples; the stats carry an "Example" label.
 */

// ─── Brand ───────────────────────────────────────────────────────────────────

export const BRAND = {
  red: '#E63922',
  orange: '#FF7A1A',
  glow: '#FF4D2E',
  /** Studio background / end card. */
  offWhite: '#F4F2EE',
  /** Headings. */
  ink: '#111111',
  /** Body text. */
  text: '#333333',
  /** Metadata. */
  meta: '#777777',
  /** Dividers. */
  divider: '#EAEAEA',
};

// ─── The two businesses (fictional) ──────────────────────────────────────────

export type Post = {
  /** Lines of the big headline drawn on the post image. */
  headline: string[];
  /** Small line under the headline on the post image. */
  kicker: string;
  caption: string;
};

export type Shop = {
  name: string;
  handle: string;
  /** Two-letter monogram on the round avatar. */
  monogram: string;
  avatarBg: string;
  avatarInk: string;
  location: string;
  bio: string;
};

export const STREET = 'Mar Mikhael, Beirut';

export const YOU: Shop & {deadPost: Post; newPost: Post} = {
  name: 'Bean Corner',
  handle: 'beancorner',
  monogram: 'BC',
  avatarBg: '#6E7F6A',
  avatarInk: '#F4F2EE',
  location: STREET,
  bio: 'Coffee & pastries',
  /** The flat, badly lit post before the flip. */
  deadPost: {headline: [], kicker: '', caption: 'Open today ☕'},
  /** The new post after Hot Pepper Media takes over. */
  newPost: {
    headline: ['FRESH', 'ROAST', 'FRIDAY'],
    kicker: 'FREE COOKIE WITH EVERY FLAT WHITE',
    caption: 'New beans just landed. First 50 flat whites come with a cookie 🍪',
  },
};

export const COMPETITOR: Shop & {post: Post} = {
  name: 'Grind House',
  handle: 'grindhouse.bey',
  monogram: 'GH',
  avatarBg: '#2B1A12',
  avatarInk: '#FF7A1A',
  location: STREET,
  bio: 'Specialty coffee · Open 7am–11pm',
  post: {
    headline: ['2 FOR 1', 'ICED', 'LATTES'],
    kicker: 'TODAY ONLY · TILL 5PM',
    caption: 'Heatwave special. Bring your coffee person 🔥',
  },
};

// ─── Numbers (illustrative) ──────────────────────────────────────────────────
// Keyframes are [frame, value]; values in between follow a smooth curve.

export const NUMBERS = {
  /** The competitor's likes: already moving at frame 0, then racing up during the gap. */
  competitorLikes: [
    [0, 214],
    [180, 1180],
    [200, 1420],
    [300, 8420],
    [540, 9210],
    [1020, 11840],
  ] as [number, number][],
  competitorComments: [
    [0, 18],
    [180, 96],
    [300, 486],
    [540, 532],
    [1020, 640],
  ] as [number, number][],
  /** "+1,236 new followers" counter in the gap. */
  competitorNewFollowers: [
    [228, 0],
    [300, 1236],
  ] as [number, number][],
  competitorFollowers: 24800,
  competitorPosts: 312,
  competitorFollowing: 180,
  /** Yours before the flip: the same three likes and one comment. */
  yourLikes: 3,
  yourComments: 1,
  yourFollowers: 412,
  /** Yours after the flip: starting to climb. */
  yourLikesAfter: [
    [846, 0],
    [1010, 1284],
  ] as [number, number][],
  yourCommentsAfter: [
    [860, 0],
    [1010, 96],
  ] as [number, number][],
};

// ─── People (fictional handles) ──────────────────────────────────────────────

/** Comments that slide in under the competitor's post. */
export const COMPETITOR_COMMENTS = [
  {user: 'nour.eats', text: 'Need this today 🔥', at: 214},
  {user: 'rami.k', text: 'Where is this?? 😍', at: 238},
  {user: 'lea.in.beirut', text: 'Best iced latte on the street', at: 258},
  {user: 'karim.cafe', text: 'Going right now ☕', at: 276},
];

/** Older comments already under the competitor's post at frame 0. */
export const COMPETITOR_OLD_COMMENTS = [
  {user: 'mira.s', text: 'Obsessed with this 😍'},
  {user: 'joe.d', text: 'Saving it for later'},
];

/** The one comment under your dead post. */
export const YOUR_COMMENT = {user: 'tony_74', text: 'nice 👍'};

/** The single, lonely notification on your phone during the time-lapse. */
export const YOUR_LONELY_NOTIF = {kind: 'chart', text: 'Your post reached 41 accounts'} as const;

/** Comments that start arriving under your new post after the flip. */
export const YOUR_NEW_COMMENTS = [
  {user: 'sara.m', text: 'Saving this for Friday ☕', at: 884},
  {user: 'omar.b', text: 'That cookie though 🍪', at: 918},
  {user: 'hiba.k', text: 'See you at 8!', at: 950},
];

/** Notification banners on the competitor's phone (cycled as they arrive). */
export const COMPETITOR_NOTIFS = [
  {kind: 'like', text: 'nour.eats liked your post'},
  {kind: 'comment', text: 'rami.k: Where is this?? 😍'},
  {kind: 'follow', text: 'lea.in.beirut started following you'},
  {kind: 'like', text: 'maya.h and 38 others liked your post'},
  {kind: 'save', text: 'Your post was saved 120 times'},
  {kind: 'comment', text: 'karim.cafe: Going right now ☕'},
  {kind: 'follow', text: '+56 new followers'},
  {kind: 'like', text: 'jad.walks and 112 others liked your post'},
] as const;

/** Notification banners on your phone after the flip. */
export const YOUR_NOTIFS = [
  {kind: 'like', text: 'sara.m liked your post', at: 868},
  {kind: 'comment', text: 'omar.b: Saving this for Friday ☕', at: 902},
  {kind: 'follow', text: 'hiba.k started following you', at: 930},
  {kind: 'like', text: 'nadim and 24 others liked your post', at: 952},
  {kind: 'save', text: 'Your post was saved 18 times', at: 972},
] as const;

// ─── Copy ────────────────────────────────────────────────────────────────────

export const COPY = {
  /** The hook headline, one entry per line. The accent (a word or a whole line) is drawn in brand red. */
  hook: ['Your competitor', 'just posted.'],
  hookAccent: 'posted.',
  labelYou: 'You',
  labelCompetitor: 'Your competitor',
  /** The three kinetic lines in the gap. */
  gap: ['Same street.', 'Same coffee.', 'Different marketing.'],
  gapAccent: 'marketing.',
  twist: ['Guess who runs', 'their page?'],
  twistAccent: 'their page?',
  flip: ["Now it's", 'your turn.'],
  flipAccent: 'your turn.',
  /** Tag on the competitor's profile. */
  managedBy: 'Managed by',
  agency: 'Hot Pepper Media',
  trending: 'Trending in Beirut',
  newFollowers: 'new followers',
  example: 'Example',
  cta: 'DM US',
  /** The clock label during the time-lapse. */
  clockLabel: 'Since posting',
};

// ─── Timings (frames at 60fps) ───────────────────────────────────────────────

export const TIMING = {
  fps: 60,
  durationInFrames: 1200,

  // 1. Hook (0–180): wide two-shot, headline.
  headlineIn: 6,
  headlineOut: 164,

  // 2. The gap (180–540): three shots.
  gapStart: 180,
  /** Kinetic lines: [in, out] for each of COPY.gap. */
  gapLines: [
    [204, 300],
    [328, 424],
    [452, 538],
  ] as [number, number][],
  trendingAt: 250,
  /** Your clock time-lapse 9:00 → 21:00. */
  clockStart: 334,
  clockEnd: 418,
  clockFromHour: 9,
  clockToHour: 21,
  /** Your screen dims and desaturates over this window. */
  dimStart: 330,
  dimEnd: 450,
  /** The single lonely notification on your phone. */
  lonelyPingAt: 396,

  // 3. The twist (540–720): push in on the competitor's profile.
  twistStart: 540,
  profileAt: 572,
  tagAt: 626,
  twistTextIn: 598,
  twistTextOut: 714,

  // 4. The flip (720–1020).
  flipSceneStart: 720,
  streakStart: 722,
  streakEnd: 762,
  flipStart: 782,
  flipEnd: 836,
  /** Impact frame(s) when your phone lands. */
  impactAt: 836,
  impactFrames: 3,
  /** The two phones pulse together from here (period in frames). */
  syncPulseFrom: 880,
  syncPulsePeriod: 30,
  flipTextIn: 866,
  flipTextOut: 1014,

  // 5. End card (1020–1200).
  endCardStart: 1020,
  logoAt: 1044,
  ctaAt: 1092,
  /** Everything is still from here to the end (the held last second). */
  holdFrom: 1140,

  /** Frame used for the PNG cover. */
  coverFrame: 960,
};

/** Notification arrival frames on the competitor's phone: faster and faster. */
export const competitorNotifFrames = (): number[] => {
  const out: number[] = [];
  let t = -40;
  let gap = 34;
  while (t < TIMING.flipSceneStart) {
    out.push(Math.round(t));
    t += gap;
    gap = Math.max(7, gap * 0.88);
  }
  return out;
};

// ─── Layout ──────────────────────────────────────────────────────────────────

/** Instagram covers the top 220px, the bottom 400px and the right 140px of a 1080x1920 reel. */
export const SAFE = {top: 220, bottom: 400, right: 140};

/** All text sits in this centred column (equal 140px margins). */
export const COLUMN = {x: 140, width: 800};

export type FormatId = 'vertical' | 'feed';

/** Per-format layout: where the headline block sits and where the 3D focus lands. */
export const LAYOUT: Record<
  FormatId,
  {
    width: number;
    height: number;
    /** Top of the kinetic headline block. */
    textTop: number;
    /** Font size of the big kinetic lines. */
    textSize: number;
    /** Lowest y any text or label may reach. */
    textBottom: number;
    /** Scale for the phone framing (bigger = phones smaller on screen). */
    distScale: number;
    /** Screen-space y of the camera target in the wide shots. */
    focusY: number;
    /** Screen-space y of the camera target in the macro shots. */
    macroFocusY: number;
    endLogoTop: number;
  }
> = {
  vertical: {
    width: 1080,
    height: 1920,
    textTop: 262,
    textSize: 104,
    textBottom: 1500,
    distScale: 1,
    focusY: 1050,
    macroFocusY: 1020,
    endLogoTop: 560,
  },
  feed: {
    width: 1080,
    height: 1350,
    textTop: 92,
    textSize: 84,
    textBottom: 1250,
    distScale: 1.06,
    focusY: 770,
    macroFocusY: 760,
    endLogoTop: 300,
  },
};

// ─── Studio look ─────────────────────────────────────────────────────────────

export const STUDIO = {
  floor: '#EFECE6',
  /** Warm glow the competitor's phone throws on the floor. */
  warmGlow: '#FF6A14',
  /** Cold, grey light from your dead phone. */
  coldGlow: '#9FB2C4',
  aluminium: '#C9CCD1',
  backGlass: '#D9D6D0',
};

// ─── Voiceover (optional) ────────────────────────────────────────────────────
// Generated by scripts/make-voiceover.py into public/vo/. `at` is the start frame.

export const VOICEOVER = {
  /** Set to false for an effects-only mix. */
  enabled: false,
  volume: 1,
  /** Effects dip to this level under the voice. */
  duckTo: 0.45,
  lines: [
    {file: 'hook', text: 'Your competitor just posted.', at: 10},
    {file: 'turn', text: 'Your turn.', at: 872},
  ],
};
