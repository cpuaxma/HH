// Absolute frames (60fps). Scenes overlap on purpose: no empty frames, no hard cuts.
export const SCENES = {
  hook: {from: 0, to: 210},
  hire: {from: 200, to: 400},
  week1: {from: 390, to: 640},
  week4: {from: 630, to: 900},
  month3: {from: 890, to: 1230},
  overheat: {from: 1220, to: 1500},
  cta: {from: 1490, to: 1800},
} as const;

export const CUE = {
  // 1 · Hook
  wake: 0,
  hookCaption: 20,
  hookCaptionExit: 200,
  momIn: 90,
  momSub: 140,
  momSwipe: 205,

  // 2 · Hire
  pepperDrop: 222,
  pepperDraw: 240,
  pepperKick: 282,
  lineGlow: 260,
  hireCaption: 236,
  hireCaptionExit: 368,
  pepperDock: 330,

  // 3 · Build: time jumps (clock odometer, chip, whoosh)
  jumps: [392, 632, 892],
  jumpDuration: 36,
  disclaimer: 940,

  // 4 · Overheat
  blurFrom: 1225,
  heat: 1230,
  shakeRamp: [1220, 1300],
  alert: 1290,
  overheatCaption: 1316,
  freeze: 1436, // 6 frames of stillness
  freezeLength: 6,
  clearAll: 1442,
  clearBurst: 1444,

  // 5 · CTA
  flood: 1490,
  floodDuration: 18,
  logo: 1514,
  ctaHeadline: 1532,
  ctaBody: 1590,
  ctaButton: 1604,
  ctaCard: 1626,
  ctaEmail: 1648,
  ctaSlogan: 1660,
  pulseFrom: 1690,
  shine: 1704,
} as const;

// Story time: freezes during the stillness, then resumes where it paused.
export const storyTime = (frame: number) =>
  frame < CUE.freeze ? frame : frame < CUE.freeze + CUE.freezeLength ? CUE.freeze : frame - CUE.freezeLength;
