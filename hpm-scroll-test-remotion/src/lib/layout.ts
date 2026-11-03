// Geometry of the phone screen and the feed, in screen-texture pixels.
// The screen is 1024 × 2224 px (about 2.2k tall, so the text stays razor-sharp in close-ups).

export const SCREEN = {
  w: 1024,
  h: 2224,
  /** Status bar and the app's top bar (fixed), then the scrolling feed, then the bottom nav (fixed). */
  statusH: 84,
  topBarH: 116,
  bottomH: 150,
};
/** Top of the scrolling feed viewport. */
export const VIEW_TOP = SCREEN.statusH + SCREEN.topBarH;
/** Height of the scrolling feed viewport. */
export const VIEW_H = SCREEN.h - VIEW_TOP - SCREEN.bottomH;

/** Every post is one fixed-height cell: header, 4:5 image, action row, likes and caption, gap. */
export const POST = {
  h: 1700,
  headerH: 120,
  imageH: 1280,
  actionsH: 100,
  /** Height of the visible post (without the gap below it). */
  contentH: 1640,
};

/** Where the hero post's top sits in the viewport when it is at rest: centred. */
export const HERO_REST_TOP = Math.round((VIEW_H - POST.contentH) / 2);

/** The bland posts live in a 2 × 4 atlas of cells. */
export const ATLAS = {cols: 2, rows: 4};

/** Phone body (world units; the phone is 1.6 tall). */
export const PHONE = {
  w: 0.76,
  h: 1.6,
  depth: 0.082,
  corner: 0.115,
  /** Screen size and corner radius (inset in the black glass). */
  screenW: 0.712,
  screenH: (0.712 * SCREEN.h) / SCREEN.w,
  screenCorner: 0.088,
};
