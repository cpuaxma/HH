// Absolute frames (60fps). Scenes overlap on purpose: no empty frames, no hard cuts.
// Structure: cold open on the flood → rewind → the quiet phone → the hire → the build
// (Week 1 → Week 4 → Month 3) → overheat → CTA.
export const SCENES = {
  coldOpen: {from: 0, to: 150},
  rewind: {from: 140, to: 220},
  quiet: {from: 210, to: 380},
  hire: {from: 370, to: 540},
  week1: {from: 530, to: 700},
  week4: {from: 690, to: 910},
  month3: {from: 900, to: 1150},
  overheat: {from: 1140, to: 1420},
  cta: {from: 1410, to: 1800},
} as const;

// A time jump: the clock, date and chip roll from MOMENTS[from] to MOMENTS[to].
// `reverse` rolls the odometer backwards (the rewind).
export type Jump = {at: number; from: number; to: number; reverse?: boolean};

export const CUE = {
  // 1 · Cold open: frame 0 is already mid-flood
  openCaption: 3, // frame 0 is pure flood; the hook lands within ~0.6s
  openCaptionExit: 132,

  // 2 · Rewind
  rewind: 140, // cold-open cards fly back up, newest first
  rewindStagger: 2.5,
  counterDown: 46, // "99+" counts down to zero over this many frames

  // 3 · The quiet phone
  quietCaption: 212,
  quietCaptionExit: 358,
  momIn: 240,
  momSub: 290,
  momSwipe: 372,

  // 4 · The hire
  pepperDrop: 386,
  pepperDraw: 404,
  pepperKick: 446,
  lineGlow: 424,
  hireCaption: 398,
  hireCaptionExit: 512,
  pepperDock: 490,

  // 2 & 5 · Time jumps (MOMENTS indices: 0 Day 1, 1 Week 1, 2 Week 4, 3 Month 3)
  startMoment: 3,
  jumps: [
    {at: 146, from: 3, to: 0, reverse: true},
    {at: 532, from: 0, to: 1},
    {at: 692, from: 1, to: 2},
    {at: 902, from: 2, to: 3},
  ] as Jump[],
  disclaimer: 920,

  // 6 · Overheat
  blurFrom: 1145,
  heat: 1150,
  shakeRamp: [1140, 1220],
  alert: 1210,
  overheatCaption: 1236,
  freeze: 1356, // 6 frames of stillness
  freezeLength: 6,
  clearAll: 1362,
  clearBurst: 1364,

  // 7 · CTA
  flood: 1410,
  floodDuration: 18,
  logo: 1434,
  ctaHeadline: 1452,
  ctaBody: 1510,
  ctaButton: 1524,
  ctaCard: 1546,
  ctaEmail: 1568,
  ctaSlogan: 1580,
  pulseFrom: 1610,
  shine: 1624,
} as const;

// Story time: freezes during the stillness, then resumes where it paused.
export const storyTime = (frame: number) =>
  frame < CUE.freeze ? frame : frame < CUE.freeze + CUE.freezeLength ? CUE.freeze : frame - CUE.freezeLength;
