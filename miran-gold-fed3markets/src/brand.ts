// Every visual token for the reel: colours, lane colours, fonts, easing, springs, beat grid, safe zones.
import {Easing} from 'remotion';

export const VIDEO = {width: 1080, height: 1920, fps: 60, durationInFrames: 2640};

/** 120 BPM at 60fps: one beat = 30 frames = 0.5s. Every major hit lands on a beat or half-beat. */
export const BEAT = 30;
export const HALF = 15;

export const C = {
  bg0: '#060B1A',
  bg1: '#0B1838',
  text: '#F3F0E8',
  slate: '#8A93AD',
  red: '#FF5A5F',
  green: '#4ADE80',
  gold1: '#F7DE8C',
  gold2: '#D4AF37',
  gold3: '#A8801F',
  nasdaq: '#7C8CFF',
  spx: '#5EC8D8',
  glassFill: 'rgba(11, 24, 56, 0.70)',
  glassBorder: 'rgba(212, 175, 55, 0.25)',
  ink: '#060B1A',
};

export const GOLD_GRADIENT = `linear-gradient(135deg, ${C.gold1} 0%, ${C.gold2} 52%, ${C.gold3} 100%)`;

export type LaneKey = 'nasdaq' | 'spx' | 'gold';

export const LANES: Record<LaneKey, {ticker: string; ar: string; color: string; gradient?: string}> = {
  nasdaq: {ticker: 'NASDAQ', ar: 'شركات التكنولوجيا', color: C.nasdaq},
  spx: {ticker: 'S&P 500', ar: 'أكبر 500 شركة', color: C.spx},
  gold: {ticker: 'XAU/USD', ar: 'الذهب مقابل الدولار', color: C.gold2, gradient: GOLD_GRADIENT},
};
export const LANE_ORDER: LaneKey[] = ['nasdaq', 'spx', 'gold'];

/** Bloom tint per chapter (always ~8–10% opacity). */
export const BLOOM = {
  neutral: C.gold2,
  nasdaq: '#6E5BFF', // blue-violet
  spx: '#3F8C9A', // slate-teal
  gold: C.gold2,
};

export const FONT = {
  ar: "'IBM Plex Sans Arabic', sans-serif",
  en: "'Poppins', sans-serif",
  arBold: 700,
  arMedium: 500,
  enSemi: 600,
  enBold: 700,
};

export const EASE = {
  entry: Easing.bezier(0.22, 1, 0.36, 1),
  move: Easing.bezier(0.65, 0, 0.35, 1),
  exit: Easing.bezier(0.55, 0, 1, 0.45),
};

export const SPRING = {
  card: {damping: 16, stiffness: 120, mass: 1},
  pill: {damping: 18, stiffness: 160, mass: 0.8},
  slam: {damping: 14, stiffness: 180, mass: 1.1},
};

export const WORD = {stagger: 4, enter: 24, blur: 8, rise: 24}; // 4 frames = ~70ms at 60fps

export const SAFE = {top: 220, bottom: 380, right: 140};

/** Vertical layout bands (px). Captions sit in the lower third, the disclaimer just above the bottom safe zone. */
export const LAYOUT = {
  chromeTop: 240,
  captionTop: 1290,
  disclaimerTop: 1492,
  railW: 800,
  railH: 124,
  railX: 140,
};
