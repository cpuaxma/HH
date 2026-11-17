import {Easing} from 'remotion';

/** Miran Gold brand tokens for the "Week Ahead" series. Everything visual reads from here. */

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 2520}; // 3s intro + 39s main

/** 120 BPM bed: one beat = 0.5s = 30 frames at 60fps. */
export const BEAT = 30;

/**
 * v3 palette: monochrome blue + gold (after the reference reel).
 * Blue does all the structure; gold is the only accent; red only for "down".
 */
export const C = {
  bg0: '#07123A', // top
  bg1: '#0A1848', // middle
  bg2: '#0F2C96', // bottom-right bloom
  peri: '#A7BCFE', // periwinkle: eyebrows, sources, secondary
  periDim: 'rgba(167,188,254,0.65)',
  gold0: '#FFE08A',
  gold1: '#F5C451',
  gold2: '#C8922A',
  text: '#FFFFFF',
  label: '#A7BCFE',
  red: '#FF5A6E',
  green: '#F5C451', // no green in v3: "support for gold" reads in gold
  glassFill: 'rgba(44,64,135,0.30)',
  glassBorder: 'rgba(167,188,254,0.22)',
  glassHi: 'rgba(255,255,255,0.08)',
  grid: 'rgba(140,165,255,0.07)',
};

export const GOLD = `linear-gradient(180deg, ${C.gold0} 0%, ${C.gold1} 60%, ${C.gold1} 100%)`;
export const GOLD_V = GOLD;

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
/** Layout (v3): one strong right edge; visual zone on top, headline zone below. */
export const SAFE = {top: 220, bottom: 380, right: 100, left: 100};
export const LAYOUT = {
  topBarY: 262, // logo + pill row
  visualTop: 420,
  visualBottom: 980,
  eyebrowY: 1030,
  headlineY: 1086,
  sourceY: 1436,
  disclaimerY: 1500,
  marginX: 100,
  contentW: 880,
  cardWidth: 880,
  // legacy keys kept for older components
  stripY: 330,
  stageTop: 420,
  stageBottom: 980,
  captionTop: 1086,
  contentLeft: 100,
  contentRight: 980,
};
