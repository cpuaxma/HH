// ─────────────────────────────────────────────────────────────────────────────
// THE ARENA · one file to edit the video.
// Colours, fonts, timings, every on-screen string, the trap list (and therefore
// the counter values) and the audio cues are all defined or derived here.
// ─────────────────────────────────────────────────────────────────────────────

export const VIDEO = {width: 1080, height: 1920, fps: 30, durationInFrames: 1200} as const;

export const COLORS = {
  black: '#0A0A0A',
  gold: '#D4AF37',
  goldLight: '#F5D77A',
  goldDark: '#8C6D1F',
  /** Loss red: used ONLY for failures (falling pillars, dead tiles, losses). */
  red: '#C8372D',
  white: '#F6F1E4',
  whisper: '#B9BCC4',
} as const;

export const GOLD_TEXT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 55%, ${COLORS.goldDark} 100%)`;

export const FONT = {
  // Cairo via @remotion/google-fonts (see src/fonts.ts).
  weights: {body: 600, bold: 800, black: 900},
  lineHeight: 1.35,
} as const;

/** Text-safe area: centre 900 px, clear of the top 250 px and bottom 350 px. */
export const SAFE = {left: 90, right: 990, top: 250, bottom: 1920 - 350} as const;

// ── Scene ranges [from, to) in frames. Neighbouring scenes overlap by 8–12 frames. ──
export const SCENES = {
  hook: [0, 98],
  setup: [88, 160],
  traps: [150, 750], // the six traps share this window equally (see TRAP_FRAMES)
  reveal: [740, 850],
  habits: [840, 1000],
  arrow: [990, 1060],
  cta: [1050, 1200],
} as const;

export type MechanismId = 'wander' | 'crack' | 'lever' | 'chain' | 'fomo' | 'rumor';

export type TrapDef = {
  /** Title shown as a big word-by-word reveal. Use \n to force a line break. */
  title: string;
  /** Words (exact, without punctuation) that get the red accent + shine. */
  accent?: string[];
  /** How many pillars this trap removes. All `remove` values must sum to 75 (100 → 25). */
  remove: number;
  /** The visual trap. Each mechanism picks its own victims from whoever is still standing. */
  mechanism: MechanismId;
};

/**
 * THE TRAP SEQUENCE. Reorder, retitle or swap mechanisms freely; counter values,
 * hit frames, camera moves, sounds and the cue sheet are all derived from this list.
 * The per-trap numbers are illustrative; only the final total (≈75% lose) is sourced.
 */
export const TRAPS: TrapDef[] = [
  {title: 'الدخول بلا خطة', accent: ['بلا', 'خطة'], remove: 12, mechanism: 'wander'},
  {title: 'التداول بلا\nوقف خسارة', accent: ['وقف', 'خسارة'], remove: 14, mechanism: 'crack'},
  {title: 'رافعة مالية مفرطة', accent: ['مفرطة'], remove: 16, mechanism: 'lever'},
  {title: 'التداول الانتقامي\nبعد الخسارة', accent: ['الانتقامي'], remove: 14, mechanism: 'chain'},
  {title: 'الخوف من\nتفويت الفرصة', accent: ['تفويت', 'الفرصة'], remove: 11, mechanism: 'fomo'},
  {title: 'التداول\nعلى الإشاعات', accent: ['الإشاعات'], remove: 8, mechanism: 'rumor'},
];

export const START_COUNT = 100;
export const FINAL_COUNT = START_COUNT - TRAPS.reduce((n, t) => n + t.remove, 0);
if (FINAL_COUNT !== 25) {
  throw new Error(`TRAPS must remove 75 pillars in total (100 → 25); they remove ${START_COUNT - FINAL_COUNT}.`);
}
/** Counter value after each trap: [100, 88, 74, 58, 44, 33, 25]. */
export const COUNTER_STEPS = TRAPS.reduce<number[]>((acc, t) => [...acc, acc[acc.length - 1] - t.remove], [START_COUNT]);

/** Frame window of trap k: [start, end). */
export const TRAP_LEN = (SCENES.traps[1] - SCENES.traps[0]) / TRAPS.length;
export const TRAP_FRAMES = TRAPS.map((_, k) => [SCENES.traps[0] + k * TRAP_LEN, SCENES.traps[0] + (k + 1) * TRAP_LEN] as const);

// ── On-screen text (Modern Standard Arabic, ≤ 8 words per screen) ──
export const TEXT = {
  hook1: '١٠٠ متداول\nدخلوا السوق...',
  hook2: '...كم بقي منهم؟',
  setup: 'معظمهم ارتكب\nالأخطاء نفسها',
  reveal: 'ثلاثة من كل أربعة...\nخسروا',
  revealNote: 'تُظهر إفصاحات الوسطاء أن نحو ٧٥٪ من حسابات الأفراد\nتخسر في تداول العقود مقابل الفروقات',
  habits: ['خطة واضحة\nقبل كل صفقة', 'وقف خسارة...\nدائماً', 'مخاطرة صغيرة\nفي كل صفقة', 'انضباط...\nلا عاطفة'],
  arrow: 'كن من القلّة\nالتي تبقى',
  cta: 'تابعنا لتتداول\nبعقلية المحترفين',
  disclaimer: 'محتوى تعليمي وليس نصيحة استثمارية',
  whisper: 'سمعتُ أن...',
  brandFallback: 'Miran Gold',
} as const;

/** Key words that get colour + a shine sweep. */
export const ACCENTS = {
  hook1: {gold: ['١٠٠']},
  hook2: {gold: ['بقي', 'منهم؟']},
  setup: {gold: ['الأخطاء', 'نفسها']},
  reveal: {red: ['خسروا'], gold: ['ثلاثة', 'أربعة...']},
  habits: [{gold: ['خطة', 'واضحة']}, {gold: ['دائماً']}, {gold: ['صغيرة']}, {gold: ['انضباط...']}],
  arrow: {gold: ['القلّة']},
  cta: {gold: ['المحترفين']},
} as const;

// ── Scene beats (absolute frames) ──
export const BEATS = {
  hookLine1: 8,
  hookLine2: 50,
  counterSlam: 100,
  setupText: 112,
  revealText: 768,
  revealNote: 790,
  riseStart: 846,
  habitAt: [860, 894, 928, 962],
  habitLen: 34,
  arrowFly: 992,
  arrowLock: 1030,
  arrowText: 1020,
  logoIn: 1068,
  ctaText: 1090,
  shineEvery: 36,
} as const;

// ── Audio ──
// Every file is optional: a slot plays only if the file exists in /public.
export const AUDIO = {
  music: 'music.mp3',
  voiceover: 'voiceover.mp3',
  musicVolume: 0.55,
  musicDuck: 0.28, // music level while the voiceover speaks
  musicSwell: 0.8, // warm swell under the survivors
  voiceoverVolume: 1,
  sfxVolume: 0.9,
  fadeOutFrames: 60, // last 2 s
} as const;

// Voiceover line timings (used for ducking and the SRT guide) live in src/audio/voiceover.ts.
