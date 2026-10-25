import {Easing} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 60;
export const DURATION = 1800;

// Hot Pepper Media
export const HPM = {
  red: '#E23B24',
  charcoal: '#0F0F0F',
  cream: '#FEF9EF',
  peach: '#FFD7C9',
  gray: '#E7E4DF',
} as const;

// Bean & Bloom (fictional client), the brand we "built" in the makeover.
// Hot Red appears only as a tiny accent.
export const CLIENT = {
  espresso: '#2B1D16',
  oat: '#F3EBDD',
  oatDeep: '#E7DAC5',
  sage: '#8FA58A',
  sageDeep: '#6F8769',
  accent: HPM.red,
} as const;

// The bland "before" world.
export const BLAND = {
  bg: '#CFCFCF',
  text: '#8A8A8A',
  textDark: '#5E5E5E',
  bubble: '#DEDEDE',
  screen: '#F2F2F2',
  filter: 'grayscale(1) contrast(0.85)',
} as const;

export const FONT = {
  brand: 'Montserrat',
  arial: 'Arimo', // Arial look-alike
  times: 'Tinos', // Times New Roman look-alike
} as const;

export const WEIGHT = {body: 500, label: 600, headline: 800} as const;

export const TYPE = {
  headlineTracking: '-0.03em',
  labelTracking: '0.08em',
  sloganTracking: '0.3em',
} as const;

// Reels/TikTok safe area: keep the right 140px and bottom 320px free of key content.
export const SAFE = {left: 80, right: 940, top: 140, bottom: 1600} as const;

// Entrances: expo-out bezier. Exits: cubic-in, ~40% shorter than the entrance.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.in(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

// Hero elements get the "kick": a spring with a little overshoot.
export const KICK = {damping: 14, stiffness: 160, mass: 1} as const;

export const TIMING = {
  charStagger: 1.2,
  minHold: 42, // 0.7s
  exitRatio: 0.6,
} as const;

export const LINE_WIDTH = 5;
