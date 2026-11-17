import {Easing} from 'remotion';

/** Miran Gold brand tokens for the "Week Ahead" series. Everything visual reads from here. */

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 2520}; // 3s intro + 39s main

/** 120 BPM bed: one beat = 0.5s = 30 frames at 60fps. */
export const BEAT = 30;

export const C = {
  bg0: '#060B1A',
  bg1: '#0B1838',
  bg2: '#0E1F47',
  gold0: '#F7DE8C',
  gold1: '#D4AF37',
  gold2: '#A8801F',
  text: '#F3F0E8',
  label: '#8A93AD',
  red: '#FF5A5F',
  green: '#4ADE80',
  glassFill: 'rgba(11, 24, 56, 0.70)',
  glassBorder: 'rgba(212, 175, 55, 0.25)',
  glassHi: 'rgba(255, 255, 255, 0.10)',
  grid: 'rgba(138, 147, 173, 0.06)',
};

export const GOLD = `linear-gradient(100deg, ${C.gold2} 0%, ${C.gold1} 30%, ${C.gold0} 55%, ${C.gold1} 78%, ${C.gold2} 100%)`;
export const GOLD_V = `linear-gradient(180deg, ${C.gold0} 0%, ${C.gold1} 55%, ${C.gold2} 100%)`;

export const FONT = {
  ar: "'IBM Plex Sans Arabic', sans-serif",
  en: "'Poppins', sans-serif",
  arBody: 500,
  arBold: 700,
};

/** Tabular figures for every number. */
export const NUM: React.CSSProperties = {fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1, "lnum" 1'};

export const EASE = {
  enter: Easing.bezier(0.22, 1, 0.36, 1),
  move: Easing.bezier(0.65, 0, 0.35, 1),
  exit: Easing.bezier(0.55, 0, 0.75, 0.2),
};

/** Springs for cards and pills (damping 14–18 per the brief). */
export const SPRING = {
  card: {damping: 16, stiffness: 120, mass: 1},
  pill: {damping: 14, stiffness: 160, mass: 0.8},
  slide: {damping: 18, stiffness: 110, mass: 1},
  bar: {damping: 12, stiffness: 120, mass: 1},
};

export const MOTION = {
  wordStagger: 4, // ≈70ms at 60fps
  wordEnter: 26,
  wordBlur: 8,
  wordRise: 24,
  overlap: 10, // scenes overlap by 8–12 frames
  push: 0.04, // camera push 1.00 → 1.04 per shot
};

/** Layout. IG/TikTok UI: no text in the top 220px or bottom 380px; right 140px clear of the action rail. */
export const SAFE = {top: 220, bottom: 380, right: 140, left: 60};
export const LAYOUT = {
  topBarY: 232, // persistent wordmark + date pill
  stripY: 330, // day strip
  stageTop: 500,
  stageBottom: 1270,
  captionTop: 1290,
  disclaimerY: 1505, // bottom edge of disclaimer sits at 1540 = 1920 − 380
  contentLeft: 120,
  contentRight: 960, // 1080 − 120; rail-sensitive elements stay ≤ 940
  cardWidth: 820,
};
