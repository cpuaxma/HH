// Absolute frames (60fps). Scenes overlap on purpose: no empty frames, no hard cuts.
export const SCENES = {
  hook: {from: 0, to: 180},
  before: {from: 170, to: 480},
  kick: {from: 470, to: 680},
  grid: {from: 670, to: 890},
  caption: {from: 880, to: 1110},
  profile: {from: 1100, to: 1340},
  compare: {from: 1330, to: 1540},
  cta: {from: 1530, to: 1800},
} as const;

export const CUE = {
  // 1 · Hook
  hookLine1: 12,
  hookLine2: 66,
  hookFade: 45,
  hookFlick: 150,
  hookExit: 165,

  // 2 · Before
  phoneIn: 170,
  bubbles: [250, 290, 330],
  tags: [370, 395, 420],
  beforeFade: 40,
  beforeExit: 470,

  // 3 · Kick
  pepperDrop: 478,
  pepperDraw: 515,
  pepperKick: 555,
  warm: 545,
  kickHeadline: 560,
  kickHeadlineExit: 660,
  threadOut: 610,
  pepperPark: 684,

  // 4a · Grid
  gridLabel: 685,
  gridSweep: 700,
  gridSweepDuration: 280, // kick spring stretched to this; tile centres are crossed in ~35f
  gridOverlays: 795,
  gridLineExit: 812,
  gridLabelExit: 870,

  // 4b · Caption
  postOpen: 880,
  captionLabel: 895,
  strike: 940,
  strikeDuration: 25,
  captionSweep: 966,
  captionSweepDuration: 14,
  typeOn: 982,
  captionLabelExit: 1095,
  postClose: 1100,

  // 4c · Profile
  profileLabel: 1115,
  headerLineIn: 1138,
  headerSweep: 1156,
  headerSweepDuration: 170, // stretched kick spring; the header is crossed in ~40f
  headerLineExit: 1232,
  disclaimer: 1260,
  profileLabelExit: 1320,
  bugExit: 1322,

  // 5 · Before / After
  dividerIn: 1340,
  compareHeadline: 1350,
  dividerMoves: [
    {at: 1380, dur: 50, x: 262},
    {at: 1435, dur: 50, x: 680},
    {at: 1490, dur: 30, x: 470},
  ],
  compareExit: 1515,

  // 6 · CTA
  flood: 1530,
  floodDuration: 18,
  logo: 1552,
  ctaHeadline: 1575,
  ctaBody: 1625,
  ctaButton: 1640,
  ctaEmail: 1655,
  ctaSlogan: 1665,
  pulseFrom: 1690,
  shine: 1700,
} as const;
