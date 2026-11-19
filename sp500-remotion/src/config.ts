/**
 * Everything you are likely to tweak lives here: colors, fonts, timings, on-screen text and audio.
 * All frame numbers are at 30 fps (30 frames = 1 second). Scene-local cues are counted from the
 * scene's own `from` frame.
 */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 900, // exactly 30 seconds
};

// ---------------------------------------------------------------------------------------------
// Brand colors
// ---------------------------------------------------------------------------------------------
export const COLORS = {
  bg: '#0A0A0A',
  gold: '#D4AF37',
  goldLight: '#F5D77A',
  goldDeep: '#8C6D1F',
  text: '#F6F1E3', // warm off-white for non-gold words
  textMuted: 'rgba(246, 241, 227, 0.62)',
};

export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 52%, ${COLORS.goldDeep} 100%)`;
export const WHITE_GRADIENT = `linear-gradient(180deg, #FFFFFF 0%, ${COLORS.text} 100%)`;

// ---------------------------------------------------------------------------------------------
// Fonts (loaded through @remotion/google-fonts in fonts.ts)
// ---------------------------------------------------------------------------------------------
export const FONT = {
  /** 'Cairo' or 'Tajawal' */
  arabic: 'Cairo' as 'Cairo' | 'Tajawal',
  weightBold: 800,
  weightBlack: 900,
  weightRegular: 500,
};

// ---------------------------------------------------------------------------------------------
// Safe zones for Instagram / TikTok UI. Text must stay inside this box (checked by
// `npm run check:safe`). The camera push-in and shake are small enough to keep it there.
// ---------------------------------------------------------------------------------------------
export const SAFE = {
  left: 90, // (1080 - 900) / 2
  right: 990,
  top: 250,
  bottom: 1570, // 1920 - 350
  textWidth: 860, // a little narrower than 900 so camera push-in never pushes text out
};

// ---------------------------------------------------------------------------------------------
// Scene timing (global frames). Neighbouring scenes overlap by 10-12 frames so elements exit while
// the next ones enter.
// ---------------------------------------------------------------------------------------------
export const SCENES = {
  hook: {from: 0, duration: 102}, //        0:00 - 0:03.4
  sp500: {from: 90, duration: 190}, //      0:03 - 0:09.3
  heartbeat: {from: 270, duration: 190}, // 0:09 - 0:15.3
  history: {from: 450, duration: 250}, //   0:15 - 0:23.3
  world: {from: 690, duration: 210}, //     0:23 - 0:30 (the globe settles behind the CTA)
  cta: {from: 820, duration: 80}, //        0:27.3 - 0:30
};

/** Global frames where the camera shakes and punches in (number landings, big reveals). */
export const IMPACTS: {frame: number; shake: number; zoom: number}[] = [
  {frame: 33, shake: 26, zoom: 0.07}, // ٥٠٠ lands
  {frame: 58, shake: 6, zoom: 0.035}, // "هل تعرف ما هو؟" quick zoom
  {frame: 96, shake: 10, zoom: 0.03}, // morph into S&P 500
  {frame: 300, shake: 4, zoom: 0.015}, // first heartbeat
  {frame: 627, shake: 12, zoom: 0.03}, // ≈ ١٠٪ lands
];

/** Per-scene cues, in scene-local frames. */
export const CUES = {
  hook: {
    countStart: 3,
    countEnd: 33, // number lands here (matches IMPACTS[0])
    line1: 40,
    line1Shine: 56,
    line2: 58,
    textExit: 80,
    numberExit: 90,
  },
  sp500: {
    labelIn: 4,
    labelMoveUp: 26,
    gridStart: 30,
    gridEnd: 90,
    text: 60,
    chipsStart: 95,
    chipsShine: 140,
    chipsReturn: 160,
    textExit: 170,
  },
  heartbeat: {
    text1: 12,
    chartStart: 20,
    chartEnd: 130,
    beatStart: 30,
    beatEvery: 30,
    beatCount: 5,
    text1Exit: 86,
    text2: 96,
    text2Shine: 130,
    gridExit: 160,
    textExit: 165,
  },
  history: {
    axisIn: 4,
    curveStart: 24,
    curveEnd: 146,
    counter: 150,
    counterLand: 177, // matches IMPACTS[4]
    label: 182,
    footnote: 200,
    counterShine: 212,
    exit: 234,
  },
  world: {
    pullBackEnd: 75,
    text: 28,
    arcsStart: 40,
    arcEvery: 7,
    arcDuration: 26,
    textShine: 96,
    exit: 126,
  },
  cta: {
    text: 4,
    telegram: 20,
    logo: 32,
    logoShine: 48,
    textShine: 28,
    telegramShine: 56,
  },
};

// ---------------------------------------------------------------------------------------------
// On-screen text (max 8 words per screen). Use Eastern Arabic digits in Arabic text.
// "\n" forces a line break.
// `gold` lists the words (exact match) that render in gold; the rest are off-white.
// ---------------------------------------------------------------------------------------------
export const TEXT = {
  hook: {
    // The giant counted number is the first word of the sentence: ٥٠٠ / شركة... / في رقم واحد!
    count: 500,
    line1: {text: 'شركة...\nفي رقم واحد!', gold: ['واحد']},
    line2: {text: 'هل تعرف ما هو؟', gold: []},
  },
  sp500: {
    label: 'S&P 500', // Latin, rendered LTR
    line: {text: 'أكبر ٥٠٠ شركة أمريكية', gold: ['٥٠٠']},
    companies: ['Apple', 'Microsoft', 'NVIDIA', 'Amazon'],
  },
  heartbeat: {
    line1: {text: 'ترتفع الشركات...\nيرتفع المؤشر', gold: ['يرتفع', 'المؤشر']},
    line2: {text: 'مقياس صحة\nالاقتصاد الأمريكي', gold: ['صحة', 'الاقتصاد']},
  },
  history: {
    startYear: '١٩٥٧',
    endLabel: 'اليوم',
    counterPrefix: '≈',
    counterValue: 10, // shown as ≈ ١٠٪
    label: {text: 'متوسط العائد السنوي\nعلى المدى الطويل', gold: ['العائد', 'السنوي']},
    footnote: 'الأداء السابق لا يضمن النتائج المستقبلية',
  },
  world: {
    line: {text: 'لهذا يتابعه المستثمرون\nحول العالم', gold: ['حول', 'العالم']},
  },
  cta: {
    line: {text: 'تابعنا للمزيد\nمن المحتوى التعليمي', gold: ['المحتوى', 'التعليمي']},
    telegram: {text: 'وانضموا إلى قناتنا\nعلى تيليجرام', gold: ['تيليجرام']},
    brand: 'Miran Gold',
  },
};

// ---------------------------------------------------------------------------------------------
// Audio. Files are optional: each one is used only if it exists in /public.
// ---------------------------------------------------------------------------------------------
export const AUDIO = {
  music: 'music.mp3',
  musicVolume: 0.22,
  musicVolumeUnderVoice: 0.12, // ducked when voiceover.mp3 is present
  musicFadeInFrames: 15,
  musicFadeOutFrames: 60, // last 2 seconds
  voiceover: 'voiceover.mp3',
  voiceoverVolume: 1,
  /** Sound-effect slots. Drop files with these names into /public/sfx/. */
  sfx: [
    {frame: 33, file: 'sfx/hit.mp3', volume: 0.7},
    {frame: 88, file: 'sfx/whoosh.mp3', volume: 0.5},
    {frame: 268, file: 'sfx/whoosh.mp3', volume: 0.45},
    {frame: 448, file: 'sfx/whoosh.mp3', volume: 0.45},
    {frame: 627, file: 'sfx/hit.mp3', volume: 0.5},
    {frame: 688, file: 'sfx/whoosh.mp3', volume: 0.45},
    {frame: 818, file: 'sfx/whoosh.mp3', volume: 0.4},
    {frame: 868, file: 'sfx/shine.mp3', volume: 0.5},
  ],
};

// ---------------------------------------------------------------------------------------------
// Background / ambience
// ---------------------------------------------------------------------------------------------
export const AMBIENCE = {
  particles: 90,
  glowOpacity: 0.2,
  pushIn: 0.03, // each scene slowly scales from 1 to 1 + pushIn
};
