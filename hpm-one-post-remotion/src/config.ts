// ─────────────────────────────────────────────────────────────────────────────
// Hot Pepper Media · "A day in the life of ONE post"
//
// EVERYTHING you are meant to edit lives in this file: copy, colours, numbers,
// scene timings (frames @ 30 fps), font sizes, spring feel, music BPM and the
// audio / SFX file names. Components only read from here.
//
// Caption syntax: each array entry is one line (max 5 words, max 2 lines).
// Wrap a word in *asterisks* to set it in the accent colour.
// ─────────────────────────────────────────────────────────────────────────────

export const VIDEO = {
  compositionId: 'Reel',
  thumbnailId: 'Thumbnail',
  width: 1080,
  height: 1920,
  fps: 30,
  // Total length is the sum of SCENES[*].duration (60+120+120+150+120+90+90 = 750).
} as const;

export const BRAND = {
  name: 'Hot Pepper Media',
  tagline: 'Marketing with a kick',
  handle: '@hotpeppermedia',
  dmKeyword: 'KICK',
  // Files inside assets/ (the Remotion public dir). Rebuild with `npm run assets`.
  logoOnDark: 'logo-on-dark.png',
  logoAspect: 744 / 515, // width / height of logoOnDark
} as const;

export const COLORS = {
  charcoal: '#121212',
  red: '#E63946', // accent only
  orange: '#FF7A1A', // accent only
  offWhite: '#FAFAFA',
  // neutrals derived from charcoal / off-white (surfaces, borders, muted text)
  surface: '#1A1A1A',
  surfaceHi: '#222222',
  border: '#2E2E2E',
  muted: '#A3A3A3',
  dim: '#6B6B6B',
  ink: '#121212', // text on off-white paper
} as const;

// Instagram-safe area. All text and key visuals stay inside it.
// Scene content is laid out inside a slightly smaller "inner" box so the
// 1.00 → 1.05 camera push never carries anything past these edges.
export const SAFE = {left: 90, right: 940, top: 220, bottom: 1500} as const;

export const FONT = {
  family: 'Montserrat',
  bold: 800, // ExtraBold: captions, headlines, numbers
  medium: 500, // Medium: small text
  // 'auto' = Google Fonts via @remotion/google-fonts, falling back to the
  // bundled files in assets/fonts/ when Google can't be reached.
  source: 'auto' as 'auto' | 'google' | 'local',
} as const;

export const SIZES = {
  caption: 90,
  hookLine1: 92,
  hookLine2: 132,
  hookOneGrowTo: 1.32, // "ONE" keeps scaling up to this while the hook holds
  clock: 40,
  small: 30,
  tiny: 24,
  note: 33,
  cardTitle: 46,
  cardLine: 31,
  panelLabel: 22,
  typing: 27,
  postHandle: 26,
  postHeadline: 64,
  phoneUi: 24,
  bubble: 28,
  statValue: 62,
  statLabel: 27,
  ctaQuestion: 82,
  ctaDm: 116,
  ctaTagline: 42,
  ctaHandle: 42,
} as const;

export const CAPTION = {
  top: 1190, // y of the first caption line
  lineHeight: 1.04,
  maxWidth: 800, // px; lines wider than this are shrunk to fit
  wordStagger: 4, // frames between words
  minHoldFrames: 36, // 1.2 s – checked at startup, warns if a scene is too short
  accent: COLORS.red,
} as const;

// Spring presets (all motion is spring-driven).
export const MOTION = {
  snap: {damping: 14, stiffness: 190, mass: 0.8},
  slam: {damping: 11, stiffness: 260, mass: 0.7},
  smooth: {damping: 200, stiffness: 120, mass: 1},
  bouncy: {damping: 10, stiffness: 150, mass: 0.9},
  soft: {damping: 22, stiffness: 80, mass: 1},
} as const;

export const CAMERA = {pushFrom: 1.0, pushTo: 1.05} as const;

export const TRANSITION = {
  whipFrames: 12, // overlap of a whip-pan, centred on the cut (on the beat)
  flameFrames: 18, // overlap of the hook's chili-flame wipe
  whipDistance: 1240, // px travelled by each scene during a whip
  maxBlur: 90, // max horizontal motion-blur radius (px)
} as const;

export const MUSIC = {
  file: 'music.mp3', // assets/music.mp3 – rendered silent if missing
  bpm: 120, // 120 BPM @ 30 fps = one beat every 15 frames
  firstBeatFrame: 0, // frame of the first downbeat in the track (after trim)
  snapCutsToBeat: true, // move every scene cut to the nearest beat
  trimStartSeconds: 0, // skip intro of the track
  volume: 0.9,
  fadeInFrames: 6,
  duckTo: 0.4, // volume multiplier during the CTA
  duckFrames: 10, // ramp into the duck
  fadeOutFrames: 24,
} as const;

// Optional one-shots. Put e.g. assets/sfx/whoosh.mp3 (or .wav) in place and it
// plays at its cue; missing files are skipped silently.
export const SFX = {
  folder: 'sfx',
  extensions: ['mp3', 'wav'],
  volume: {whoosh: 0.7, pop: 0.55, tap: 0.8, 'bass-hit': 1} as Record<string, number>,
} as const;

// ── Scenes ───────────────────────────────────────────────────────────────────
// `duration` is in frames. Cues inside a scene are frames from its cut.
// Reorder nothing here: SCENE_ORDER below defines the running order.

export const SCENES = {
  hook: {
    duration: 60,
    line1: ['What', 'goes', 'into'],
    line2: ['*ONE*', 'post?'],
    wordAt: [2, 7, 11, 15, 22], // slam frame per word (ONE lands on the beat)
    bassHitWord: 3, // index of the word that triggers sfx/bass-hit
  },

  idea: {
    duration: 120,
    clock: '08:00',
    caption: ['It starts', 'with an *idea*'],
    captionAt: 16,
    notes: ['Behind the scenes', 'Customer story', 'Trend remix', 'Before / after', 'Founder tip', 'Menu drop'],
    chosenNote: 1, // index into notes that gets the red circle
    flyInAt: -6, // notes start flying while the flame wipe is still revealing the scene
    flyStagger: 3,
    scatterAt: 26,
    circleAt: 54,
    circleFrames: 22,
  },

  strategy: {
    duration: 120,
    clock: '10:00',
    caption: ['Then a', '*strategy*'],
    captionAt: 30,
    cards: [
      {title: 'Audience', line: 'Local foodies, 25 to 40', icon: 'audience'},
      {title: 'Goal', line: 'Fill 50 more tables a week', icon: 'target'},
      {title: 'Message', line: 'New menu. Same kick.', icon: 'message'},
    ],
    cardAt: [-4, 4, 12], // negative = already flying in during the whip-pan
    checkAt: [46, 53, 60],
  },

  create: {
    duration: 150,
    clock: '13:00',
    caption: ['We *create* it'],
    captionAt: 22,
    panelLabels: ['SHOOT', 'DESIGN', 'WRITE'],
    postHeadline: ['NEW', 'MENU'],
    postButton: 'Order now',
    typedCaption: 'New menu, same kick. Tag who you are bringing. #eatlocal',
    typeAt: 12,
    typeFramesPerChar: 1.1,
    mergeAt: 92, // panels merge into the finished post
  },

  launch: {
    duration: 120,
    clock: '17:00',
    caption: ['Publish + *boost*'],
    captionAt: 20,
    publishingLabel: 'Publishing...',
    postedLabel: 'Posted',
    boostLabel: 'Boost post',
    boostedLabel: 'Boosted',
    publishAt: 2,
    postedAt: 30,
    boostButtonAt: 34,
    tapAt: 54,
    notifications: [
      {icon: 'heart', text: '+1.2K likes', at: 62},
      {icon: 'comment', text: '86 comments', at: 70},
      {icon: 'user', text: '+340 followers', at: 78},
      {icon: 'dm', text: 'New DM: "Book for 4?"', at: 86},
    ],
  },

  results: {
    duration: 90,
    clock: '20:00', // set to null to hide the clock in this scene
    caption: ['Then we', '*measure*'],
    captionAt: 14,
    stats: [
      {label: 'Reach', value: 48200, format: 'compact', prefix: '', suffix: '', icon: 'eye'},
      {label: 'Followers', value: 1240, format: 'comma', prefix: '+', suffix: '', icon: 'users'},
      {label: 'Leads', value: 37, format: 'comma', prefix: '', suffix: '', icon: 'target'},
    ],
    statAt: [2, 7, 12],
    countFrames: 42,
    graphAt: 0,
    graph: [0.08, 0.12, 0.1, 0.22, 0.2, 0.34, 0.31, 0.47, 0.55, 0.52, 0.7, 0.82, 0.95], // 0..1, left → right
    showExampleLabel: true, // turn OFF once the numbers are real
    exampleLabel: 'Example results',
  },

  cta: {
    duration: 90,
    question: ['Want this for', 'your brand?'],
    dm: 'DM us', // followed by ‘BRAND.dmKeyword’
    logoAt: 0,
    questionAt: 10,
    dmAt: 20,
    taglineAt: 28,
    handleAt: 32,
    // everything is settled by ~frame 45 of the CTA → the last 1.5 s is a full hold
  },
} as const;

export const SCENE_ORDER = ['hook', 'idea', 'strategy', 'create', 'launch', 'results', 'cta'] as const;

// Transition INTO each scene.
export const TRANSITIONS_IN: Record<(typeof SCENE_ORDER)[number], 'none' | 'flame' | 'whip'> = {
  hook: 'none',
  idea: 'flame',
  strategy: 'whip',
  create: 'whip',
  launch: 'whip',
  results: 'whip',
  cta: 'whip',
};

// Clock + chili logo mark are hidden on these scenes.
export const NO_HUD: readonly string[] = ['hook', 'cta'];

// Thumbnail (out/thumbnail.png)
export const THUMBNAIL = {
  line1: 'What goes into',
  line2: ['*ONE*', 'post?'],
  kicker: 'A day in the life of',
} as const;
