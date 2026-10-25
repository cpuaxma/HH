import {Easing} from 'remotion';

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 1980;

export const colors = {
  bgTop: '#0A0E18',
  bgBottom: '#131A2A',
  glow: '#C8963E',
  text: '#F5F1E8',
  goldFrom: '#D4A24C',
  goldTo: '#F3D27A',
  goldDeep: '#9A6E25',
  dollar: '#D9534F',
  green: '#4CC38A',
  mapDot: '#2A3550',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  muted: 'rgba(245,241,232,0.4)',
  disclaimer: 'rgba(245,241,232,0.5)',
  ink: '#141018',
};

export const goldGradientCss = `linear-gradient(100deg, ${colors.goldFrom} 0%, ${colors.goldTo} 55%, ${colors.goldFrom} 100%)`;

export const fonts = {
  en: "'Sora', sans-serif",
  ar: "'IBM Plex Sans Arabic', sans-serif",
};

export const ease = {
  // Entrances: expo-like out curve
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  // Exits: accelerate away
  exit: Easing.in(Easing.cubic),
  // Transitions: a fast sweep that still reads across the frame
  sweep: Easing.bezier(0.45, 0, 0.25, 1),
  // Ambient drift
  inOut: Easing.inOut(Easing.sin),
};

export const springs = {
  // Critically damped: text and UI
  smooth: {damping: 200},
  // Hero objects: soft overshoot
  hero: {damping: 13, mass: 0.9, stiffness: 90},
};

export const text = {
  // Per-unit entrance and exit durations (frames). Exits run ~40% faster.
  enterDuration: 25,
  exitDuration: 15,
  enStagger: 1.5,
  enExitStagger: 0.5,
  arStagger: 4,
  arExitStagger: 2,
  blur: 8,
  rise: 18,
  startSpacing: 0.35,
  lineHeight: {en: 1.15, ar: 1.5},
  headline: {en: 72, ar: 64},
};

export const layout = {
  // Content box: symmetric 140px gutters so centred content clears the right UI rail
  safeLeft: 140,
  safeRight: 940,
  safeWidth: 800,
  safeBottom: 1600,
  wordmarkY: 140,
  headlineY: 480,
};
