import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../config';
import {fontFamily} from '../fonts';
import {EASE, ease, springIn} from '../lib/motion';
import {useTextOnly} from './Debug';

type Props = {
  label: string;
  color: 'red' | 'gold';
  /** the chart point the pin stands on */
  at: {x: number; y: number};
  dir: 'up' | 'down';
  drop: number;
  exit: number;
};

const C = {red: {bg: '#E5352B', ring: '#FF6A5E', text: '#fff'}, gold: {bg: '#D4AF37', ring: '#F5D77A', text: '#1A1405'}};

/** A buy/sell pin dropped onto the chart. */
export const Pin: React.FC<Props> = ({label, color, at, dir, drop, exit}) => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();
  if (frame < drop - 1) return null;
  const p = springIn(frame, drop, {damping: 10, stiffness: 220, mass: 0.6});
  const out = ease(frame, [exit, exit + 12], [0, 1], EASE.in);
  if (out >= 1) return null;
  const stem = 78;
  const sign = dir === 'up' ? -1 : 1;
  const headY = at.y + sign * stem;
  const c = C[color];
  const fall = (1 - p) * -70 * (dir === 'up' ? 1 : -1);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: (1 - out) * Math.min(1, p * 2), filter: `blur(${out * 10}px)`}}>
      {textOnly ? null : (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <line x1={at.x} y1={at.y + sign * 10} x2={at.x} y2={headY + fall} stroke={c.ring} strokeWidth={3} opacity={0.9} />
          <circle cx={at.x} cy={at.y} r={8 * p} fill={c.ring} />
          <circle cx={at.x} cy={at.y} r={8 + 26 * ease(frame, [drop, drop + 16])} fill="none" stroke={c.ring} strokeWidth={2} opacity={1 - ease(frame, [drop, drop + 16])} />
        </svg>
      )}
      <div
        style={{
          position: 'absolute',
          left: at.x - 120,
          width: 240,
          top: headY + fall,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${dir === 'up' ? '-100%' : '0'}) scale(${0.7 + 0.3 * p})`,
          transformOrigin: dir === 'up' ? 'center bottom' : 'center top',
        }}
      >
        <div
          style={{
            padding: '2px 22px 6px',
            borderRadius: 14,
            background: textOnly ? 'transparent' : c.bg,
            boxShadow: textOnly ? 'none' : `0 0 22px ${c.ring}88`,
            fontFamily,
            fontWeight: FONT.weightBlack,
            fontSize: 40,
            lineHeight: 1.35,
            color: textOnly ? '#fff' : c.text,
            direction: 'rtl',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
