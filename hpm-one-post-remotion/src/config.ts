// ─────────────────────────────────────────────────────────────────────────────
// Hot Pepper Media · "A day in the life of ONE post"
//
// EVERYTHING you are meant to edit lives in this file: copy, colours, numbers,
// scene timings (frames @ 30 fps), font sizes, spring feel, music BPM and the
// audio / SFX file names. Components only read from here.
//
// Caption syntax: each array entry is one line (max 5 words, max 2 lines).
// Wrap a word (or several) in *asterisks* to set it in the accent colour.
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
  logo: 'logo-on-light.png', // transparent-background logo, original colours
  logoWhite: 'logo-white.png', // all-white version for the red CTA card
  logoAspect: 744 / 515, // width / height of the logo file
} as const;

export const COLORS = {
  // brand palette
  charcoal: '#121212',
  red: '#E63946', // accent only
  orange: '#FF7A1A', // accent only
  offWhite: '#FAFAFA',
  // light theme, matched to the cream Instagram feed
  bg: '#FAF5EA', // page background: warm off-white, like the feed
  ink: '#121212', // main text + line art (charcoal)
  inkSoft: '#6B655B', // secondary text
  inkFaint: '#A39C8F', // tertiary text, ticks
  card: '#FFFFFF', // cards, panels, notes, phone screen
  cardAlt: '#F5EFE2', // image wells, pressed states
  line: '#E7DFCF', // borders, dividers
  grid: 'rgba(230,57,70,0.24)', // background grid lines (like the feed posts)
  gridOnRed: 'rgba(255,255,255,0.18)', // grid lines on the red CTA card
  shadow: 'rgba(90,60,30,0.16)', // soft warm drop shadows
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
  caption: 110,
  hookLine1: 96,
  hookHero: 400, // the giant "ONE" (shrinks automatically to fit the width)
  hookLine3: 150,
  heroGrowTo: 1.08, // the giant word keeps growing slowly to this
  clock: 40,
  small: 30,
  tiny: 24,
  note: 48,
  chip: 34,
  stepTag: 30,
  typing: 24,
  postHandle: 26,
  postHeadline: 64,
  adButton: 40,
  bubble: 30,
  heroStat: 250,
  heroStatLabel: 44,
  statValue: 44,
  statLabel: 28,
  ctaQuestion: 96,
  ctaDm: 130,
  ctaTagline: 42,
  ctaHandle: 44,
} as const;

export const CAPTION = {
  top: 1196, // y of the first caption line
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

// Graph-paper background grid
export const GRID = {cell: 90, lineWidth: 2.5} as const;

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

// Voiceover. Each line plays from frame `at` of its scene (frames from the scene's cut).
// Audio lives in assets/vo/<id>.wav; regenerate after editing text with
// `npm run voiceover -- MODELS_DIR` (see README). Missing files are skipped.
export const VOICEOVER = {
  enabled: true,
  folder: 'vo',
  // Engine: Chatterbox Turbo (Resemble AI, MIT licence), run locally. The whole script is
  // read in ONE continuous take so it flows; the generator then splits it at its natural
  // pauses and lays each sentence on its scene (see scripts/make-voiceover.py).
  engine: 'chatterbox-turbo' as 'chatterbox-turbo' | 'chatterbox',
  // Voice to clone (5–20 s, clean, one speaker). Now: Kokoro "af_heart" (Apache-2.0),
  // a warm American female voice. Swap in any clip you have the rights to, e.g. your own.
  voiceRef: 'vo/voice-ref.wav',
  temperature: 0.8, // Turbo: higher = more varied delivery
  exaggeration: 0.75, // standard Chatterbox only: energy (0.5 natural … 0.8+ dramatic)
  cfgWeight: 0.35, // standard Chatterbox only: lower = slower, more deliberate pacing
  takes: 6, // full-script takes rendered; the best clean, best-fitting, liveliest is kept
  lead: 0.2, // a sentence may start up to this many seconds before its scene's cut
  volume: 1,
  musicDuckTo: 0.35, // music level while the voice is speaking
  sfxDuckTo: 0.6, // SFX level while the voice is speaking
  // Written for the ear. `at` = target start, in frames from the scene's cut.
  lines: [
    {id: 'hook', scene: 'hook', at: 3, text: 'What goes into one post?'},
    {id: 'idea', scene: 'idea', at: 4, text: 'It starts with an idea... one that stops the scroll.'},
    {id: 'strategy', scene: 'strategy', at: 4, text: "Then a strategy: who it's for, and what to say."},
    {id: 'create', scene: 'create', at: 4, text: "We shoot it, design it, and write it... until it's just right."},
    {id: 'launch', scene: 'launch', at: 4, text: 'Then we hit publish, and launch the ad campaign behind it.'},
    {id: 'results', scene: 'results', at: 2, text: "And we track what's working, in real time."},
    {id: 'cta', scene: 'cta', at: 0, text: 'Want this? DM us the word kick.'},
  ],
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
    line1: 'What goes into', // small line above
    hero: 'ONE', // giant red word
    line3: 'post?',
    line1At: 2,
    heroAt: 13, // giant word slams (bass hit)
    line3At: 24,
  },

  idea: {
    duration: 120,
    clock: '08:00',
    caption: ['It starts', 'with an *idea*'],
    captionAt: 14,
    notes: ['Trend remix', 'Founder tip', 'Customer story'], // three big notes
    chosenNote: 2, // the one that survives (gets circled)
    noteAt: [-6, 2, 10], // each note slaps down
    crossAt: 40, // the other two get scribbled out ...
    dropAt: 52, // ... and fall away
    circleAt: 60,
    circleFrames: 20,
  },

  strategy: {
    duration: 120,
    clock: '10:00',
    caption: ['Then a', '*strategy*'],
    captionAt: 34,
    targetAt: -4, // bullseye rings draw in
    dartAt: 20, // dart thunks into the centre
    chips: [
      {title: 'Audience', icon: 'audience'},
      {title: 'Goal', icon: 'target'},
      {title: 'Message', icon: 'message'},
    ],
    chipAt: [30, 36, 42],
  },

  create: {
    duration: 150,
    clock: '13:00',
    caption: ['We *create* it'],
    captionAt: 16,
    steps: [
      {label: 'SHOOT', at: 6},
      {label: 'DESIGN', at: 40},
      {label: 'WRITE', at: 70},
    ],
    flashAt: 12, // camera flash, photo drops in
    headlineAt: 44,
    buttonAt: 56,
    typeAt: 72,
    typeFramesPerChar: 0.8,
    doneAt: 104, // heart pops + sheen: post finished
    postHeadline: ['NEW', 'MENU'],
    postButton: 'Order now',
    typedCaption: 'New menu, same kick. Tag who you are bringing. #eatlocal',
  },

  launch: {
    duration: 120,
    clock: '17:00',
    caption: ['Publish +', '*ad campaigns*'],
    captionAt: 16,
    postedLabel: 'Posted',
    adButtonLabel: 'Launch ad campaign',
    adLiveLabel: 'Campaign live',
    postAt: -4,
    postedAt: 14,
    adButtonAt: 24,
    tapAt: 50, // finger taps → burst of likes
    notifications: [
      {icon: 'heart', text: '+1.2K likes', at: 58},
      {icon: 'comment', text: '86 comments', at: 66},
      {icon: 'dm', text: 'New DM: "Book for 4?"', at: 74},
    ],
  },

  results: {
    duration: 90,
    clock: '20:00', // set to null to hide the clock in this scene
    caption: ['Then we', '*measure*'],
    captionAt: 12,
    hero: {label: 'people reached', value: 48200, format: 'compact', prefix: '', suffix: ''},
    stats: [
      {label: 'followers', value: 1240, format: 'comma', prefix: '+', suffix: '', icon: 'users'},
      {label: 'leads', value: 37, format: 'comma', prefix: '', suffix: '', icon: 'target'},
    ],
    heroAt: 0,
    countFrames: 40,
    statAt: [24, 30],
    graph: [0.05, 0.1, 0.08, 0.2, 0.18, 0.32, 0.3, 0.48, 0.58, 0.55, 0.75, 0.9, 1], // 0..1, left → right
    showExampleLabel: true, // turn OFF once the numbers are real
    exampleLabel: 'Example results',
  },

  cta: {
    duration: 90,
    redBackground: true, // full chili-red end card (like the feed's red posts); false = light
    question: ['Want this for', 'your brand?'],
    dm: 'DM us', // followed by ‘BRAND.dmKeyword’
    logoAt: 0,
    questionAt: 8,
    dmAt: 18,
    taglineAt: 26,
    handleAt: 30,
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
  kicker: 'A day in the life of',
  line1: 'What goes into',
  hero: 'ONE',
  line3: 'post?',
} as const;
