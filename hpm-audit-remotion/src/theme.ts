import {Easing} from 'remotion';

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 2460; // 41 s = 82 beats

// Beat grid. 120 BPM with the first downbeat on frame 0 = one beat every 30 frames.
// Change BPM and every cue built with beat() moves with it.
export const BPM = 120;
export const BEAT = (FPS * 60) / BPM;
export const beat = (n: number) => Math.round(n * BEAT);

export const C = {
  red: '#E23B24',
  charcoal: '#0F0F0F',
  cream: '#FEF9EF',
  peach: '#FFD7C9',
  gray: '#E7E4DF',
  // Fictional client, "after" palette: loud on purpose, so the rebrand pops against the grey before
  espresso: '#2B1D16',
  oat: '#FFF4E2',
  cobalt: '#2F4BFF',
  butter: '#FFD23F',
  pink: '#FF8FB8',
  // App chrome (generic profile UI)
  white: '#FFFFFF',
  ink: '#1C1C1C',
  muted: '#8A8A8A',
  hairline: '#DBDBDB',
} as const;

export const FONT = "'Montserrat', sans-serif";
export const FONT_APP = "'Arimo', sans-serif";
export const FONT_SERIF = "'Tinos', serif";

// Overlay entrance spring: slight overshoot.
export const SPRING = {damping: 12, stiffness: 200, mass: 1};

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_WHIP = Easing.bezier(0.83, 0, 0.17, 1);

// Reels UI safe zones: key text stays inside x ∈ [SAFE.left, WIDTH - SAFE.right], y < HEIGHT - SAFE.bottom.
export const SAFE = {left: 64, right: 140, bottom: 320, top: 96};
export const TEXT_MAX_X = WIDTH - SAFE.right; // 940
export const TEXT_MAX_Y = HEIGHT - SAFE.bottom; // 1600

// Kinetic headlines
export const SLAM = {from: 1.4, frames: 6, exitFrames: 8, shakePx: 3, minSize: 120, maxSize: 170};
export const PUNCH = {amount: 0.08, attack: 4, release: 12};
export const HEADLINE_TOP = 236;
