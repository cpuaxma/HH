import {Easing} from 'remotion';

// 3.5 seconds at 60fps. The same timeline drives all three aspect ratios.
export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 210};

export const COLORS = {
  bgTop: '#0A0E18',
  bgBottom: '#131A2A',
  glow: '#C8963E',
  glowOpacity: 0.25,
  text: '#F5F1E8',
  goldA: '#D4A24C',
  goldB: '#F3D27A',
  goldDeep: '#8A6424',
  red: '#D9534F',
  green: '#4FB286',
  amber: '#E0803A',
  ink: '#0A0E18',
};

export type Accent = 'gold' | 'red' | 'green' | 'amber' | 'white';

export const ACCENT_GLOW: Record<Accent, string> = {
  gold: COLORS.goldA,
  red: COLORS.red,
  green: COLORS.green,
  amber: COLORS.amber,
  white: '#DCE3F2',
};

export const GOLD_GRADIENT = `linear-gradient(100deg, ${COLORS.goldA} 0%, ${COLORS.goldB} 55%, ${COLORS.goldA} 100%)`;

export const FONT = {family: "'IBM Plex Sans Arabic', sans-serif", body: 300, key: 600};

export const EASE = {
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
};
export const SPRING_TEXT = {damping: 200};
export const SPRING_HERO = {damping: 14, stiffness: 120, mass: 1}; // soft overshoot
export const MOTION = {wordEnter: 30, wordBlur: 8, wordRise: 18, sceneExit: 18};

/** Frames (60fps) at which each beat starts. Sound cues read these too. */
export const T = {
  wipe: 0, // light sweep opens the card (peaks ~frame 7)
  logo: 8, // logo springs in
  orbit: 12, // gold comet circles the logo
  brand: 28, // "ميران جولد"
  button: 48, // Telegram pill
  disclaimer: 62,
  shine: 84, // light glint across the pill
  fadeOut: 186, // fade to black over the last 24 frames (0.4s)
};
