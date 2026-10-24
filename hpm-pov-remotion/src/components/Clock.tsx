import React from 'react';
import {progress} from '../lib/anim';
import {jumpAt} from '../lib/moments';
import {measureText} from '../fonts';
import {MOMENTS} from '../notifications';
import {FONT, HPM, LOCK, TYPE, WEIGHT} from '../theme';

const ROLL = 30;
const WHOOSH = 40;
// Columns roll right to left; the minute ones spins hardest.
const COLUMNS = [
  {key: 'ht', delay: 9, spins: 0},
  {key: 'ho', delay: 6, spins: 1},
  {key: 'mt', delay: 3, spins: 1},
  {key: 'mo', delay: 0, spins: 2},
] as const;

type Digits = Record<(typeof COLUMNS)[number]['key'], number>;
const digits = (h: number, m: number): Digits => ({ht: Math.floor(h / 10), ho: h % 10, mt: Math.floor(m / 10), mo: m % 10});

// A rolling digit column. Without a width it sizes itself to the widest stacked digit.
const Column: React.FC<{pos: number; width?: number}> = ({pos, width}) => (
  <span style={{display: 'inline-block', height: '1em', overflow: 'hidden', width, marginRight: TYPE.headlineTracking, verticalAlign: 'top'}}>
    <span style={{display: 'block', transform: `translateY(${-(((pos % 10) + 10) % 10)}em)`}}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
        <span key={i} style={{display: 'block', height: '1em', textAlign: 'center'}}>
          {d}
        </span>
      ))}
    </span>
  </span>
);

// Big lock-screen clock. On a time jump every digit odometer-rolls forward, with a quick
// vertical whoosh blur on the whole clock.
export const Clock: React.FC<{frame: number; color?: string; opacity?: number}> = ({frame, color = HPM.charcoal, opacity = 1}) => {
  const j = jumpAt(frame);
  const size = LOCK.clockSize;
  const font = `${WEIGHT.headline} ${size}px ${FONT}`;
  const w = Math.max(...'0123456789'.split('').map((d) => measureText(d, font)), size * 0.7);
  const colon = measureText(':', font) || size * 0.3;

  const from = j ? digits(j.from.hour, j.from.minute) : digits(MOMENTS[0].hour, MOMENTS[0].minute);
  const to = j ? digits(j.to.hour, j.to.minute) : from;

  const cols = COLUMNS.map((c) => {
    const p = j ? progress(frame, j.start + c.delay, ROLL) : 0;
    const a = from[c.key];
    const b = to[c.key];
    if (c.key === 'ht') {
      // The hour tens digit only exists for 10–12; it grows in or out.
      const vis = (a > 0 ? 1 : 0) + ((b > 0 ? 1 : 0) - (a > 0 ? 1 : 0)) * p;
      return {pos: a + (b - a) * p, width: vis >= 1 ? undefined : w * vis, opacity: vis};
    }
    const travel = (((b - a) % 10) + 10) % 10 + 10 * c.spins;
    return {pos: a + travel * p, width: undefined, opacity: 1};
  });

  const q = j ? Math.max(0, Math.min(1, (frame - j.start) / WHOOSH)) : 0;
  const whoosh = Math.sin(Math.PI * q);
  const blur = 8 * whoosh;
  const id = 'clock-whoosh';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: '100%',
        top: LOCK.clockCenterY - size / 2,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: WEIGHT.headline,
        fontSize: size,
        lineHeight: 1,
        color,
        opacity,
        transform: `scaleY(${1 + 0.05 * whoosh})`,
        filter: blur > 0.2 ? `url(#${id})` : undefined,
      }}
    >
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>
      <span style={{display: 'inline-flex', opacity: cols[0].opacity}}>
        <Column pos={cols[0].pos} width={cols[0].width} />
      </span>
      <Column pos={cols[1].pos} width={cols[1].width} />
      <span style={{display: 'inline-block', width: colon, textAlign: 'center', marginRight: TYPE.headlineTracking, transform: 'translateY(-0.04em)'}}>:</span>
      <Column pos={cols[2].pos} width={cols[2].width} />
      <Column pos={cols[3].pos} width={cols[3].width} />
    </div>
  );
};
