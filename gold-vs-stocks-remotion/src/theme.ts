import {Easing} from 'remotion';

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 1980};

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
  blueA: '#5B8DEF',
  blueB: '#8FB3FF',
  red: '#D9534F',
  glassFill: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  ink: '#0A0E18',
};

export const GOLD_GRADIENT = `linear-gradient(100deg, ${COLORS.goldA} 0%, ${COLORS.goldB} 55%, ${COLORS.goldA} 100%)`;
export const BLUE_GRADIENT = `linear-gradient(100deg, ${COLORS.blueA} 0%, ${COLORS.blueB} 55%, ${COLORS.blueA} 100%)`;

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
  wordmarkTop: 150, // below the TikTok / Instagram top tabs
  headlineTop: 420, // headlines sit in the upper-middle third
  visualTop: 760,
  contentWidth: VIDEO.width - SAFE.side * 2, // symmetric margins keep everything clear of the right safe zone
};

// Scene frame ranges at 60fps (overlaps are intentional: each scene starts 10 frames before the previous ends)
export const SCENES = {
  hook: [0, 180],
  stocks: [170, 480],
  gold: [470, 840],
  crisis: [830, 1140],
  longTerm: [1130, 1440],
  tip: [1430, 1740],
  cta: [1730, 1980],
} as const;
