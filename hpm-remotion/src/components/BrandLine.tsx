import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LAYOUT} from '../layout';
import {progress} from '../lib/anim';
import {lerpPoints, Point, smoothPath, translatePoints} from '../lib/path';
import {COLORS, EASE_IN, EASE_IN_OUT, EASE_OUT, HEIGHT, STROKE, WIDTH} from '../theme';
import {beatStart, FLOOD_DURATION, FLOOD_START} from '../timeline';

// Every shape has 7 anchors, so any two can be morphed point by point.
const hookShape = (): Point[] => [
  [-80, 1640],
  [260, 1560],
  [640, 1500],
  [930, 1330],
  [1020, 1040],
  [990, 760],
  [1160, 470],
];

const underlineShape = (): Point[] => {
  const y = LAYOUT.oneTeam.underlineY();
  return [
    [-80, y + 10],
    [90, y + 4],
    [240, y - 2],
    [400, y + 3],
    [560, y - 3],
    [700, y - 6],
    [790, y - 12],
  ];
};

const dividerShape = (flip: 1 | -1): Point[] => {
  const y = LAYOUT.services.dividerY();
  const a = 9 * flip;
  return [
    [-80, y + a * 0.6],
    [130, y - a],
    [330, y + a],
    [530, y - a],
    [730, y + a],
    [930, y - a],
    [1160, y + a * 0.6],
  ];
};

const processShape = (): Point[] => {
  const x = LAYOUT.process.lineX;
  return [
    [x, -80],
    [x - 18, 300],
    [x + 20, 620],
    [x - 20, 940],
    [x + 20, 1260],
    [x - 18, 1580],
    [x, 2000],
  ];
};

// Flood geometry: a straight line along the top-left→bottom-right diagonal,
// pushed along its normal (towards the top-right) from the bottom-left corner.
const U: Point = [Math.SQRT1_2, Math.SQRT1_2];
const N: Point = [Math.SQRT1_2, -Math.SQRT1_2];
const FLOOD_FROM = -900; // offset along N from the frame centre
const FLOOD_WIDTH = 2400; // thick enough to cover the frame once centred
const cornerShape = (): Point[] =>
  [-1500, -1000, -500, 0, 500, 1000, 1500].map(
    (k) => [WIDTH / 2 + N[0] * FLOOD_FROM + U[0] * k, HEIGHT / 2 + N[1] * FLOOD_FROM + U[1] * k] as const,
  );

type Morph = {start: number; end: number; to: () => Point[]; easing?: (t: number) => number};

// Between services beats the divider retracts to the right, then redraws from the left
// in the opposite wave, so the thread "moves" with the carousel.
const BEAT_SWEEPS = [1, 2, 3].map((b) => ({
  retract: beatStart(b) - 15,
  redraw: beatStart(b) + 3,
  flip: (b % 2 === 0 ? 1 : -1) as 1 | -1,
}));

// A morph with start === end is a snap, used while the line is fully retracted.
const MORPHS: Morph[] = [
  {start: 174, end: 214, to: underlineShape},
  {start: 376, end: 416, to: () => dividerShape(1)},
  ...BEAT_SWEEPS.map((s) => ({start: s.redraw, end: s.redraw, to: () => dividerShape(s.flip)})),
  {start: 1182, end: 1222, to: processShape},
  {start: 1406, end: FLOOD_START, to: cornerShape, easing: EASE_IN_OUT},
];
const RETRACT = 16;
const REDRAW = 30;
const DRAW_IN = 64;

export type LineState = {points: Point[]; trimStart: number; trimEnd: number; width: number};

export const brandLineState = (frame: number): LineState => {
  let points = hookShape();
  for (const m of MORPHS) {
    if (frame >= m.end) points = m.to();
    else if (frame > m.start) points = lerpPoints(points, m.to(), progress(frame, m.start, m.end - m.start, m.easing ?? EASE_OUT));
  }

  let trimStart = 0;
  let trimEnd = progress(frame, 0, DRAW_IN, EASE_OUT);
  for (const s of BEAT_SWEEPS) {
    if (frame >= s.retract && frame < s.redraw) {
      trimStart = progress(frame, s.retract, RETRACT, EASE_IN);
    } else if (frame >= s.redraw && frame < s.redraw + REDRAW) {
      trimEnd = progress(frame, s.redraw, REDRAW, EASE_OUT);
    }
  }

  // A slow breathing drift keeps the line alive while it holds a shape.
  const drift = interpolate(frame, [1380, 1406], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const t = (frame / 60) * ((2 * Math.PI) / 3.2);
  points = points.map(([x, y], i) =>
    i === 0 || i === points.length - 1 ? [x, y] : [x + Math.sin(t + i * 1.7) * 5 * drift, y + Math.cos(t + i * 1.3) * 5 * drift],
  );

  let width = STROKE.line;
  if (frame >= FLOOD_START) {
    const p = progress(frame, FLOOD_START, FLOOD_DURATION, EASE_IN_OUT);
    const shift = -FLOOD_FROM * p;
    points = translatePoints(points, N[0] * shift, N[1] * shift);
    width = STROKE.line + (FLOOD_WIDTH - STROKE.line) * p;
  }

  return {points, trimStart, trimEnd, width};
};

export const brandLinePath = (frame: number) => smoothPath(brandLineState(frame).points);

type Props = {layer: 'under' | 'over'};

// The red thread. 'under' sits beneath the scene content until the flood;
// 'over' takes over at the flood so the red covers scene 4, then stays as the CTA background.
export const BrandLine: React.FC<Props> = ({layer}) => {
  const frame = useCurrentFrame();
  const flooding = frame >= FLOOD_START;
  if ((layer === 'under') === flooding) return null;
  if (frame >= FLOOD_START + FLOOD_DURATION) return <AbsoluteFill style={{backgroundColor: COLORS.red}} />;

  const {points, trimStart, trimEnd, width} = brandLineState(frame);
  const len = trimEnd - trimStart;
  if (len <= 0.0005) return null;

  return (
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{overflow: 'visible'}}>
        <path
          d={smoothPath(points)}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={width}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${len} 2`}
          strokeDashoffset={-trimStart}
        />
      </svg>
    </AbsoluteFill>
  );
};
