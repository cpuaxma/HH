import React from 'react';
import {mix, progress} from '../lib/anim';

type Props = {
  frame: number;
  from: number; // in display units, e.g. 0.2 (= 212 as "K")
  to: number; // e.g. 12.4
  start: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  style?: React.CSSProperties;
};

const LINE = 1.1; // em per digit row

// Mechanical odometer: the lowest column rolls continuously, each higher column
// turns over only while the one below passes 9 → 0.
export const Odometer: React.FC<Props> = ({frame, from, to, start, duration = 66, decimals = 1, suffix = '', style}) => {
  const scale = 10 ** decimals;
  const value = mix(from, to, progress(frame, start, duration)) * scale; // in lowest-column units
  const intDigits = Math.max(1, String(Math.floor(to)).length);
  const columns = intDigits + decimals;

  const pos = (k: number) => {
    const unit = 10 ** k;
    if (k === 0) return value;
    const rest = value % unit;
    return Math.floor(value / unit) + Math.max(0, rest - (unit - 1));
  };

  const cells: React.ReactNode[] = [];
  for (let c = columns - 1; c >= 0; c--) {
    const p = pos(c);
    // Leading zeros stay hidden until the column first turns over, then grow in.
    const leading = c >= decimals + 1;
    const lead = leading ? Math.max(0, Math.min(1, value - (10 ** c - 1))) : 1;
    cells.push(
      <span
        key={c}
        style={{
          display: 'inline-block',
          height: `${LINE}em`,
          overflow: 'hidden',
          verticalAlign: 'top',
          width: leading ? `${0.7 * lead}em` : undefined,
          opacity: lead,
        }}
      >
        <span style={{display: 'block', transform: `translateY(${-(p % 10) * LINE}em)`}}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
            <span key={i} style={{display: 'block', height: `${LINE}em`, lineHeight: `${LINE}em`, textAlign: 'center'}}>
              {d}
            </span>
          ))}
        </span>
      </span>,
    );
    if (c === decimals && decimals > 0) {
      cells.push(
        <span key="dot" style={{display: 'inline-block', height: `${LINE}em`, lineHeight: `${LINE}em`, verticalAlign: 'top'}}>
          .
        </span>,
      );
    }
  }

  return (
    <span style={{display: 'inline-flex', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', lineHeight: `${LINE}em`, ...style}}>
      {cells}
      {suffix ? <span style={{display: 'inline-block', height: `${LINE}em`, lineHeight: `${LINE}em`}}>{suffix}</span> : null}
    </span>
  );
};
