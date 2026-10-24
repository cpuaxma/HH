// Geometry of every red-line pass. Each function returns the line (dense samples in
// frame coordinates) together with the region it has already swept, built from the
// very same samples, so <BrushReveal> uncovers the AFTER layer exactly under the line.
import {EASE_IN, EASE_OUT} from '../theme';
import {CUE} from '../timeline';
import {kick, mix, progress} from './anim';
import {lerpPoints, Point, sampleSmooth} from './path';
import {camera, Cam, GRID, POST, SCREEN, tileCenter, toFrame} from './stage';

export type LineState = {
  pts: Point[]; // frame coordinates
  trimStart: number;
  trimEnd: number;
  swept: Point[]; // revealed region, frame coordinates ([] = nothing yet)
};

const NONE: LineState = {pts: [], trimStart: 0, trimEnd: 0, swept: []};
const FAR = 4000;

const norm = ([x, y]: Point): Point => {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
};

// A front of `anchors` (frame coords) moving along n; the swept side is behind it (−n).
const sweptBehind = (pts: Point[], n: Point): Point[] => {
  if (pts.length < 2) return [];
  const first = pts[0];
  const last = pts[pts.length - 1];
  return [...pts, [last[0] - n[0] * FAR, last[1] - n[1] * FAR], [first[0] - n[0] * FAR, first[1] - n[1] * FAR]];
};

// ── Pepper: rest pose in scene 3, and its tip (where the line springs from) ──
export const PEPPER_VIEWBOX = {x: 440, y: 552, w: 720, h: 500} as const;
export const PEPPER_TIP: Point = [452, 984]; // in the logo artboard
export const PEPPER_REST = {left: 648, top: 566, width: 290} as const;
export const PEPPER_BUG = {left: 80, top: 132, width: 88} as const;

const pepperTipAt = (pose: {left: number; top: number; width: number}): Point => {
  const k = pose.width / PEPPER_VIEWBOX.w;
  return [pose.left + (PEPPER_TIP[0] - PEPPER_VIEWBOX.x) * k, pose.top + (PEPPER_TIP[1] - PEPPER_VIEWBOX.y) * k];
};

// ── 4a · Grid sweep: top-right → bottom-left diagonal ──
const GRID_N = norm([-1, 1]);
const GRID_U = norm([1, 1]);
const GRID_O: Point = [SCREEN.w / 2, GRID.top + GRID.size / 2];
const GRID_S0 = -470;
const GRID_S1 = 520;
const GRID_K = [707, 517, 327, 137, -53, -243, -433]; // along the front: lower-right → upper-left
const MORPH_AT = 680;
const MORPH_DUR = 26;

const gridOffset = (frame: number) =>
  frame < CUE.gridSweep ? GRID_S0 : mix(GRID_S0, GRID_S1, kick(frame, CUE.gridSweep, CUE.gridSweepDuration));

const gridFrontLocal = (s: number): Point[] =>
  GRID_K.map((k) => {
    const w = s + 14 * Math.sin(k / 150);
    return [GRID_O[0] + GRID_U[0] * k + GRID_N[0] * w, GRID_O[1] + GRID_U[1] * k + GRID_N[1] * w] as const;
  });

const threadAnchors = (cam: Cam): Point[] => {
  const [tx, ty] = pepperTipAt(PEPPER_REST);
  const [cx, cy] = toFrame(cam, [SCREEN.w, GRID.top]);
  const at = (t: number, dx: number): Point => [mix(tx, cx, t) + dx, mix(ty, cy, t)];
  return [[tx, ty], [tx + 36, ty + 34], at(0.36, 88), at(0.62, 84), at(0.86, 56), [cx + 22, cy - 4], [cx - 4, cy + 16]];
};

export const gridLine = (frame: number): LineState => {
  if (frame < CUE.threadOut) return NONE;
  const cam = camera(frame);
  const front = gridFrontLocal(gridOffset(frame)).map((p) => toFrame(cam, p));
  const m = progress(frame, MORPH_AT, MORPH_DUR);
  const anchors = m <= 0 ? threadAnchors(cam) : m >= 1 ? front : lerpPoints(threadAnchors(cam), front, m);
  const pts = sampleSmooth(anchors);
  return {
    pts,
    trimEnd: Math.min(1, kick(frame, CUE.threadOut, 45)),
    trimStart: progress(frame, CUE.gridLineExit, 20, EASE_IN),
    swept: frame >= CUE.gridSweep ? sweptBehind(sampleSmooth(front), GRID_N) : [],
  };
};

// Region of the grid covered at a frame, in frame coords (stays fully swept after 4a).
export const gridSwept = (frame: number): Point[] => {
  if (frame < CUE.gridSweep) return [];
  const cam = camera(frame);
  const s = frame > CUE.gridSweep + CUE.gridSweepDuration ? GRID_S1 : gridOffset(frame);
  return sweptBehind(sampleSmooth(gridFrontLocal(s).map((p) => toFrame(cam, p))), GRID_N);
};

// The frame at which the line crosses a point of the grid (screen-local).
const firstCross = (offsetAt: (f: number) => number, from: number, to: number, depth: number) => {
  for (let f = from; f <= to; f++) if (offsetAt(f) >= depth) return f;
  return to;
};
export const tileTrigger = (i: number) => {
  const [x, y] = tileCenter(i);
  const depth = GRID_N[0] * (x - GRID_O[0]) + GRID_N[1] * (y - GRID_O[1]);
  return firstCross(gridOffset, CUE.gridSweep, CUE.gridSweep + CUE.gridSweepDuration, depth);
};

// ── 4c · Header sweep: left → right ──
const HEAD_N = norm([1, 0.1]);
const HEAD_U: Point = [-HEAD_N[1], HEAD_N[0]];
const HEAD_O: Point = [SCREEN.w / 2, 300];
const HEAD_S0 = -372;
const HEAD_S1 = 380;
const HEAD_K = [-336, -210, -84, 42, 168, 294, 420]; // top → bottom

const headOffset = (frame: number) =>
  frame < CUE.headerSweep ? HEAD_S0 : mix(HEAD_S0, HEAD_S1, kick(frame, CUE.headerSweep, CUE.headerSweepDuration));

const headFrontLocal = (s: number): Point[] =>
  HEAD_K.map((k) => {
    const w = s + 12 * Math.sin(k / 120 + 0.6);
    return [HEAD_O[0] + HEAD_U[0] * k + HEAD_N[0] * w, HEAD_O[1] + HEAD_U[1] * k + HEAD_N[1] * w] as const;
  });

export const headerLine = (frame: number): LineState => {
  if (frame < CUE.headerLineIn) return NONE;
  const cam = camera(frame);
  const pts = sampleSmooth(headFrontLocal(headOffset(frame)).map((p) => toFrame(cam, p)));
  return {
    pts,
    trimEnd: progress(frame, CUE.headerLineIn, 22),
    trimStart: progress(frame, CUE.headerLineExit, 16, EASE_IN),
    swept: frame >= CUE.headerSweep ? sweptBehind(pts, HEAD_N) : [],
  };
};

export const headerSwept = (frame: number): Point[] => (frame < CUE.headerSweep ? [] : headerLine(frame).swept);

export const headerTrigger = ([x, y]: Point) => {
  const depth = HEAD_N[0] * (x - HEAD_O[0]) + HEAD_N[1] * (y - HEAD_O[1]);
  return firstCross(headOffset, CUE.headerSweep, CUE.headerSweep + CUE.headerSweepDuration, depth);
};

// ── 4b · Caption: strike-through, then the same line wipes down over the caption box ──
// Box-local coordinates (origin at the caption box's top-left).
export type CaptionLine = {local: Point[]; trimStart: number; trimEnd: number; sweptY: number | null};

export const captionLine = (frame: number, strike: {x0: number; x1: number; y: number}): CaptionLine | null => {
  if (frame < CUE.strike) return null;
  const w = POST.caption.w;
  const sweep = progress(frame, CUE.captionSweep, CUE.captionSweepDuration, EASE_OUT);
  const y = mix(strike.y, POST.caption.h + 18, sweep);
  const x0 = mix(strike.x0, -16, sweep);
  const x1 = mix(strike.x1, w + 16, sweep);
  const anchors: Point[] = [0, 1, 2, 3, 4, 5, 6].map((i) => [mix(x0, x1, i / 6), y + Math.sin(i * 1.3) * 1.6] as const);
  return {
    local: sampleSmooth(anchors, 8),
    trimEnd: progress(frame, CUE.strike, CUE.strikeDuration),
    trimStart: progress(frame, CUE.typeOn - 2, 14, EASE_IN),
    sweptY: frame >= CUE.captionSweep ? y : null,
  };
};

export const captionToFrame = (cam: Cam, [x, y]: Point) => toFrame(cam, [POST.caption.x + x, POST.caption.y + y]);

// ── 5 · Before/After divider ──
export const DIVIDER_TOP = 400;
export const DIVIDER_HOME = 470;

export const dividerX = (frame: number) => {
  let x = DIVIDER_HOME;
  for (const m of CUE.dividerMoves) {
    if (frame >= m.at + m.dur) x = m.x;
    else if (frame > m.at) x = mix(x, m.x, progress(frame, m.at, m.dur));
  }
  return x;
};

// The divider draws down from DIVIDER_TOP to the bottom of the frame.
export const dividerTip = (frame: number) => mix(DIVIDER_TOP, 1930, progress(frame, CUE.dividerIn, 26));

// AFTER is visible right of the divider, and everywhere the divider hasn't reached yet.
export const dividerAfterRegion = (frame: number): Point[] | null => {
  if (frame < CUE.dividerIn) return null;
  const x = dividerX(frame);
  const tip = dividerTip(frame);
  return [[x, -10], [1100, -10], [1100, 1940], [-10, 1940], [-10, tip], [x, tip]];
};
