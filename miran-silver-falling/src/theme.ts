import {Easing} from 'remotion';

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 2530};

export const COLORS = {
  bgTop: '#0A0E18',
  bgBottom: '#131A2A',
  glow: '#AEB8C8', // cool silver glow (the gold reel used warm gold)
  glowOpacity: 0.22,
  text: '#F5F1E8',
  silverA: '#BFC6D1',
  silverB: '#F4F6FA',
  silverDeep: '#7D8798',
  silverShadow: '#4A5262',
  goldA: '#D4A24C',
  goldB: '#F3D27A',
  goldDeep: '#8A6424',
  goldShadow: '#5E4318',
  red: '#D9534F',
  green: '#4FB286',
  amber: '#E0803A',
  blue: '#6FB7E9', // industry
  white: '#FFFFFF',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  ink: '#0A0E18',
};

export type Accent = 'silver' | 'gold' | 'red' | 'green' | 'amber' | 'blue' | 'white';

/** The glow color each accent uses for streaks, rings and halos. */
export const ACCENT_GLOW: Record<Accent, string> = {
  silver: '#C9D3E2',
  gold: COLORS.goldA,
  red: COLORS.red,
  green: COLORS.green,
  amber: COLORS.amber,
  blue: COLORS.blue,
  white: '#DCE3F2',
};

export const SILVER_GRADIENT = `linear-gradient(100deg, ${COLORS.silverA} 0%, ${COLORS.silverB} 55%, ${COLORS.silverA} 100%)`;
export const GOLD_GRADIENT = `linear-gradient(100deg, ${COLORS.goldA} 0%, ${COLORS.goldB} 55%, ${COLORS.goldA} 100%)`;
/** Polished chrome, for big numerals. */
export const CHROME_GRADIENT = 'linear-gradient(180deg, #FFFFFF 0%, #DDE3EB 38%, #8E98A8 52%, #C3CBD6 70%, #F2F5F9 100%)';

export const FONT = {
  family: "'IBM Plex Sans Arabic', sans-serif",
  body: 300,
  key: 600,
  lineHeight: 1.5,
};

// Motion
export const EASE = {
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  glide: Easing.bezier(0.65, 0, 0.35, 1),
};
export const SPRING_TEXT = {damping: 200};
export const SPRING_HERO = {damping: 14, stiffness: 120, mass: 1}; // soft overshoot
export const MOTION = {
  wordStagger: 4,
  wordEnter: 30,
  exitFactor: 0.6, // exits run ~40% faster
  wordBlur: 8,
  wordRise: 18,
  sceneExit: 18,
  holdMin: 48, // 0.8s at 60fps
  sheenDelay: 10, // a word's silver sheen sweeps across it this many frames after it starts entering
  sheenDur: 26,
};

// Layout
export const SAFE = {bottom: 320, right: 140, side: 140};
export const LAYOUT = {
  wordmarkTop: 58,
  hudTop: 122,
  headlineTop: 452, // two lines span ~452–680: the upper-middle third
  headlineSize: 64,
  subSize: 40,
  minSize: 34,
  contentWidth: VIDEO.width - SAFE.side * 2, // symmetric margins keep text clear of the right safe zone
  floorY: 1420, // the reflective floor's horizon line
  disclaimerBottom: VIDEO.height - SAFE.bottom - 36,
};

// Scene frame ranges at 60fps. Each scene's TEXT runs over this range (overlapping the next by
// 10 frames); its VISUALS stay mounted until the camera has glided on to the next station.
// Each scene is long enough for the voiceover to read its headline while it is on screen.
export const SCENES = {
  hook: [0, 220],
  drop: [210, 560],
  versus: [550, 850],
  pressure: [840, 1150],
  industry: [1140, 1450],
  market: [1440, 1740],
  tip: [1730, 2050],
  cta: [2040, 2530],
} as const;
export type SceneKey = keyof typeof SCENES;
export const sceneLength = (k: SceneKey) => SCENES[k][1] - SCENES[k][0];

/** The camera glides to the next station over this many frames, starting as the next scene starts. */
export const GLIDE = 30;
/** Stations in story order (the camera travels right → left). The CTA is reached by a pull-back instead. */
export const STATIONS: SceneKey[] = ['hook', 'drop', 'versus', 'pressure', 'industry', 'market', 'tip'];
