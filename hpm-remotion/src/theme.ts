import {Easing} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 60;
export const DURATION = 1800;

export const COLORS = {
  red: '#E23B24',
  charcoal: '#0F0F0F',
  cream: '#FEF9EF',
  peach: '#FFD7C9',
  gray: '#E7E4DF',
} as const;

export const FONT = 'Montserrat';
export const WEIGHT = {body: 500, label: 600, headline: 800} as const;

export const TYPE = {
  headlineMax: 140,
  headlineTracking: '-0.03em',
  labelSize: 28,
  labelTracking: 0.08, // em, settled
  labelTrackingFrom: 0.3, // em, at the start of the reveal
  bodySize: 36,
  serviceName: 52,
  processWord: 104,
} as const;

// Reels/TikTok safe area. Key content stays inside x 80..940 and above y 1600.
export const SAFE = {
  left: 80,
  right: 940,
  top: 160,
  bottom: 1600,
} as const;
export const COLUMN = SAFE.right - SAFE.left;
export const COLUMN_CENTER = (SAFE.left + SAFE.right) / 2;

// Entrances: expo-out bezier. Exits: cubic-in, ~40% shorter than the entrance.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.in(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

// Hero entrances get a small "kick" overshoot.
export const KICK = {damping: 14, stiffness: 160, mass: 1} as const;

export const TIMING = {
  charStagger: 1.2,
  charEnter: 22, // bezier char reveal duration (non-hero text)
  wordExitStagger: 2,
  exit: 13, // ≈ 0.6 × charEnter
  labelEnter: 26,
  minHold: 42, // 0.7s
} as const;

export const STROKE = {
  line: 4,
  icon: 1.75,
  pepper: 6.5, // in the pepper's own viewBox units
} as const;
