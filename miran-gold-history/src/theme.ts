import {Easing} from 'remotion';

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 3600};

export const COLORS = {
  bgTop: '#0A0E18',
  bgBottom: '#131A2A',
  glow: '#C8963E',
  glowOpacity: 0.25,
  text: '#F5F1E8',
  silverA: '#BFC6D1',
  silverB: '#F4F6FA',
  goldA: '#D4A24C',
  goldB: '#F3D27A',
  goldDeep: '#8A6424',
  goldShadow: '#5E4318',
  red: '#D9534F',
  green: '#4FB286',
  amber: '#E0A040',
  blue: '#6FB7E9',
  teal: '#2FA39A',
  white: '#FFFFFF',
  molten: '#FF7A1A',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  ink: '#0A0E18',
};

export type Accent = 'silver' | 'gold' | 'red' | 'green' | 'amber' | 'blue' | 'teal' | 'white';

/** The glow color each accent uses for streaks, rings and halos. */
export const ACCENT_GLOW: Record<Accent, string> = {
  silver: '#C9D3E2',
  gold: COLORS.goldA,
  red: COLORS.red,
  green: COLORS.green,
  amber: COLORS.amber,
  blue: COLORS.blue,
  teal: COLORS.teal,
  white: '#F1E6CC',
};

export const SILVER_GRADIENT = `linear-gradient(100deg, ${COLORS.silverA} 0%, ${COLORS.silverB} 55%, ${COLORS.silverA} 100%)`;
export const GOLD_GRADIENT = `linear-gradient(100deg, ${COLORS.goldA} 0%, ${COLORS.goldB} 55%, ${COLORS.goldA} 100%)`;
/** Polished chrome-gold, for big numerals (the year HUD). */
export const CHROME_GRADIENT = 'linear-gradient(180deg, #FFF6DC 0%, #F3D27A 36%, #9A6E26 52%, #D9AE55 70%, #FFF0C4 100%)';

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
  sheenDelay: 10,
  sheenDur: 26,
};

// Layout
export const SAFE = {bottom: 320, right: 140, side: 140};
export const LAYOUT = {
  wordmarkTop: 58,
  hudTop: 112,
  headlineTop: 452, // two lines span ~452–680: the upper-middle third
  headlineSize: 64,
  subSize: 40,
  minSize: 34,
  contentWidth: VIDEO.width - SAFE.side * 2,
  vp: {x: VIDEO.width / 2, y: 1010}, // vanishing point of the corridor of time gates
  floorY: 1460,
  disclaimerBottom: VIDEO.height - SAFE.bottom - 36,
};

// Scene frame ranges at 60fps (overlaps are intentional). Each scene is long enough for the
// voiceover to read its headline while it is on screen.
export const SCENES = {
  hook: [0, 240],
  first: [230, 540],
  egypt: [530, 840],
  lydia: [830, 1140],
  dinar: [1130, 1440],
  rush: [1430, 1740],
  standard: [1730, 2040],
  break1971: [2030, 2340],
  modern: [2330, 2700],
  cube: [2690, 3000],
  today: [2990, 3240],
  cta: [3230, 3600],
} as const;
export type SceneKey = keyof typeof SCENES;
export const sceneLength = (k: SceneKey) => SCENES[k][1] - SCENES[k][0];

/** The camera dollies forward through a time gate at the start of each of these scenes. */
export const DOLLY_INTO: SceneKey[] = ['first', 'egypt', 'lydia', 'dinar', 'rush', 'standard', 'break1971'];
export const DOLLY = 30; // frames, centred on the scene start

/** Era tint per scene: a subtle wash of the background and the glow of that scene's streaks. */
export const ERA_TINT: Record<SceneKey, string> = {
  hook: '#D9B26A',
  first: '#D9B26A',
  egypt: '#E0A040',
  lydia: '#C08A52',
  dinar: COLORS.teal,
  rush: '#C8743A',
  standard: '#8FB89A',
  break1971: COLORS.red,
  modern: '#F1E6CC',
  cube: '#F3D27A',
  today: '#F3D27A',
  cta: '#C8963E',
};

/** The year the HUD shows in each scene (negative = BC). The modern scene rolls 1971 → 2026 with its chart. */
export const ERA_YEAR: Partial<Record<SceneKey, number>> = {
  hook: -4500,
  first: -4500,
  egypt: -1300,
  lydia: -600,
  dinar: 696,
  rush: 1848,
  standard: 1944,
  break1971: 1971,
  modern: 2026, // the HUD follows the chart during this scene; this is where it ends up
  cube: 2026,
  today: 2026,
};
/** Evenly spaced ticks on the HUD's timeline (story order, drawn right → left). */
export const TIMELINE = [-4500, -1300, -600, 696, 1848, 1944, 1971, 2026];
