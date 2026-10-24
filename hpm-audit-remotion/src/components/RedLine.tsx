import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progress} from '../lib/anim';
import {handArrow, handLine, Pt, scribbleEllipse} from '../lib/path';
import {C, EASE_IN_OUT, EASE_OUT, HEIGHT, WIDTH} from '../theme';

// THE RED LINE: our signature thin, hand-drawn stroke. It always draws on (strokeDashoffset).
type Common = {at: number; dur?: number; color?: string; width?: number; seed?: string; style?: React.CSSProperties; w?: number; h?: number};
type Geo =
  | {type: 'circle'; cx: number; cy: number; rx: number; ry: number}
  | {type: 'strike' | 'underline'; x1: number; y1: number; x2: number; y2: number}
  | {type: 'arrow'; from: Pt; to: Pt; curve?: number; head?: number};

export const RedLine: React.FC<Common & Geo> = (props) => {
  const frame = useCurrentFrame();
  const {at, dur = 14, color = C.red, width = 8, seed = 'r', style, w = WIDTH, h = HEIGHT} = props;
  if (frame < at) return null;
  const p = progress(frame, at, dur, EASE_OUT);
  const stroke = {stroke: color, strokeWidth: width, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none', pathLength: 1, strokeDasharray: '1 1'};
  let paths: React.ReactNode;
  if (props.type === 'circle') {
    paths = <path d={scribbleEllipse(props.cx, props.cy, props.rx, props.ry, seed)} {...stroke} strokeDashoffset={1 - p} />;
  } else if (props.type === 'arrow') {
    const a = handArrow(props.from, props.to, props.curve ?? 0.3, seed, props.head ?? 46);
    const ph = progress(frame, at + dur * 0.8, 6, EASE_OUT);
    paths = (
      <>
        <path d={a.shaft} {...stroke} strokeDashoffset={1 - p} />
        <path d={a.head} {...stroke} strokeDashoffset={1 - ph} />
      </>
    );
  } else {
    const bow = props.type === 'underline' ? 5 : 3;
    paths = <path d={handLine(props.x1, props.y1, props.x2, props.y2, seed, 2.5, bow)} {...stroke} strokeDashoffset={1 - p} />;
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
      {paths}
    </svg>
  );
};

// A travelling red line: a segment of `d` whose head and tail both move, so it wanders through.
export const RedWander: React.FC<{d: string; at: number; dur: number; length?: number; width?: number; color?: string; opacity?: number}> = ({
  d,
  at,
  dur,
  length = 0.45,
  width = 7,
  color = C.red,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const p = progress(frame, at, dur, EASE_IN_OUT) * (1 + length);
  const head = Math.min(1, p);
  const tail = Math.max(0, p - length);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, opacity}}>
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${head - tail} 2`} strokeDashoffset={-tail} />
    </svg>
  );
};
