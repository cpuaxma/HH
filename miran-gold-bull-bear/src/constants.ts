import {Easing} from 'remotion';

/** Video format. */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 45 * 30,
} as const;

export const COLORS = {
  bg: '#0A0A0A',
  bgRaised: '#121212',
  gold: '#D4AF37',
  goldLight: '#F3D77A',
  goldDeep: '#9C7A1C',
  green: '#22C55E',
  red: '#EF4444',
  white: '#F5F2EA',
  muted: '#9A968C',
  grid: 'rgba(255, 255, 255, 0.05)',
} as const;

export const FONT = {
  family: '"Cairo", "Noto Color Emoji", sans-serif',
  regular: 400,
  semibold: 600,
  bold: 700,
  heavy: 900,
} as const;

/**
 * Text safe zone: nothing readable above SAFE.top or below SAFE.bottom.
 * (250px clear at the top, 340px clear at the bottom.)
 */
export const SAFE = {
  top: 250,
  bottom: VIDEO.height - 340, // y = 1580
  side: 70,
} as const;

/** Captions sit in a band that ends this far above the bottom edge of the frame. */
export const CAPTION_BOTTOM = 400; // caption bottom edge at y = 1520

/** Seconds → frames. */
export const s = (seconds: number) => Math.round(seconds * VIDEO.fps);

/** Fade/slide transition between scenes (0.4s). */
export const TRANSITION = s(0.4);

/** Scene windows in seconds, matching the voice-over. */
export const SCENES = {
  hook: {start: 0, end: 3},
  bull: {start: 3, end: 13},
  bear: {start: 13, end: 23},
  compare: {start: 23, end: 31},
  todo: {start: 31, end: 39},
  outro: {start: 39, end: 45},
} as const;

export type SceneKey = keyof typeof SCENES;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
} as const;

/** Spring presets. */
export const SPRING = {
  smooth: {damping: 200},
  pop: {damping: 11, stiffness: 160, mass: 0.8},
  slam: {damping: 14, stiffness: 260, mass: 0.9},
  soft: {damping: 18, stiffness: 90},
} as const;

/** Audio levels. Music is ducked under the voice-over. */
export const AUDIO = {
  voiceover: 1,
  music: 0.08,
  musicNoVoiceover: 0.2,
} as const;

export const ASSETS = {
  logo: 'logo.png',
  voiceover: 'voiceover.mp3',
  music: 'music.mp3',
} as const;
