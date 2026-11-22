import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONT} from '../config';
import {fontFamily} from '../fonts';
import {EASE, ease, springIn} from '../lib/motion';
import {useTextOnly} from './Debug';

type Props = {
  text: string;
  tag: string;
  tagColor: 'red' | 'gold';
  /** centre of the callout text */
  y: number;
  /** the point the leader line runs to (the orb on screen) */
  to: {x: number; y: number};
  enter: number;
  tagEnter: number;
  exit: number;
};

const TAG = {
  red: {bg: 'linear-gradient(180deg, #FF4B3E, #B3121F)', glow: 'rgba(255,59,59,0.55)', text: '#FFFFFF'},
  gold: {bg: 'linear-gradient(180deg, #F5D77A, #B8902A)', glow: 'rgba(212,175,55,0.55)', text: '#1A1405'},
};

/** "Here the majority buys" + a coloured tag, with a thin leader line to the orb. */
export const Callout: React.FC<Props> = ({text, tag, tagColor, y, to, enter, tagEnter, exit}) => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();
  const words = text.split(' ');
  const out = ease(frame, [exit, exit + 12], [0, 1], EASE.in);
  if (frame < enter - 2 || out >= 1) return null;
  const tagP = springIn(frame, tagEnter, {damping: 11, stiffness: 200, mass: 0.6});
  const line = ease(frame, [enter + 4, enter + 18], [0, 1], EASE.inOut);
  const tagY = y + 92;
  // leader line from the tag towards the orb, stopping short of it
  const fromY = to.y > y ? tagY + 44 : y - 52;
  const dx = to.x - 540;
  const dy = to.y - fromY;
  const len = Math.hypot(dx, dy);
  const stop = Math.max(0, len - 46);
  const ex = 540 + (dx / len) * stop * line;
  const ey = fromY + (dy / len) * stop * line;
  const t = TAG[tagColor];

  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: `blur(${out * 12}px)`}}>
      {textOnly ? null : (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <line x1={540} y1={fromY} x2={ex} y2={ey} stroke="rgba(255,255,255,0.75)" strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
          <circle cx={to.x} cy={to.y} r={30 + 10 * (1 - line)} fill="none" stroke={tagColor === 'red' ? '#FF5A4E' : COLORS.goldLight} strokeWidth={3} opacity={line} />
        </svg>
      )}
      <div
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: y,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'center',
          columnGap: '0.26em',
          direction: 'rtl',
          fontFamily,
          fontWeight: FONT.weightBlack,
          fontSize: 74,
          lineHeight: 1.3,
          color: '#fff',
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.85))',
        }}
      >
        {words.map((w, i) => {
          const p = springIn(frame, enter + i * 4, {damping: 17, stiffness: 140, mass: 0.7});
          return (
            <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.18em 0.06em', margin: '-0.18em -0.06em'}}>
              <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 2)}}>{w}</span>
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 90, width: 900, top: tagY, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `translateY(-50%) scale(${0.6 + 0.4 * tagP})`,
            opacity: Math.min(1, tagP * 1.5),
            padding: '6px 30px 10px',
            borderRadius: 999,
            background: textOnly ? 'transparent' : t.bg,
            boxShadow: textOnly ? 'none' : `0 0 30px ${t.glow}`,
            fontFamily,
            fontWeight: FONT.weightBlack,
            fontSize: 46,
            lineHeight: 1.3,
            color: textOnly ? '#fff' : t.text,
            direction: 'rtl',
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
        </div>
      </div>
    </div>
  );
};
