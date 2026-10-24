import {Point} from './path';
import {mix, progress} from './anim';
import {CUE} from '../timeline';

// Phone geometry. "Screen-local" coordinates start at the top-left of the screen.
export const PHONE = {w: 600, h: 1230, bezel: 8, radius: 64} as const;
export const SCREEN = {w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2} as const;

export const GRID = {
  top: 630,
  gap: 6,
  size: SCREEN.w,
  tile: (SCREEN.w - 6 * 2) / 3,
} as const;
export const HEADER_BOTTOM = 626;

export const tileRect = (i: number) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return {
    x: col * (GRID.tile + GRID.gap),
    y: GRID.top + row * (GRID.tile + GRID.gap),
    size: GRID.tile,
  };
};
export const tileCenter = (i: number): Point => {
  const r = tileRect(i);
  return [r.x + r.size / 2, r.y + r.size / 2];
};

// The post opened in 4b (latte art, top-right tile).
export const POST_TILE = 2;
export const POST = {
  image: {x: 0, y: 196, size: SCREEN.w},
  caption: {x: 24, y: 856, w: SCREEN.w - 48, h: 210},
} as const;

// ── Camera: where the phone's centre sits in the frame, and its scale ──
export type Cam = {cx: number; cy: number; s: number};

const CAM_START: Cam = {cx: 370, cy: 2560, s: 1};
const CAM_MOVES: {at: number; dur: number; to: Cam}[] = [
  {at: CUE.phoneIn, dur: 72, to: {cx: 370, cy: 900, s: 1}}, // 2 · slides up, slow and flat
  {at: CUE.pepperDrop, dur: 50, to: {cx: 380, cy: 1050, s: 0.86}}, // 3 · makes room for headline + pepper
  {at: 665, dur: 45, to: {cx: 470, cy: 925, s: 1.08}}, // 4a · grid
  {at: CUE.postOpen, dur: 50, to: {cx: 470, cy: 975, s: 1.2}}, // 4b · push into the post
  {at: CUE.postClose, dur: 50, to: {cx: 470, cy: 925, s: 1.08}}, // 4c · full profile
  {at: 1330, dur: 45, to: {cx: 470, cy: 965, s: 0.82}}, // 5 · split view
];

export const camera = (frame: number): Cam => {
  let c = CAM_START;
  for (const m of CAM_MOVES) {
    if (frame >= m.at + m.dur) c = m.to;
    else if (frame > m.at) {
      const t = progress(frame, m.at, m.dur);
      c = {cx: mix(c.cx, m.to.cx, t), cy: mix(c.cy, m.to.cy, t), s: mix(c.s, m.to.s, t)};
    }
  }
  return c;
};

// Screen-local → frame coordinates.
export const toFrame = (cam: Cam, [x, y]: Point): Point => [
  cam.cx + (x + PHONE.bezel - PHONE.w / 2) * cam.s,
  cam.cy + (y + PHONE.bezel - PHONE.h / 2) * cam.s,
];

export const rectToFrame = (cam: Cam, x0: number, y0: number, x1: number, y1: number) => {
  const [ax, ay] = toFrame(cam, [x0, y0]);
  const [bx, by] = toFrame(cam, [x1, y1]);
  return {x0: ax, y0: ay, x1: bx, y1: by};
};
