/**
 * Everything you are likely to tweak lives here: colors, fonts, the emotion color script, the 3D
 * track's curve points, timings, all on-screen text and every audio cue.
 * All frame numbers are GLOBAL frames at 30 fps (30 frames = 1 second) unless noted.
 */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1350, // exactly 45 seconds
};

// ---------------------------------------------------------------------------------------------
// Brand colors (default: the dark gold from sp500-remotion). Swap these for the client's colors.
// ---------------------------------------------------------------------------------------------
export const COLORS = {
  bg: '#0A0A0A',
  gold: '#D4AF37',
  goldLight: '#F5D77A',
  goldDeep: '#8C6D1F',
  text: '#F6F1E3', // warm off-white
  textMuted: 'rgba(246, 241, 227, 0.62)',
  red: '#FF3B3B',
  redDeep: '#B3121F',
  ice: '#A9B8CC', // cold blue-grey
  hot: '#FFF6DA', // white-hot gold
  green: '#C9C75A', // warm green-gold
};

export const GRADIENTS = {
  gold: `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 52%, ${COLORS.goldDeep} 100%)`,
  white: `linear-gradient(180deg, #FFFFFF 0%, ${COLORS.text} 100%)`,
  red: 'linear-gradient(180deg, #FF8A7A 0%, #FF3B3B 50%, #B3121F 100%)',
  ice: 'linear-gradient(180deg, #E4ECF5 0%, #A9B8CC 55%, #6E7E94 100%)',
  hot: 'linear-gradient(180deg, #FFFFFF 0%, #FFF3C4 45%, #F5D77A 100%)',
  dawn: 'linear-gradient(180deg, #FFE2B8 0%, #FFB070 55%, #D9823F 100%)',
  green: 'linear-gradient(180deg, #F1EDA0 0%, #C9C75A 55%, #8C8A2A 100%)',
  amber: 'linear-gradient(180deg, #FFE0A0 0%, #FFA436 55%, #B8651A 100%)',
};
export type Accent = keyof typeof GRADIENTS;

// ---------------------------------------------------------------------------------------------
// Fonts (loaded through @remotion/google-fonts in fonts.ts)
// ---------------------------------------------------------------------------------------------
export const FONT = {
  arabic: 'Cairo',
  weightRegular: 600,
  weightBold: 800,
  weightBlack: 900,
};

// ---------------------------------------------------------------------------------------------
// Safe zone: text stays inside the center 900 px, clear of the top 250 px and bottom 350 px.
// `npm run check:safe` verifies this on every frame.
// ---------------------------------------------------------------------------------------------
export const SAFE = {
  left: 90,
  right: 990,
  top: 250,
  bottom: 1570,
  textWidth: 860,
};

// ---------------------------------------------------------------------------------------------
// THE TRACK. One editable list of curve points. x = time (left to right, like a market chart),
// y = price / emotion, z = sideways swing of the rollercoaster (it flattens to 0 in the reveal).
// `stage` marks where an emotion lives on the curve; its label appears when the orb gets there.
// The chart you see at the end is exactly (x, y) of this list.
// ---------------------------------------------------------------------------------------------
export type StageKey =
  | 'calm'
  | 'optimism'
  | 'excitement'
  | 'thrill'
  | 'euphoria'
  | 'peak'
  | 'anxiety'
  | 'denial'
  | 'fear'
  | 'panic'
  | 'capitulation'
  | 'despondency'
  | 'hope'
  | 'relief'
  | 'optimism2'
  | 'end';

export const TRACK_POINTS: {x: number; y: number; z: number; stage?: StageKey}[] = [
  {x: -6, y: 5, z: 0},
  {x: 0, y: 6, z: 0, stage: 'calm'},
  {x: 8, y: 8.5, z: 3},
  {x: 16, y: 12, z: 5, stage: 'optimism'},
  {x: 24, y: 16.5, z: 2},
  {x: 31, y: 22, z: -3, stage: 'excitement'},
  {x: 37, y: 30, z: -5},
  {x: 41.5, y: 38.5, z: -2, stage: 'thrill'},
  {x: 45, y: 47, z: 2},
  {x: 48, y: 53, z: 3, stage: 'euphoria'},
  {x: 51.5, y: 56, z: 1, stage: 'peak'},
  {x: 55, y: 52, z: -1.5, stage: 'anxiety'},
  {x: 58, y: 47.5, z: -3.5},
  {x: 61, y: 49, z: -4.5, stage: 'denial'}, // the little "it will come back" bounce
  {x: 64, y: 42, z: -3},
  {x: 67, y: 33, z: -0.5, stage: 'fear'},
  {x: 70, y: 22, z: 2.5, stage: 'panic'},
  {x: 73, y: 11, z: 4, stage: 'capitulation'},
  {x: 77, y: 4, z: 3},
  {x: 82, y: 1, z: 0, stage: 'despondency'},
  {x: 88, y: 2, z: -2},
  {x: 93, y: 6, z: -2.5, stage: 'hope'},
  {x: 99, y: 10.5, z: -1, stage: 'relief'},
  {x: 106, y: 15.5, z: 2, stage: 'optimism2'},
  {x: 113, y: 20, z: 3},
  {x: 120, y: 24, z: 0, stage: 'end'},
  {x: 126, y: 27, z: -1},
];

// ---------------------------------------------------------------------------------------------
// THE EMOTION COLOR SCRIPT. Each stage sets the world: light/track color, grade, heart rate,
// fear/greed needle and effects. Values blend smoothly between stages as the orb moves, so a
// rewind runs the colors backwards automatically.
//   color     light, orb and track glow
//   sat       post saturation (1 = normal, 0 = monochrome)
//   tint      how strongly the whole picture is graded toward `color` (0..1)
//   exposure  overall brightness
//   bpm       heart-rate HUD
//   greed     fear/greed needle, -1 = extreme fear, +1 = extreme greed
//   shake     base camera shake, split = RGB split, vignette = edge darkness, fog = fog banks
//   drift     particle drift speed (up = +), embers = red ember rate
// ---------------------------------------------------------------------------------------------
export type Stage = {
  key: StageKey;
  word?: string;
  color: string;
  sat: number;
  tint: number;
  exposure: number;
  bpm: number;
  greed: number;
  shake: number;
  split: number;
  vignette: number;
  fog: number;
  drift: number;
};

export const STAGES: Stage[] = [
  {key: 'calm', color: '#D4AF37', sat: 0.95, tint: 0.12, exposure: 1.0, bpm: 62, greed: 0.05, shake: 0, split: 0, vignette: 0.45, fog: 0.35, drift: 0.01},
  {key: 'optimism', word: 'تفاؤل', color: '#E2BC4A', sat: 1.0, tint: 0.1, exposure: 1.03, bpm: 72, greed: 0.25, shake: 0, split: 0, vignette: 0.42, fog: 0.3, drift: 0.015},
  {key: 'excitement', word: 'حماس', color: '#CFCB55', sat: 1.08, tint: 0.12, exposure: 1.06, bpm: 88, greed: 0.5, shake: 0.03, split: 0, vignette: 0.4, fog: 0.25, drift: 0.02},
  {key: 'thrill', word: 'إثارة', color: '#F2D46A', sat: 1.12, tint: 0.12, exposure: 1.1, bpm: 104, greed: 0.72, shake: 0.06, split: 0.0005, vignette: 0.38, fog: 0.2, drift: 0.03},
  {key: 'euphoria', word: 'نشوة', color: '#FFF1C8', sat: 1.05, tint: 0.16, exposure: 1.22, bpm: 126, greed: 0.95, shake: 0.08, split: 0.001, vignette: 0.32, fog: 0.2, drift: 0.035},
  {key: 'peak', color: '#FFF6DA', sat: 0.9, tint: 0.18, exposure: 1.06, bpm: 118, greed: 1.0, shake: 0, split: 0, vignette: 0.5, fog: 0.25, drift: 0.004},
  {key: 'anxiety', word: 'قلق', color: '#FFA436', sat: 1.0, tint: 0.16, exposure: 1.02, bpm: 110, greed: 0.35, shake: 0.08, split: 0.001, vignette: 0.5, fog: 0.3, drift: 0.03},
  {key: 'denial', word: 'إنكار', color: '#FF7A2A', sat: 1.0, tint: 0.2, exposure: 1.0, bpm: 108, greed: 0.1, shake: 0.1, split: 0.0015, vignette: 0.55, fog: 0.3, drift: 0.05},
  {key: 'fear', word: 'خوف', color: '#F0412F', sat: 1.05, tint: 0.28, exposure: 0.98, bpm: 128, greed: -0.45, shake: 0.22, split: 0.003, vignette: 0.75, fog: 0.35, drift: 0.12},
  {key: 'panic', word: 'ذعر', color: '#FF1530', sat: 1.12, tint: 0.36, exposure: 1.0, bpm: 148, greed: -0.95, shake: 0.5, split: 0.007, vignette: 0.8, fog: 0.35, drift: 0.3},
  {key: 'capitulation', word: 'استسلام', color: '#C0283A', sat: 0.85, tint: 0.32, exposure: 0.92, bpm: 138, greed: -1.0, shake: 0.3, split: 0.004, vignette: 0.8, fog: 0.45, drift: 0.18},
  {key: 'despondency', word: 'إحباط', color: '#7F93B0', sat: 0.12, tint: 0.55, exposure: 0.78, bpm: 58, greed: -0.82, shake: 0, split: 0, vignette: 0.7, fog: 1.0, drift: -0.004},
  {key: 'hope', word: 'أمل', color: '#FFB070', sat: 0.5, tint: 0.18, exposure: 0.92, bpm: 66, greed: -0.45, shake: 0, split: 0, vignette: 0.6, fog: 0.8, drift: 0.008},
  {key: 'relief', word: 'ارتياح', color: '#F0C36A', sat: 0.88, tint: 0.12, exposure: 1.0, bpm: 70, greed: -0.1, shake: 0, split: 0, vignette: 0.5, fog: 0.5, drift: 0.012},
  {key: 'optimism2', word: 'تفاؤل', color: '#D4AF37', sat: 1.0, tint: 0.1, exposure: 1.04, bpm: 72, greed: 0.25, shake: 0, split: 0, vignette: 0.45, fog: 0.35, drift: 0.015},
  {key: 'end', color: '#D4AF37', sat: 1.0, tint: 0.08, exposure: 1.0, bpm: 70, greed: 0.3, shake: 0, split: 0, vignette: 0.45, fog: 0.3, drift: 0.01},
];

// ---------------------------------------------------------------------------------------------
// Scene timing (global frames). Neighbouring scenes overlap by 10 frames.
// ---------------------------------------------------------------------------------------------
export const SCENES = {
  coldOpen: {from: 0, duration: 100}, //  0:00 - 0:03
  rewind: {from: 90, duration: 80}, //    0:03 - 0:05.7
  question: {from: 160, duration: 90}, // 0:05.3 - 0:08.3
  ride: {from: 240, duration: 520}, //    0:08 - 0:25
  reveal: {from: 750, duration: 130}, //  0:25 - 0:29
  crowd: {from: 870, duration: 130}, //   0:29 - 0:33
  quote: {from: 990, duration: 145}, //   0:33 - 0:37.5
  lesson: {from: 1125, duration: 85}, //  0:37.5 - 0:40
  cta: {from: 1200, duration: 150}, //    0:40 - 0:45
};

/**
 * Where the orb is on the track over time (arc-length position, by stage + offset in world units).
 * Interpolated with a monotone cubic, so speed changes are smooth and nothing moves linearly.
 */
export const ORB_PATH: {f: number; at: StageKey; off?: number}[] = [
  // cold open: plunging down the red section
  {f: 0, at: 'fear', off: -6},
  {f: 40, at: 'panic', off: -1},
  {f: 84, at: 'capitulation', off: 1},
  {f: 92, at: 'capitulation', off: 1.6}, // tape stop
  // rewind: back up the whole track
  {f: 138, at: 'calm'},
  // the question: still
  {f: 240, at: 'calm'},
  // the ride
  {f: 262, at: 'optimism'},
  {f: 294, at: 'excitement'},
  {f: 324, at: 'thrill'},
  {f: 354, at: 'euphoria'},
  {f: 380, at: 'peak', off: -0.6},
  {f: 444, at: 'peak', off: 0.5}, // hang time at the summit
  {f: 462, at: 'anxiety'},
  {f: 486, at: 'denial'},
  {f: 510, at: 'fear'},
  {f: 534, at: 'panic'},
  {f: 560, at: 'capitulation'},
  {f: 590, at: 'despondency', off: -1.5},
  {f: 650, at: 'despondency', off: 1.8}, // slow motion at the bottom
  {f: 670, at: 'hope'},
  {f: 698, at: 'relief'},
  {f: 726, at: 'optimism2'},
  {f: 790, at: 'end'},
  {f: 1350, at: 'end'},
];

/** Ride label timing: the frame each emotion word lands (the orb reaches its stage here). */
export const RIDE_LABELS: {stage: StageKey; at: number; out: number; fx: EmotionFx}[] = [
  {stage: 'optimism', at: 262, out: 281, fx: 'soft'},
  {stage: 'excitement', at: 294, out: 311, fx: 'pop'},
  {stage: 'thrill', at: 324, out: 341, fx: 'spark'},
  {stage: 'euphoria', at: 354, out: 384, fx: 'swell'},
  {stage: 'anxiety', at: 462, out: 471, fx: 'wobble'},
  {stage: 'denial', at: 482, out: 496, fx: 'strike'},
  {stage: 'fear', at: 512, out: 524, fx: 'fear'},
  {stage: 'panic', at: 536, out: 545, fx: 'panic'},
  {stage: 'capitulation', at: 560, out: 572, fx: 'drop'},
  {stage: 'despondency', at: 594, out: 650, fx: 'heavy'},
  {stage: 'hope', at: 672, out: 686, fx: 'ray'},
  {stage: 'relief', at: 698, out: 714, fx: 'color'},
  {stage: 'optimism2', at: 726, out: 752, fx: 'climb'},
];
export type EmotionFx = 'soft' | 'pop' | 'spark' | 'swell' | 'wobble' | 'strike' | 'fear' | 'panic' | 'drop' | 'heavy' | 'ray' | 'color' | 'climb' | 'flash';

/** Cues inside scenes (global frames). */
export const CUES = {
  coldOpen: {slam: 3, text: 30, glitch: 56, textExit: 78, wordExit: 82, tapeStop: 86},
  rewind: {start: 92, labelsFrom: 95, labelEvery: 4, land: 138, text: 122, textExit: 150},
  question: {text1: 166, text2: 198, shine: 214, exit: 232},
  ride: {
    climbStart: 240,
    peakArrive: 380,
    tiltDown: [392, 424] as [number, number],
    peakCallout: 398,
    peakTag: 410,
    peakCalloutExit: 440,
    dropStart: 446,
    impact: 452,
    bottomArrive: 588,
    bottomCallout: 604,
    bottomTag: 618,
    bottomCalloutExit: 656,
    hopeRay: 664,
    hudExit: 760,
  },
  reveal: {pullBack: [748, 826] as [number, number], flatten: [778, 834] as [number, number], text1: 780, text1Exit: 830, draw: [796, 846] as [number, number], text2: 836, text2Exit: 874, ghosts: [836, 848, 860]},
  crowd: {settle: 872, orbsIn: 880, label: 882, run: [886, 912, 938, 962] as [number, number, number, number], text1: 914, text2: 940, exit: 986},
  quote: {morph: [992, 1030] as [number, number], text1: 1004, text1Exit: 1048, text2: 1052, attribution: 1078, exit: 1120, pulses: [1010, 1046, 1082, 1112]},
  lesson: {morph: [1126, 1146] as [number, number], sweep: [1130, 1196] as [number, number], text1: 1138, text2: 1158, shine: 1176, exit: 1198},
  cta: {coil: [1202, 1246] as [number, number], logo: 1226, logoShine: [1244, 1286, 1322], text: 1252, textShine: [1270, 1306], footnote: 1270, pulses: [1236, 1276, 1316]},
};

/** Camera shake + flash impacts (global frames). */
export const IMPACTS: {frame: number; shake: number; flash: number; color?: string}[] = [
  {frame: 0, shake: 1.0, flash: 0.1, color: '#FF2A2A'},
  {frame: 3, shake: 1.2, flash: 0.16, color: '#FFFFFF'}, // ذعر slams in
  {frame: 56, shake: 0.8, flash: 0.06, color: '#FF2A2A'}, // alarm hit + glitch burst on ذعر
  {frame: 86, shake: 0.6, flash: 0.06, color: '#FFFFFF'}, // tape stop
  {frame: 138, shake: 0.12, flash: 0.03, color: '#F5D77A'}, // rewind lands
  {frame: 452, shake: 0.9, flash: 0.07, color: '#FF3B3B'}, // the drop
  {frame: 536, shake: 0.7, flash: 0.08, color: '#FF1530'}, // ذعر
  {frame: 588, shake: 0.35, flash: 0.0}, // the bottom (sub drop)
];

/** Particle bursts: sparks off the track, gold confetti at euphoria, embers in the panic. */
export const BURSTS: {kind: 'spark' | 'confetti' | 'ember'; from: number; to: number; rate: number}[] = [
  {kind: 'spark', from: 318, to: 352, rate: 9},
  {kind: 'confetti', from: 346, to: 384, rate: 14},
  {kind: 'ember', from: 0, to: 86, rate: 6},
  {kind: 'ember', from: 520, to: 572, rate: 7},
];

// ---------------------------------------------------------------------------------------------
// On-screen text (max 8 words per screen). Eastern Arabic digits only.
// "\n" forces a line break. `accent` maps a word to a color treatment.
// ---------------------------------------------------------------------------------------------
export const TEXT = {
  coldOpen: {
    word: 'ذعر',
    heartRate: 140,
    line: {text: 'هل شعرت بهذا\nمن قبل؟', accent: {} as Record<string, Accent>},
  },
  rewind: {
    line: {text: 'لنبدأ من البداية', accent: {البداية: 'gold'} as Record<string, Accent>},
  },
  question: {
    line1: {text: 'لماذا يشتري الناس\nفي القمة...', accent: {'القمة...': 'hot'} as Record<string, Accent>},
    line2: {text: '...ويبيعون في القاع؟', accent: {'القاع؟': 'ice'} as Record<string, Accent>},
  },
  ride: {
    peakCallout: 'هنا يشتري الأغلبية',
    peakTag: 'أعلى مخاطرة',
    bottomCallout: 'هنا يبيع الأغلبية',
    bottomTag: 'أكبر فرصة',
  },
  hud: {fear: 'خوف', greed: 'طمع', bpmUnit: 'النبض'},
  reveal: {
    line1: {text: 'هذه دورة\nمشاعر المستثمر', accent: {مشاعر: 'gold', المستثمر: 'gold'} as Record<string, Accent>},
    line2: {text: 'والسوق يكرّرها...\nمرة بعد مرة', accent: {مرة: 'gold'} as Record<string, Accent>},
  },
  crowd: {
    crowd: 'الجمهور',
    buy: 'شراء',
    sell: 'بيع',
    line1: {text: 'العاطفة تشتري غالياً...', accent: {'غالياً...': 'red'} as Record<string, Accent>},
    line2: {text: '...وتبيع رخيصاً', accent: {رخيصاً: 'red'} as Record<string, Accent>},
  },
  quote: {
    line1: {text: 'كن خائفاً\nحين يطمع الآخرون...', accent: {خائفاً: 'gold'} as Record<string, Accent>},
    line2: {text: '...وطمّاعاً\nحين يخافون', accent: {'...وطمّاعاً': 'gold'} as Record<string, Accent>},
    attribution: 'وارن بافيت',
  },
  lesson: {
    line1: {text: 'تحكّم بمشاعرك...', accent: {'بمشاعرك...': 'gold'} as Record<string, Accent>},
    line2: {text: '...قبل أن تتحكم\nبأموالك', accent: {بأموالك: 'gold'} as Record<string, Accent>},
  },
  cta: {
    // Replace with the client's call to action
    line: {text: 'تابعنا لتتعلّم الاستثمار\nبعقل هادئ', accent: {بعقل: 'gold', هادئ: 'gold'} as Record<string, Accent>},
    footnote: 'محتوى تعليمي وليس نصيحة استثمارية',
    // Shown when /public/logo.png is missing. Replace with the client's name.
    brand: '[CLIENT NAME]',
  },
};

// ---------------------------------------------------------------------------------------------
// Audio. Every file is optional: it is used only if it exists in /public.
// `npm run cues` regenerates sfx-cues.md from this list.
// ---------------------------------------------------------------------------------------------
export type SfxCue = {frame: number; file: string; volume: number; note: string; loopUntil?: number};

export const AUDIO = {
  music: 'music.mp3',
  musicVolume: 0.32,
  musicVolumeUnderVoice: 0.14, // ducked when voiceover.mp3 is present
  musicFadeInFrames: 12,
  musicFadeOutFrames: 60, // last 2 seconds
  /** extra music ducking: [from, to, level]; the peak goes nearly silent, the bottom goes quiet */
  musicDucks: [
    {from: 380, to: 446, level: 0.04, ramp: 10},
    {from: 590, to: 664, level: 0.3, ramp: 14},
  ],
  voiceover: 'voiceover.mp3',
  voiceoverVolume: 1,
  /** heartbeat.mp3 (one "lub-dub") is triggered on every beat of the HUD heart rate */
  heartbeat: {file: 'sfx/heartbeat.mp3', volume: 0.55, until: 1200},
  sfx: [
    {frame: 0, file: 'sfx/impact.mp3', volume: 0.8, note: 'Cold open hits mid-crash'},
    {frame: 0, file: 'sfx/alarm.mp3', volume: 0.45, note: 'Alarm under the cold open', loopUntil: 88},
    {frame: 3, file: 'sfx/whoosh.mp3', volume: 0.5, note: '«ذعر» slams in'},
    {frame: 56, file: 'sfx/impact.mp3', volume: 0.45, note: 'Alarm hit: glitch burst on «ذعر»'},
    {frame: 86, file: 'sfx/rewind.mp3', volume: 0.7, note: 'Tape stop, then the rewind up the track'},
    {frame: 136, file: 'sfx/whoosh.mp3', volume: 0.35, note: 'Rewind lands on the calm start'},
    {frame: 196, file: 'sfx/whoosh.mp3', volume: 0.25, note: '"...ويبيعون في القاع؟"'},
    {frame: 244, file: 'sfx/riser.mp3', volume: 0.6, note: 'The climb: riser up to the summit (about 4.5 s)'},
    {frame: 446, file: 'sfx/whoosh.mp3', volume: 0.6, note: 'Tipping over the edge'},
    {frame: 452, file: 'sfx/impact.mp3', volume: 0.85, note: 'The drop'},
    {frame: 506, file: 'sfx/alarm.mp3', volume: 0.5, note: 'Alarm through fear and panic', loopUntil: 586},
    {frame: 536, file: 'sfx/impact.mp3', volume: 0.6, note: '«ذعر» on the ride'},
    {frame: 586, file: 'sfx/sub-drop.mp3', volume: 0.8, note: 'Hitting the bottom'},
    {frame: 666, file: 'sfx/piano.mp3', volume: 0.7, note: '«أمل»: the first warm ray'},
    {frame: 748, file: 'sfx/whoosh.mp3', volume: 0.55, note: 'Camera pulls back (reveal)'},
    {frame: 836, file: 'sfx/whoosh.mp3', volume: 0.3, note: 'Cycle repeats into the distance'},
    {frame: 870, file: 'sfx/whoosh.mp3', volume: 0.35, note: 'Crowd vs wise replay'},
    {frame: 912, file: 'sfx/impact.mp3', volume: 0.35, note: 'Buy pin at the peak'},
    {frame: 938, file: 'sfx/impact.mp3', volume: 0.35, note: 'Sell pin at the bottom'},
    {frame: 990, file: 'sfx/whoosh.mp3', volume: 0.3, note: 'Calm: the quote'},
    {frame: 1124, file: 'sfx/whoosh.mp3', volume: 0.3, note: 'The lesson'},
    {frame: 1200, file: 'sfx/whoosh.mp3', volume: 0.35, note: 'Track coils into the loop'},
    {frame: 1244, file: 'sfx/shine.mp3', volume: 0.55, note: 'Logo shine'},
    {frame: 1286, file: 'sfx/shine.mp3', volume: 0.3, note: 'Logo shine (repeat)'},
    {frame: 1322, file: 'sfx/shine.mp3', volume: 0.25, note: 'Logo shine (repeat)'},
  ] as SfxCue[],
};
