import {Easing} from 'remotion';

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 2800};

export const COLORS = {
  bgTop: '#0A0E18',
  bgBottom: '#131A2A',
  glow: '#C8963E',
  glowOpacity: 0.25,
  text: '#F5F1E8',
  goldA: '#D4A24C',
  goldB: '#F3D27A',
  goldDeep: '#8A6424',
  goldShadow: '#5E4318',
  red: '#D9534F',
  green: '#4FB286',
  amber: '#E0803A',
  white: '#FFFFFF',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  ink: '#0A0E18',
};

export type Accent = 'gold' | 'red' | 'green' | 'amber' | 'white';

/** The glow color each accent uses for streaks, rings and halos. */
export const ACCENT_GLOW: Record<Accent, string> = {
  gold: COLORS.goldA,
  red: COLORS.red,
  green: COLORS.green,
  amber: COLORS.amber,
  white: '#DCE3F2',
};

export const GOLD_GRADIENT = `linear-gradient(100deg, ${COLORS.goldA} 0%, ${COLORS.goldB} 55%, ${COLORS.goldA} 100%)`;

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
};

// Layout
export const SAFE = {bottom: 320, right: 140, side: 140};
export const LAYOUT = {
  wordmarkTop: 58,
  chainY: 236,
  headlineTop: 452, // two lines span ~452–680: the upper-middle third
  headlineSize: 64,
  subSize: 40,
  minSize: 34,
  contentWidth: VIDEO.width - SAFE.side * 2, // symmetric margins keep text clear of the right safe zone
  disclaimerBottom: VIDEO.height - SAFE.bottom - 36,
};

// Scene frame ranges at 60fps (overlaps are intentional). Each scene is long enough for its
// voiceover line (voiceover-script-ar.md) to be read in full while its text is on screen.
export const SCENES = {
  hook: [0, 210],
  drop: [200, 800],
  oil: [790, 1060],
  inflation: [1050, 1430],
  dollar: [1420, 1830],
  panic: [1820, 2090],
  tip: [2080, 2560],
  cta: [2550, 2800],
} as const;

export type SceneKey = keyof typeof SCENES;
export const sceneLength = (k: SceneKey) => SCENES[k][1] - SCENES[k][0];

// The chain (absolute frames): each node pops at its frame; the link before it draws in just ahead.
// Nodes land as the voiceover names them.
export const CHAIN = {
  start: SCENES.oil[0],
  fadeOut: [SCENES.panic[0], SCENES.panic[0] + 25] as const,
  nodes: [SCENES.oil[0] + 130, SCENES.inflation[0] + 90, SCENES.inflation[0] + 200, SCENES.dollar[0] + 100, SCENES.dollar[0] + 196],
  goldDownArrow: SCENES.dollar[0] + 212,
};
