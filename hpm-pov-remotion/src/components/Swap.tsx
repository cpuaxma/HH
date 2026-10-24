import React from 'react';
import {enter, exit} from '../lib/anim';

type Props = {frame: number; at: number | null; from: React.ReactNode; to: React.ReactNode; distance?: number; style?: React.CSSProperties};

// A small vertical roll between two values: the old one lifts out, the new one rises in.
export const Swap: React.FC<Props> = ({frame, at, from, to, distance = 30, style}) => {
  if (at === null) return <div style={style}>{from}</div>;
  const o = exit(frame, at, 12);
  const i = enter(frame, at + 6, 24);
  return (
    <div style={{position: 'relative', ...style}}>
      {o < 1 ? <div style={{position: i > 0 ? 'absolute' : 'relative', inset: 0, transform: `translateY(${-distance * o}px)`, opacity: 1 - o}}>{from}</div> : null}
      {i > 0 ? <div style={{transform: `translateY(${distance * (1 - i)}px)`, opacity: i}}>{to}</div> : null}
    </div>
  );
};
