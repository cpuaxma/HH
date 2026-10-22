import {Easing} from 'remotion';

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 3600;

export const colors = {
  base: '#07090F',
  navy: '#0F1524',
  text: '#F5F1E8',
  goldFrom: '#D4A24C',
  goldTo: '#F3D27A',
  goldDeep: '#9A6E25',
  red: '#D9534F',
  green: '#3FB68B',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  muted: 'rgba(245,241,232,0.4)',
  disclaimer: 'rgba(245,241,232,0.5)',
  ink: '#07090F',
};

// Per-side lighting: Ray is cold with a red rim, Sam is warm with a gold rim
export const lighting = {
  ray: {fill: '#1A2438', rim: '#D9534F', wallTop: '#1A2438', wallBottom: '#0C111D', screenGlow: '#5B7BC4'},
  sam: {fill: '#2A2012', rim: '#D4A24C', wallTop: '#2A2012', wallBottom: '#140F08', screenGlow: '#F3C774'},
};

export const goldGradientCss = `linear-gradient(100deg, ${colors.goldFrom} 0%, ${colors.goldTo} 55%, ${colors.goldFrom} 100%)`;

export const fonts = {
  en: "'Sora', sans-serif",
  ar: "'IBM Plex Sans Arabic', sans-serif",
};

export const ease = {
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.sin),
  sweep: Easing.bezier(0.45, 0, 0.25, 1),
};

export const springs = {
  smooth: {damping: 200},
  hero: {damping: 13, mass: 0.9, stiffness: 90},
  pop: {damping: 14, mass: 0.6, stiffness: 180},
};

export const layout = {
  wordmark: {top: 60, bottom: 110},
  headline: {top: 160, bottom: 400},
  panel: {top: 420, bottom: 1460, height: 1040},
  tags: {top: 1470, bottom: 1580},
  safeBottom: 1600,
  safeLeft: 140,
  safeRight: 940,
  divider: 540,
  // Character art box (box-local 0..BOX_W, facing the divider). Ray's box sits at
  // global x 132..524; Sam's is mirrored into 548..940 so the right 140px stay free.
  boxW: 392,
  rayBoxX: 132,
  samBoxX: 548,
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
};
