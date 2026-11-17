/**
 * Every timing, string, colour and layout value for the video lives here.
 * Scenes read their window and text from SCENES; change a number here and the whole video follows.
 */
import {Easing} from 'remotion';

export const VIDEO = {
  id: 'CryptoExplainer',
  width: 1080,
  height: 1920,
  fps: 30,
  seconds: 30, // hard limit
} as const;
export const TOTAL_FRAMES = VIDEO.fps * VIDEO.seconds; // 900

/** Seconds → frames. */
export const sec = (s: number) => Math.round(s * VIDEO.fps);

export const COLORS = {
  bgDeep: '#0A0A0A',
  bgLift: '#141414',
  gold: '#D4AF37',
  goldLight: '#F3DC85',
  goldPale: '#FFF1C2',
  goldDeep: '#8C6B1C',
  goldShadow: '#4A3810',
  text: '#F5F1E6',
  textDim: 'rgba(245,241,230,0.62)',
  strike: '#C4513F', // the line through the bank and government icons
};

export const FONT = {
  family: "'Cairo', sans-serif",
  headlineWeight: 800,
  bodyWeight: 600,
  lineHeight: 1.5,
};

/** Social UI overlays: nothing important above TOP or below height − BOTTOM. */
export const SAFE = {top: 250, bottom: 350, side: 80};
export const SAFE_BOTTOM_Y = VIDEO.height - SAFE.bottom; // 1570

/** Where the visual of each scene is centred (below the headline). */
export const STAGE = {cx: VIDEO.width / 2, cy: 1130};

/** Crossfade between scenes, in seconds (each side of the cut gets half). */
export const TRANSITION = 0.6;

export const EASE = {
  inOut: Easing.inOut(Easing.cubic),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
};
/** Springs are critically damped: smooth, no bounce. */
export const SPRING = {damping: 200, mass: 1, stiffness: 80};

export const WORDS = {
  delay: 0.3, // seconds after the scene starts before the first word
  stagger: 0.16, // seconds between words
  rise: 26, // px each word rises as it appears
  blur: 10, // px of blur each word clears
};

export type SceneId = 'hook' | 'decentral' | 'blockchain' | 'verify' | 'trade' | 'endcard';

export type SceneConfig = {
  id: SceneId;
  from: number; // seconds
  to: number; // seconds
  /** One entry per line, in reading order. Wrap a word in *asterisks* to set it in gold. */
  lines: string[];
  fontSize: number;
  /** Vertical position of the headline block (its top edge). */
  textTop: number;
  /** Reading direction; Arabic scenes are 'rtl' (the default), the English outro is 'ltr'. */
  dir?: 'rtl' | 'ltr';
};

export const SCENES: SceneConfig[] = [
  {
    id: 'hook',
    from: 0,
    to: 4,
    lines: ['ما هي', '*العملات* *الرقمية؟*'],
    fontSize: 104,
    textTop: 330,
  },
  {
    id: 'decentral',
    from: 4,
    to: 10,
    lines: ['نقود *إلكترونية*', 'لا يتحكم بها', 'بنك ولا حكومة'],
    fontSize: 86,
    textTop: 290,
  },
  {
    id: 'blockchain',
    from: 10,
    to: 17,
    lines: ['تعمل عبر *البلوكتشين:*', 'دفتر رقمي مشترك', 'يسجّل كل عملية'],
    fontSize: 80,
    textTop: 300,
  },
  {
    id: 'verify',
    from: 17,
    to: 23,
    lines: ['*آلاف* *المشاركين*', 'يتحققون من كل عملية،', 'ولا يمكن تعديلها'],
    fontSize: 74,
    textTop: 300,
  },
  {
    id: 'trade',
    from: 23,
    to: 27,
    lines: ['تداولها متاح', 'على مدار *٢٤* *ساعة*'],
    fontSize: 96,
    textTop: 330,
  },
  {
    id: 'endcard',
    from: 27,
    to: 30,
    lines: ['Follow *Miran* *Gold*', 'and learn more'],
    fontSize: 84,
    textTop: 1230,
    dir: 'ltr',
  },
];

export const sceneById = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

/**
 * Audio slots. Drop the files into public/ and they play automatically (Studio and render);
 * when a file is missing its slot is skipped and the render still carries a silent audio track.
 */
export const AUDIO = {
  voiceover: {file: 'voiceover.mp3', startAt: 0.2, volume: 1},
  music: {file: 'ambient.mp3', volume: 0.16, duckedVolume: 0.09, fadeIn: 1.2, fadeOut: 1.8},
};

export const LOGO = {file: 'logo.png', size: 560, cy: 860};
